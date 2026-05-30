/** A single layer. Holds one pixel grid per animation frame ("cels"). */
export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number; // 0..1
  /** length === doc.frameCount; each is a width*height array of palette indices. */
  frames: Uint8Array[];
}

/**
 * A pixel artwork document.
 * Pixels are palette indices (index 0 === transparent).
 * Frames are top-level; every layer keeps one grid per frame.
 */
export interface PixelDoc {
  id: string;
  name: string;
  width: number;
  height: number;
  palette: string[]; // palette[0] === 'transparent'
  layers: Layer[]; // render order: layers[0] is the bottom
  frameCount: number;
  frameDurations: number[]; // ms per frame, length === frameCount
  activeLayer: number;
  activeFrame: number;
  createdAt: number;
  updatedAt: number;
}

export type RGBA = [number, number, number, number];
