import { describe, it, expect } from 'vitest';
import { hexToRgba, rgbaToHex, nearestIndex } from '../color';
import type { RGBA } from '../types';

describe('color', () => {
  it('parses 6-digit hex', () => {
    expect(hexToRgba('#ff8800')).toEqual([255, 136, 0, 255]);
  });

  it('parses shorthand hex', () => {
    expect(hexToRgba('#f80')).toEqual([255, 136, 0, 255]);
  });

  it('treats transparent as zero alpha', () => {
    expect(hexToRgba('transparent')).toEqual([0, 0, 0, 0]);
  });

  it('round-trips to hex', () => {
    expect(rgbaToHex(255, 136, 0)).toBe('#ff8800');
    expect(rgbaToHex(0, 0, 0, 128)).toBe('#00000080');
  });

  it('finds nearest palette index, skipping transparent', () => {
    const pal: RGBA[] = [
      [0, 0, 0, 0],
      [255, 0, 0, 255],
      [0, 255, 0, 255],
    ];
    expect(nearestIndex([250, 10, 10, 255], pal)).toBe(1);
    expect(nearestIndex([10, 240, 20, 255], pal)).toBe(2);
  });
});
