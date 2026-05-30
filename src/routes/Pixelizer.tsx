import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { quantize, applyPalette } from 'gifenc';
import { createDoc, activeCel } from '@/pixel/doc';
import { rgbaToHex } from '@/pixel/color';
import { compositeFrame, toImageData } from '@/pixel/composite';
import type { PixelDoc } from '@/pixel/types';
import { useEditor } from '@/store/editor';
import { PixelIcon } from '@/components/ui/PixelIcon';
import { useSfx } from '@/lib/useSfx';

const SIZES = [16, 32, 48, 64, 96, 128];
const COLOR_COUNTS = [6, 8, 12, 16, 24, 32];

export default function Pixelizer() {
  const navigate = useNavigate();
  const loadDoc = useEditor((s) => s.loadDoc);
  const play = useSfx();

  const imgRef = useRef<HTMLImageElement | null>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [size, setSize] = useState(48);
  const [colors, setColors] = useState(16);
  const [doc, setDoc] = useState<PixelDoc | null>(null);
  const [hasImage, setHasImage] = useState(false);

  function process(img: HTMLImageElement, w: number, ncol: number) {
    const ratio = img.height / img.width || 1;
    const W = w;
    const H = Math.max(1, Math.round(w * ratio));
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const ctx = c.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(img, 0, 0, W, H);
    const { data } = ctx.getImageData(0, 0, W, H);

    const palette = quantize(data, ncol, { format: 'rgba4444' });
    const idx = applyPalette(data, palette, 'rgba4444');
    const hex = palette.map((p) => rgbaToHex(p[0], p[1], p[2]));

    const d = createDoc({ name: 'Pixelized', width: W, height: H, palette: ['transparent', ...hex] });
    const cel = activeCel(d);
    for (let i = 0; i < W * H; i++) {
      cel[i] = data[i * 4 + 3] < 128 ? 0 : idx[i] + 1;
    }
    setDoc(d);
    requestAnimationFrame(() => renderPreview(d));
  }

  function renderPreview(d: PixelDoc) {
    const cv = previewRef.current;
    if (!cv) return;
    const scale = Math.max(1, Math.floor(360 / Math.max(d.width, d.height)));
    cv.width = d.width;
    cv.height = d.height;
    cv.style.width = `${d.width * scale}px`;
    cv.style.height = `${d.height * scale}px`;
    const rgba = compositeFrame(d, 0);
    cv.getContext('2d')!.putImageData(toImageData(rgba, d.width, d.height), 0, 0);
  }

  function onFile(file: File) {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setHasImage(true);
      URL.revokeObjectURL(url);
      process(img, size, colors);
      play('success');
    };
    img.src = url;
  }

  function reprocess(nextSize: number, nextColors: number) {
    setSize(nextSize);
    setColors(nextColors);
    if (imgRef.current) process(imgRef.current, nextSize, nextColors);
  }

  function openInStudio() {
    if (doc) {
      loadDoc(doc);
      play('select');
      navigate('/studio');
    }
  }

  return (
    <div className="toy">
      <div className="toy-head">
        <Link to="/play" className="px-btn" onClick={() => play('tap')}>
          ‹ Back
        </Link>
        <span className="eyebrow">Pixelizer</span>
        <div className="toy-controls">
          <label className="pix-field">
            Size
            <select value={size} onChange={(e) => reprocess(Number(e.target.value), colors)}>
              {SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}px
                </option>
              ))}
            </select>
          </label>
          <label className="pix-field">
            Colors
            <select value={colors} onChange={(e) => reprocess(size, Number(e.target.value))}>
              {COLOR_COUNTS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <button className="px-btn px-btn--accent" disabled={!doc} onClick={openInStudio}>
            <PixelIcon name="studio" size={14} /> Open in Studio
          </button>
        </div>
      </div>

      <div className="canvas-stage pixelizer-stage">
        {!hasImage ? (
          <button
            className="dropzone"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0];
              if (f) onFile(f);
            }}
          >
            <PixelIcon name="gallery" size={48} className="tile-icon" />
            <p style={{ fontSize: 16 }}>Drop a photo here, or tap to choose</p>
            <span className="eyebrow">It becomes editable pixel art</span>
          </button>
        ) : (
          <div className="pixelizer-preview">
            <canvas ref={previewRef} className="pixel-canvas" style={{ position: 'static' }} />
            <button className="px-btn" onClick={() => fileRef.current?.click()}>
              Choose another
            </button>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
          }}
        />
      </div>
    </div>
  );
}
