import { createDoc, activeCel } from '@/pixel/doc';
import { buildDocPalette } from '@/data/palettes';
import type { PixelDoc } from '@/pixel/types';

interface AsciiArt {
  name: string;
  /** colors[0] -> '1', colors[1] -> '2', ... ('.' / space = transparent) */
  colors: string[];
  rows: string[];
}

function fromAscii(a: AsciiArt): PixelDoc {
  const width = Math.max(...a.rows.map((r) => r.length));
  const height = a.rows.length;
  const doc = createDoc({
    name: a.name,
    width,
    height,
    palette: buildDocPalette(a.colors),
  });
  const cel = activeCel(doc);
  for (let y = 0; y < height; y++) {
    const row = a.rows[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === '.' || ch === ' ') continue;
      const idx = parseInt(ch, 16);
      cel[y * width + x] = Number.isNaN(idx) ? 0 : idx;
    }
  }
  return doc;
}

const ART: AsciiArt[] = [
  {
    name: 'Heart',
    colors: ['#ff5277', '#b1304f'],
    rows: [
      '.22...22.',
      '2112.2112',
      '211121112',
      '211111112',
      '.2111112.',
      '..21112..',
      '...212...',
      '....2....',
    ],
  },
  {
    name: 'Smiley',
    colors: ['#ffd23f', '#3a2e0a'],
    rows: [
      '..1111..',
      '.111111.',
      '11211211',
      '11111111',
      '12111121',
      '11222211',
      '.111111.',
      '..1111..',
    ],
  },
  {
    name: 'Mushroom',
    colors: ['#e0335b', '#ffffff', '#f4d9a6'],
    rows: [
      '...11111...',
      '.111111111.',
      '11121111211',
      '11111111111',
      '11111121111',
      '.111111111.',
      '...33333...',
      '...32223...',
      '....333....',
    ],
  },
  {
    name: 'Cat',
    colors: ['#2b2b3c', '#ffce5c', '#ff7ba9'],
    rows: [
      '1.......1',
      '11.....11',
      '111111111',
      '112111211',
      '111111111',
      '111313111',
      '111111111',
      '1.11111.1',
    ],
  },
];

export function featuredDocs(): PixelDoc[] {
  return ART.map(fromAscii);
}
