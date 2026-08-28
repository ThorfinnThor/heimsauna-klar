import { gunzipSync } from "node:zlib";

const MAX_DOWNLOAD_BYTES = 25_000_000;
const MAX_ROWS = 2_000;

export async function readFeedRows(url) {
  const response = await fetch(url, {
    redirect: "follow",
    headers: { "user-agent": "SelectYourSauna-FeedDiscovery/1.0" },
    signal: AbortSignal.timeout(120_000),
  });
  if (!response.ok) throw new Error(`Awin download failed with status ${response.status}`);
  const declaredBytes = Number(response.headers.get("content-length"));
  if (Number.isFinite(declaredBytes) && declaredBytes > MAX_DOWNLOAD_BYTES) {
    throw new Error("Awin feed list exceeds the download limit");
  }

  const compressed = Buffer.from(await response.arrayBuffer());
  if (compressed.length > MAX_DOWNLOAD_BYTES) throw new Error("Awin feed list exceeds the download limit");
  const data = compressed[0] === 0x1f && compressed[1] === 0x8b
    ? gunzipSync(compressed, { maxOutputLength: MAX_DOWNLOAD_BYTES })
    : compressed;
  return parseCsv(data.toString("utf8").replace(/^\uFEFF/, ""));
}

export function parseCsv(text) {
  const delimiter = detectDelimiter(text);
  const records = [];
  let record = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        value += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        value += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === delimiter) {
      record.push(value.trim());
      value = "";
    } else if (character === "\n") {
      record.push(value.trim());
      value = "";
      if (record.some(Boolean)) records.push(record);
      record = [];
      if (records.length > MAX_ROWS + 1) throw new Error("Awin feed list exceeds the row limit");
    } else if (character !== "\r") {
      value += character;
    }
  }
  if (value || record.length) {
    record.push(value.trim());
    if (record.some(Boolean)) records.push(record);
  }
  if (quoted) throw new Error("Awin feed list contains an unterminated CSV field");
  const [headers, ...rows] = records;
  if (!headers?.length) throw new Error("Awin feed list is empty");
  return rows.map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])));
}

function detectDelimiter(text) {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  const counts = [",", "\t", ";"].map((delimiter) => [delimiter, firstLine.split(delimiter).length - 1]);
  counts.sort((left, right) => right[1] - left[1]);
  if (counts[0][1] === 0) throw new Error("Awin feed list delimiter could not be detected");
  return counts[0][0];
}
