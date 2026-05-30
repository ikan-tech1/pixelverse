import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { hexToRgba } from '@/pixel/color';
import { useSfx } from '@/lib/useSfx';

const GRID = 22;
const SPEED_MS = 110;

interface P {
  x: number;
  y: number;
}

export default function Snake() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rgba = useRef(new Uint8ClampedArray(GRID * GRID * 4));
  const snake = useRef<P[]>([]);
  const dir = useRef<P>({ x: 1, y: 0 });
  const nextDir = useRef<P>({ x: 1, y: 0 });
  const food = useRef<P>({ x: 5, y: 5 });

  const [view, setView] = useState({ scale: 12, ox: 0, oy: 0 });
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const [running, setRunning] = useState(false);
  const runningRef = useRef(false);
  const overRef = useRef(false);
  runningRef.current = running;
  overRef.current = over;
  const play = useSfx();

  const placeFood = useCallback(() => {
    const occupied = new Set(snake.current.map((s) => s.y * GRID + s.x));
    let p: P;
    do {
      p = { x: (Math.random() * GRID) | 0, y: (Math.random() * GRID) | 0 };
    } while (occupied.has(p.y * GRID + p.x));
    food.current = p;
  }, []);

  const reset = useCallback(() => {
    snake.current = [
      { x: 9, y: 11 },
      { x: 8, y: 11 },
      { x: 7, y: 11 },
    ];
    dir.current = { x: 1, y: 0 };
    nextDir.current = { x: 1, y: 0 };
    placeFood();
    setScore(0);
    setOver(false);
    setRunning(true);
    play('select');
  }, [placeFood, play]);

  const fit = useCallback(() => {
    const el = stageRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const s = Math.max(1, Math.floor(Math.min(r.width, r.height) / GRID));
    setView({ scale: s, ox: Math.floor((r.width - GRID * s) / 2), oy: Math.floor((r.height - GRID * s) / 2) });
  }, []);
  useEffect(() => {
    fit();
    const ro = new ResizeObserver(fit);
    if (stageRef.current) ro.observe(stageRef.current);
    return () => ro.disconnect();
  }, [fit]);

  const setDir = useCallback((d: P) => {
    const c = dir.current;
    if (d.x === -c.x && d.y === -c.y) return;
    nextDir.current = d;
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, P> = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
        w: { x: 0, y: -1 },
        s: { x: 0, y: 1 },
        a: { x: -1, y: 0 },
        d: { x: 1, y: 0 },
      };
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (map[k]) {
        e.preventDefault();
        setDir(map[k]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setDir]);

  const render = useCallback((ctx: CanvasRenderingContext2D) => {
    const data = rgba.current;
    data.fill(0);
    const cs = getComputedStyle(document.documentElement);
    const body = hexToRgba(cs.getPropertyValue('--accent').trim() || '#19f0d8');
    const head = hexToRgba(cs.getPropertyValue('--accent-3').trim() || '#b4ff39');
    const fc = hexToRgba(cs.getPropertyValue('--accent-2').trim() || '#ff2e97');
    const put = (p: P, c: number[]) => {
      const o = (p.y * GRID + p.x) * 4;
      data[o] = c[0];
      data[o + 1] = c[1];
      data[o + 2] = c[2];
      data[o + 3] = 255;
    };
    put(food.current, fc);
    snake.current.forEach((s, i) => put(s, i === 0 ? head : body));
    ctx.putImageData(new ImageData(data, GRID, GRID), 0, 0);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = GRID;
    canvas.height = GRID;
    const ctx = canvas.getContext('2d')!;
    let raf = 0;
    let acc = 0;
    let last = performance.now();
    let alive = true;

    const tick = () => {
      dir.current = nextDir.current;
      const head = { x: snake.current[0].x + dir.current.x, y: snake.current[0].y + dir.current.y };
      if (
        head.x < 0 ||
        head.x >= GRID ||
        head.y < 0 ||
        head.y >= GRID ||
        snake.current.some((s) => s.x === head.x && s.y === head.y)
      ) {
        setOver(true);
        setRunning(false);
        play('error');
        return;
      }
      snake.current.unshift(head);
      if (head.x === food.current.x && head.y === food.current.y) {
        setScore((v) => v + 1);
        play('pop');
        placeFood();
      } else {
        snake.current.pop();
      }
    };

    const loop = (t: number) => {
      if (!alive) return;
      const dt = t - last;
      last = t;
      if (runningRef.current && !overRef.current) {
        acc += dt;
        while (acc >= SPEED_MS) {
          acc -= SPEED_MS;
          tick();
        }
      } else {
        acc = 0;
      }
      render(ctx);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }, [render, placeFood, play]);

  const swipe = useRef<P | null>(null);

  return (
    <div className="toy">
      <div className="toy-head">
        <Link to="/play" className="px-btn" onClick={() => play('tap')}>
          ‹ Back
        </Link>
        <span className="eyebrow">Pixel Snake</span>
        <span className="px-chip" style={{ marginLeft: 'auto' }}>
          Score: {score}
        </span>
        <button className="px-btn" onClick={reset}>
          Restart
        </button>
      </div>

      <div
        ref={stageRef}
        className="canvas-stage"
        onPointerDown={(e) => {
          swipe.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerUp={(e) => {
          if (!swipe.current) return;
          const dx = e.clientX - swipe.current.x;
          const dy = e.clientY - swipe.current.y;
          if (Math.max(Math.abs(dx), Math.abs(dy)) > 18) {
            if (Math.abs(dx) > Math.abs(dy)) setDir({ x: dx > 0 ? 1 : -1, y: 0 });
            else setDir({ x: 0, y: dy > 0 ? 1 : -1 });
          }
          swipe.current = null;
        }}
      >
        <canvas
          ref={canvasRef}
          className="pixel-canvas"
          style={{ left: view.ox, top: view.oy, width: GRID * view.scale, height: GRID * view.scale }}
        />

        {!running && (
          <div className="snake-overlay">
            {over ? (
              <>
                <h2 className="text-glow" style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--accent-2)' }}>
                  GAME OVER
                </h2>
                <p className="eyebrow">Score: {score}</p>
              </>
            ) : (
              <h2 className="text-glow" style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--accent)' }}>
                PIXEL SNAKE
              </h2>
            )}
            <button className="px-btn px-btn--accent" onClick={reset}>
              {over ? 'Play again' : 'Start'}
            </button>
            <p style={{ color: 'var(--ink-dim)', fontSize: 13 }}>Arrows / WASD · swipe · D-pad</p>
          </div>
        )}

        <div className="dpad" aria-hidden="true">
          <button style={{ gridColumn: 2, gridRow: 1 }} onClick={() => setDir({ x: 0, y: -1 })}>
            ▲
          </button>
          <button style={{ gridColumn: 1, gridRow: 2 }} onClick={() => setDir({ x: -1, y: 0 })}>
            ◀
          </button>
          <button style={{ gridColumn: 3, gridRow: 2 }} onClick={() => setDir({ x: 1, y: 0 })}>
            ▶
          </button>
          <button style={{ gridColumn: 2, gridRow: 3 }} onClick={() => setDir({ x: 0, y: 1 })}>
            ▼
          </button>
        </div>
      </div>
    </div>
  );
}
