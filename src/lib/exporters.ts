import { GIFEncoder, quantize, applyPalette } from 'gifenc';
import type { PixelDoc } from '@/pixel/types';
import { compositeFrame } from '@/pixel/composite';

/** Render one frame to a 1:1 canvas (palette-composited). */
export function renderFrame(doc: PixelDoc, frame: number): HTMLCanvasElement {
  const base = document.createElement('canvas');
  base.width = doc.width;
  base.height = doc.height;
  const ctx = base.getContext('2d')!;
  const rgba = compositeFrame(doc, frame);
  ctx.putImageData(new ImageData(rgba, doc.width, doc.height), 0, 0);
  return base;
}

/** Nearest-neighbor upscale to an integer factor. */
export function renderFrameScaled(doc: PixelDoc, frame: number, scale: number): HTMLCanvasElement {
  const base = renderFrame(doc, frame);
  if (scale <= 1) return base;
  const out = document.createElement('canvas');
  out.width = doc.width * scale;
  out.height = doc.height * scale;
  const ctx = out.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(base, 0, 0, out.width, out.height);
  return out;
}

export function canvasToBlob(canvas: HTMLCanvasElement, type = 'image/png'): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), type),
  );
}

export async function exportPngBlob(doc: PixelDoc, frame = 0, scale = 10): Promise<Blob> {
  return canvasToBlob(renderFrameScaled(doc, frame, scale));
}

/** A small PNG data URL for gallery thumbnails. */
export function thumbnailDataUrl(doc: PixelDoc, maxSize = 128): string {
  const scale = Math.max(1, Math.floor(maxSize / Math.max(doc.width, doc.height)));
  return renderFrameScaled(doc, 0, scale).toDataURL('image/png');
}

/** Horizontal spritesheet of all frames at an integer scale. */
export function renderSpritesheet(doc: PixelDoc, scale = 1): HTMLCanvasElement {
  const out = document.createElement('canvas');
  out.width = doc.width * scale * doc.frameCount;
  out.height = doc.height * scale;
  const ctx = out.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  for (let f = 0; f < doc.frameCount; f++) {
    const frame = renderFrame(doc, f);
    ctx.drawImage(frame, 0, 0, doc.width, doc.height, f * doc.width * scale, 0, doc.width * scale, doc.height * scale);
  }
  return out;
}

export async function exportSpritesheetBlob(doc: PixelDoc, scale = 8): Promise<Blob> {
  return canvasToBlob(renderSpritesheet(doc, scale));
}

/** Animated GIF of every frame (transparency-aware) using gifenc. */
export async function exportGifBlob(doc: PixelDoc, scale = 8): Promise<Blob> {
  const enc = GIFEncoder();
  for (let f = 0; f < doc.frameCount; f++) {
    const canvas = renderFrameScaled(doc, f, scale);
    const ctx = canvas.getContext('2d')!;
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const palette = quantize(data, 256, { format: 'rgba4444' });
    const index = applyPalette(data, palette, 'rgba4444');
    enc.writeFrame(index, canvas.width, canvas.height, {
      palette,
      delay: doc.frameDurations[f] ?? 120,
      transparent: true,
    });
  }
  enc.finish();
  return new Blob([enc.bytes()], { type: 'image/gif' });
}
