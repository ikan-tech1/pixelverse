import { useEditor } from '@/store/editor';
import { BottomSheet } from './BottomSheet';
import { PixelIcon } from '@/components/ui/PixelIcon';
import { cn } from '@/lib/cn';
import { uid } from '@/lib/id';
import { cloneDoc } from '@/pixel/doc';
import {
  thumbnailDataUrl,
  exportPngBlob,
  exportGifBlob,
  exportSpritesheetBlob,
} from '@/lib/exporters';
import { downloadBlob, slug } from '@/lib/download';
import { shareUrl, copyToClipboard } from '@/lib/share';
import { saveCreation } from '@/lib/storage';
import { useSfx } from '@/lib/useSfx';

const SIZES = [16, 32, 48, 64, 128];

export function ActionMenu({ onClose, flash }: { onClose: () => void; flash: (m: string) => void }) {
  const width = useEditor((s) => s.doc.width);
  const height = useEditor((s) => s.doc.height);
  const frameCount = useEditor((s) => s.doc.frameCount);
  const resize = useEditor((s) => s.resize);
  const newDoc = useEditor((s) => s.newDoc);
  const play = useSfx();

  async function save() {
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
    onClose();
  }

  async function share() {
    const url = shareUrl(useEditor.getState().doc);
    const ok = await copyToClipboard(url);
    play(ok ? 'success' : 'error');
    flash(ok ? 'Share link copied!' : 'Copy failed');
    onClose();
  }

  async function png() {
    const doc = useEditor.getState().doc;
    downloadBlob(await exportPngBlob(doc, doc.activeFrame, 12), `${slug(doc.name)}.png`);
    play('success');
    flash('PNG exported');
    onClose();
  }

  async function gif() {
    const doc = useEditor.getState().doc;
    downloadBlob(await exportGifBlob(doc, 10), `${slug(doc.name)}.gif`);
    play('success');
    flash('GIF exported');
    onClose();
  }

  async function sheet() {
    const doc = useEditor.getState().doc;
    downloadBlob(await exportSpritesheetBlob(doc, 10), `${slug(doc.name)}-sheet.png`);
    play('success');
    flash('Spritesheet exported');
    onClose();
  }

  function brandNew() {
    if (useEditor.getState().dirty && !confirm('Start a new drawing? Unsaved changes will be lost.')) return;
    newDoc({ width: 32, height: 32 });
    play('pop');
    onClose();
  }

  return (
    <BottomSheet title="Artwork" onClose={onClose}>
      <div className="action-grid">
        <button className="action-item action-item--accent" onClick={save}>
          <PixelIcon name="save" size={22} />
          <span>Save</span>
        </button>
        <button className="action-item" onClick={share}>
          <PixelIcon name="share" size={22} />
          <span>Share</span>
        </button>
        <button className="action-item" onClick={png}>
          <PixelIcon name="download" size={22} />
          <span>PNG</span>
        </button>
        {frameCount > 1 && (
          <button className="action-item" onClick={gif}>
            <PixelIcon name="download" size={22} />
            <span>GIF</span>
          </button>
        )}
        {frameCount > 1 && (
          <button className="action-item" onClick={sheet}>
            <PixelIcon name="download" size={22} />
            <span>Sheet</span>
          </button>
        )}
        <button className="action-item" onClick={brandNew}>
          <PixelIcon name="plus" size={22} />
          <span>New</span>
        </button>
      </div>

      <div className="action-sizes">
        <span className="eyebrow">Canvas size</span>
        <div className="size-row">
          {SIZES.map((s) => (
            <button
              key={s}
              className={cn('size-pill', width === s && height === s && 'is-on')}
              onClick={() => {
                resize(s, s);
                play('select');
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </BottomSheet>
  );
}
