import { execFileSync } from "node:child_process";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";

const projectRoot = path.resolve(import.meta.dirname, "../..");
const outputRoot = path.join(projectRoot, "out");
const usOutputRoot = path.join(outputRoot, "us");
const issues = [];

const budgets = {
  maxRouteAssetGzipBytes: 225_000,
  maxChunkGzipBytes: 75_000,
  maxHtmlGzipBytes: 12_000,
};

async function collectFiles(directory, predicate) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(fullPath, predicate));
    else if (predicate(entry.name)) files.push(fullPath);
  }
  return files;
}

function count(html, pattern) {
  return [...html.matchAll(pattern)].length;
}

function routeForFile(file) {
  return `/${path.relative(outputRoot, file).replace(/index\.html$/, "").split(path.sep).join("/")}`;
}

function assetPath(url) {
  return path.join(outputRoot, decodeURIComponent(url).replace(/^\//, ""));
}

function relativeLuminance(hex) {
  const channels = [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16) / 255);
  const linear = channels.map((value) => value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrastRatio(foreground, background) {
  const first = relativeLuminance(foreground);
  const second = relativeLuminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

const [headers, redirects, css, wrangler, publication] = await Promise.all([
  readFile(path.join(projectRoot, "public/_headers"), "utf8"),
  readFile(path.join(projectRoot, "public/_redirects"), "utf8"),
  readFile(path.join(projectRoot, "app/globals.css"), "utf8"),
  readFile(path.join(projectRoot, "wrangler.toml"), "utf8"),
  readFile(path.join(projectRoot, "data/us/publication.json"), "utf8").then(JSON.parse),
]);
const indexedRelease = publication.indexing_enabled === true;

for (const expected of [
  "default-src 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src-attr 'none'",
  "style-src-attr 'none'",
  "frame-src 'none'",
  "upgrade-insecure-requests",
  "Strict-Transport-Security: max-age=31536000",
]) {
  if (!headers.includes(expected)) issues.push(`public/_headers: missing ${expected}`);
}
if (!/https:\/\/[^\s]+\.workers\.dev\/\*/.test(headers) || !headers.includes("X-Robots-Tag: noindex, nofollow")) {
  issues.push("public/_headers: workers.dev must remain noindex, nofollow");
}
if (redirects.trim() !== "/ /de/ 301") issues.push("public/_redirects: only the fixed root-to-DE redirect is expected");
if (/^main\s*=/m.test(wrangler)) issues.push("wrangler.toml: static-assets-only deployment must not define a Worker main entry point");
if (!/\[assets\][\s\S]*directory\s*=\s*"\.\/out"/.test(wrangler)) issues.push("wrangler.toml: assets directory must be ./out");

const compatibilityDate = wrangler.match(/^compatibility_date\s*=\s*"(\d{4}-\d{2}-\d{2})"/m)?.[1];
if (!compatibilityDate) {
  issues.push("wrangler.toml: missing compatibility_date");
} else {
  const ageDays = Math.floor((Date.now() - Date.parse(`${compatibilityDate}T00:00:00Z`)) / 86_400_000);
  if (ageDays < 0) issues.push(`wrangler.toml: compatibility_date ${compatibilityDate} is in the future`);
  if (ageDays > 90) issues.push(`wrangler.toml: compatibility_date ${compatibilityDate} is older than 90 days`);
}

const expectedPublicationControls = indexedRelease ? {
  routes_enabled: true,
  indexing_enabled: true,
  affiliate_links_enabled: false,
  feed_sync_enabled: false,
} : {
  routes_enabled: true,
  indexing_enabled: false,
  affiliate_links_enabled: false,
  feed_sync_enabled: false,
};
for (const [flag, expected] of Object.entries(expectedPublicationControls)) {
  if (publication[flag] !== expected) issues.push(`data/us/publication.json: ${flag} must be ${expected} for the current US release`);
}

for (const expected of [
  ":where(a, button, input, select, textarea, summary):focus-visible",
  ".skip-link:focus-visible",
  "@media (prefers-reduced-motion: reduce)",
  "font-size: 16px",
]) {
  if (!css.includes(expected)) issues.push(`app/globals.css: missing accessibility baseline ${expected}`);
}
for (const [label, foreground, background] of [
  ["body text", "#17362f", "#fbf8ef"],
  ["secondary text", "#31554c", "#fbf8ef"],
  ["accent text and focus", "#b94928", "#fbf8ef"],
  ["light text on dark panels", "#fffdf8", "#17362f"],
  ["light accent on dark panels", "#f6b59d", "#17362f"],
]) {
  const ratio = contrastRatio(foreground, background);
  if (ratio < 4.5) issues.push(`app/globals.css: ${label} contrast is ${ratio.toFixed(2)}:1, below 4.5:1`);
}

const trackedFiles = execFileSync("git", ["ls-files"], { cwd: projectRoot, encoding: "utf8" }).trim().split("\n").filter(Boolean);
for (const file of trackedFiles) {
  const base = path.basename(file);
  if ((base.startsWith(".env") && base !== ".env.example") || base === ".dev.vars") {
    issues.push(`${file}: local secret file must not be tracked`);
  }
  const fullPath = path.join(projectRoot, file);
  const fileStats = await stat(fullPath).catch(() => null);
  if (!fileStats?.isFile() || fileStats.size > 1_000_000) continue;
  const contents = await readFile(fullPath, "utf8").catch(() => "");
  if (/productdata-darwin-download\/publisher\/\d+\/[a-f0-9]{24,}/i.test(contents)) {
    issues.push(`${file}: Awin feed credential-like URL must not be tracked`);
  }
  if (/\b(?:ghp_|github_pat_)[A-Za-z0-9_]{20,}/.test(contents)) {
    issues.push(`${file}: GitHub credential-like value must not be tracked`);
  }
  if (/\bAWIN_[A-Z0-9_]*(?:TOKEN|SECRET|KEY)\s*=\s*[^\s#][^\r\n]+/.test(contents)) {
    issues.push(`${file}: assigned Awin secret-like environment value must not be tracked`);
  }
}

const usStats = await stat(usOutputRoot).catch(() => null);
if (!usStats?.isDirectory()) throw new Error("US static-quality check needs a generated out/us directory");
const htmlFiles = await collectFiles(usOutputRoot, (name) => name.endsWith(".html"));
const routeMetrics = [];
const allAssets = new Map();

for (const file of htmlFiles) {
  const route = routeForFile(file);
  const htmlBuffer = await readFile(file);
  const html = htmlBuffer.toString("utf8");
  const mainIndex = html.indexOf('<main id="main-content" tabindex="-1">');
  const siteHeaderIndex = html.indexOf('<header class="site-header">');
  const footerIndex = html.indexOf("<footer>");
  const skipIndex = html.indexOf('<a class="skip-link" href="#main-content">Skip to main content</a>');

  if (count(html, /<main(?:\s|>)/g) !== 1) issues.push(`${route}: expected exactly one main landmark`);
  if (count(html, /<h1(?:\s|>)/g) !== 1) issues.push(`${route}: expected exactly one h1`);
  if (skipIndex < 0) issues.push(`${route}: missing keyboard skip link`);
  if (!(skipIndex < siteHeaderIndex && siteHeaderIndex < mainIndex && mainIndex < footerIndex)) {
    issues.push(`${route}: landmark order must be skip link, site header, main, footer`);
  }
  if (/tabindex="[1-9]\d*"/.test(html)) issues.push(`${route}: positive tabindex is not allowed`);
  if (/\son(?:click|load|error|mouseover|focus)="/i.test(html)) issues.push(`${route}: inline event handler conflicts with the CSP`);
  if (/\sstyle="/i.test(html)) issues.push(`${route}: inline style conflicts with style-src-attr 'none'`);
  if (/<(?:script|img|iframe)\b[^>]*\ssrc="https?:\/\//i.test(html)) issues.push(`${route}: third-party subresource detected`);
  if (/<link\b[^>]*rel="stylesheet"[^>]*href="https?:\/\//i.test(html)) issues.push(`${route}: third-party stylesheet detected`);
  if (/<iframe\b/i.test(html)) issues.push(`${route}: iframe is outside the static pilot scope`);
  if (/<form\b[^>]*action="https?:\/\//i.test(html)) issues.push(`${route}: external form action is not allowed`);
  if (/\b(?:href|src|action)="\s*(?:javascript|data|vbscript):/i.test(html)) {
    issues.push(`${route}: executable or embedded-data URL detected in markup`);
  }

  for (const match of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
    if (!/rel="[^"]*noopener/.test(match[0]) || !/rel="[^"]*noreferrer/.test(match[0])) {
      issues.push(`${route}: target=_blank link is missing noopener noreferrer`);
    }
  }
  for (const match of html.matchAll(/<button\b[^>]*>/g)) {
    if (!/\stype="(?:button|submit|reset)"/.test(match[0])) issues.push(`${route}: button is missing an explicit type`);
  }
  for (const match of html.matchAll(/<(?:input|select|textarea)\b[^>]*>/g)) {
    const tag = match[0];
    if (/\stype="hidden"/.test(tag)) continue;
    const prefix = html.slice(0, match.index);
    const nestedInLabel = prefix.lastIndexOf("<label") > prefix.lastIndexOf("</label>");
    const id = tag.match(/\sid="([^"]+)"/)?.[1];
    const explicitlyLabelled = id && html.includes(`for="${id}"`);
    if (!nestedInLabel && !explicitlyLabelled && !/\saria-label(?:ledby)?="[^"]+"/.test(tag)) {
      issues.push(`${route}: form control is missing an accessible label`);
    }
  }

  const routeAssets = new Set();
  for (const match of html.matchAll(/(?:src|href)="(\/_next\/static\/[^"]+\.(?:js|css))"/g)) routeAssets.add(match[1]);
  let routeAssetGzipBytes = 0;
  for (const url of routeAssets) {
    const localPath = assetPath(url);
    const buffer = await readFile(localPath).catch(() => null);
    if (!buffer) {
      issues.push(`${route}: missing referenced asset ${url}`);
      continue;
    }
    const gzipBytes = gzipSync(buffer).length;
    routeAssetGzipBytes += gzipBytes;
    allAssets.set(url, { bytes: buffer.length, gzipBytes });
  }
  const htmlGzipBytes = gzipSync(htmlBuffer).length;
  if (routeAssetGzipBytes > budgets.maxRouteAssetGzipBytes) {
    issues.push(`${route}: ${routeAssetGzipBytes} compressed asset bytes exceed ${budgets.maxRouteAssetGzipBytes}`);
  }
  if (htmlGzipBytes > budgets.maxHtmlGzipBytes) {
    issues.push(`${route}: ${htmlGzipBytes} compressed HTML bytes exceed ${budgets.maxHtmlGzipBytes}`);
  }
  routeMetrics.push({ route, routeAssetGzipBytes, htmlGzipBytes });
}

for (const [url, metric] of allAssets) {
  if (url.endsWith(".js") && metric.gzipBytes > budgets.maxChunkGzipBytes) {
    issues.push(`${url}: ${metric.gzipBytes} compressed bytes exceed the ${budgets.maxChunkGzipBytes} chunk ceiling`);
  }
}

if (issues.length > 0) throw new Error(`US static security, accessibility and performance check failed:\n${issues.join("\n")}`);

const heaviestRoute = routeMetrics.toSorted((a, b) => b.routeAssetGzipBytes - a.routeAssetGzipBytes)[0];
const largestHtmlRoute = routeMetrics.toSorted((a, b) => b.htmlGzipBytes - a.htmlGzipBytes)[0];
const largestChunk = [...allAssets.entries()].toSorted((a, b) => b[1].gzipBytes - a[1].gzipBytes)[0];
console.log(
  `US static quality passed: ${htmlFiles.length} pages; one main and h1 per route; keyboard skip link, visible focus and reduced motion; `
  + `strict headers and assets-only Worker; no tracked local secret files, third-party subresources, iframes or unsafe blank-target links. `
  + `Heaviest route ${heaviestRoute.route}: ${heaviestRoute.routeAssetGzipBytes} compressed JS/CSS bytes; `
  + `largest chunk ${largestChunk[0]}: ${largestChunk[1].gzipBytes} compressed bytes; `
  + `largest HTML ${largestHtmlRoute.route}: ${largestHtmlRoute.htmlGzipBytes} compressed bytes.`,
);
