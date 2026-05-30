import { useEffect, useRef } from 'react';
import { hexToRgba } from '@/pixel/color';
import { useSettings } from '@/store/settings';

type RGB = [number, number, number];

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
  max: number;
  c: RGB;
}

const readVar = (cs: CSSStyleDeclaration, name: string, fallback: string): RGB => {
  const [r, g, b] = hexToRgba(cs.getPropertyValue(name).trim() || fallback);
  return [r, g, b];
};

/**
 * Ambient + touch-reactive pixel field. Fills its parent. Drifting "motes"
 * twinkle on their own; touching/dragging spawns sparks and glowing trails.
 */
export function LivingCanvas({ density = 1 }: { density?: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const motes = useRef<Mote[]>([]);
  const sparks = useRef<Spark[]>([]);
  const size = useRef({ w: 0, h: 0, scale: 3 });
  const palette = useRef<RGB[]>([[25, 240, 216]]);
  const bg = useRef<RGB>([11, 11, 26]);
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const theme = useSettings((s) => s.theme);

  function refreshColors() {
    const cs = getComputedStyle(document.documentElement);
    palette.current = [
      readVar(cs, '--accent', '#19f0d8'),
      readVar(cs, '--accent-3', '#b4ff39'),
      readVar(cs, '--accent-2', '#ff2e97'),
      readVar(cs, '--warn', '#ffd23f'),
    ];
    bg.current = readVar(cs, '--bg', '#0b0b1a');
  }

  function makeMote(w: number, h: number): Mote {
    const tier = Math.random();
    const speed = 0.03 + tier * 0.05;
    const ang = Math.random() * Math.PI * 2;
    const cols = palette.current;
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: Math.cos(ang) * speed,
      vy: Math.sin(ang) * speed - 0.015,
      c: cols[(Math.random() * cols.length) | 0],
      tw: 0.6 + Math.random() * 1.6,
      tp: Math.random() * Math.PI * 2,
      halo: tier > 0.72,
    };
  }

  function setup() {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const rect = wrap.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const scale = Math.max(2, Math.round(rect.width / 150));
    const w = Math.max(1, Math.ceil(rect.width / scale));
    const h = Math.max(1, Math.ceil(rect.height / scale));
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    size.current = { w, h, scale };
    const count = Math.min(360, Math.round(((w * h) / 130) * density));
    motes.current = Array.from({ length: count }, () => makeMote(w, h));
  }

  function spawn(x: number, y: number, n: number, power: number) {
    const cols = palette.current;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = Math.random() * power;
      sparks.current.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: 14 + ((Math.random() * 18) | 0),
        max: 32,
        c: cols[(Math.random() * cols.length) | 0],
      });
    }
    if (sparks.current.length > 900) sparks.current.splice(0, sparks.current.length - 900);
  }

  useEffect(() => {
    refreshColors();
    setup();
    const ro = new ResizeObserver(() => setup());
    if (wrapRef.current) ro.observe(wrapRef.current);

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let raf = 0;
    let alive = true;

    const loop = () => {
      if (!alive) return;
      const { w, h } = size.current;
      const [br, bgc, bb] = bg.current;
      ctx.fillStyle = `rgba(${br},${bgc},${bb},0.26)`;
      ctx.fillRect(0, 0, w, h);

      for (const m of motes.current) {
        m.x += m.vx;
        m.y += m.vy;
        m.tp += 0.045 * m.tw;
        if (m.x < 0) m.x += w;
        else if (m.x >= w) m.x -= w;
        if (m.y < 0) m.y += h;
        else if (m.y >= h) m.y -= h;
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

      for (let i = sparks.current.length - 1; i >= 0; i--) {
        const s = sparks.current[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.012;
        s.life--;
        if (s.life <= 0) {
          sparks.current.splice(i, 1);
          continue;
        }
        const a = Math.min(1, s.life / 22);
        ctx.fillStyle = `rgba(${s.c[0]},${s.c[1]},${s.c[2]},${a})`;
        ctx.fillRect(s.x | 0, s.y | 0, 1, 1);
      }

      for (const p of pointers.current.values()) spawn(p.x, p.y, 2, 1.1);

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [density]);

  // Recolor on theme change.
  useEffect(() => {
    refreshColors();
    for (const m of motes.current) m.c = palette.current[(Math.random() * palette.current.length) | 0];
  }, [theme]);

  const toLocal = (clientX: number, clientY: number) => {
    const rect = wrapRef.current!.getBoundingClientRect();
    const { scale } = size.current;
    return { x: (clientX - rect.left) / scale, y: (clientY - rect.top) / scale };
  };

  return (
    <div
      ref={wrapRef}
      className="living-canvas"
      onPointerDown={(e) => {
        const p = toLocal(e.clientX, e.clientY);
        pointers.current.set(e.pointerId, p);
        spawn(p.x, p.y, 18, 2.4);
      }}
      onPointerMove={(e) => {
        if (!pointers.current.has(e.pointerId)) return;
        pointers.current.set(e.pointerId, toLocal(e.clientX, e.clientY));
      }}
      onPointerUp={(e) => pointers.current.delete(e.pointerId)}
      onPointerCancel={(e) => pointers.current.delete(e.pointerId)}
    >
      <canvas ref={canvasRef} className="living-canvas-el" aria-hidden="true" />
    </div>
  );
}
