import { useState } from 'react';
import { useEditor, type Tool } from '@/store/editor';
import { PixelIcon, type IconName } from '@/components/ui/PixelIcon';
import { cn } from '@/lib/cn';
import { useSfx } from '@/lib/useSfx';

export type SheetName = 'color' | 'layers' | 'frames';

const SHAPES: { tool: Tool; icon: IconName }[] = [
  { tool: 'line', icon: 'line' },
  { tool: 'rect', icon: 'rect' },
  { tool: 'ellipse', icon: 'ellipse' },
];

export function ToolDock({ onOpenSheet }: { onOpenSheet: (s: SheetName) => void }) {
  const tool = useEditor((s) => s.tool);
  const setTool = useEditor((s) => s.setTool);
  const palette = useEditor((s) => s.doc.palette);
  const primaryIndex = useEditor((s) => s.primaryIndex);
  const brushSize = useEditor((s) => s.brushSize);
  const setBrushSize = useEditor((s) => s.setBrushSize);
  const shapeFilled = useEditor((s) => s.shapeFilled);
  const setShapeFilled = useEditor((s) => s.setShapeFilled);
  const mirrorX = useEditor((s) => s.mirrorX);
  const mirrorY = useEditor((s) => s.mirrorY);
  const toggleMirrorX = useEditor((s) => s.toggleMirrorX);
  const toggleMirrorY = useEditor((s) => s.toggleMirrorY);
  const showGrid = useEditor((s) => s.showGrid);
  const toggleGrid = useEditor((s) => s.toggleGrid);
  const clearLayer = useEditor((s) => s.clearLayer);
  const play = useSfx();

  const [shapesOpen, setShapesOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);

  const isShape = tool === 'line' || tool === 'rect' || tool === 'ellipse';
  const shapeIcon: IconName = tool === 'line' ? 'line' : tool === 'ellipse' ? 'ellipse' : 'rect';
  const currentColor = primaryIndex === 0 ? 'transparent' : palette[primaryIndex] ?? '#000000';

  const pick = (t: Tool) => {
    setTool(t);
    play('tap');
  };

  return (
    <div className="tool-dock-wrap">
      {shapesOpen && (
        <div className="dock-pop">
          {SHAPES.map((s) => (
            <button
              key={s.tool}
              className={cn('pop-btn', tool === s.tool && 'is-on')}
              aria-label={s.tool}
              onClick={() => {
                pick(s.tool);
                setShapesOpen(false);
              }}
            >
              <PixelIcon name={s.icon} size={18} />
            </button>
          ))}
          <button
            className={cn('pop-btn', shapeFilled && 'is-on')}
            aria-label="Filled"
            onClick={() => {
              setShapeFilled(!shapeFilled);
              play('tap');
            }}
          >
            <PixelIcon name="rect" size={15} />
          </button>
        </div>
      )}

      {optionsOpen && (
        <div className="dock-pop dock-pop--wide">
          <div className="pop-row">
            <span className="pop-label">Brush</span>
            <button className="pop-btn" aria-label="Smaller" onClick={() => { setBrushSize(brushSize - 1); play('tap'); }}>
              −
            </button>
            <span className="tool-readout">{brushSize}px</span>
            <button className="pop-btn" aria-label="Bigger" onClick={() => { setBrushSize(brushSize + 1); play('tap'); }}>
              +
            </button>
          </div>
          <div className="pop-row">
            <button className={cn('pop-btn', mirrorX && 'is-on')} aria-label="Mirror X" onClick={() => { toggleMirrorX(); play('tap'); }}>
              <PixelIcon name="mirror" size={16} />
            </button>
            <button className={cn('pop-btn', mirrorY && 'is-on')} aria-label="Mirror Y" onClick={() => { toggleMirrorY(); play('tap'); }}>
              <PixelIcon name="mirror" size={16} className="rot90" />
            </button>
            <button className={cn('pop-btn', showGrid && 'is-on')} aria-label="Grid" onClick={() => { toggleGrid(); play('tap'); }}>
              <PixelIcon name="grid" size={16} />
            </button>
            <button className="pop-btn" aria-label="Clear layer" onClick={() => { if (confirm('Clear this layer?')) { clearLayer(); play('error'); } }}>
              <PixelIcon name="trash" size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="tool-dock">
        <button className="color-chip" aria-label="Color" onClick={() => { play('tap'); onOpenSheet('color'); }}>
          <span
            className={cn('color-chip-swatch', primaryIndex === 0 && 'is-transparent')}
            style={primaryIndex === 0 ? undefined : { background: currentColor }}
          />
        </button>
        <button className={cn('dock-tool', tool === 'pencil' && 'is-on')} aria-label="Pencil" onClick={() => pick('pencil')}>
          <PixelIcon name="studio" size={18} />
        </button>
        <button className={cn('dock-tool', tool === 'eraser' && 'is-on')} aria-label="Eraser" onClick={() => pick('eraser')}>
          <PixelIcon name="eraser" size={18} />
        </button>
        <button className={cn('dock-tool', tool === 'fill' && 'is-on')} aria-label="Fill" onClick={() => pick('fill')}>
          <PixelIcon name="bucket" size={18} />
        </button>
        <button
          className={cn('dock-tool', isShape && 'is-on')}
          aria-label="Shapes"
          onClick={() => {
            setOptionsOpen(false);
            setShapesOpen((o) => !o);
            if (!isShape) pick('rect');
          }}
        >
          <PixelIcon name={shapeIcon} size={18} />
        </button>
        <button className={cn('dock-tool', tool === 'eyedropper' && 'is-on')} aria-label="Eyedropper" onClick={() => pick('eyedropper')}>
          <PixelIcon name="dropper" size={18} />
        </button>
        <span className="dock-div" />
        <button className="dock-tool" aria-label="Layers" onClick={() => { play('tap'); onOpenSheet('layers'); }}>
          <PixelIcon name="layers" size={18} />
        </button>
        <button className="dock-tool" aria-label="Animation frames" onClick={() => { play('tap'); onOpenSheet('frames'); }}>
          <PixelIcon name="play" size={18} />
        </button>
        <button
          className={cn('dock-tool', optionsOpen && 'is-on')}
          aria-label="Options"
          onClick={() => {
            setShapesOpen(false);
            setOptionsOpen((o) => !o);
          }}
        >
          <PixelIcon name="settings" size={18} />
        </button>
      </div>
    </div>
  );
}
