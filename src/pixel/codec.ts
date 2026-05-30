import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import { uid } from '@/lib/id';
import { rleDecode, rleEncode } from './rle';
import type { PixelDoc } from './types';

const FORMAT_VERSION = 1;

interface SerLayer {
  id: string;
  n: string;
  vi: 0 | 1;
  o: number;
  f: number[][]; // one RLE run-list per frame
}

interface SerDoc {
  v: number;
  n: string;
  w: number;
  h: number;
  p: string[];
  fc: number;
  fd: number[];
  l: SerLayer[];
}

export function serializeDoc(doc: PixelDoc): SerDoc {
  return {
    v: FORMAT_VERSION,
    n: doc.name,
    w: doc.width,
    h: doc.height,
    p: doc.palette,
    fc: doc.frameCount,
    fd: doc.frameDurations,
    l: doc.layers.map((la) => ({
      id: la.id,
      n: la.name,
      vi: la.visible ? 1 : 0,
      o: la.opacity,
      f: la.frames.map((grid) => rleEncode(grid)),
    })),
  };
}

export function deserializeDoc(s: SerDoc): PixelDoc {
  const size = s.w * s.h;
  const now = Date.now();
  return {
    id: uid(),
    name: s.n ?? 'Untitled',
    width: s.w,
    height: s.h,
    palette: s.p,
    frameCount: s.fc,
    frameDurations: s.fd ?? Array.from({ length: s.fc }, () => 120),
    activeLayer: 0,
    activeFrame: 0,
    createdAt: now,
    updatedAt: now,
    layers: s.l.map((sl) => ({
      id: sl.id || uid(),
      name: sl.n,
      visible: sl.vi === 1,
      opacity: sl.o,
      frames: sl.f.map((runs) => rleDecode(runs, size)),
    })),
  };
}

/** Compact, URL-safe string of an entire artwork (used for share links + .pix files). */
export function encodeDoc(doc: PixelDoc): string {
  return compressToEncodedURIComponent(JSON.stringify(serializeDoc(doc)));
}

export function decodeDoc(encoded: string): PixelDoc | null {
  try {
    const json = decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const parsed = JSON.parse(json) as SerDoc;
    if (!parsed || typeof parsed.w !== 'number' || !Array.isArray(parsed.l)) return null;
    return deserializeDoc(parsed);
  } catch {
    return null;
  }
}
