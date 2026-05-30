/**
 * Dependency-free PWA icon generator. Encodes PNGs by hand (zlib + manual
 * chunks) so we don't need `sharp`/`canvas`. Draws the 4-square Pixelverse
 * mark on the brand background. Run: `node scripts/gen-icons.mjs`
 */
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(here, '..', 'public');

const BG = [11, 11, 26]; // #0b0b1a
const SQUARES = [
  [0x19, 0xf0, 0xd8], // cyan
  [0xff, 0x2e, 0x97], // magenta
  [0xb4, 0xff, 0x39], // lime
  [0xff, 0xd2, 0x3f], // yellow
];

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePng(size, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = deflateSync(raw);
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

function draw(size, { maskable = false } = {}) {
  const rgba = Buffer.alloc(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    const o = i * 4;
    rgba[o] = BG[0];
    rgba[o + 1] = BG[1];
    rgba[o + 2] = BG[2];
    rgba[o + 3] = 255;
  }
  const frac = maskable ? 0.56 : 0.74; // maskable keeps the logo in the safe zone
  const area = Math.round(size * frac);
  const start = Math.round((size - area) / 2);
  const gap = Math.max(2, Math.round(area * 0.06));
  const cell = Math.floor((area - gap) / 2);
  const positions = [
    [start, start],
    [start + cell + gap, start],
    [start, start + cell + gap],
    [start + cell + gap, start + cell + gap],
  ];
  positions.forEach(([px, py], idx) => {
    const [r, g, b] = SQUARES[idx];
    for (let y = 0; y < cell; y++) {
      for (let x = 0; x < cell; x++) {
        const X = px + x;
        const Y = py + y;
        if (X < 0 || Y < 0 || X >= size || Y >= size) continue;
        const o = (Y * size + X) * 4;
        rgba[o] = r;
        rgba[o + 1] = g;
        rgba[o + 2] = b;
        rgba[o + 3] = 255;
      }
    }
  });
  return rgba;
}

function write(name, size, opts) {
  writeFileSync(join(PUBLIC, name), encodePng(size, draw(size, opts)));
  console.log('wrote', name);
}

mkdirSync(PUBLIC, { recursive: true });
write('icon-192.png', 192, {});
write('icon-512.png', 512, {});
write('icon-maskable-512.png', 512, { maskable: true });
write('apple-touch-icon.png', 180, {});
console.log('✓ icons generated');
