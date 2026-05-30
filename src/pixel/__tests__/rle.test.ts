import { describe, it, expect } from 'vitest';
import { rleEncode, rleDecode } from '../rle';

describe('rle', () => {
  it('round-trips arbitrary data', () => {
    const data = new Uint8Array([0, 0, 0, 1, 1, 2, 2, 2, 2, 0]);
    expect(Array.from(rleDecode(rleEncode(data), data.length))).toEqual(Array.from(data));
  });

  it('encodes a solid run compactly', () => {
    const data = new Uint8Array(100).fill(5);
    expect(rleEncode(data)).toEqual([5, 100]);
  });

  it('handles empty input', () => {
    expect(rleEncode(new Uint8Array(0))).toEqual([]);
    expect(Array.from(rleDecode([], 0))).toEqual([]);
  });

  it('stops at target length even if runs overshoot', () => {
    expect(Array.from(rleDecode([7, 999], 3))).toEqual([7, 7, 7]);
  });
});
