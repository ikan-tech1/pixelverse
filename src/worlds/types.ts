import type { ComponentType } from 'react';

export type RGB = [number, number, number];

export interface WorldPointer {
  id: number;
  /** grid coords (floats) */
  x: number;
  y: number;
  /** grid coords on the previous frame */
  px: number;
  py: number;
  down: boolean;
  /** frames since this pointer went down */
  age: number;
}

/** Per-frame context handed to every world sketch. */
export interface WorldCtx {
  ctx: CanvasRenderingContext2D;
  cols: number;
  rows: number;
  frame: number;
  /** theme accents [accent, accent-3, accent-2, warn] */
  palette: RGB[];
  bg: RGB;
  /** active touch/mouse pointers, in grid coords */
  pointers: WorldPointer[];
}

/** A living scene: optional setup, re-init on resize, and a per-frame update+draw. */
export interface WorldSketch {
  init?(c: WorldCtx): void;
  resize?(c: WorldCtx): void;
  frame(c: WorldCtx): void;
}

export interface WorldDef {
  id: string;
  name: string;
  blurb: string;
  hint: string;
  /** css px per grid cell — lower = finer */
  pixelSize: number;
  create: () => WorldSketch;
  /** optional floating controls (element pickers, sliders…) */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Controls?: ComponentType<{ sketch: any }>;
}
