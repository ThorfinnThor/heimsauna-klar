import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";

const projectRoot = resolve(import.meta.dirname, "../..");
const inventory = JSON.parse(await readFile(resolve(projectRoot, "docs/us/data-flow-inventory.json"), "utf8"));

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await sourceFiles(path));
    else if (/\.(?:ts|tsx|js|jsx)$/.test(entry.name)) files.push(path);
  }
  return files;
}

test("the inventory names every active repository-visible recipient class", () => {
  assert.equal(inventory.schema_version, 1);
  assert.equal(inventory.market, "US");
  assert.deepEqual(inventory.services.map((service) => service.id).sort(), [
    "affiliate-outbound-click",
    "awin-product-feed-ingestion",
    "cloudflare-git-build-and-deploy",
    "cloudflare-static-hosting",
    "cloudflare-web-analytics",
    "email-contact",
    "github-source-ci-and-build-trigger",
    "non-affiliate-outbound-click",
  ]);
  assert(inventory.services.every((service) => service.recipients.length > 0 && service.data.length > 0));
});

test("the public client remains free of hidden browser collection and third-party embeds", async () => {
  const files = [
    ...await sourceFiles(resolve(projectRoot, "app")),
    ...await sourceFiles(resolve(projectRoot, "lib")),
  ];
  const source = (await Promise.all(files.map((file) => readFile(file, "utf8")))).join("\n");
  for (const forbidden of [
    /\bfetch\s*\(/,
    /\bXMLHttpRequest\b/,
    /\bsendBeacon\s*\(/,
    /\blocalStorage\b/,
    /\bsessionStorage\b/,
    /\bdocument\.cookie\b/,
    /googletagmanager|google-analytics|gtag\s*\(|posthog|plausible|segment\.com|sentry/i,
    /<iframe\b/i,
  ]) {
    assert.doesNotMatch(source, forbidden);
  }
  assert.match(source, /mailto:/);
  assert.match(source, /window\.history\.(?:pushState|replaceState)/);
});

test("the deployment is static and the CSP blocks silent browser egress", async () => {
  const [wrangler, headers, packageDocument] = await Promise.all([
    readFile(resolve(projectRoot, "wrangler.toml"), "utf8"),
    readFile(resolve(projectRoot, "public/_headers"), "utf8"),
    readFile(resolve(projectRoot, "package.json"), "utf8").then(JSON.parse),
  ]);
  assert.match(wrangler, /\[assets\]/);
  assert.doesNotMatch(wrangler, /^main\s*=/m);
  assert.match(headers, /connect-src 'self'/);
  assert.match(headers, /frame-src 'none'/);
  assert.match(headers, /img-src 'self' data:/);
  assert.deepEqual(Object.keys(packageDocument.dependencies).sort(), ["next", "react", "react-dom"]);
});

test("Awin ingestion uses a secret and persists only sanitized reports", async () => {
  const [workflow, source, sync] = await Promise.all([
    readFile(resolve(projectRoot, ".github/workflows/sync-awin-affiliate-offers.yml"), "utf8"),
    readFile(resolve(projectRoot, "scripts/awin/source.mjs"), "utf8"),
    readFile(resolve(projectRoot, "scripts/awin/sync-affiliate-offers.mjs"), "utf8"),
  ]);
  assert.match(workflow, /secrets\.AWIN_FEED_LIST_URL/);
  assert.match(source, /await fetch\(url/);
  assert.match(sync, /secret_included:\s*false/);
  assert.doesNotMatch(sync, /AWIN_FEED_LIST_URL[^\n]*write/);
});

test("future collection features remain proposed and disabled", () => {
  const proposed = new Map(inventory.proposed_controls.map((control) => [control.id, control]));
  for (const id of ["us-affiliate-click-reference-enabled", "contact-form-enabled", "account-preview-enabled"]) {
    assert.equal(proposed.get(id)?.default, false);
  }
});

test("Cloudflare Web Analytics is recorded as an operator-enabled hosting service", () => {
  const service = inventory.services.find((entry) => entry.id === "cloudflare-web-analytics");
  assert.equal(service?.active, true);
  assert.match(service?.recipients?.join(",") ?? "", /Cloudflare/);
});
