import type { RGB, WorldCtx, WorldSketch } from '../types';

interface Mote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  c: RGB;
  tw: number;
  tp: number;
  halo: boolean;
}
interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  c: RGB;
}
interface Shoot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  c: RGB;
}

const pick = (c: WorldCtx): RGB => c.palette[(Math.random() * c.palette.length) | 0];

/** A drifting, twinkling cosmos. Touch sparks constellations; shooting stars streak by. */
export function createCosmos(): WorldSketch {
  let motes: Mote[] = [];
  const sparks: Spark[] = [];
  const shoots: Shoot[] = [];
  let lastShoot = 0;

  const makeMote = (c: WorldCtx): Mote => {
    const tier = Math.random();
    const speed = 0.02 + tier * 0.04;
    const ang = Math.random() * Math.PI * 2;
    return {
      x: Math.random() * c.cols,
      y: Math.random() * c.rows,
      vx: Math.cos(ang) * speed,
      vy: Math.sin(ang) * speed - 0.01,
      c: pick(c),
      tw: 0.6 + Math.random() * 1.6,
      tp: Math.random() * Math.PI * 2,
      halo: tier > 0.7,
    };
  };

  const spawn = (c: WorldCtx, x: number, y: number, n: number, power: number) => {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = Math.random() * power;
      sparks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 14 + ((Math.random() * 18) | 0), c: pick(c) });
    }
    if (sparks.length > 1400) sparks.splice(0, sparks.length - 1400);
  };

  return {
    resize(c) {
      const count = Math.min(460, Math.round((c.cols * c.rows) / 120));
      motes = Array.from({ length: count }, () => makeMote(c));
    },
    frame(c) {
      const { ctx, cols, rows, bg } = c;
      ctx.fillStyle = `rgba(${bg[0]},${bg[1]},${bg[2]},0.28)`;
      ctx.fillRect(0, 0, cols, rows);

      for (const m of motes) {
        m.x += m.vx;
        m.y += m.vy;
        m.tp += 0.045 * m.tw;
        if (m.x < 0) m.x += cols;
        else if (m.x >= cols) m.x -= cols;
        if (m.y < 0) m.y += rows;
        else if (m.y >= rows) m.y -= rows;
        const a = 0.4 + 0.45 * Math.sin(m.tp);
        const xi = m.x | 0;
        const yi = m.y | 0;
        ctx.fillStyle = `rgba(${m.c[0]},${m.c[1]},${m.c[2]},${a})`;
        ctx.fillRect(xi, yi, 1, 1);
        if (m.halo) {
          ctx.fillStyle = `rgba(${m.c[0]},${m.c[1]},${m.c[2]},${a * 0.22})`;
          ctx.fillRect(xi - 1, yi, 1, 1);
          ctx.fillRect(xi + 1, yi, 1, 1);
          ctx.fillRect(xi, yi - 1, 1, 1);
          ctx.fillRect(xi, yi + 1, 1, 1);
        }
      }

      for (const p of c.pointers) spawn(c, p.x, p.y, p.age === 0 ? 24 : 2, p.age === 0 ? 2.6 : 1);

      if (c.frame - lastShoot > 80 && Math.random() < 0.05) {
        lastShoot = c.frame;
        const fromLeft = Math.random() < 0.5;
        shoots.push({
          x: fromLeft ? 0 : cols,
          y: Math.random() * rows * 0.5,
          vx: (fromLeft ? 1 : -1) * (1.4 + Math.random()),
          vy: 0.4 + Math.random() * 0.5,
          life: 46,
          c: c.palette[0],
        });
      }
      for (let i = shoots.length - 1; i >= 0; i--) {
        const s = shoots[i];
        for (let t = 0; t < 5; t++) {
          const a = (1 - t * 0.2) * Math.min(1, s.life / 12);
          ctx.fillStyle = `rgba(${s.c[0]},${s.c[1]},${s.c[2]},${a})`;
          ctx.fillRect((s.x - s.vx * t) | 0, (s.y - s.vy * t) | 0, 1, 1);
        }
        s.x += s.vx;
        s.y += s.vy;
        s.life--;
        if (s.life <= 0 || s.x < -2 || s.x > cols + 2) shoots.splice(i, 1);
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.012;
        s.life--;
        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        ctx.fillStyle = `rgba(${s.c[0]},${s.c[1]},${s.c[2]},${Math.min(1, s.life / 22)})`;
        ctx.fillRect(s.x | 0, s.y | 0, 1, 1);
      }
    },
  };
}
