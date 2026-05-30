import type { PixelDoc } from '@/pixel/types';
import { encodeDoc, decodeDoc } from '@/pixel/codec';

const HASH_KEY = 'art=';

/** A self-contained URL whose hash *is* the artwork. */
export function shareUrl(doc: PixelDoc): string {
  return `${location.origin}/studio#${HASH_KEY}${encodeDoc(doc)}`;
}

/** If the current URL hash carries artwork, decode it. */
export function docFromHash(hash: string): PixelDoc | null {
  const h = hash.replace(/^#/, '');
  if (!h.startsWith(HASH_KEY)) return null;
  return decodeDoc(h.slice(HASH_KEY.length));
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
