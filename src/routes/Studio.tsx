import { useEffect, useState } from 'react';
import { useEditor } from '@/store/editor';
import { Toolbar } from '@/components/studio/Toolbar';
import { PixelCanvas } from '@/components/studio/PixelCanvas';
import { PalettePanel } from '@/components/studio/PalettePanel';
import { LayersPanel } from '@/components/studio/LayersPanel';
import { FramesBar } from '@/components/studio/FramesBar';
import { PixelIcon } from '@/components/ui/PixelIcon';
import { useSfx } from '@/lib/useSfx';
import { uid } from '@/lib/id';
import { cloneDoc } from '@/pixel/doc';
import {
  thumbnailDataUrl,
  exportPngBlob,
  exportGifBlob,
  exportSpritesheetBlob,
} from '@/lib/exporters';
import { downloadBlob, slug } from '@/lib/download';
import { shareUrl, copyToClipboard, docFromHash } from '@/lib/share';
import { saveCreation } from '@/lib/storage';

const SIZES = [16, 32, 48, 64, 128];

export default function Studio() {
  const name = useEditor((s) => s.doc.name);
  const width = useEditor((s) => s.doc.width);
  const height = useEditor((s) => s.doc.height);
  const frameCount = useEditor((s) => s.doc.frameCount);
  const dirty = useEditor((s) => s.dirty);
  const setName = useEditor((s) => s.setName);
  const resize = useEditor((s) => s.resize);
  const newDoc = useEditor((s) => s.newDoc);
  const play = useSfx();

  const [notice, setNotice] = useState<string | null>(null);
  const flash = (msg: string) => {
    setNotice(msg);
    window.setTimeout(() => setNotice(null), 1800);
  };

  // Load artwork from a share link (#art=...).
  useEffect(() => {
    const shared = docFromHash(window.location.hash);
    if (shared) {
      useEditor.getState().loadDoc(shared);
      history.replaceState(null, '', '/studio');
      flash('Loaded shared art');
    }
  }, []);

  async function handleSave() {
    const doc = useEditor.getState().doc;
    const id = useEditor.getState().savedId ?? uid();
    try {
      await saveCreation({
        id,
        name: doc.name,
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
      flash('Saved to gallery');
    } catch {
      play('error');
      flash('Save failed');
    }
  }

  async function handleShare() {
    const url = shareUrl(useEditor.getState().doc);
    const ok = await copyToClipboard(url);
    play(ok ? 'success' : 'error');
    flash(ok ? 'Share link copied!' : 'Copy failed');
  }

  async function handlePng() {
    const doc = useEditor.getState().doc;
    const blob = await exportPngBlob(doc, doc.activeFrame, 12);
    downloadBlob(blob, `${slug(doc.name)}.png`);
    play('success');
    flash('PNG exported');
  }

  async function handleGif() {
    const doc = useEditor.getState().doc;
    const blob = await exportGifBlob(doc, 10);
    downloadBlob(blob, `${slug(doc.name)}.gif`);
    play('success');
    flash('GIF exported');
  }

  async function handleSheet() {
    const doc = useEditor.getState().doc;
    const blob = await exportSpritesheetBlob(doc, 10);
    downloadBlob(blob, `${slug(doc.name)}-sheet.png`);
    play('success');
    flash('Spritesheet exported');
  }

  function handleNew() {
    if (useEditor.getState().dirty && !confirm('Start a new drawing? Unsaved changes will be lost.'))
      return;
    newDoc({ width: 32, height: 32 });
    play('pop');
  }

  return (
    <div className="studio">
      <div className="studio-head">
        <input
          className="name-input"
          value={name}
          aria-label="Artwork name"
          onChange={(e) => setName(e.target.value)}
        />
        {dirty && <span className="dirty-dot" title="Unsaved changes" />}

        <select
          className="size-select"
          aria-label="Canvas size"
          value={`${width}x${height}`}
          onChange={(e) => {
            const [w, h] = e.target.value.split('x').map(Number);
            if (w !== width || h !== height) {
              resize(w, h);
              play('select');
            }
          }}
        >
          {SIZES.map((s) => (
            <option key={s} value={`${s}x${s}`}>
              {s}×{s}
            </option>
          ))}
          {!SIZES.includes(width) || width !== height ? (
            <option value={`${width}x${height}`}>
              {width}×{height}
            </option>
          ) : null}
        </select>

        <div className="studio-actions">
          <button className="px-btn" onClick={handleNew} title="New">
            <PixelIcon name="plus" size={14} /> New
          </button>
          <button className="px-btn" onClick={handlePng} title="Export PNG">
            <PixelIcon name="download" size={14} /> PNG
          </button>
          {frameCount > 1 && (
            <>
              <button className="px-btn" onClick={handleGif} title="Export animated GIF">
                <PixelIcon name="download" size={14} /> GIF
              </button>
              <button className="px-btn" onClick={handleSheet} title="Export spritesheet">
                <PixelIcon name="download" size={14} /> Sheet
              </button>
            </>
          )}
          <button className="px-btn" onClick={handleShare} title="Copy share link">
            <PixelIcon name="share" size={14} /> Share
          </button>
          <button className="px-btn px-btn--accent" onClick={handleSave} title="Save to gallery">
            <PixelIcon name="save" size={14} /> Save
          </button>
        </div>
      </div>

      <div className="studio-body">
        <Toolbar />
        <div className="studio-canvas-wrap">
          <PixelCanvas />
        </div>
        <div className="studio-side">
          <PalettePanel />
          <LayersPanel />
        </div>
      </div>

      <FramesBar />

      {notice && (
        <div className="studio-notice" role="status">
          {notice}
        </div>
      )}
    </div>
  );
}
