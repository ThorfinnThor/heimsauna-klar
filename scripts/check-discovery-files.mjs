import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

const outputRoot = path.resolve("out");
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://selectyoursauna.com").replace(/\/$/, "");
const products = JSON.parse(await readFile(new URL("../data/products.json", import.meta.url), "utf8"));
const productIndexing = JSON.parse(await readFile(new URL("../data/product-indexing.json", import.meta.url), "utf8"));
const llmsPath = path.join(outputRoot, "llms.txt");
const robotsPath = path.join(outputRoot, "robots.txt");
const redirectsPath = path.join(outputRoot, "_redirects");

if (!existsSync(llmsPath) || !existsSync(robotsPath) || !existsSync(redirectsPath)) {
  throw new Error("Discovery check needs out/llms.txt, out/robots.txt and out/_redirects");
}

const llms = await readFile(llmsPath, "utf8");
const robots = await readFile(robotsPath, "utf8");
const redirects = await readFile(redirectsPath, "utf8");
const requiredLlmsContent = [
  "# Select Your Sauna",
  `${products.length} verifizierte Produktdatensätze`,
  `${productIndexing.summary.index} eigenständige Produktseiten`,
  "Redaktionell verantwortlich: Schayan Yousefian",
  "Redaktion, Belege und Zitierfähigkeit",
  "Fehlende Werte werden nicht aus ähnlichen Modellen ergänzt",
  `${siteUrl}/de/produkte/`,
  `${siteUrl}/de/ueber-uns/`,
  `${siteUrl}/sitemap.xml`,
  "Eigene Produktnutzung, Montage oder Labortests",
];
const missing = requiredLlmsContent.filter((value) => !llms.includes(value));

if (missing.length > 0) {
  throw new Error(`llms.txt is missing required content: ${missing.join(", ")}`);
}

const searchCrawlers = ["OAI-SearchBot", "Claude-SearchBot", "PerplexityBot"];
const blockedSearchCrawlers = searchCrawlers.filter((crawler) => (
  !new RegExp(`User-Agent:\\s*${crawler}[\\s\\S]*?Allow:\\s*\\/`, "i").test(robots)
));
if (robots.includes("Sitemap:") && blockedSearchCrawlers.length > 0) {
  throw new Error(`robots.txt does not explicitly allow search crawlers: ${blockedSearchCrawlers.join(", ")}`);
}

if (!redirects.split("\n").some((line) => line.trim() === "/ /de/ 301")) {
  throw new Error("Static redirects must send the root URL to /de/ with status 301");
}

console.log(`Discovery check passed: llms.txt documents ${products.length} products, ${productIndexing.summary.index} indexable detail pages and the editorial evidence policy; three AI search crawlers, robots.txt and the root redirect are valid.`);
