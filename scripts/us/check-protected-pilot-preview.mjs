import { readdir, readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "../..");
const outputRoot = resolve(projectRoot, "out");
const usOutputRoot = resolve(outputRoot, "us");

async function readJson(path) {
  return JSON.parse(await readFile(resolve(projectRoot, path), "utf8"));
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

function requireText(html, expected, route, issues) {
  if (!html.includes(expected)) issues.push(`${route}: missing ${JSON.stringify(expected)}`);
}

const [publication, productsDocument, configurationsDocument, sourcesDocument, offersDocument, previewManifest] = await Promise.all([
  readJson("data/us/publication.json"),
  readJson("data/us/products.json"),
  readJson("data/us/configurations.json"),
  readJson("data/us/sources.json"),
  readJson("data/us/offers.json"),
  readJson("docs/us/preview-manifest.json"),
]);

const issues = [];
const expectedPublicationControls = {
  routes_enabled: true,
  indexing_enabled: false,
  affiliate_links_enabled: false,
  feed_sync_enabled: false,
};
for (const [flag, expected] of Object.entries(expectedPublicationControls)) {
  if (publication[flag] !== expected) issues.push(`publication.${flag}: public noindex beta requires ${expected}`);
}
if (offersDocument.offers.length !== 0) issues.push("data/us/offers.json: expected zero offers in the current real pilot");
if (productsDocument.products.length !== 100) issues.push(`data/us/products.json: expected 100 pilot products, found ${productsDocument.products.length}`);
if (configurationsDocument.configurations.length !== 100) issues.push(`data/us/configurations.json: expected 100 pilot configurations, found ${configurationsDocument.configurations.length}`);
if (productsDocument.products.some((product) => product.publication_status !== "candidate")) {
  issues.push("data/us/products.json: every protected pilot product must remain a candidate");
}

const usStats = await stat(usOutputRoot).catch(() => null);
if (!usStats?.isDirectory()) throw new Error("Protected pilot preview needs a generated out/us directory");
const htmlFiles = await collectHtmlFiles(usOutputRoot);
if (htmlFiles.length !== previewManifest.expected_page_count) {
  issues.push(`out/us: expected ${previewManifest.expected_page_count} static pilot pages, found ${htmlFiles.length}`);
}

const generatedRoutes = htmlFiles.map((file) => `/${file.slice(outputRoot.length + 1).replace(/index\.html$/, "").replaceAll("\\", "/")}`);
const expectedRoutes = previewManifest.routes.map((route) => route.path);
for (const route of expectedRoutes.filter((route) => !generatedRoutes.includes(route))) issues.push(`${route}: missing from generated preview`);
for (const route of generatedRoutes.filter((route) => !expectedRoutes.includes(route))) issues.push(`${route}: not declared in preview manifest`);

for (const file of htmlFiles) {
  const route = `/${file.slice(outputRoot.length + 1).replace(/index\.html$/, "").replaceAll("\\", "/")}`;
  const html = await readFile(file, "utf8");
  requireText(html, '<html lang="en-US">', route, issues);
  requireText(html, 'name="robots" content="noindex, follow"', route, issues);
  requireText(html, "Research beta", route, issues);
  for (const forbidden of previewManifest.forbidden_output_markers) {
    if (html.includes(forbidden)) issues.push(`${route}: synthetic test marker leaked into the static preview`);
  }
}

const catalogHtml = await readFile(resolve(usOutputRoot, "saunas/index.html"), "utf8");
const finderHtml = await readFile(resolve(usOutputRoot, "sauna-finder/index.html"), "utf8");
requireText(finderHtml, "searches 100 candidate records", "/us/sauna-finder/", issues);
for (const product of productsDocument.products) {
  const productRoute = `/us/saunas/${product.slug}/`;
  const productPath = resolve(usOutputRoot, `saunas/${product.slug}/index.html`);
  const productHtml = await readFile(productPath, "utf8").catch(() => "");
  const configuration = configurationsDocument.configurations.find((entry) => entry.product_id === product.id);
  const sourceTitles = sourcesDocument.sources
    .filter((source) => [...new Set([...product.source_ids, ...(configuration?.source_ids ?? [])])].includes(source.id))
    .map((source) => source.title);

  requireText(catalogHtml, product.model, "/us/saunas/", issues);
  requireText(productHtml, product.model, productRoute, issues);
  if (configuration) requireText(productHtml, configuration.label, productRoute, issues);
  for (const sourceTitle of sourceTitles) requireText(productHtml, sourceTitle, productRoute, issues);
  requireText(productHtml, "No reviewed offer", productRoute, issues);
  if (productHtml.includes("Affiliate link") || productHtml.includes('"@type":"Product"')) {
    issues.push(`${productRoute}: candidate preview exposed an affiliate label or public Product schema`);
  }
}

const expectedEditorialPages = [
  "brands/jnh-lifestyles/index.html",
  "compare/indoor-infrared-saunas/index.html",
  "compare/models/index.html",
  "guides/infrared-sauna-electrical-requirements/index.html",
];
for (const relativePath of expectedEditorialPages) {
  const html = await readFile(resolve(usOutputRoot, relativePath), "utf8").catch(() => "");
  if (!html) issues.push(`/us/${relativePath.replace(/index\.html$/, "")}: missing editorial pilot page`);
}

if (issues.length > 0) throw new Error(`Protected US pilot preview failed:\n${issues.join("\n")}`);

console.log(
  `Protected US pilot preview passed: ${htmlFiles.length} static pages, `
  + `${productsDocument.products.length} real candidate products, ${configurationsDocument.configurations.length} configurations, `
  + "0 offers, 0 synthetic fixture leaks, all pages noindex.",
);
