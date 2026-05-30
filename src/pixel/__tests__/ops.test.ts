import { describe, it, expect } from 'vitest';
import { stamp, drawLine, drawRect, floodFill, replaceIndex } from '../ops';

describe('ops', () => {
  it('stamps a single pixel', () => {
    const g = new Uint8Array(16);
    stamp(g, 4, 4, 1, 1, 9, 1);
    expect(g[1 * 4 + 1]).toBe(9);
  });

  it('draws a line hitting both endpoints', () => {
    const g = new Uint8Array(64);
    drawLine(g, 8, 8, 0, 0, 7, 7, 5, 1);
    expect(g[0]).toBe(5);
    expect(g[7 * 8 + 7]).toBe(5);
  });

  it('flood fills an empty region fully', () => {
    const g = new Uint8Array(16);
    floodFill(g, 4, 4, 0, 0, 2);
    expect(Array.from(g).every((v) => v === 2)).toBe(true);
  });

  it('flood fill respects a barrier', () => {
    const g = new Uint8Array([0, 0, 1, 0, 0]);
    floodFill(g, 5, 1, 0, 0, 3);
    expect(Array.from(g)).toEqual([3, 3, 1, 0, 0]);
  });

  it('rect outline draws the border but not the center', () => {
    const g = new Uint8Array(25);
    drawRect(g, 5, 5, 0, 0, 4, 4, 7, false, 1);
    expect(g[0]).toBe(7);
    expect(g[4 * 5 + 4]).toBe(7);
    expect(g[2 * 5 + 2]).toBe(0);
  });

  it('replaceIndex swaps colors globally', () => {
    const g = new Uint8Array([1, 2, 1, 3]);
    replaceIndex(g, 1, 9);
    expect(Array.from(g)).toEqual([9, 2, 9, 3]);
  });
});
