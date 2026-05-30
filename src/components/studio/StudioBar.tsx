import { Link } from 'react-router-dom';
import { useEditor } from '@/store/editor';
import { PixelIcon } from '@/components/ui/PixelIcon';
import { useSfx } from '@/lib/useSfx';

export function StudioBar({ onMenu }: { onMenu: () => void }) {
  const name = useEditor((s) => s.doc.name);
  const dirty = useEditor((s) => s.dirty);
  const setName = useEditor((s) => s.setName);
  const undo = useEditor((s) => s.undo);
  const redo = useEditor((s) => s.redo);
  const play = useSfx();

  return (
    <header className="studio-bar">
      <Link to="/" className="bar-btn" aria-label="Home" onClick={() => play('tap')}>
        <span className="bar-home">‹</span>
      </Link>
      <input
        className="bar-name"
        value={name}
        aria-label="Artwork name"
        spellCheck={false}
        onChange={(e) => setName(e.target.value)}
      />
      {dirty && <span className="dirty-dot" title="Unsaved changes" />}
      <button
        className="bar-btn"
        aria-label="Undo"
        onClick={() => {
          undo();
          play('tap');
        }}
      >
        <PixelIcon name="undo" size={16} />
      </button>
      <button
        className="bar-btn"
        aria-label="Redo"
        onClick={() => {
          redo();
          play('tap');
        }}
      >
        <PixelIcon name="redo" size={16} />
      </button>
      <button
        className="bar-btn bar-btn--menu"
        aria-label="Artwork menu"
        onClick={() => {
          play('tap');
          onMenu();
        }}
      >
        <span className="bar-dots">•••</span>
      </button>
    </header>
  );
}
