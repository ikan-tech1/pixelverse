import type { RGBA } from './types';

/** Parse '#rgb', '#rgba', '#rrggbb', '#rrggbbaa', or 'transparent' into RGBA. */
export function hexToRgba(hex: string): RGBA {
  if (!hex || hex === 'transparent') return [0, 0, 0, 0];
  let h = hex.trim().replace('#', '').toLowerCase();
  if (h.length === 3 || h.length === 4) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (h.length === 6) h += 'ff';
  if (h.length !== 8) return [0, 0, 0, 0];
  const n = parseInt(h, 16);
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
}

const toHex2 = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');

/** RGBA -> '#rrggbb' (or '#rrggbbaa' when alpha < 255). */
export function rgbaToHex(r: number, g: number, b: number, a = 255): string {
  const base = `#${toHex2(r)}${toHex2(g)}${toHex2(b)}`;
  return a >= 255 ? base : base + toHex2(a);
}

/** Perceptual-ish luminance (0..255), handy for contrast picks. */
export function luminance(hex: string): number {
  const [r, g, b] = hexToRgba(hex);
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/** Nearest palette index (by squared RGB distance) — used by the Pixelizer/import. */
export function nearestIndex(rgb: RGBA, paletteRgba: RGBA[], skipTransparent = true): number {
  let best = skipTransparent ? 1 : 0;
  let bestD = Infinity;
  for (let i = skipTransparent ? 1 : 0; i < paletteRgba.length; i++) {
    const p = paletteRgba[i];
    const dr = rgb[0] - p[0];
    const dg = rgb[1] - p[1];
    const db = rgb[2] - p[2];
    const d = dr * dr + dg * dg + db * db;
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}
