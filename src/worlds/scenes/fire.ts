import { toImageData } from '@/pixel/composite';
import type { RGB, WorldSketch } from '../types';

/** Classic "doom fire" — heat rises from the base. Touch stokes the flames. */
export function createFire(): WorldSketch {
  let heat = new Float32Array(0);
  let rgba = new Uint8ClampedArray(0);
  let cols = 0;
  let rows = 0;

  const col = (t: number): RGB => {
    const v = Math.max(0, Math.min(1, t));
    if (v < 0.25) return [((v / 0.25) * 180) | 0, 0, 0];
    if (v < 0.5) return [180 + (((v - 0.25) / 0.25) * 75) | 0, (((v - 0.25) / 0.25) * 90) | 0, 0];
    if (v < 0.75) return [255, 90 + (((v - 0.5) / 0.25) * 120) | 0, (((v - 0.5) / 0.25) * 40) | 0];
    return [255, 210 + (((v - 0.75) / 0.25) * 45) | 0, 40 + (((v - 0.75) / 0.25) * 180) | 0];
  };

  return {
    resize(c) {
      cols = c.cols;
      rows = c.rows;
      heat = new Float32Array(cols * rows);
      rgba = new Uint8ClampedArray(cols * rows * 4);
    },
    frame(c) {
      // Seed the fuel row with flicker.
      for (let x = 0; x < cols; x++) heat[(rows - 1) * cols + x] = 0.86 + Math.random() * 0.14;

      // Stoke where touched.
      for (const p of c.pointers) {
        const r = Math.max(2, (cols / 28) | 0);
        for (let dy = -r; dy <= r; dy++) {
          for (let dx = -r; dx <= r; dx++) {
            if (dx * dx + dy * dy > r * r) continue;
            const x = (p.x + dx) | 0;
            const y = (p.y + dy) | 0;
            if (x >= 0 && x < cols && y >= 0 && y < rows) heat[y * cols + x] = Math.min(1, heat[y * cols + x] + 0.55);
          }
        }
      }

      // Propagate heat upward with cooling.
      for (let y = 0; y < rows - 1; y++) {
        for (let x = 0; x < cols; x++) {
          const below = (y + 1) * cols + x;
          const l = x > 0 ? heat[below - 1] : heat[below];
          const r = x < cols - 1 ? heat[below + 1] : heat[below];
          const d = y + 2 < rows ? heat[(y + 2) * cols + x] : heat[below];
          const avg = (heat[below] + l + r + d) / 4;
          heat[y * cols + x] = Math.max(0, avg - (0.006 + Math.random() * 0.022));
        }
      }

      for (let i = 0; i < heat.length; i++) {
        const t = heat[i];
        const o = i * 4;
        if (t <= 0.02) {
          rgba[o + 3] = 0;
          continue;
        }
        const [r, g, b] = col(t);
        rgba[o] = r;
        rgba[o + 1] = g;
        rgba[o + 2] = b;
        rgba[o + 3] = t < 0.1 ? (t * 10 * 255) | 0 : 255;
      }
      c.ctx.putImageData(toImageData(rgba, cols, rows), 0, 0);
    },
  };
}
