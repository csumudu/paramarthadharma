// Rasterises src/app/icon.svg into favicon.ico (16/32/48) and apple-icon.png (180).
// Run: node scripts/gen-icons.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

const svg = readFileSync('src/app/icon.svg');
const png = (size) => sharp(svg, { density: 72 * (size / 64) * 4 }).resize(size, size).png().toBuffer();

// apple-icon: iOS rounds corners itself, so fill the full square.
const square = Buffer.from(svg.toString().replace('rx="14"', 'rx="0"'));
writeFileSync('src/app/apple-icon.png', await sharp(square, { density: 72 * 4 * 3 }).resize(180, 180).png().toBuffer());

// ICO with embedded PNGs (supported by every current browser).
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map(png));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((s, i) => {
  const e = 6 + 16 * i;
  header.writeUInt8(s, e);
  header.writeUInt8(s, e + 1);
  header.writeUInt16LE(1, e + 4);
  header.writeUInt16LE(32, e + 6);
  header.writeUInt32LE(images[i].length, e + 8);
  header.writeUInt32LE(offset, e + 12);
  offset += images[i].length;
});
writeFileSync('src/app/favicon.ico', Buffer.concat([header, ...images]));
console.log('wrote src/app/favicon.ico, src/app/apple-icon.png');
