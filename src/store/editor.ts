import { create } from 'zustand';
import type { PixelDoc } from '@/pixel/types';
import { activeCel, cloneDoc, createDoc, createLayer, emptyGrid } from '@/pixel/doc';
import { drawEllipse, drawLine, drawRect, floodFill, stamp } from '@/pixel/ops';

export type Tool = 'pencil' | 'eraser' | 'fill' | 'line' | 'rect' | 'ellipse' | 'eyedropper';

const UNDO_LIMIT = 60;

type XForm = (x: number, y: number) => [number, number];

function transformsFor(w: number, h: number, mx: boolean, my: boolean): XForm[] {
  const t: XForm[] = [(x, y) => [x, y]];
  if (mx) t.push((x, y) => [w - 1 - x, y]);
  if (my) t.push((x, y) => [x, h - 1 - y]);
  if (mx && my) t.push((x, y) => [w - 1 - x, h - 1 - y]);
  return t;
}

interface EditorState {
  doc: PixelDoc;
  tool: Tool;
  primaryIndex: number;
  brushSize: number;
  shapeFilled: boolean;
  mirrorX: boolean;
  mirrorY: boolean;
  showGrid: boolean;
  onionSkin: boolean;
  revision: number;
  dirty: boolean;
  savedId: string | null;

  // transient stroke state
  _drawing: boolean;
  _start: { x: number; y: number } | null;
  _last: { x: number; y: number } | null;
  _backup: Uint8Array | null;

  undoStack: PixelDoc[];
  redoStack: PixelDoc[];

  setTool: (t: Tool) => void;
  setPrimaryIndex: (i: number) => void;
  setBrushSize: (n: number) => void;
  setShapeFilled: (v: boolean) => void;
  toggleMirrorX: () => void;
  toggleMirrorY: () => void;
  toggleGrid: () => void;
  toggleOnion: () => void;

  addFrame: () => void;
  duplicateFrame: () => void;
  removeFrame: () => void;
  setActiveFrame: (i: number) => void;
  setFrameDuration: (i: number, ms: number) => void;

  pointerDown: (x: number, y: number) => void;
  pointerMove: (x: number, y: number) => void;
  pointerUp: (x: number, y: number) => void;

  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  newDoc: (opts?: { width?: number; height?: number; palette?: string[]; name?: string }) => void;
  loadDoc: (doc: PixelDoc, savedId?: string | null) => void;
  setName: (name: string) => void;
  resize: (w: number, h: number) => void;
  clearLayer: () => void;
  markSaved: (id: string) => void;

  setPaletteColor: (index: number, hex: string) => void;
  addPaletteColor: (hex: string) => void;
  applyPalette: (colors: string[]) => void;

  addLayer: () => void;
  removeLayer: (i: number) => void;
  setActiveLayer: (i: number) => void;
  toggleLayerVisible: (i: number) => void;
  setLayerOpacity: (i: number, o: number) => void;
  moveLayer: (i: number, dir: -1 | 1) => void;
  renameLayer: (i: number, name: string) => void;
}

