import { createHash, randomUUID } from "node:crypto";
import { copyFile, lstat, mkdir, mkdtemp, readFile, rename, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { auditUsBundle, loadUsBundle } from "./validate-us-data.mjs";

export const IMPORT_FILES = [
  "products.json",
  "configurations.json",
  "sources.json",
  "merchants.json",
  "programs.json",
  "offers.json",
  "mappings.json",
];

const COLLECTIONS = [
  ["products", "products"],
  ["configurations", "configurations"],
  ["configurations", "certifications"],
  ["configurations", "warranties"],
  ["sources", "sources"],
  ["sources", "evidence"],
  ["merchants", "merchants"],
  ["programs", "programs"],
  ["offers", "offers"],
  ["mappings", "mappings"],
];

const projectRoot = resolve(fileURLToPath(new URL("../..", import.meta.url)));

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

function collectionEntries(bundle, documentName, collectionName) {
  const value = bundle?.[documentName]?.[collectionName];
  return Array.isArray(value) ? value : [];
}

function mapById(entries) {
  return new Map(entries.filter((entry) => entry && typeof entry.id === "string").map((entry) => [entry.id, entry]));
}

function countNulls(value) {
  if (value === null) return 1;
  if (!value || typeof value !== "object") return 0;
  return Object.values(value).reduce((total, entry) => total + countNulls(entry), 0);
}

function collectComparableValues(bundle) {
  const values = new Map();
  for (const source of collectionEntries(bundle, "sources", "sources")) {
    if (source?.id && typeof source.url === "string") values.set(`source:${source.id}:url`, source.url);
  }
  for (const offer of collectionEntries(bundle, "offers", "offers")) {
    if (!offer?.id) continue;
    if (typeof offer.destination_url === "string") values.set(`offer:${offer.id}:destination_url`, offer.destination_url);
    if (typeof offer.affiliate_url === "string") values.set(`offer:${offer.id}:affiliate_url`, offer.affiliate_url);
  }
  return values;
}

function collectPrices(bundle) {
  const values = new Map();
  for (const offer of collectionEntries(bundle, "offers", "offers")) {
    if (offer?.id && offer.price && typeof offer.price === "object") values.set(offer.id, offer.price);
  }
  return values;
}

function valueChanges(before, after) {
  const keys = new Set([...before.keys(), ...after.keys()]);
  return [...keys].sort().flatMap((key) => {
    const previous = before.get(key);
    const next = after.get(key);
    return semanticEqual(previous, next) ? [] : [{ key, before: previous ?? null, after: next ?? null }];
  });
}

export function reviewManualImport(currentBundle, candidateBundle) {
  const issues = auditUsBundle(candidateBundle).map((entry) => ({ ...entry, origin: "candidate" }));
  const currentIssues = auditUsBundle(currentBundle)
    .filter((entry) => entry.severity === "error")
    .map((entry) => ({ ...entry, origin: "current" }));
  issues.push(...currentIssues);

  const collections = {};
  for (const [documentName, collectionName] of COLLECTIONS) {
    const key = `${documentName}.${collectionName}`;
    const before = mapById(collectionEntries(currentBundle, documentName, collectionName));
    const after = mapById(collectionEntries(candidateBundle, documentName, collectionName));
    const added = [...after.keys()].filter((id) => !before.has(id)).sort();
    const removed = [...before.keys()].filter((id) => !after.has(id)).sort();
    const updated = [...after.keys()].filter((id) => before.has(id) && !semanticEqual(before.get(id), after.get(id))).sort();
    const unchanged = [...after.keys()].filter((id) => before.has(id) && semanticEqual(before.get(id), after.get(id))).length;
    collections[key] = { before: before.size, after: after.size, added, updated, removed, unchanged };
    if (removed.length > 0) {
      issues.push({
        severity: "error",
        origin: "import-policy",
        path: key,
        message: `manual imports cannot remove existing IDs: ${removed.join(", ")}`,
      });
    }
  }

  const changedUrls = valueChanges(collectComparableValues(currentBundle), collectComparableValues(candidateBundle));
  const changedPrices = valueChanges(collectPrices(currentBundle), collectPrices(candidateBundle));
  const nullValues = {
    before: countNulls(currentBundle),
    after: countNulls(candidateBundle),
  };
  const errors = issues.filter((entry) => entry.severity === "error");
  const changedRecordCount = Object.values(collections)
    .reduce((total, collection) => total + collection.added.length + collection.updated.length + collection.removed.length, 0);

  return {
    schema_version: 1,
    market: "US",
    status: errors.length > 0 ? "rejected" : changedRecordCount === 0 ? "no-changes" : "ready",
    summary: {
      changed_records: changedRecordCount,
      changed_urls: changedUrls.length,
      changed_prices: changedPrices.length,
      errors: errors.length,
      warnings: issues.filter((entry) => entry.severity === "warning").length,
    },
    collections,
    changed_urls: changedUrls,
    changed_prices: changedPrices,
    null_values: { ...nullValues, delta: nullValues.after - nullValues.before },
    issues,
  };
}

async function readCandidateDocument(inputDirectory, fileName) {
  const path = resolve(inputDirectory, fileName);
  const metadata = await lstat(path);
  if (!metadata.isFile() || metadata.isSymbolicLink()) throw new Error(`${fileName} must be a regular file, not a link`);
  const raw = await readFile(path);
  return {
    document: JSON.parse(raw.toString("utf8")),
    checksum: createHash("sha256").update(raw).digest("hex"),
    raw,
  };
}

export async function loadCandidateBundle(inputDirectory, currentBundle) {
  const resolvedInput = resolve(inputDirectory);
  const candidate = { ...currentBundle };
  const files = {};
  for (const fileName of IMPORT_FILES) {
    const loaded = await readCandidateDocument(resolvedInput, fileName);
    candidate[basename(fileName, ".json")] = loaded.document;
    files[fileName] = { checksum: loaded.checksum, raw: loaded.raw };
  }
  return { candidate, files, input_directory: resolvedInput };
}

export async function applyManualImport({ files, dataRoot = resolve(projectRoot, "data/us"), report }) {
  if (!report || !["ready", "no-changes"].includes(report.status)) {
    throw new Error("Only a validated ready or no-changes import can be applied");
  }
  if (report.status === "no-changes") return { applied: false, backup_directory: null };

  const resolvedDataRoot = resolve(dataRoot);
  const backupDirectory = await mkdtemp(resolve(tmpdir(), "selectyoursauna-us-import-"));
  await mkdir(resolvedDataRoot, { recursive: true });
  for (const fileName of IMPORT_FILES) {
    await copyFile(resolve(resolvedDataRoot, fileName), resolve(backupDirectory, fileName));
  }

  const written = [];
  try {
    for (const fileName of IMPORT_FILES) {
      const destination = resolve(resolvedDataRoot, fileName);
      const temporary = `${destination}.manual-import-${randomUUID()}.tmp`;
      await writeFile(temporary, files[fileName].raw, { flag: "wx" });
      await rename(temporary, destination);
      written.push(fileName);
    }
  } catch (error) {
    for (const fileName of written) {
      await copyFile(resolve(backupDirectory, fileName), resolve(resolvedDataRoot, fileName));
    }
    throw error;
  }
  return { applied: true, backup_directory: backupDirectory };
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
  if (!result.input) throw new Error("Usage: npm run us:import:review -- --input <candidate-directory> [--report <file>] [--apply]");
  return result;
}

async function runCli() {
  const args = parseArguments(process.argv.slice(2));
  const current = await loadUsBundle();
  const loaded = await loadCandidateBundle(args.input, current);
  const report = reviewManualImport(current, loaded.candidate);
  report.input_directory = loaded.input_directory;
  report.file_checksums = Object.fromEntries(Object.entries(loaded.files).map(([name, value]) => [name, value.checksum]));

  if (args.report) {
    await mkdir(resolve(args.report, ".."), { recursive: true });
    await writeFile(resolve(args.report), `${JSON.stringify(report, null, 2)}\n`, "utf8");
  }
  console.log(JSON.stringify(report, null, 2));
  if (report.status === "rejected") process.exitCode = 1;
  else if (args.apply) console.error(JSON.stringify(await applyManualImport({ files: loaded.files, report }), null, 2));
}

const isCli = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);
if (isCli) await runCli();
