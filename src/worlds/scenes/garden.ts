import type { RGB, WorldCtx, WorldSketch } from '../types';

interface Flower {
  x: number;
  h: number;
  maxH: number;
  bloom: number;
  c: RGB;
  ph: number;
}

const clamp255 = (n: number) => Math.max(0, Math.min(255, n | 0));

/** A garden under a drifting day/night sky. Tap the ground to plant a flower that grows and sways. */
export function createGarden(): WorldSketch {
  let flowers: Flower[] = [];
  let stars: { x: number; y: number; t: number }[] = [];
  let cols = 0;
  let rows = 0;

  const plant = (c: WorldCtx, x: number): Flower => ({
    x,
    h: 0,
    maxH: rows * (0.2 + Math.random() * 0.36),
    bloom: 0,
    c: c.palette[(Math.random() * c.palette.length) | 0],
    ph: Math.random() * 6,
  });

  return {
    resize(c) {
      cols = c.cols;
      rows = c.rows;
      flowers = Array.from({ length: 5 }, () => plant(c, Math.random() * cols));
      stars = Array.from({ length: 46 }, () => ({ x: Math.random() * cols, y: Math.random() * rows * 0.62, t: Math.random() * 6 }));
    },
    frame(c) {
      const { ctx, bg, palette } = c;
      const day = Math.sin(c.frame * 0.002) * 0.5 + 0.5; // 0 night → 1 day
      const top: RGB = [clamp255(bg[0] + day * 38), clamp255(bg[1] + day * 50), clamp255(bg[2] + day * 72)];
      const g = ctx.createLinearGradient(0, 0, 0, rows);
      g.addColorStop(0, `rgb(${top[0]},${top[1]},${top[2]})`);
      g.addColorStop(0.78, `rgb(${bg[0]},${bg[1]},${bg[2]})`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cols, rows);

      if (day < 0.55) {
        for (const s of stars) {
          s.t += 0.05;
          const a = (0.3 + 0.4 * Math.sin(s.t)) * (0.55 - day) * 2;
          if (a > 0) {
            ctx.fillStyle = `rgba(255,255,255,${a})`;
            ctx.fillRect(s.x | 0, s.y | 0, 1, 1);
          }
        }
      }

      ctx.fillStyle = 'rgba(72,193,74,0.3)';
      ctx.fillRect(0, rows - 2, cols, 2);

      for (const p of c.pointers) if (p.age === 0 && flowers.length < 70) flowers.push(plant(c, p.x));

      for (const f of flowers) {
        if (f.h < f.maxH) f.h += 0.4;
        else if (f.bloom < 1) f.bloom += 0.03;
        f.ph += 0.03;
        const sway = Math.sin(f.ph + f.h * 0.05) * f.h * 0.06;
        ctx.fillStyle = 'rgba(72,193,74,0.92)';
        for (let i = 0; i < f.h; i++) {
          const yy = (rows - 1 - i) | 0;
          const xx = (f.x + sway * (i / f.h)) | 0;
          ctx.fillRect(xx, yy, 1, 1);
        }
        if (f.bloom > 0) {
          const bx = (f.x + sway) | 0;
          const by = (rows - 1 - f.h) | 0;
          const r = 1 + Math.round(f.bloom);
          ctx.fillStyle = `rgb(${f.c[0]},${f.c[1]},${f.c[2]})`;
          for (let a = 0; a < 4; a++) {
            const ang = (a * Math.PI) / 2;
            ctx.fillRect((bx + Math.cos(ang) * r) | 0, (by + Math.sin(ang) * r) | 0, 1, 1);
          }
          ctx.fillStyle = `rgb(${palette[3][0]},${palette[3][1]},${palette[3][2]})`;
          ctx.fillRect(bx, by, 1, 1);
        }
      }
    },
  };
}
