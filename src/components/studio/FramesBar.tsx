import { useEffect, useState } from 'react';
import { useEditor } from '@/store/editor';
import { renderFrameScaled } from '@/lib/exporters';
import { PixelIcon } from '@/components/ui/PixelIcon';
import { cn } from '@/lib/cn';
import { useSfx } from '@/lib/useSfx';

export function FramesBar() {
  const doc = useEditor((s) => s.doc);
  const revision = useEditor((s) => s.revision);
  const onionSkin = useEditor((s) => s.onionSkin);
  const setActiveFrame = useEditor((s) => s.setActiveFrame);
  const addFrame = useEditor((s) => s.addFrame);
  const duplicateFrame = useEditor((s) => s.duplicateFrame);
  const removeFrame = useEditor((s) => s.removeFrame);
  const setFrameDuration = useEditor((s) => s.setFrameDuration);
  const toggleOnion = useEditor((s) => s.toggleOnion);
  const play = useSfx();

  const { frameCount, activeFrame } = doc;
  const [playing, setPlaying] = useState(false);
  const [thumbs, setThumbs] = useState<string[]>([]);

  // Debounced thumbnails — keeps drawing smooth (main canvas updates live).
  useEffect(() => {
    const id = window.setTimeout(() => {
      const d = useEditor.getState().doc;
      const s = Math.max(1, Math.floor(40 / Math.max(d.width, d.height)));
      const arr: string[] = [];
      for (let f = 0; f < d.frameCount; f++) arr.push(renderFrameScaled(d, f, s).toDataURL());
      setThumbs(arr);
    }, 140);
    return () => window.clearTimeout(id);
  }, [revision, frameCount]);

  // Playback loop, honoring per-frame durations.
  useEffect(() => {
    if (!playing || frameCount < 2) return;
    let timer = 0;
    const tick = () => {
      const d = useEditor.getState().doc;
      const next = (d.activeFrame + 1) % d.frameCount;
      useEditor.getState().setActiveFrame(next);
      timer = window.setTimeout(tick, d.frameDurations[next] ?? 120);
    };
    const d0 = useEditor.getState().doc;
    timer = window.setTimeout(tick, d0.frameDurations[d0.activeFrame] ?? 120);
    return () => window.clearTimeout(timer);
  }, [playing, frameCount]);

  return (
    <div className="frames-bar px-panel">
      <div className="frames-controls">
        <button
          className={cn('icon-btn', playing && 'is-on')}
          aria-label={playing ? 'Pause' : 'Play'}
          disabled={frameCount < 2}
          onClick={() => {
            setPlaying((p) => !p);
            play('tap');
          }}
        >
          <PixelIcon name="play" size={16} />
        </button>
        <button
          className={cn('icon-btn', onionSkin && 'is-on')}
          aria-label="Onion skin"
          aria-pressed={onionSkin}
          title="Onion skin"
          onClick={() => {
            toggleOnion();
            play('tap');
          }}
        >
          <PixelIcon name="layers" size={16} />
        </button>
      </div>

      <div className="frames-strip">
        {Array.from({ length: frameCount }, (_, f) => (
          <button
            key={f}
            className={cn('frame-chip', f === activeFrame && 'is-active')}
            onClick={() => {
              setActiveFrame(f);
              play('tap');
            }}
            title={`Frame ${f + 1}`}
          >
            {thumbs[f] ? <img src={thumbs[f]} alt="" /> : <span className="frame-blank" />}
            <span className="frame-num">{f + 1}</span>
          </button>
        ))}
        <button
          className="frame-chip frame-add"
          onClick={() => {
            addFrame();
            play('select');
          }}
          title="Add frame"
          aria-label="Add frame"
        >
          <PixelIcon name="plus" size={16} />
        </button>
      </div>

      <div className="frames-controls">
        <button
          className="icon-btn"
          aria-label="Duplicate frame"
          title="Duplicate frame"
          onClick={() => {
            duplicateFrame();
            play('select');
          }}
        >
          <PixelIcon name="layers" size={16} />
        </button>
        <button
          className="icon-btn"
          aria-label="Delete frame"
          title="Delete frame"
          disabled={frameCount < 2}
          onClick={() => {
            removeFrame();
            play('tap');
          }}
        >
          <PixelIcon name="trash" size={16} />
        </button>
        <label className="frame-dur" title="Frame duration">
          <input
            type="range"
            min={20}
            max={1000}
            step={10}
            value={doc.frameDurations[activeFrame] ?? 120}
            onChange={(e) => setFrameDuration(activeFrame, Number(e.target.value))}
          />
          <span className="tool-readout">{doc.frameDurations[activeFrame] ?? 120}ms</span>
        </label>
      </div>
    </div>
  );
}
