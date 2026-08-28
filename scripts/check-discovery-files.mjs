import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

const outputRoot = path.resolve("out");
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://selectyoursauna.com").replace(/\/$/, "");
const products = JSON.parse(await readFile(new URL("../data/products.json", import.meta.url), "utf8"));
const llmsPath = path.join(outputRoot, "llms.txt");
const robotsPath = path.join(outputRoot, "robots.txt");

if (!existsSync(llmsPath) || !existsSync(robotsPath)) {
  throw new Error("Discovery check needs out/llms.txt and out/robots.txt");
}

const llms = await readFile(llmsPath, "utf8");
const robots = await readFile(robotsPath, "utf8");
const requiredLlmsContent = [
  "# Select Your Sauna",
  `${products.length} verifizierte Produktdatensätze`,
  `${siteUrl}/de/produkte/`,
  `${siteUrl}/de/ueber-uns/`,
  `${siteUrl}/sitemap.xml`,
  "Eigene Produktnutzung, Montage oder Labortests",
];
const missing = requiredLlmsContent.filter((value) => !llms.includes(value));

if (missing.length > 0) {
  throw new Error(`llms.txt is missing required content: ${missing.join(", ")}`);
}

if (robots.includes("Sitemap:") && !/User-Agent:\s*OAI-SearchBot[\s\S]*?Allow:\s*\//i.test(robots)) {
  throw new Error("robots.txt does not explicitly allow OAI-SearchBot on the indexable build");
}

console.log(`Discovery check passed: llms.txt describes ${products.length} products and robots.txt has the expected crawler policy.`);
