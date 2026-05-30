import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { useSfx } from '@/lib/useSfx';

const COLS = 160;
const ROWS = 100;
const N = COLS * ROWS;

const EMPTY = 0;
const SAND = 1;
const WATER = 2;
const STONE = 3;
const FIRE = 4;
const PLANT = 5;
const SMOKE = 6;

const ELEMENTS: { id: number; name: string; color: string }[] = [
  { id: SAND, name: 'Sand', color: '#e6c66e' },
  { id: WATER, name: 'Water', color: '#3f9ae0' },
  { id: STONE, name: 'Stone', color: '#8a8a9a' },
  { id: PLANT, name: 'Plant', color: '#48c14a' },
  { id: FIRE, name: 'Fire', color: '#ff7a18' },
  { id: EMPTY, name: 'Erase', color: 'transparent' },
];

const RGB: Record<number, [number, number, number]> = {
  [SAND]: [230, 198, 110],
  [WATER]: [63, 154, 224],
  [STONE]: [138, 138, 154],
  [PLANT]: [72, 193, 74],
  [SMOKE]: [150, 156, 166],
};

export default function Sandbox() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const grid = useRef<Uint8Array>(new Uint8Array(N));
  const moved = useRef<Uint8Array>(new Uint8Array(N));
  const rgba = useRef<Uint8ClampedArray>(new Uint8ClampedArray(N * 4));
  const frame = useRef(0);
  const drawing = useRef(false);
  const cell = useRef<{ x: number; y: number } | null>(null);

  const [element, setElement] = useState(SAND);
  const [brush, setBrush] = useState(3);
  const [paused, setPaused] = useState(false);
  const elementRef = useRef(element);
  const brushRef = useRef(brush);
  const pausedRef = useRef(paused);
  elementRef.current = element;
  brushRef.current = brush;
  pausedRef.current = paused;
  const play = useSfx();

  const [view, setView] = useState({ scale: 4, ox: 0, oy: 0 });

  const fit = useCallback(() => {
    const el = stageRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const s = Math.max(1, Math.floor(Math.min(r.width / COLS, r.height / ROWS)));
    setView({ scale: s, ox: Math.floor((r.width - COLS * s) / 2), oy: Math.floor((r.height - ROWS * s) / 2) });
  }, []);

  useEffect(() => {
    fit();
    const ro = new ResizeObserver(fit);
    if (stageRef.current) ro.observe(stageRef.current);
    return () => ro.disconnect();
  }, [fit]);

  const paintAt = useCallback((cx: number, cy: number) => {
    const e = elementRef.current;
    const r = brushRef.current;
    const g = grid.current;
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (dx * dx + dy * dy > r * r) continue;
        const x = cx + dx;
        const y = cy + dy;
        if (x >= 0 && x < COLS && y >= 0 && y < ROWS) g[y * COLS + x] = e;
      }
    }
  }, []);

  const step = useCallback(() => {
    const g = grid.current;
    const m = moved.current;
    m.fill(0);
    const ltr = (frame.current & 1) === 0;
    for (let y = ROWS - 1; y >= 0; y--) {
      for (let k = 0; k < COLS; k++) {
        const x = ltr ? k : COLS - 1 - k;
        const i = y * COLS + x;
        if (m[i]) continue;
        const e = g[i];
        if (e === EMPTY || e === STONE || e === PLANT) continue;

        if (e === SAND) {
          const below = y + 1 < ROWS ? g[i + COLS] : STONE;
          if (below === EMPTY || below === WATER) {
            g[i] = below;
            g[i + COLS] = SAND;
            m[i + COLS] = 1;
            continue;
          }
          const dirs = Math.random() < 0.5 ? [-1, 1] : [1, -1];
          let did = false;
          for (const dx of dirs) {
            const nx = x + dx;
            if (nx < 0 || nx >= COLS || y + 1 >= ROWS) continue;
            const j = (y + 1) * COLS + nx;
            if (g[j] === EMPTY || g[j] === WATER) {
              g[i] = g[j];
              g[j] = SAND;
              m[j] = 1;
              did = true;
              break;
            }
          }
          if (did) continue;
        } else if (e === WATER) {
          if (y + 1 < ROWS && g[i + COLS] === EMPTY) {
            g[i] = EMPTY;
            g[i + COLS] = WATER;
            m[i + COLS] = 1;
            continue;
          }
          const dirs = Math.random() < 0.5 ? [-1, 1] : [1, -1];
          let did = false;
          for (const dx of dirs) {
            const nx = x + dx;
            if (nx < 0 || nx >= COLS || y + 1 >= ROWS) continue;
            const j = (y + 1) * COLS + nx;
            if (g[j] === EMPTY) {
              g[i] = EMPTY;
              g[j] = WATER;
              m[j] = 1;
              did = true;
              break;
            }
          }
          if (did) continue;
          for (const dx of dirs) {
            const nx = x + dx;
            if (nx < 0 || nx >= COLS) continue;
            const j = y * COLS + nx;
            if (g[j] === EMPTY) {
              g[i] = EMPTY;
              g[j] = WATER;
              m[j] = 1;
              break;
            }
          }
        } else if (e === FIRE) {
          let extinguished = false;
          const neigh = [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1],
          ];
          for (const [dx, dy] of neigh) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) continue;
            const j = ny * COLS + nx;
            if (g[j] === PLANT && Math.random() < 0.28) {
              g[j] = FIRE;
              m[j] = 1;
            } else if (g[j] === WATER && Math.random() < 0.6) {
              g[i] = SMOKE;
              m[i] = 1;
              extinguished = true;
              break;
            }
          }
          if (!extinguished && Math.random() < 0.09) {
            g[i] = Math.random() < 0.5 ? SMOKE : EMPTY;
            m[i] = 1;
          }
        } else if (e === SMOKE) {
          if (Math.random() < 0.05) {
            g[i] = EMPTY;
            continue;
          }
          if (y - 1 >= 0 && g[i - COLS] === EMPTY) {
            g[i] = EMPTY;
            g[i - COLS] = SMOKE;
            m[i - COLS] = 1;
            continue;
          }
          const dirs = Math.random() < 0.5 ? [-1, 1] : [1, -1];
          for (const dx of dirs) {
            const nx = x + dx;
            if (nx < 0 || nx >= COLS || y - 1 < 0) continue;
            const j = (y - 1) * COLS + nx;
            if (g[j] === EMPTY) {
              g[i] = EMPTY;
              g[j] = SMOKE;
              m[j] = 1;
              break;
            }
          }
        }
      }
    }
    frame.current++;
  }, []);

  const render = useCallback((ctx: CanvasRenderingContext2D) => {
    const g = grid.current;
    const data = rgba.current;
    for (let i = 0; i < N; i++) {
      const e = g[i];
      const o = i * 4;
      if (e === EMPTY) {
        data[o + 3] = 0;
        continue;
      }
      let col = RGB[e];
      if (e === FIRE) {
        const f = 120 + ((Math.random() * 90) | 0);
        col = [255, f, 20];
      }
      data[o] = col[0];
      data[o + 1] = col[1];
      data[o + 2] = col[2];
      data[o + 3] = e === SMOKE ? 165 : 255;
    }
    ctx.putImageData(new ImageData(data, COLS, ROWS), 0, 0);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = COLS;
    canvas.height = ROWS;
    const ctx = canvas.getContext('2d')!;
    let raf = 0;
    let alive = true;
    const loop = () => {
      if (!alive) return;
      if (!pausedRef.current) step();
      if (drawing.current && cell.current) paintAt(cell.current.x, cell.current.y);
      render(ctx);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }, [step, render, paintAt]);

  const toCell = (clientX: number, clientY: number) => {
    const r = stageRef.current!.getBoundingClientRect();
    return {
      x: Math.floor((clientX - r.left - view.ox) / view.scale),
      y: Math.floor((clientY - r.top - view.oy) / view.scale),
    };
  };

  return (
    <div className="toy">
      <div className="toy-head">
        <Link to="/play" className="px-btn" onClick={() => play('tap')}>
          ‹ Back
        </Link>
        <div className="toy-elements">
          {ELEMENTS.map((el) => (
            <button
              key={el.id}
              className={cn('elem-btn', element === el.id && 'is-on')}
              onClick={() => {
                setElement(el.id);
                play('tap');
              }}
            >
              <span
                className={cn('elem-swatch', el.id === EMPTY && 'elem-swatch--erase')}
                style={el.id === EMPTY ? undefined : { background: el.color }}
              />
              {el.name}
            </button>
          ))}
        </div>
        <div className="toy-controls">
          <button className="icon-btn" aria-label="Smaller brush" onClick={() => setBrush((b) => Math.max(1, b - 1))}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 11 }}>-</span>
          </button>
          <span className="tool-readout">{brush}</span>
          <button className="icon-btn" aria-label="Bigger brush" onClick={() => setBrush((b) => Math.min(12, b + 1))}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 11 }}>+</span>
          </button>
          <button className="px-btn" onClick={() => setPaused((p) => !p)}>
            {paused ? 'Play' : 'Pause'}
          </button>
          <button
            className="px-btn"
            onClick={() => {
              grid.current.fill(0);
              play('error');
            }}
          >
            Clear
          </button>
        </div>
      </div>

      <div
        ref={stageRef}
        className="canvas-stage"
        style={{ cursor: 'crosshair' }}
        onPointerDown={(e) => {
          stageRef.current?.setPointerCapture(e.pointerId);
          drawing.current = true;
          cell.current = toCell(e.clientX, e.clientY);
          paintAt(cell.current.x, cell.current.y);
        }}
        onPointerMove={(e) => {
          if (drawing.current) cell.current = toCell(e.clientX, e.clientY);
        }}
        onPointerUp={() => {
          drawing.current = false;
          cell.current = null;
        }}
        onPointerCancel={() => {
          drawing.current = false;
          cell.current = null;
        }}
      >
        <canvas
          ref={canvasRef}
          className="pixel-canvas"
          style={{ left: view.ox, top: view.oy, width: COLS * view.scale, height: ROWS * view.scale }}
        />
      </div>
    </div>
  );
}
