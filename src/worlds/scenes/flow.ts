import type { RGB, WorldCtx, WorldSketch } from '../types';

interface Particle {
  x: number;
  y: number;
  c: RGB;
}

/** A flowing particle field. Drag to push the swarm and carve currents. */
export function createFlow(): WorldSketch {
  let parts: Particle[] = [];
  let cols = 0;
  let rows = 0;

  const field = (x: number, y: number, t: number): number =>
    (Math.sin(x * 0.06 + t) + Math.cos(y * 0.07 - t * 0.8) + Math.sin((x + y) * 0.04 + t * 0.5)) * 1.2;

  return {
    resize(c: WorldCtx) {
      cols = c.cols;
      rows = c.rows;
      const n = Math.min(1000, Math.round((cols * rows) / 36));
      parts = Array.from({ length: n }, () => ({
        x: Math.random() * cols,
        y: Math.random() * rows,
        c: c.palette[(Math.random() * c.palette.length) | 0],
      }));
    },
    frame(c) {
      const { ctx, bg } = c;
      const t = c.frame * 0.01;
      ctx.fillStyle = `rgba(${bg[0]},${bg[1]},${bg[2]},0.12)`;
      ctx.fillRect(0, 0, cols, rows);
      for (const p of parts) {
        const a = field(p.x, p.y, t);
        let vx = Math.cos(a) * 0.6;
        let vy = Math.sin(a) * 0.6;
        for (const pt of c.pointers) {
          const dx = pt.x - p.x;
          const dy = pt.y - p.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 1100) {
            const d = Math.sqrt(d2) || 1;
            vx += (dx / d) * 0.9;
            vy += (dy / d) * 0.9;
          }
        }
        p.x += vx;
        p.y += vy;
        if (p.x < 0) p.x += cols;
        else if (p.x >= cols) p.x -= cols;
        if (p.y < 0) p.y += rows;
        else if (p.y >= rows) p.y -= rows;
        ctx.fillStyle = `rgba(${p.c[0]},${p.c[1]},${p.c[2]},0.85)`;
        ctx.fillRect(p.x | 0, p.y | 0, 1, 1);
      }
    },
  };
}
