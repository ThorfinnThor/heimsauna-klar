import { readdir, readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const outputRoot = path.resolve("out");

async function collectHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectHtmlFiles(fullPath));
    else if (entry.name.endsWith(".html")) files.push(fullPath);
  }
  return files;
}

function targetCandidates(url) {
  const cleanUrl = url.split("#")[0].split("?")[0];
  const relative = cleanUrl.replace(/^\//, "");
  if (cleanUrl.endsWith("/")) return [path.join(outputRoot, relative, "index.html")];
  return [path.join(outputRoot, `${relative}.html`), path.join(outputRoot, relative, "index.html")];
}

const outputStats = await stat(outputRoot).catch(() => null);
if (!outputStats?.isDirectory()) throw new Error("Static output directory out/ is missing; run a production build first");

const htmlFiles = await collectHtmlFiles(outputRoot);
const missing = new Map();
let internalReferences = 0;

for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  for (const match of html.matchAll(/href="(\/de[^"]*)"/g)) {
    const url = match[1];
    internalReferences += 1;
    if (targetCandidates(url).some((candidate) => existsSync(candidate))) continue;
    missing.set(url, (missing.get(url) ?? 0) + 1);
  }
}

if (missing.size > 0) {
  throw new Error(`Broken internal links: ${[...missing].map(([url, count]) => `${url} (${count}x)`).join(", ")}`);
}

console.log(`Internal link check passed: ${htmlFiles.length} static HTML pages, ${internalReferences} internal references, 0 broken targets.`);
