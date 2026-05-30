import { describe, it, expect } from 'vitest';
import { createDoc, activeCel } from '../doc';
import { encodeDoc, decodeDoc, serializeDoc, deserializeDoc } from '../codec';

describe('codec', () => {
  it('round-trips a doc with drawn pixels through a share string', () => {
    const doc = createDoc({ width: 8, height: 8, name: 'Test' });
    const cel = activeCel(doc);
    cel[0] = 3;
    cel[10] = 5;
    cel[63] = 1;

    const restored = decodeDoc(encodeDoc(doc));
    expect(restored).not.toBeNull();
    expect(restored!.width).toBe(8);
    expect(restored!.height).toBe(8);
    expect(restored!.name).toBe('Test');
    expect(restored!.palette).toEqual(doc.palette);
    expect(Array.from(activeCel(restored!))).toEqual(Array.from(cel));
  });

  it('returns null on garbage input', () => {
    expect(decodeDoc('not-a-valid-string')).toBeNull();
    expect(decodeDoc('')).toBeNull();
  });

  it('preserves layers and frame count via serialize/deserialize', () => {
    const doc = createDoc({ width: 4, height: 4 });
    const back = deserializeDoc(serializeDoc(doc));
    expect(back.layers.length).toBe(doc.layers.length);
    expect(back.frameCount).toBe(doc.frameCount);
    expect(back.frameDurations).toEqual(doc.frameDurations);
  });
});
