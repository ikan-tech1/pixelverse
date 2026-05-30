import { hexToRgba } from './color';
import type { PixelDoc, RGBA } from './types';

/** Precompute palette colors as RGBA tuples. */
export function paletteRgba(palette: string[]): RGBA[] {
  return palette.map((c) => hexToRgba(c));
}

/**
 * Flatten one frame to straight (non-premultiplied) RGBA bytes via source-over
 * compositing, bottom layer first. DOM-free so it can be unit-tested and reused
 * for thumbnails, PNG/GIF export, and the live canvas.
 */
export function compositeFrame(
  doc: PixelDoc,
  frame: number,
  out?: Uint8ClampedArray,
  pal?: RGBA[],
): Uint8ClampedArray {
  const { width, height, layers } = doc;
  const size = width * height;
  const rgba = out ?? new Uint8ClampedArray(size * 4);
  rgba.fill(0);
  const colors = pal ?? paletteRgba(doc.palette);

  for (const layer of layers) {
    if (!layer.visible || layer.opacity <= 0) continue;
    const data = layer.frames[frame];
    if (!data) continue;
    const lo = layer.opacity;
    for (let i = 0; i < size; i++) {
      const idx = data[i];
      if (idx === 0) continue; // transparent slot
      const col = colors[idx];
      if (!col) continue;
      const sa = (col[3] / 255) * lo;
      if (sa <= 0) continue;
      const o = i * 4;
      const da = rgba[o + 3] / 255;
      const outA = sa + da * (1 - sa);
      if (outA <= 0) continue;
      const inv = da * (1 - sa);
      rgba[o] = (col[0] * sa + rgba[o] * inv) / outA;
      rgba[o + 1] = (col[1] * sa + rgba[o + 1] * inv) / outA;
      rgba[o + 2] = (col[2] * sa + rgba[o + 2] * inv) / outA;
      rgba[o + 3] = outA * 255;
    }
  }
  return rgba;
}

/** Convenience for canvas code (needs a DOM ImageData). */
export function compositeToImageData(doc: PixelDoc, frame: number): ImageData {
  const rgba = compositeFrame(doc, frame);
  return new ImageData(rgba, doc.width, doc.height);
}
