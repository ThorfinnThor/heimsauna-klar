import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

// Package the selected logo as static web assets. Clip the preview margin.
const source = 'docs/brand/icon-concepts-2026-09-07/03-aufguss-clean.png';
await mkdir('public/brand', { recursive: true });
const mask = Buffer.from('<svg width="1210" height="1210"><rect width="1210" height="1210" rx="235" fill="white"/></svg>');
const master = await sharp(source).extract({ left: 22, top: 22, width: 1210, height: 1210 }).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
for (const size of [32, 48, 192, 512]) {
  await sharp(master).resize(size, size).png().toFile(`public/brand/sauna-${size}.png`);
}
await sharp(master).resize(180, 180).flatten({ background: '#cf5e35' }).png().toFile('public/brand/apple-touch-icon.png');
