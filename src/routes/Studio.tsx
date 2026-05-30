import { useEffect, useState } from 'react';
import { useEditor } from '@/store/editor';
import { PixelCanvas } from '@/components/studio/PixelCanvas';
import { StudioBar } from '@/components/studio/StudioBar';
import { ToolDock, type SheetName } from '@/components/studio/ToolDock';
import { BottomSheet } from '@/components/studio/BottomSheet';
import { ActionMenu } from '@/components/studio/ActionMenu';
import { PalettePanel } from '@/components/studio/PalettePanel';
import { LayersPanel } from '@/components/studio/LayersPanel';
import { FramesBar } from '@/components/studio/FramesBar';
import { docFromHash } from '@/lib/share';

export default function Studio() {
  const [sheet, setSheet] = useState<SheetName | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const flash = (m: string) => {
    setNotice(m);
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

  return (
    <div className="studio-immersive">
      <div className="studio-canvas-fill">
        <PixelCanvas />
      </div>

      <StudioBar onMenu={() => setMenuOpen(true)} />
      <ToolDock onOpenSheet={(s) => setSheet(s)} />

      {sheet === 'color' && (
        <BottomSheet title="Palette" onClose={() => setSheet(null)}>
          <PalettePanel bare />
        </BottomSheet>
      )}
      {sheet === 'layers' && (
        <BottomSheet title="Layers" onClose={() => setSheet(null)}>
          <LayersPanel bare />
        </BottomSheet>
      )}
      {sheet === 'frames' && (
        <BottomSheet title="Animation" onClose={() => setSheet(null)}>
          <FramesBar bare />
        </BottomSheet>
      )}
      {menuOpen && <ActionMenu onClose={() => setMenuOpen(false)} flash={flash} />}

      {notice && (
        <div className="studio-notice" role="status">
          {notice}
        </div>
      )}
    </div>
  );
}
