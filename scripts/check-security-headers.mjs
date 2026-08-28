import { readFile } from "node:fs/promises";
import path from "node:path";

const headersPath = path.resolve("out/_headers");
const headers = await readFile(headersPath, "utf8").catch(() => "");

if (!headers) throw new Error("Static security check failed: out/_headers is missing");

const requiredHeaders = [
  "Content-Security-Policy:",
  "Strict-Transport-Security: max-age=31536000",
  "X-Content-Type-Options: nosniff",
  "X-Frame-Options: DENY",
  "Referrer-Policy: strict-origin-when-cross-origin",
  "Permissions-Policy:",
];

const requiredCspDirectives = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "script-src-attr 'none'",
  "style-src-attr 'none'",
  "upgrade-insecure-requests",
];

const missing = [...requiredHeaders, ...requiredCspDirectives].filter((value) => !headers.includes(value));
if (missing.length > 0) {
  throw new Error(`Static security check failed; missing: ${missing.join(", ")}`);
}

console.log("Static security check passed: CSP, HSTS, MIME, framing, referrer and permissions policies are versioned.");
