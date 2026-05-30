import { useState } from 'react';
import { toImageData } from '@/pixel/composite';
import { cn } from '@/lib/cn';
import { useSfx } from '@/lib/useSfx';
import type { WorldSketch } from '../types';

export interface LifeSketch extends WorldSketch {
  paused: boolean;
  clear(): void;
  randomize(): void;
}

export function createLife(): LifeSketch {
  let cells = new Uint8Array(0);
  let next = new Uint8Array(0);
  let glow = new Float32Array(0);
  let rgba = new Uint8ClampedArray(0);
  let cols = 0;
  let rows = 0;

  const at = (x: number, y: number): number => cells[((y + rows) % rows) * cols + ((x + cols) % cols)];

  function stepLife() {
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        let n = 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (dx || dy) n += at(x + dx, y + dy);
        const a = cells[y * cols + x];
        next[y * cols + x] = a ? (n === 2 || n === 3 ? 1 : 0) : n === 3 ? 1 : 0;
      }
    }
    const t = cells;
    cells = next;
    next = t;
  }

  const sketch: LifeSketch = {
    paused: false,
    clear() {
      cells.fill(0);
      glow.fill(0);
    },
    randomize() {
      for (let i = 0; i < cells.length; i++) cells[i] = Math.random() < 0.22 ? 1 : 0;
    },
    resize(c) {
      cols = c.cols;
      rows = c.rows;
      cells = new Uint8Array(cols * rows);
      next = new Uint8Array(cols * rows);
      glow = new Float32Array(cols * rows);
      rgba = new Uint8ClampedArray(cols * rows * 4);
      for (let i = 0; i < cells.length; i++) cells[i] = Math.random() < 0.16 ? 1 : 0;
    },
    frame(c) {
      for (const p of c.pointers) {
        const x = p.x | 0;
        const y = p.y | 0;
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++) {
            const xx = x + dx;
            const yy = y + dy;
            if (xx >= 0 && xx < cols && yy >= 0 && yy < rows) cells[yy * cols + xx] = 1;
          }
      }
      if (!sketch.paused && c.frame % 4 === 0) stepLife();

      const a = c.palette[0];
      for (let i = 0; i < cells.length; i++) {
        const o = i * 4;
        if (cells[i]) {
          glow[i] = 1;
          rgba[o] = a[0];
          rgba[o + 1] = a[1];
          rgba[o + 2] = a[2];
          rgba[o + 3] = 255;
        } else {
          glow[i] *= 0.86;
          if (glow[i] > 0.03) {
            rgba[o] = a[0];
            rgba[o + 1] = a[1];
            rgba[o + 2] = a[2];
            rgba[o + 3] = (glow[i] * 150) | 0;
          } else {
            rgba[o + 3] = 0;
          }
        }
      }
      c.ctx.putImageData(toImageData(rgba, cols, rows), 0, 0);
    },
  };
  return sketch;
}

export function LifeControls({ sketch }: { sketch: LifeSketch }) {
  const [paused, setPaused] = useState(sketch.paused);
  const play = useSfx();
  return (
    <div className="world-dots">
      <button
        className={cn('world-pill', paused && 'is-on')}
        onClick={() => {
          sketch.paused = !sketch.paused;
          setPaused(sketch.paused);
          play('tap');
        }}
      >
        {paused ? 'Play' : 'Pause'}
      </button>
      <button
        className="world-pill"
        onClick={() => {
          sketch.randomize();
          play('select');
        }}
      >
        Seed
      </button>
      <button
        className="world-pill"
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
