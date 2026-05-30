import { uid } from '@/lib/id';
import { DEFAULT_PALETTE } from '@/data/palettes';
import type { Layer, PixelDoc } from './types';

export function emptyGrid(width: number, height: number): Uint8Array {
  return new Uint8Array(width * height);
}

export function createLayer(name: string, width: number, height: number, frameCount = 1): Layer {
  return {
    id: uid(),
    name,
    visible: true,
    opacity: 1,
    frames: Array.from({ length: frameCount }, () => emptyGrid(width, height)),
  };
}

export interface CreateDocOptions {
  name?: string;
  width?: number;
  height?: number;
  palette?: string[];
}

export function createDoc(opts: CreateDocOptions = {}): PixelDoc {
  const width = opts.width ?? 32;
  const height = opts.height ?? 32;
  const now = Date.now();
  return {
    id: uid(),
    name: opts.name ?? 'Untitled',
    width,
    height,
    palette: opts.palette ? [...opts.palette] : [...DEFAULT_PALETTE],
    layers: [createLayer('Layer 1', width, height, 1)],
    frameCount: 1,
    frameDurations: [120],
    activeLayer: 0,
    activeFrame: 0,
    createdAt: now,
    updatedAt: now,
  };
}

export function cloneLayer(layer: Layer): Layer {
  return { ...layer, frames: layer.frames.map((f) => new Uint8Array(f)) };
}

/** Deep clone including typed-array pixel data — used for undo snapshots. */
export function cloneDoc(doc: PixelDoc): PixelDoc {
  return {
    ...doc,
    palette: [...doc.palette],
    frameDurations: [...doc.frameDurations],
    layers: doc.layers.map(cloneLayer),
  };
}

/** The active layer's grid for the active frame. */
export function activeCel(doc: PixelDoc): Uint8Array {
  return doc.layers[doc.activeLayer].frames[doc.activeFrame];
}

export function inBounds(doc: PixelDoc, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < doc.width && y < doc.height;
}
