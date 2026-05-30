import { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor } from '@/store/editor';
import { compositeFrame, toImageData } from '@/pixel/composite';
import { PixelIcon } from '@/components/ui/PixelIcon';

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const dist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.hypot(a.x - b.x, a.y - b.y);
const mid = (a: { x: number; y: number }, b: { x: number; y: number }) => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2,
});

export function PixelCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onionCanvasRef = useRef<HTMLCanvasElement>(null);
  const rgbaRef = useRef<Uint8ClampedArray | null>(null);
  const onionRgbaRef = useRef<Uint8ClampedArray | null>(null);

  const revision = useEditor((s) => s.revision);
  const docW = useEditor((s) => s.doc.width);
  const docH = useEditor((s) => s.doc.height);
  const showGrid = useEditor((s) => s.showGrid);
  const onionSkin = useEditor((s) => s.onionSkin);
  const activeFrame = useEditor((s) => s.doc.activeFrame);
  const mirrorX = useEditor((s) => s.mirrorX);
  const mirrorY = useEditor((s) => s.mirrorY);
  const tool = useEditor((s) => s.tool);

  const [scale, setScale] = useState(12);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [panMode, setPanMode] = useState(false);

  // transient interaction refs
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinch = useRef<{ dist: number; mid: { x: number; y: number } } | null>(null);
  const drawing = useRef(false);
  const panning = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const lastCell = useRef({ x: 0, y: 0 });
  const spaceHeld = useRef(false);

  // Repaint the buffer whenever pixels (or the active frame) change.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const doc = useEditor.getState().doc;
    if (canvas.width !== doc.width) canvas.width = doc.width;
    if (canvas.height !== doc.height) canvas.height = doc.height;
    const size = doc.width * doc.height * 4;
    if (!rgbaRef.current || rgbaRef.current.length !== size) {
      rgbaRef.current = new Uint8ClampedArray(size);
    }
    const rgba = compositeFrame(doc, doc.activeFrame, rgbaRef.current);
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.putImageData(toImageData(rgba, doc.width, doc.height), 0, 0);

    // Onion skin: previous frame faintly behind (its own canvas, dimmed via CSS).
    const onion = onionCanvasRef.current;
    if (onion) {
      if (onionSkin && doc.activeFrame > 0) {
        if (onion.width !== doc.width) onion.width = doc.width;
        if (onion.height !== doc.height) onion.height = doc.height;
        if (!onionRgbaRef.current || onionRgbaRef.current.length !== size) {
          onionRgbaRef.current = new Uint8ClampedArray(size);
        }
        const orgba = compositeFrame(doc, doc.activeFrame - 1, onionRgbaRef.current);
        const octx = onion.getContext('2d');
        if (octx) octx.putImageData(toImageData(orgba, doc.width, doc.height), 0, 0);
        onion.style.display = 'block';
      } else {
        onion.style.display = 'none';
      }
    }
  }, [revision, docW, docH, onionSkin, activeFrame]);

  const fit = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const pad = 32;
    const s = clamp(Math.min((rect.width - pad) / docW, (rect.height - pad) / docH), 1, 48);
    setScale(s);
    setOffset({ x: (rect.width - docW * s) / 2, y: (rect.height - docH * s) / 2 });
  }, [docW, docH]);

  // Fit on mount + when the doc dimensions change.
  useEffect(() => {
    fit();
    const id = requestAnimationFrame(fit);
    return () => cancelAnimationFrame(id);
  }, [fit]);

  // Space = temporary pan.
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === 'Space') spaceHeld.current = true;
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space') spaceHeld.current = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  const toCell = useCallback(
    (clientX: number, clientY: number) => {
      const rect = containerRef.current!.getBoundingClientRect();
      return {
        x: Math.floor((clientX - rect.left - offset.x) / scale),
        y: Math.floor((clientY - rect.top - offset.y) / scale),
      };
    },
    [offset.x, offset.y, scale],
  );

  const zoomAt = useCallback(
    (factor: number, cx: number, cy: number) => {
      const ns = clamp(scale * factor, 1, 48);
      const px = (cx - offset.x) / scale;
      const py = (cy - offset.y) / scale;
      setOffset({ x: cx - px * ns, y: cy - py * ns });
      setScale(ns);
    },
    [offset.x, offset.y, scale],
  );

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const rect = containerRef.current!.getBoundingClientRect();
    zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX - rect.left, e.clientY - rect.top);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    containerRef.current?.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2) {
      if (drawing.current) {
        useEditor.getState().pointerUp(lastCell.current.x, lastCell.current.y);
        drawing.current = false;
      }
      const [a, b] = [...pointers.current.values()];
      pinch.current = { dist: dist(a, b), mid: mid(a, b) };
      return;
    }

    if (panMode || spaceHeld.current || e.button === 1) {
      panning.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
      return;
    }

    const { x, y } = toCell(e.clientX, e.clientY);
    drawing.current = true;
    lastCell.current = { x, y };
    useEditor.getState().pointerDown(x, y);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (pointers.current.has(e.pointerId)) {
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      const nd = dist(a, b);
      const nm = mid(a, b);
      const rect = containerRef.current!.getBoundingClientRect();
      const pmx = pinch.current.mid.x - rect.left;
      const pmy = pinch.current.mid.y - rect.top;
      const px = (pmx - offset.x) / scale;
      const py = (pmy - offset.y) / scale;
      const ns = clamp(scale * (nd / (pinch.current.dist || 1)), 1, 48);
      const nmx = nm.x - rect.left;
      const nmy = nm.y - rect.top;
      setScale(ns);
      setOffset({ x: nmx - px * ns, y: nmy - py * ns });
      pinch.current = { dist: nd, mid: nm };
      return;
    }

    if (panning.current) {
      setOffset({
        x: panning.current.ox + (e.clientX - panning.current.x),
        y: panning.current.oy + (e.clientY - panning.current.y),
      });
      return;
    }

    if (drawing.current) {
      const { x, y } = toCell(e.clientX, e.clientY);
      if (x !== lastCell.current.x || y !== lastCell.current.y) {
        lastCell.current = { x, y };
        useEditor.getState().pointerMove(x, y);
      }
    }
  };

  const endPointer = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (panning.current) panning.current = null;
    if (drawing.current && pointers.current.size === 0) {
      useEditor.getState().pointerUp(lastCell.current.x, lastCell.current.y);
      drawing.current = false;
    }
  };

  const w = docW * scale;
  const h = docH * scale;
  const showGridLines = showGrid && scale >= 7;
  const cursor = panMode ? 'grab' : tool === 'eyedropper' ? 'crosshair' : 'crosshair';

  return (
    <div
      ref={containerRef}
      className="canvas-stage"
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      style={{ cursor }}
    >
      <div
        className="canvas-checker"
        style={{ left: offset.x, top: offset.y, width: w, height: h }}
        aria-hidden="true"
      />
      <canvas
        ref={onionCanvasRef}
        className="pixel-canvas onion"
        style={{ left: offset.x, top: offset.y, width: w, height: h, opacity: 0.4, display: 'none' }}
        aria-hidden="true"
      />
      <canvas
        ref={canvasRef}
        className="pixel-canvas"
        style={{ left: offset.x, top: offset.y, width: w, height: h }}
      />
      {showGridLines && (
        <div
          className="canvas-grid"
          style={{
            left: offset.x,
            top: offset.y,
            width: w,
            height: h,
            backgroundSize: `${scale}px ${scale}px`,
          }}
          aria-hidden="true"
        />
      )}
      {mirrorX && (
        <div
          className="mirror-guide mirror-guide--v"
          style={{ left: offset.x + w / 2, top: offset.y, height: h }}
          aria-hidden="true"
        />
      )}
      {mirrorY && (
        <div
          className="mirror-guide mirror-guide--h"
          style={{ top: offset.y + h / 2, left: offset.x, width: w }}
          aria-hidden="true"
        />
      )}

      <div className="canvas-controls">
        <button
          className={'icon-btn' + (panMode ? ' is-on' : '')}
          aria-label="Pan"
          aria-pressed={panMode}
          onClick={() => setPanMode((p) => !p)}
        >
          <PixelIcon name="play" size={16} />
        </button>
        <button
          className="icon-btn"
          aria-label="Zoom out"
          onClick={() => {
            const r = containerRef.current!.getBoundingClientRect();
            zoomAt(1 / 1.25, r.width / 2, r.height / 2);
          }}
        >
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 12 }}>-</span>
        </button>
        <button className="icon-btn" aria-label="Fit" onClick={fit}>
          <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 9 }}>FIT</span>
        </button>
        <button
          className="icon-btn"
          aria-label="Zoom in"
          onClick={() => {
            const r = containerRef.current!.getBoundingClientRect();
            zoomAt(1.25, r.width / 2, r.height / 2);
          }}
        >
          <PixelIcon name="plus" size={14} />
        </button>
      </div>
    </div>
  );
}
