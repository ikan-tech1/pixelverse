/**
 * Pure raster operations on a flat palette-index grid (Uint8Array, row-major).
 * Tools (pencil, line, shapes, bucket) are thin wrappers over these. Keeping
 * them DOM-free makes them unit-testable and reusable across editor + games.
 */

export function inside(w: number, h: number, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < w && y < h;
}

/** Stamp a square brush of side `size`, roughly centered on (cx, cy). */
export function stamp(
  grid: Uint8Array,
  w: number,
  h: number,
  cx: number,
  cy: number,
  value: number,
  size = 1,
): void {
  if (size <= 1) {
    if (inside(w, h, cx, cy)) grid[cy * w + cx] = value;
    return;
  }
  const a = Math.floor((size - 1) / 2);
  const b = Math.floor(size / 2);
  for (let dy = -a; dy <= b; dy++) {
    for (let dx = -a; dx <= b; dx++) {
      const x = cx + dx;
      const y = cy + dy;
      if (inside(w, h, x, y)) grid[y * w + x] = value;
    }
  }
}

/** Bresenham line, stamping the brush at each step (for smooth drag-drawing). */
export function drawLine(
  grid: Uint8Array,
  w: number,
  h: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  value: number,
  size = 1,
): void {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  let cx = x0;
  let cy = y0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    stamp(grid, w, h, cx, cy, value, size);
    if (cx === x1 && cy === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      cx += sx;
    }
    if (e2 < dx) {
      err += dx;
      cy += sy;
    }
  }
}

export function drawRect(
  grid: Uint8Array,
  w: number,
  h: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  value: number,
  filled: boolean,
  size = 1,
): void {
  const minX = Math.min(x0, x1);
  const maxX = Math.max(x0, x1);
  const minY = Math.min(y0, y1);
  const maxY = Math.max(y0, y1);
  if (filled) {
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) stamp(grid, w, h, x, y, value, 1);
    }
    return;
  }
  drawLine(grid, w, h, minX, minY, maxX, minY, value, size);
  drawLine(grid, w, h, minX, maxY, maxX, maxY, value, size);
  drawLine(grid, w, h, minX, minY, minX, maxY, value, size);
  drawLine(grid, w, h, maxX, minY, maxX, maxY, value, size);
}

export function drawEllipse(
  grid: Uint8Array,
  w: number,
  h: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  value: number,
  filled: boolean,
  size = 1,
): void {
  const minX = Math.min(x0, x1);
  const maxX = Math.max(x0, x1);
  const minY = Math.min(y0, y1);
  const maxY = Math.max(y0, y1);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const rx = Math.max(0.5, (maxX - minX) / 2);
  const ry = Math.max(0.5, (maxY - minY) / 2);
  const isInside = (x: number, y: number) => {
    const nx = (x - cx) / rx;
    const ny = (y - cy) / ry;
    return nx * nx + ny * ny <= 1;
  };
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (!isInside(x, y)) continue;
      if (filled) {
        stamp(grid, w, h, x, y, value, 1);
      } else if (
        !isInside(x - 1, y) ||
        !isInside(x + 1, y) ||
        !isInside(x, y - 1) ||
        !isInside(x, y + 1)
      ) {
        stamp(grid, w, h, x, y, value, size);
      }
    }
  }
}

/** 4-connected scanline flood fill. */
export function floodFill(
  grid: Uint8Array,
  w: number,
  h: number,
  x: number,
  y: number,
  value: number,
): void {
  if (!inside(w, h, x, y)) return;
  const target = grid[y * w + x];
  if (target === value) return;

  const stack: Array<[number, number]> = [[x, y]];
  while (stack.length) {
    const [sx, sy] = stack.pop()!;
    let nx = sx;
    while (nx >= 0 && grid[sy * w + nx] === target) nx--;
    nx++;
    let spanUp = false;
    let spanDown = false;
    while (nx < w && grid[sy * w + nx] === target) {
      grid[sy * w + nx] = value;
      if (sy > 0) {
        const above = grid[(sy - 1) * w + nx] === target;
        if (above && !spanUp) {
          stack.push([nx, sy - 1]);
          spanUp = true;
        } else if (!above) {
          spanUp = false;
        }
      }
      if (sy < h - 1) {
        const below = grid[(sy + 1) * w + nx] === target;
        if (below && !spanDown) {
          stack.push([nx, sy + 1]);
          spanDown = true;
        } else if (!below) {
          spanDown = false;
        }
      }
      nx++;
    }
  }
}

/** Replace every occurrence of one index with another (global recolor / paint-bucket-all). */
export function replaceIndex(grid: Uint8Array, from: number, to: number): void {
  if (from === to) return;
  for (let i = 0; i < grid.length; i++) if (grid[i] === from) grid[i] = to;
}
