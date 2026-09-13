import { access, readFile, readdir, rm } from "node:fs/promises";
import { constants } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const outputRoot = resolve(projectRoot, "out");
const usOutputRoot = resolve(outputRoot, "us");
const publication = JSON.parse(await readFile(resolve(projectRoot, "data/us/publication.json"), "utf8"));
const environmentAllowsRoutes = process.env.US_ROUTES_ENABLED !== "false";
const routesEnabled = publication.routes_enabled && environmentAllowsRoutes;

async function exists(path) {
  return access(path, constants.F_OK).then(() => true).catch(() => false);
}

async function collectHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectHtmlFiles(path));
    else if (entry.name.endsWith(".html")) files.push(path);
  }
  return files;
}

if (!routesEnabled) {
  await rm(usOutputRoot, { recursive: true, force: true });
  if (await exists(usOutputRoot)) throw new Error("Disabled US output could not be removed");

  const publicFiles = await collectHtmlFiles(outputRoot);
  const leakedLinks = [];
  for (const file of publicFiles) {
    const html = await readFile(file, "utf8");
    if (/href=["']\/us(?:\/|["'])/.test(html)) leakedLinks.push(file.replace(`${outputRoot}/`, ""));
  }
  for (const discoveryFile of ["sitemap.xml", "llms.txt"]) {
    const path = resolve(outputRoot, discoveryFile);
    if (await exists(path) && (await readFile(path, "utf8")).includes("/us/")) leakedLinks.push(discoveryFile);
  }
  if (leakedLinks.length > 0) throw new Error(`Disabled US routes leaked from: ${leakedLinks.join(", ")}`);
  console.log("US output gate passed: routes disabled, out/us removed, no US links in HTML or discovery files.");
} else {
  const entry = resolve(usOutputRoot, "index.html");
  if (!(await exists(entry))) throw new Error("US routes are enabled but out/us/index.html is missing");
  console.log("US output gate passed: routes enabled and out/us/index.html exists.");
}
