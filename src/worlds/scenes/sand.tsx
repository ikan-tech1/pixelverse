import { useState } from 'react';
import { toImageData } from '@/pixel/composite';
import { cn } from '@/lib/cn';
import { useSfx } from '@/lib/useSfx';
import type { WorldSketch } from '../types';

const EMPTY = 0;
const SAND = 1;
const WATER = 2;
const STONE = 3;
const FIRE = 4;
const PLANT = 5;
const SMOKE = 6;

export interface SandSketch extends WorldSketch {
  element: number;
  clear(): void;
}

export function createSand(): SandSketch {
  let grid = new Uint8Array(0);
  let moved = new Uint8Array(0);
  let rgba = new Uint8ClampedArray(0);
  let cols = 0;
  let rows = 0;
  let frame = 0;

  const COLOR: Record<number, [number, number, number]> = {
    [SAND]: [230, 198, 110],
    [WATER]: [63, 154, 224],
    [STONE]: [138, 138, 154],
    [PLANT]: [72, 193, 74],
    [SMOKE]: [150, 156, 166],
  };

  function paint(cx: number, cy: number, e: number, r: number) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (dx * dx + dy * dy > r * r) continue;
        const x = (cx + dx) | 0;
        const y = (cy + dy) | 0;
        if (x >= 0 && x < cols && y >= 0 && y < rows) grid[y * cols + x] = e;
      }
    }
  }

  function step() {
    moved.fill(0);
    const ltr = (frame & 1) === 0;
    for (let y = rows - 1; y >= 0; y--) {
      for (let k = 0; k < cols; k++) {
        const x = ltr ? k : cols - 1 - k;
        const i = y * cols + x;
        if (moved[i]) continue;
        const e = grid[i];
        if (e === EMPTY || e === STONE || e === PLANT) continue;

        if (e === SAND) {
          const below = y + 1 < rows ? grid[i + cols] : STONE;
          if (below === EMPTY || below === WATER) {
            grid[i] = below;
            grid[i + cols] = SAND;
            moved[i + cols] = 1;
            continue;
          }
          const dirs = Math.random() < 0.5 ? [-1, 1] : [1, -1];
          let did = false;
          for (const dx of dirs) {
            const nx = x + dx;
            if (nx < 0 || nx >= cols || y + 1 >= rows) continue;
            const j = (y + 1) * cols + nx;
            if (grid[j] === EMPTY || grid[j] === WATER) {
              grid[i] = grid[j];
              grid[j] = SAND;
              moved[j] = 1;
              did = true;
              break;
            }
          }
          if (did) continue;
        } else if (e === WATER) {
          if (y + 1 < rows && grid[i + cols] === EMPTY) {
            grid[i] = EMPTY;
            grid[i + cols] = WATER;
            moved[i + cols] = 1;
            continue;
          }
          const dirs = Math.random() < 0.5 ? [-1, 1] : [1, -1];
          let did = false;
          for (const dx of dirs) {
            const nx = x + dx;
            if (nx < 0 || nx >= cols || y + 1 >= rows) continue;
            const j = (y + 1) * cols + nx;
            if (grid[j] === EMPTY) {
              grid[i] = EMPTY;
              grid[j] = WATER;
              moved[j] = 1;
              did = true;
              break;
            }
          }
          if (did) continue;
          for (const dx of dirs) {
            const nx = x + dx;
            if (nx < 0 || nx >= cols) continue;
            const j = y * cols + nx;
            if (grid[j] === EMPTY) {
              grid[i] = EMPTY;
              grid[j] = WATER;
              moved[j] = 1;
              break;
            }
          }
        } else if (e === FIRE) {
          let ext = false;
          const neigh = [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1],
          ];
          for (const [dx, dy] of neigh) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
            const j = ny * cols + nx;
            if (grid[j] === PLANT && Math.random() < 0.28) {
              grid[j] = FIRE;
              moved[j] = 1;
            } else if (grid[j] === WATER && Math.random() < 0.6) {
              grid[i] = SMOKE;
              moved[i] = 1;
              ext = true;
              break;
            }
          }
          if (!ext && Math.random() < 0.09) {
            grid[i] = Math.random() < 0.5 ? SMOKE : EMPTY;
            moved[i] = 1;
          }
        } else if (e === SMOKE) {
          if (Math.random() < 0.05) {
            grid[i] = EMPTY;
            continue;
          }
          if (y - 1 >= 0 && grid[i - cols] === EMPTY) {
            grid[i] = EMPTY;
            grid[i - cols] = SMOKE;
            moved[i - cols] = 1;
            continue;
          }
          const dirs = Math.random() < 0.5 ? [-1, 1] : [1, -1];
          for (const dx of dirs) {
            const nx = x + dx;
            if (nx < 0 || nx >= cols || y - 1 < 0) continue;
            const j = (y - 1) * cols + nx;
            if (grid[j] === EMPTY) {
              grid[i] = EMPTY;
              grid[j] = SMOKE;
              moved[j] = 1;
              break;
            }
          }
        }
      }
    }
    frame++;
  }

  const sketch: SandSketch = {
    element: SAND,
    clear() {
      grid.fill(0);
    },
    resize(c) {
      const og = grid;
      const oc = cols;
      const or = rows;
      cols = c.cols;
      rows = c.rows;
      grid = new Uint8Array(cols * rows);
      moved = new Uint8Array(cols * rows);
      rgba = new Uint8ClampedArray(cols * rows * 4);
      if (og.length) {
        const cw = Math.min(cols, oc);
        const ch = Math.min(rows, or);
        for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) grid[y * cols + x] = og[y * oc + x];
      }
    },
    frame(c) {
      const r = Math.max(2, Math.round(cols / 36));
      for (const p of c.pointers) paint(p.x, p.y, sketch.element, sketch.element === EMPTY ? r + 1 : r);
      step();
      for (let i = 0; i < grid.length; i++) {
        const e = grid[i];
        const o = i * 4;
        if (e === EMPTY) {
          rgba[o + 3] = 0;
          continue;
        }
        let cc = COLOR[e];
        if (e === FIRE) cc = [255, 120 + ((Math.random() * 90) | 0), 20];
        rgba[o] = cc[0];
        rgba[o + 1] = cc[1];
        rgba[o + 2] = cc[2];
        rgba[o + 3] = e === SMOKE ? 165 : 255;
      }
      c.ctx.putImageData(toImageData(rgba, cols, rows), 0, 0);
    },
  };
  return sketch;
}

const ELEMENTS = [
  { id: SAND, name: 'Sand', color: '#e6c66e' },
  { id: WATER, name: 'Water', color: '#3f9ae0' },
  { id: STONE, name: 'Stone', color: '#8a8a9a' },
  { id: PLANT, name: 'Plant', color: '#48c14a' },
  { id: FIRE, name: 'Fire', color: '#ff7a18' },
  { id: EMPTY, name: 'Erase', color: 'transparent' },
];

export function SandControls({ sketch }: { sketch: SandSketch }) {
  const [el, setEl] = useState(sketch.element);
  const play = useSfx();
  return (
    <div className="world-dots">
      {ELEMENTS.map((e) => (
        <button
          key={e.id}
          className={cn('world-dot', el === e.id && 'is-on', e.id === EMPTY && 'world-dot--erase')}
          style={e.id === EMPTY ? undefined : { background: e.color }}
          aria-label={e.name}
          title={e.name}
          onClick={() => {
            sketch.element = e.id;
            setEl(e.id);
            play('tap');
          }}
        />
      ))}
      <button
        className="world-pill"
        aria-label="Clear"
        onClick={() => {
          sketch.clear();
          play('error');
        }}
      >
        Clear
      </button>
    </div>
  );
}
