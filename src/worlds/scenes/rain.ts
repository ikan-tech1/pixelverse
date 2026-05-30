import type { WorldCtx, WorldSketch } from '../types';

interface Drop {
  x: number;
  y: number;
  vy: number;
  len: number;
}
interface Splash {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

/** Pixel rain. Drag to bend the wind; tap to trigger a lightning flash. */
export function createRain(): WorldSketch {
  let drops: Drop[] = [];
  const splash: Splash[] = [];
  let cols = 0;
  let rows = 0;
  let wind = 0;
  let flash = 0;

  const mk = (c: WorldCtx): Drop => ({
    x: Math.random() * c.cols,
    y: Math.random() * c.rows,
    vy: 0.9 + Math.random() * 0.8,
    len: 2 + ((Math.random() * 3) | 0),
  });

  return {
    resize(c) {
      cols = c.cols;
      rows = c.rows;
      const n = Math.min(720, Math.round((cols * rows) / 90));
      drops = Array.from({ length: n }, () => mk(c));
    },
    frame(c) {
      const { ctx, bg, palette } = c;
      let target = 0;
      let pn = 0;
      for (const p of c.pointers) {
        target += ((p.x - cols / 2) / cols) * 2.2;
        pn++;
        if (p.age === 0) flash = 1;
      }
      if (pn) target /= pn;
      wind += (target - wind) * 0.05;

      ctx.fillStyle = `rgb(${bg[0]},${bg[1]},${bg[2]})`;
      ctx.fillRect(0, 0, cols, rows);
      if (flash > 0.02) {
        ctx.fillStyle = `rgba(200,210,255,${flash * 0.4})`;
        ctx.fillRect(0, 0, cols, rows);
        flash *= 0.85;
      }

      const col = palette[0];
      ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},0.6)`;
      for (const d of drops) {
        d.x += wind * 1.5;
        d.y += d.vy;
        for (let t = 0; t < d.len; t++) ctx.fillRect((d.x - wind * t) | 0, (d.y - t) | 0, 1, 1);
        if (d.y >= rows) {
          for (let s = 0; s < 2; s++)
            splash.push({ x: d.x, y: rows - 1, vx: (Math.random() - 0.5) * 0.6, vy: -Math.random() * 0.6, life: 8 });
          d.y = -d.len;
          d.x = Math.random() * cols;
        }
        if (d.x < 0) d.x += cols;
        else if (d.x >= cols) d.x -= cols;
      }

      ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},0.85)`;
      for (let i = splash.length - 1; i >= 0; i--) {
        const s = splash[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.1;
        s.life--;
        if (s.life <= 0) {
          splash.splice(i, 1);
          continue;
        }
        ctx.fillRect(s.x | 0, s.y | 0, 1, 1);
      }
    },
  };
}
