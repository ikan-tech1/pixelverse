import type { RGB, WorldCtx, WorldSketch } from '../types';

interface Fish {
  x: number;
  y: number;
  vx: number;
  vy: number;
  c: RGB;
  ph: number;
  sp: number;
  big: boolean;
}
interface Bubble {
  x: number;
  y: number;
  v: number;
  life: number;
}

/** A calm pixel aquarium. Fish drift and wiggle; touch scatters them and trails bubbles. */
export function createAquarium(): WorldSketch {
  let fish: Fish[] = [];
  const bubbles: Bubble[] = [];
  let cols = 0;
  let rows = 0;

  const makeFish = (c: WorldCtx): Fish => {
    const dir = Math.random() < 0.5 ? 1 : -1;
    const sp = 0.1 + Math.random() * 0.16;
    return {
      x: Math.random() * c.cols,
      y: c.rows * (0.12 + Math.random() * 0.72),
      vx: dir * sp,
      vy: 0,
      c: c.palette[(Math.random() * c.palette.length) | 0],
      ph: Math.random() * Math.PI * 2,
      sp,
      big: Math.random() < 0.28,
    };
  };

  return {
    resize(c) {
      cols = c.cols;
      rows = c.rows;
      const n = Math.max(6, Math.min(44, Math.round((cols * rows) / 850)));
      fish = Array.from({ length: n }, () => makeFish(c));
    },
    frame(c) {
      const { ctx, bg } = c;
      const a = c.palette[0];
      const bot: RGB = [
        Math.round(bg[0] * 0.55 + a[0] * 0.1),
        Math.round(bg[1] * 0.55 + a[1] * 0.18),
        Math.round(bg[2] * 0.55 + a[2] * 0.28),
      ];
      const g = ctx.createLinearGradient(0, 0, 0, rows);
      g.addColorStop(0, `rgb(${bg[0]},${bg[1]},${bg[2]})`);
      g.addColorStop(1, `rgb(${bot[0]},${bot[1]},${bot[2]})`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cols, rows);

      for (const p of c.pointers) {
        if (p.age % 3 === 0) bubbles.push({ x: p.x, y: p.y, v: 0.15 + Math.random() * 0.2, life: 70 });
        for (const f of fish) {
          const dx = f.x - p.x;
          const dy = f.y - p.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 420) {
            const d = Math.sqrt(d2) || 1;
            f.vx += (dx / d) * 0.45;
            f.vy += (dy / d) * 0.45;
          }
        }
      }

      for (const f of fish) {
        f.ph += 0.22;
        f.x += f.vx;
        f.y += f.vy + Math.sin(f.ph) * 0.05;
        f.vx *= 0.96;
        f.vy *= 0.9;
        const cruise = f.vx >= 0 ? f.sp : -f.sp;
        f.vx += (cruise - f.vx) * 0.02;
        if (f.x < -2) f.x += cols + 4;
        else if (f.x > cols + 2) f.x -= cols + 4;
        if (f.y < 2) {
          f.y = 2;
          f.vy = Math.abs(f.vy);
        } else if (f.y > rows - 2) {
          f.y = rows - 2;
          f.vy = -Math.abs(f.vy);
        }
        const xi = f.x | 0;
        const yi = f.y | 0;
        const dir = f.vx >= 0 ? 1 : -1;
        ctx.fillStyle = `rgb(${f.c[0]},${f.c[1]},${f.c[2]})`;
        ctx.fillRect(xi, yi, 1, 1);
        ctx.fillRect(xi + dir, yi, 1, 1);
        if (f.big) ctx.fillRect(xi, yi - 1, 1, 1);
        ctx.fillStyle = `rgba(${f.c[0]},${f.c[1]},${f.c[2]},0.55)`;
        ctx.fillRect(xi - dir, yi + (Math.sin(f.ph) > 0 ? 0 : -1), 1, 1);
      }

      if (c.frame % 22 === 0) bubbles.push({ x: Math.random() * cols, y: rows - 1, v: 0.1 + Math.random() * 0.14, life: 140 });
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        b.y -= b.v;
        b.x += Math.sin(b.y * 0.3) * 0.05;
        b.life--;
        if (b.life <= 0 || b.y < 0) {
          bubbles.splice(i, 1);
          continue;
        }
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillRect(b.x | 0, b.y | 0, 1, 1);
      }
    },
  };
}