export const useEditor = create<EditorState>((set, get) => {
  /** Push the current doc onto the undo stack and clear redo. */
  function pushHistory() {
    const snap = cloneDoc(get().doc);
    set((s) => ({
      undoStack: [...s.undoStack.slice(-(UNDO_LIMIT - 1)), snap],
      redoStack: [],
    }));
  }

  /** Bump revision (repaint) and mark dirty after an in-place pixel change. */
  function paint() {
    set((s) => ({ revision: s.revision + 1, dirty: true }));
  }

  /** Replace the doc reference (structural change) + repaint. */
  function replaceDoc(doc: PixelDoc) {
    doc.updatedAt = Date.now();
    set((s) => ({ doc, revision: s.revision + 1, dirty: true }));
  }

  function stampMirrored(doc: PixelDoc, x: number, y: number, value: number) {
    const { width: w, height: h } = doc;
    const cel = activeCel(doc);
    for (const tr of transformsFor(w, h, get().mirrorX, get().mirrorY)) {
      const [tx, ty] = tr(x, y);
      stamp(cel, w, h, tx, ty, value, get().brushSize);
    }
  }

  function lineMirrored(doc: PixelDoc, ax: number, ay: number, bx: number, by: number, value: number) {
    const { width: w, height: h } = doc;
    const cel = activeCel(doc);
    for (const tr of transformsFor(w, h, get().mirrorX, get().mirrorY)) {
      const [x0, y0] = tr(ax, ay);
      const [x1, y1] = tr(bx, by);
      drawLine(cel, w, h, x0, y0, x1, y1, value, get().brushSize);
    }
  }

  function shapeMirrored(
    doc: PixelDoc,
    kind: 'rect' | 'ellipse',
    ax: number,
    ay: number,
    bx: number,
    by: number,
    value: number,
  ) {
    const { width: w, height: h } = doc;
    const cel = activeCel(doc);
    const filled = get().shapeFilled;
    const size = get().brushSize;
    for (const tr of transformsFor(w, h, get().mirrorX, get().mirrorY)) {
      const [x0, y0] = tr(ax, ay);
      const [x1, y1] = tr(bx, by);
      if (kind === 'rect') drawRect(cel, w, h, x0, y0, x1, y1, value, filled, size);
      else drawEllipse(cel, w, h, x0, y0, x1, y1, value, filled, size);
    }
  }

  const currentValue = () => (get().tool === 'eraser' ? 0 : get().primaryIndex);

  return {
    doc: createDoc({ width: 32, height: 32, name: 'Untitled' }),
    tool: 'pencil',
    primaryIndex: 1,
    brushSize: 1,
    shapeFilled: false,
    mirrorX: false,
    mirrorY: false,
    showGrid: true,
    onionSkin: false,
    revision: 0,
    dirty: false,
    savedId: null,

    _drawing: false,
    _start: null,
    _last: null,
    _backup: null,

    undoStack: [],
    redoStack: [],

    setTool: (tool) => set({ tool }),
    setPrimaryIndex: (primaryIndex) => set({ primaryIndex }),
    setBrushSize: (brushSize) => set({ brushSize: Math.max(1, Math.min(16, brushSize)) }),
    setShapeFilled: (shapeFilled) => set({ shapeFilled }),
    toggleMirrorX: () => set((s) => ({ mirrorX: !s.mirrorX })),
    toggleMirrorY: () => set((s) => ({ mirrorY: !s.mirrorY })),
    toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
    toggleOnion: () => set((s) => ({ onionSkin: !s.onionSkin })),

    addFrame: () => {
      pushHistory();
      const doc = cloneDoc(get().doc);
      for (const layer of doc.layers) layer.frames.push(emptyGrid(doc.width, doc.height));
      doc.frameDurations.push(120);
      doc.frameCount += 1;
      doc.activeFrame = doc.frameCount - 1;
      replaceDoc(doc);
    },
    duplicateFrame: () => {
      pushHistory();
      const doc = cloneDoc(get().doc);
      const f = doc.activeFrame;
      for (const layer of doc.layers) {
        layer.frames.splice(f + 1, 0, new Uint8Array(layer.frames[f]));
      }
      doc.frameDurations.splice(f + 1, 0, doc.frameDurations[f] ?? 120);
      doc.frameCount += 1;
      doc.activeFrame = f + 1;
      replaceDoc(doc);
    },
    removeFrame: () => {
      const cur = get().doc;
      if (cur.frameCount <= 1) return;
      pushHistory();
      const doc = cloneDoc(cur);
      const f = doc.activeFrame;
      for (const layer of doc.layers) layer.frames.splice(f, 1);
      doc.frameDurations.splice(f, 1);
      doc.frameCount -= 1;
      doc.activeFrame = Math.max(0, Math.min(f, doc.frameCount - 1));
      replaceDoc(doc);
    },
    setActiveFrame: (i) => {
      const doc = cloneDoc(get().doc);
      doc.activeFrame = Math.max(0, Math.min(i, doc.frameCount - 1));
      set({ doc, revision: get().revision + 1 });
    },
    setFrameDuration: (i, ms) => {
      const doc = cloneDoc(get().doc);
      doc.frameDurations[i] = Math.max(20, Math.min(2000, Math.round(ms)));
      set({ doc, revision: get().revision + 1, dirty: true });
    },

    pointerDown: (x, y) => {
      const s = get();
      const doc = s.doc;
      const cel = activeCel(doc);

      if (s.tool === 'eyedropper') {
        const idx = cel[y * doc.width + x] ?? 0;
        if (idx > 0) set({ primaryIndex: idx });
        return;
      }

      pushHistory();
      const value = currentValue();

      if (s.tool === 'fill') {
        for (const tr of transformsFor(doc.width, doc.height, s.mirrorX, s.mirrorY)) {
          const [tx, ty] = tr(x, y);
          floodFill(cel, doc.width, doc.height, tx, ty, value);
        }
        paint();
        return;
      }

      const backup = new Uint8Array(cel);
      set({ _drawing: true, _start: { x, y }, _last: { x, y }, _backup: backup });

      if (s.tool === 'pencil' || s.tool === 'eraser') {
        stampMirrored(doc, x, y, value);
        paint();
      }
    },

    pointerMove: (x, y) => {
      const s = get();
      if (!s._drawing || !s._start || !s._last) return;
      const doc = s.doc;
      const value = currentValue();

      if (s.tool === 'pencil' || s.tool === 'eraser') {
        lineMirrored(doc, s._last.x, s._last.y, x, y, value);
        set({ _last: { x, y } });
        paint();
        return;
      }

      if (s.tool === 'line' || s.tool === 'rect' || s.tool === 'ellipse') {
        const cel = activeCel(doc);
        if (s._backup) cel.set(s._backup);
        if (s.tool === 'line') lineMirrored(doc, s._start.x, s._start.y, x, y, value);
        else shapeMirrored(doc, s.tool, s._start.x, s._start.y, x, y, value);
        paint();
      }
    },

    pointerUp: (x, y) => {
      const s = get();
      if (!s._drawing || !s._start) {
        set({ _drawing: false, _start: null, _last: null, _backup: null });
        return;
      }
      const doc = s.doc;
      const value = currentValue();

      if (s.tool === 'line' || s.tool === 'rect' || s.tool === 'ellipse') {
        const cel = activeCel(doc);
        if (s._backup) cel.set(s._backup);
        if (s.tool === 'line') lineMirrored(doc, s._start.x, s._start.y, x, y, value);
        else shapeMirrored(doc, s.tool, s._start.x, s._start.y, x, y, value);
        paint();
      }
      set({ _drawing: false, _start: null, _last: null, _backup: null });
    },

    undo: () => {
      const s = get();
      if (!s.undoStack.length) return;
      const prev = s.undoStack[s.undoStack.length - 1];
      const cur = cloneDoc(s.doc);
      set({
        doc: prev,
        undoStack: s.undoStack.slice(0, -1),
        redoStack: [...s.redoStack, cur],
        revision: s.revision + 1,
        dirty: true,
      });
    },
    redo: () => {
      const s = get();
      if (!s.redoStack.length) return;
      const next = s.redoStack[s.redoStack.length - 1];
      const cur = cloneDoc(s.doc);
      set({
        doc: next,
        redoStack: s.redoStack.slice(0, -1),
        undoStack: [...s.undoStack, cur],
        revision: s.revision + 1,
        dirty: true,
      });
    },
    canUndo: () => get().undoStack.length > 0,
    canRedo: () => get().redoStack.length > 0,

    newDoc: (opts) => {
      const doc = createDoc(opts);
      set({
        doc,
        undoStack: [],
        redoStack: [],
        revision: get().revision + 1,
        dirty: false,
        savedId: null,
        primaryIndex: 1,
        _drawing: false,
        _start: null,
        _last: null,
        _backup: null,
      });
    },
    loadDoc: (doc, savedId = null) => {
      set({
        doc: cloneDoc(doc),
        undoStack: [],
        redoStack: [],
        revision: get().revision + 1,
        dirty: false,
        savedId,
        primaryIndex: 1,
      });
    },
    setName: (name) => {
      const doc = cloneDoc(get().doc);
      doc.name = name;
      set({ doc, dirty: true });
    },
    resize: (w, h) => {
      pushHistory();
      const old = get().doc;
      const next = cloneDoc(old);
      next.width = w;
      next.height = h;
      for (const layer of next.layers) {
        layer.frames = layer.frames.map((_, fi) => {
          const grid = emptyGrid(w, h);
          const src = old.layers[next.layers.indexOf(layer)]?.frames[fi];
          if (src) {
            const cw = Math.min(w, old.width);
            const ch = Math.min(h, old.height);
            for (let y = 0; y < ch; y++)
              for (let x = 0; x < cw; x++) grid[y * w + x] = src[y * old.width + x];
          }
          return grid;
        });
      }
      replaceDoc(next);
    },
    clearLayer: () => {
      pushHistory();
      const cel = activeCel(get().doc);
      cel.fill(0);
      paint();
    },
    markSaved: (id) => set({ savedId: id, dirty: false }),

    setPaletteColor: (index, hex) => {
      pushHistory();
      const doc = cloneDoc(get().doc);
      doc.palette[index] = hex;
      replaceDoc(doc);
    },
    addPaletteColor: (hex) => {
      const doc = cloneDoc(get().doc);
      if (doc.palette.length >= 256) return;
      doc.palette.push(hex);
      set({ doc, primaryIndex: doc.palette.length - 1, revision: get().revision + 1, dirty: true });
    },
    applyPalette: (colors) => {
      pushHistory();
      const doc = cloneDoc(get().doc);
      doc.palette = ['transparent', ...colors];
      replaceDoc(doc);
    },

    addLayer: () => {
      pushHistory();
      const doc = cloneDoc(get().doc);
      doc.layers.push(createLayer(`Layer ${doc.layers.length + 1}`, doc.width, doc.height, doc.frameCount));
      doc.activeLayer = doc.layers.length - 1;
      replaceDoc(doc);
    },
    removeLayer: (i) => {
      const cur = get().doc;
      if (cur.layers.length <= 1) return;
      pushHistory();
      const doc = cloneDoc(cur);
      doc.layers.splice(i, 1);
      doc.activeLayer = Math.max(0, Math.min(doc.activeLayer, doc.layers.length - 1));
      replaceDoc(doc);
    },
    setActiveLayer: (i) => {
      const doc = cloneDoc(get().doc);
      doc.activeLayer = i;
      set({ doc });
    },
    toggleLayerVisible: (i) => {
      const doc = cloneDoc(get().doc);
      doc.layers[i].visible = !doc.layers[i].visible;
      replaceDoc(doc);
    },
    setLayerOpacity: (i, o) => {
      const doc = cloneDoc(get().doc);
      doc.layers[i].opacity = Math.max(0, Math.min(1, o));
      replaceDoc(doc);
    },
    moveLayer: (i, dir) => {
      const j = i + dir;
      const cur = get().doc;
      if (j < 0 || j >= cur.layers.length) return;
      pushHistory();
      const doc = cloneDoc(cur);
      const [layer] = doc.layers.splice(i, 1);
      doc.layers.splice(j, 0, layer);
      doc.activeLayer = j;
      replaceDoc(doc);
    },
    renameLayer: (i, name) => {
      const doc = cloneDoc(get().doc);
      doc.layers[i].name = name;
      set({ doc, dirty: true });
    },
  };
});
