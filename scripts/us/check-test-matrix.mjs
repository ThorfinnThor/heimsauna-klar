import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "../..");
const matrixPath = resolve(projectRoot, "docs/us/qa/test-matrix.json");
const matrix = JSON.parse(await readFile(matrixPath, "utf8"));
const issues = [];
const allowedCoverage = new Set(["automated", "partial", "manual"]);
const expectedIds = Array.from({ length: 32 }, (_, index) => `T-${String(index + 1).padStart(2, "0")}`);
const actualIds = matrix.cases?.map((entry) => entry.id) ?? [];

if (matrix.schema_version !== 1) issues.push("schema_version must be 1");
if (matrix.market !== "US") issues.push("market must be US");
if (!matrix.fixture_policy?.includes("fixture")) issues.push("fixture_policy must name the fixture isolation rule");
if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) {
  issues.push(`cases must contain T-01 through T-32 exactly once and in order; found ${actualIds.join(", ")}`);
}

for (const entry of matrix.cases ?? []) {
  if (!allowedCoverage.has(entry.coverage)) issues.push(`${entry.id}: unsupported coverage ${entry.coverage}`);
  if (!Array.isArray(entry.automated_by) || entry.automated_by.length === 0) {
    issues.push(`${entry.id}: automated_by needs at least one repository check`);
  }
  if (!Array.isArray(entry.open_checks)) issues.push(`${entry.id}: open_checks must be an array`);
  if (entry.coverage === "automated" && entry.open_checks?.length > 0) {
    issues.push(`${entry.id}: automated coverage cannot retain open checks`);
  }
  if (entry.coverage !== "automated" && entry.open_checks?.length === 0) {
    issues.push(`${entry.id}: partial or manual coverage must state the remaining check`);
  }
  for (const relativePath of entry.automated_by ?? []) {
    if (relativePath.startsWith("/") || relativePath.includes("..")) {
      issues.push(`${entry.id}: unsafe evidence path ${relativePath}`);
      continue;
    }
    await access(resolve(projectRoot, relativePath)).catch(() => issues.push(`${entry.id}: missing evidence path ${relativePath}`));
  }
}

if (issues.length > 0) throw new Error(`US test-matrix validation failed:\n- ${issues.join("\n- ")}`);

const counts = Object.fromEntries([...allowedCoverage].map((status) => [status, matrix.cases.filter((entry) => entry.coverage === status).length]));
console.log(`US test matrix passed: 32/32 cases mapped; ${counts.automated} automated, ${counts.partial} partial, ${counts.manual} manual.`);
