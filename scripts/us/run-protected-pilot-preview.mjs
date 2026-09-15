import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "../..");
const previewEnvironment = {
  ...process.env,
  US_RESEARCH_PREVIEW: "1",
  US_ROUTES_ENABLED: "false",
};

const publication = JSON.parse(await readFile(resolve(projectRoot, "data/us/publication.json"), "utf8"));
if (publication.indexing_enabled) {
  console.log("US protected preview skipped: the indexed first-wave release uses the post-build SEO and live-release checks instead.");
  process.exit(0);
}

function run(label, command, args, environment = process.env) {
  console.log(`\n[US protected preview] ${label}`);
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    env: environment,
    encoding: "utf8",
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${label} failed with exit code ${result.status}`);
}

let previewError;
try {
  run("validate source data", "npm", ["run", "data:check"], previewEnvironment);
  run("generate offline static preview", process.execPath, ["node_modules/next/dist/bin/next", "build", "--webpack"], previewEnvironment);
  run("check SEO safety before cleanup", process.execPath, ["scripts/us/check-seo-output.mjs"], previewEnvironment);
  run("exercise real pilot output", process.execPath, ["scripts/us/check-protected-pilot-preview.mjs"], previewEnvironment);
  run("check static security, accessibility and performance", process.execPath, ["scripts/us/check-static-quality.mjs"], previewEnvironment);
} catch (error) {
  previewError = error;
} finally {
  run("remove non-public US output", process.execPath, ["scripts/us/enforce-publication-output.mjs"], previewEnvironment);
}

if (previewError) throw previewError;
console.log("\nUS protected preview completed and out/us was removed before exit.");
