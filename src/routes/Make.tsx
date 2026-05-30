import { useState } from 'react';
import { useEditor } from '@/store/editor';
import { PixelCanvas } from '@/components/studio/PixelCanvas';
import { PixelIcon } from '@/components/ui/PixelIcon';
import { cn } from '@/lib/cn';
import { useSfx } from '@/lib/useSfx';
import { uid } from '@/lib/id';
import { cloneDoc } from '@/pixel/doc';
import { thumbnailDataUrl } from '@/lib/exporters';
import { saveCreation } from '@/lib/storage';

/** A joyful finger-doodle. No toolbars or layers — just colors, a size slider, and big taps. */
export default function Make() {
  const palette = useEditor((s) => s.doc.palette);
  const primaryIndex = useEditor((s) => s.primaryIndex);
  const setPrimaryIndex = useEditor((s) => s.setPrimaryIndex);
  const tool = useEditor((s) => s.tool);
  const setTool = useEditor((s) => s.setTool);
  const brushSize = useEditor((s) => s.brushSize);
  const setBrushSize = useEditor((s) => s.setBrushSize);
  const mirrorX = useEditor((s) => s.mirrorX);
  const toggleMirrorX = useEditor((s) => s.toggleMirrorX);
  const undo = useEditor((s) => s.undo);
  const clearLayer = useEditor((s) => s.clearLayer);
  const newDoc = useEditor((s) => s.newDoc);
  const play = useSfx();
  const [notice, setNotice] = useState<string | null>(null);

  const flash = (m: string) => {
    setNotice(m);
    window.setTimeout(() => setNotice(null), 1600);
  };

  async function save() {
    const doc = useEditor.getState().doc;
    const id = useEditor.getState().savedId ?? uid();
    try {
      await saveCreation({
        id,
        name: doc.name || 'Doodle',
        width: doc.width,
        height: doc.height,
        frameCount: doc.frameCount,
        createdAt: doc.createdAt,
        updatedAt: Date.now(),
        thumb: thumbnailDataUrl(doc),
        doc: cloneDoc(doc),
      });
      useEditor.getState().markSaved(id);
      play('success');
      flash('Saved to gallery ✓');
    } catch {
      play('error');
      flash('Save failed');
    }
  }

  return (
    <div className="make">
      <div className="make-canvas">
        <PixelCanvas />
      </div>

      <div className="make-controls">
        <div className="make-swatches">
          {palette.map((c, i) =>
            i === 0 ? (
              <button
                key="erase"
                className={cn('mk-swatch mk-swatch--erase', tool === 'eraser' && 'is-on')}
                aria-label="Eraser"
                onClick={() => {
                  setTool('eraser');
                  play('tap');
                }}
              />
            ) : (
              <button
                key={i}
                className={cn('mk-swatch', primaryIndex === i && tool !== 'eraser' && 'is-on')}
                style={{ background: c }}
                aria-label={`Color ${c}`}
                onClick={() => {
                  setPrimaryIndex(i);
                  if (tool === 'eraser') setTool('pencil');
                  play('tap');
                }}
              />
            ),
          )}
        </div>

        <div className="make-row">
          <button
            className={cn('mk-btn', tool === 'pencil' && 'is-on')}
            aria-label="Draw"
            onClick={() => {
              setTool('pencil');
              play('tap');
            }}
          >
            <PixelIcon name="studio" size={16} />
          </button>
          <button
            className={cn('mk-btn', tool === 'fill' && 'is-on')}
            aria-label="Fill"
            onClick={() => {
              setTool('fill');
              play('tap');
            }}
          >
            <PixelIcon name="bucket" size={16} />
          </button>
          <button
            className={cn('mk-btn', mirrorX && 'is-on')}
            aria-label="Mirror"
            onClick={() => {
              toggleMirrorX();
              play('tap');
            }}
          >
            <PixelIcon name="mirror" size={16} />
          </button>
          <input
            className="mk-slider"
            type="range"
            min={1}
            max={8}
            value={brushSize}
            aria-label="Brush size"
            onChange={(e) => setBrushSize(Number(e.target.value))}
          />
          <button
            className="mk-btn"
            aria-label="Undo"
            onClick={() => {
              undo();
              play('tap');
            }}
          >
            <PixelIcon name="undo" size={16} />
          </button>
          <button
            className="mk-btn"
            aria-label="New"
            onClick={() => {
              if (confirm('Start a fresh doodle?')) {
                newDoc({ width: 32, height: 32 });
                play('pop');
              }
            }}
          >
            <PixelIcon name="plus" size={16} />
          </button>
          <button
            className="mk-btn"
            aria-label="Clear"
            onClick={() => {
              clearLayer();
              play('error');
            }}
          >
            <PixelIcon name="trash" size={16} />
          </button>
          <button className="mk-btn mk-btn--save" aria-label="Save" onClick={save}>
            <PixelIcon name="save" size={16} /> Save
          </button>
        </div>
      </div>

      {notice && <div className="make-notice">{notice}</div>}
    </div>
  );
}
