import { randomUUID } from "node:crypto";
import { copyFile, mkdir, mkdtemp, readFile, rename, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { auditUsBundle, loadUsBundle } from "./validate-us-data.mjs";

const projectRoot = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const defaultOffersPath = resolve(projectRoot, "data/us/offers.json");

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
  }
  return value;
}

function semanticEqual(left, right) {
  return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right));
}

function isIsoDay(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function cleanOfferDocument(candidate) {
  return {
    schema_version: candidate.schema_version,
    market: candidate.market,
    offers: candidate.offers,
  };
}

export function reviewUsOfferSnapshot(currentBundle, candidate) {
  const issues = [];
  const snapshot = candidate?.snapshot;
  if (candidate?.schema_version !== 1) issues.push({ path: "schema_version", message: "must equal 1" });
  if (candidate?.market !== "US") issues.push({ path: "market", message: "must equal US" });
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) {
    issues.push({ path: "snapshot", message: "is required" });
  } else {
    if (typeof snapshot.attempt_id !== "string" || snapshot.attempt_id.trim().length === 0) {
      issues.push({ path: "snapshot.attempt_id", message: "is required" });
    }
    if (!isIsoDay(snapshot.attempted_at)) issues.push({ path: "snapshot.attempted_at", message: "must be an ISO date" });
    if (snapshot.source_status !== "succeeded") {
      issues.push({ path: "snapshot.source_status", message: "must equal succeeded before promotion" });
    }
    if (snapshot.complete !== true) {
      issues.push({ path: "snapshot.complete", message: "must be true before promotion" });
    }
  }
  if (!Array.isArray(candidate?.offers)) issues.push({ path: "offers", message: "must be an array" });

  const clean = cleanOfferDocument(candidate ?? {});
  const candidateBundle = { ...currentBundle, offers: clean };
  if (Array.isArray(candidate?.offers)) {
    for (const issue of auditUsBundle(candidateBundle)) {
      if (issue.severity === "error") issues.push({ path: issue.path, message: issue.message });
    }
  }

  const currentOffers = new Map((currentBundle.offers?.offers ?? []).map((offer) => [offer.id, offer]));
  const candidateOffers = new Map((candidate?.offers ?? []).filter((offer) => offer && typeof offer.id === "string").map((offer) => [offer.id, offer]));
  const added = [...candidateOffers.keys()].filter((id) => !currentOffers.has(id)).sort();
  const removed = [...currentOffers.keys()].filter((id) => !candidateOffers.has(id)).sort();
  const updated = [...candidateOffers.keys()].filter((id) => currentOffers.has(id) && !semanticEqual(currentOffers.get(id), candidateOffers.get(id))).sort();
  if (removed.length > 0) {
    issues.push({ path: "offers", message: `offer snapshots cannot remove existing IDs: ${removed.join(", ")}` });
  }

  if (isIsoDay(snapshot?.attempted_at)) {
    for (const offer of candidateOffers.values()) {
      if (isIsoDay(offer.last_successfully_checked_at) && offer.last_successfully_checked_at > snapshot.attempted_at) {
        issues.push({ path: `offers.${offer.id}.last_successfully_checked_at`, message: "cannot be later than the successful snapshot attempt" });
      }
      if (offer.last_attempted_at && offer.last_attempted_at < offer.last_successfully_checked_at) {
        issues.push({ path: `offers.${offer.id}.last_attempted_at`, message: "cannot be earlier than the last successful check" });
      }
    }
  }

  const changed = added.length + updated.length + removed.length;
  return {
    schema_version: 1,
    market: "US",
    attempt_id: snapshot?.attempt_id ?? null,
    status: issues.length > 0 ? "rejected" : changed === 0 ? "no-changes" : "ready",
    summary: {
      before: currentOffers.size,
      after: candidateOffers.size,
      added,
      updated,
      removed,
      errors: issues.length,
    },
    issues,
    output: clean,
  };
}

export async function applyUsOfferSnapshot({ report, offersPath = defaultOffersPath }) {
  if (!report || !["ready", "no-changes"].includes(report.status)) {
    throw new Error("Only a validated ready or no-changes offer snapshot can be applied");
  }
  if (report.status === "no-changes") return { applied: false, backup_path: null };

  const destination = resolve(offersPath);
  await mkdir(resolve(destination, ".."), { recursive: true });
  const backupDirectory = await mkdtemp(resolve(tmpdir(), `selectyoursauna-us-offers-${report.attempt_id}-`));
  const backupPath = resolve(backupDirectory, "offers.json");
  const temporary = `${destination}.snapshot-${randomUUID()}.tmp`;
  await copyFile(destination, backupPath);
  try {
    await writeFile(temporary, `${JSON.stringify(report.output, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
    await rename(temporary, destination);
  } catch (error) {
    await copyFile(backupPath, destination);
    throw error;
  }
  return { applied: true, backup_path: backupPath };
}

function parseArguments(argv) {
  const result = { apply: false, input: null, report: null };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--apply") result.apply = true;
    else if (argument === "--input") result.input = argv[++index];
    else if (argument === "--report") result.report = argv[++index];
    else throw new Error(`Unknown argument: ${argument}`);
  }
  if (!result.input) throw new Error("Usage: npm run us:offers:promote -- --input <snapshot.json> [--report <file>] [--apply]");
  return result;
}

async function runCli() {
  const args = parseArguments(process.argv.slice(2));
  const current = await loadUsBundle();
  const candidate = JSON.parse(await readFile(resolve(args.input), "utf8"));
  const report = reviewUsOfferSnapshot(current, candidate);
  if (args.report) {
    await mkdir(resolve(args.report, ".."), { recursive: true });
    await writeFile(resolve(args.report), `${JSON.stringify(report, null, 2)}\n`, "utf8");
  }
  console.log(JSON.stringify({ ...report, output: undefined }, null, 2));
  if (report.status === "rejected") process.exitCode = 1;
  else if (args.apply) console.error(JSON.stringify(await applyUsOfferSnapshot({ report }), null, 2));
}

const isCli = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);
if (isCli) await runCli();
