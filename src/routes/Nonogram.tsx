import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { featuredDocs } from '@/data/featured';
import { activeCel } from '@/pixel/doc';
import { cn } from '@/lib/cn';
import { useSfx } from '@/lib/useSfx';

function clues(line: boolean[]): number[] {
  const out: number[] = [];
  let run = 0;
  for (const v of line) {
    if (v) run++;
    else if (run) {
      out.push(run);
      run = 0;
    }
  }
  if (run) out.push(run);
  return out.length ? out : [0];
}

export default function Nonogram() {
  const puzzles = useMemo(() => featuredDocs(), []);
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const doc = puzzles[puzzleIdx];
  const W = doc.width;
  const H = doc.height;
  const play = useSfx();

  const solution = useMemo(() => {
    const cel = activeCel(doc);
    const s = new Uint8Array(W * H);
    for (let i = 0; i < W * H; i++) s[i] = cel[i] !== 0 ? 1 : 0;
    return s;
  }, [doc, W, H]);

  const [cells, setCells] = useState<Uint8Array>(() => new Uint8Array(W * H));
  const [mode, setMode] = useState<'fill' | 'mark'>('fill');
  const painting = useRef<number | null>(null);

  useEffect(() => {
    setCells(new Uint8Array(W * H));
  }, [puzzleIdx, W, H]);

  const rowClues = useMemo(
    () =>
      Array.from({ length: H }, (_, r) =>
        clues(Array.from({ length: W }, (_, c) => solution[r * W + c] === 1)),
      ),
    [solution, W, H],
  );
  const colClues = useMemo(
    () =>
      Array.from({ length: W }, (_, c) =>
        clues(Array.from({ length: H }, (_, r) => solution[r * W + c] === 1)),
      ),
    [solution, W, H],
  );

  const won = useMemo(() => {
    for (let i = 0; i < W * H; i++) if ((cells[i] === 1) !== (solution[i] === 1)) return false;
    return true;
  }, [cells, solution, W, H]);

  useEffect(() => {
    if (won) play('success');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [won]);

  function apply(i: number, value: number) {
    setCells((prev) => {
      if (prev[i] === value) return prev;
      const n = new Uint8Array(prev);
      n[i] = value;
      return n;
    });
  }

  function cellDown(i: number, right: boolean) {
    const cur = cells[i];
    const value = right || mode === 'mark' ? (cur === 2 ? 0 : 2) : cur === 1 ? 0 : 1;
    painting.current = value;
    apply(i, value);
    play('tap');
  }

  return (
    <div className="toy">
      <div className="toy-head">
        <Link to="/play" className="px-btn" onClick={() => play('tap')}>
          ‹ Back
        </Link>
        <span className="eyebrow">Nonogram</span>
        <div className="toy-controls">
          <button
            className={cn('px-btn', mode === 'fill' && 'px-btn--accent')}
            onClick={() => setMode('fill')}
          >
            Fill
          </button>
          <button
            className={cn('px-btn', mode === 'mark' && 'px-btn--accent')}
            onClick={() => setMode('mark')}
          >
            Mark
          </button>
          <button className="px-btn" onClick={() => setCells(new Uint8Array(W * H))}>
            Clear
          </button>
          <button
            className="px-btn"
            onClick={() => {
              setPuzzleIdx((p) => (p + 1) % puzzles.length);
              play('select');
            }}
          >
            Next
          </button>
        </div>
      </div>

      <div
        className="canvas-stage nono-stage"
        onPointerUp={() => (painting.current = null)}
        onPointerLeave={() => (painting.current = null)}
      >
        <div className="nono">
          <div className={cn('nono-corner', won && 'is-won')}>{won ? '★' : ''}</div>
          <div
            className="nono-col-clues"
            style={{ gridTemplateColumns: `repeat(${W}, var(--cell))` }}
          >
            {colClues.map((cl, c) => (
              <div key={c} className="cc">
                {cl.map((n, k) => (
                  <span key={k}>{n}</span>
                ))}
              </div>
            ))}
          </div>
          <div className="nono-row-clues" style={{ gridTemplateRows: `repeat(${H}, var(--cell))` }}>
            {rowClues.map((cl, r) => (
              <div key={r} className="rc">
                {cl.map((n, k) => (
                  <span key={k}>{n}</span>
                ))}
              </div>
            ))}
          </div>
          <div
            className="nono-grid"
            style={{
              gridTemplateColumns: `repeat(${W}, var(--cell))`,
              gridTemplateRows: `repeat(${H}, var(--cell))`,
            }}
          >
            {Array.from({ length: W * H }, (_, i) => (
              <button
                key={i}
                className={cn(
                  'nono-cell',
                  cells[i] === 1 && 'is-filled',
                  cells[i] === 2 && 'is-marked',
                )}
                onPointerDown={(e) => {
                  e.preventDefault();
                  cellDown(i, e.button === 2);
                }}
                onPointerEnter={() => {
                  if (painting.current !== null) apply(i, painting.current);
                }}
                onContextMenu={(e) => e.preventDefault()}
              >
                {cells[i] === 2 ? '×' : ''}
              </button>
            ))}
          </div>
        </div>

        {won && <div className="nono-win">Solved! ★</div>}
      </div>
    </div>
  );
}
