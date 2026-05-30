/**
 * Run-length encoding for palette-index grids. Pixel art has long runs of the
 * same index, so this shrinks documents hugely before lz-string compression.
 * Output is a flat [value, count, value, count, ...] number array.
 */
export function rleEncode(data: Uint8Array): number[] {
  const out: number[] = [];
  let i = 0;
  while (i < data.length) {
    const v = data[i];
    let c = 1;
    while (i + c < data.length && data[i + c] === v) c++;
    out.push(v, c);
    i += c;
  }
  return out;
}

export function rleDecode(runs: number[], length: number): Uint8Array {
  const out = new Uint8Array(length);
  let p = 0;
  for (let i = 0; i + 1 < runs.length; i += 2) {
    const v = runs[i];
    const c = runs[i + 1];
    const end = Math.min(p + c, length);
    out.fill(v, p, end);
    p = end;
  }
  return out;
}
