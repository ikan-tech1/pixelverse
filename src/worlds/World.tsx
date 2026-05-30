import { useEffect, useRef } from 'react';
import { hexToRgba } from '@/pixel/color';
import { useSettings } from '@/store/settings';
import type { RGB, WorldCtx, WorldPointer, WorldSketch } from './types';

function readVar(cs: CSSStyleDeclaration, name: string, fallback: string): RGB {
  const [r, g, b] = hexToRgba(cs.getPropertyValue(name).trim() || fallback);
  return [r, g, b];
}

function themeColors(): { palette: RGB[]; bg: RGB } {
  const cs = getComputedStyle(document.documentElement);
  return {
    palette: [
      readVar(cs, '--accent', '#19f0d8'),
      readVar(cs, '--accent-3', '#b4ff39'),
      readVar(cs, '--accent-2', '#ff2e97'),
      readVar(cs, '--warn', '#ffd23f'),
    ],
    bg: readVar(cs, '--bg', '#0b0b1a'),
  };
}

/**
 * Hosts one living scene. Sizes a pixel canvas to its container, runs the RAF
 * loop (only while `active`), and feeds the sketch grid-mapped multi-touch.
 */
export function World({
  sketch,
  pixelSize,
  active,
}: {
  sketch: WorldSketch;
  pixelSize: number;
  active: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wc = useRef<WorldCtx | null>(null);
  const inited = useRef(false);
  const pointers = useRef<Map<number, WorldPointer>>(new Map());
  const activeRef = useRef(active);
  activeRef.current = active;
  const theme = useSettings((s) => s.theme);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const setup = () => {
      const rect = wrap.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const cols = Math.max(8, Math.ceil(rect.width / pixelSize));
      const rows = Math.max(8, Math.ceil(rect.height / pixelSize));
      canvas.width = cols;
      canvas.height = rows;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;
      const { palette, bg } = themeColors();
      const next: WorldCtx = wc.current ?? {
        ctx,
        cols,
        rows,
        frame: 0,
        palette,
        bg,
        pointers: [],
      };
      next.ctx = ctx;
      next.cols = cols;
      next.rows = rows;
      next.palette = palette;
      next.bg = bg;
      wc.current = next;
      if (!inited.current) {
        sketch.init?.(next);
        inited.current = true;
      }
      sketch.resize?.(next);
    };

    setup();
    const ro = new ResizeObserver(setup);
    ro.observe(wrap);

    let raf = 0;
    let alive = true;
    const loop = () => {
      if (!alive) return;
      const c = wc.current;
      if (c && activeRef.current) {
        c.frame++;
        c.pointers = [...pointers.current.values()];
        sketch.frame(c);
        for (const p of c.pointers) {
          p.px = p.x;
          p.py = p.y;
          p.age++;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [sketch, pixelSize]);

  // Recolor live on theme change.
  useEffect(() => {
    const c = wc.current;
    if (c) {
      const { palette, bg } = themeColors();
      c.palette = palette;
      c.bg = bg;
    }
  }, [theme]);

  const toGrid = (clientX: number, clientY: number) => {
    const rect = wrapRef.current!.getBoundingClientRect();
    const c = wc.current!;
    return {
      x: ((clientX - rect.left) / rect.width) * c.cols,
      y: ((clientY - rect.top) / rect.height) * c.rows,
    };
  };

  return (
    <div
      ref={wrapRef}
      className="world-stage"
      onPointerDown={(e) => {
        wrapRef.current?.setPointerCapture(e.pointerId);
        const g = toGrid(e.clientX, e.clientY);
        pointers.current.set(e.pointerId, { id: e.pointerId, x: g.x, y: g.y, px: g.x, py: g.y, down: true, age: 0 });
      }}
      onPointerMove={(e) => {
        const p = pointers.current.get(e.pointerId);
        if (!p) return;
        const g = toGrid(e.clientX, e.clientY);
        p.x = g.x;
        p.y = g.y;
      }}
      onPointerUp={(e) => pointers.current.delete(e.pointerId)}
      onPointerCancel={(e) => pointers.current.delete(e.pointerId)}
    >
      <canvas ref={canvasRef} className="world-canvas" aria-hidden="true" />
    </div>
  );
}
