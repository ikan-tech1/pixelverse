import { useEditor, type Tool } from '@/store/editor';
import { PixelIcon, type IconName } from '@/components/ui/PixelIcon';
import { cn } from '@/lib/cn';
import { useSfx } from '@/lib/useSfx';

const TOOLS: { tool: Tool; icon: IconName; label: string }[] = [
  { tool: 'pencil', icon: 'studio', label: 'Pencil' },
  { tool: 'eraser', icon: 'eraser', label: 'Eraser' },
  { tool: 'fill', icon: 'bucket', label: 'Fill' },
  { tool: 'line', icon: 'line', label: 'Line' },
  { tool: 'rect', icon: 'rect', label: 'Rectangle' },
  { tool: 'ellipse', icon: 'ellipse', label: 'Ellipse' },
  { tool: 'eyedropper', icon: 'dropper', label: 'Eyedropper' },
];

export function Toolbar() {
  const tool = useEditor((s) => s.tool);
  const setTool = useEditor((s) => s.setTool);
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
  const undo = useEditor((s) => s.undo);
  const redo = useEditor((s) => s.redo);
  const clearLayer = useEditor((s) => s.clearLayer);
  const play = useSfx();

  const isShape = tool === 'rect' || tool === 'ellipse';

  return (
    <div className="toolbar px-panel">
      <div className="toolbar-group">
        {TOOLS.map((t) => (
          <button
            key={t.tool}
            className={cn('icon-btn', tool === t.tool && 'is-on')}
            title={t.label}
            aria-label={t.label}
            aria-pressed={tool === t.tool}
            onClick={() => {
              setTool(t.tool);
              play('tap');
            }}
          >
            <PixelIcon name={t.icon} size={18} />
          </button>
        ))}
      </div>

      <div className="toolbar-div" />

      <div className="toolbar-group">
        <button
          className="icon-btn"
          title="Smaller brush"
          aria-label="Smaller brush"
          onClick={() => {
            setBrushSize(brushSize - 1);
            play('tap');
          }}
        >
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 11 }}>-</span>
        </button>
        <span className="tool-readout">{brushSize}px</span>
        <button
          className="icon-btn"
          title="Bigger brush"
          aria-label="Bigger brush"
          onClick={() => {
            setBrushSize(brushSize + 1);
            play('tap');
          }}
        >
          <PixelIcon name="plus" size={12} />
        </button>
        {isShape && (
          <button
            className={cn('icon-btn', shapeFilled && 'is-on')}
            title="Filled shape"
            aria-pressed={shapeFilled}
            onClick={() => {
              setShapeFilled(!shapeFilled);
              play('tap');
            }}
          >
            <PixelIcon name="rect" size={16} />
          </button>
        )}
      </div>

      <div className="toolbar-div" />

      <div className="toolbar-group">
        <button
          className={cn('icon-btn', mirrorX && 'is-on')}
          title="Mirror horizontally"
          aria-pressed={mirrorX}
          onClick={() => {
            toggleMirrorX();
            play('tap');
          }}
        >
          <PixelIcon name="mirror" size={18} />
        </button>
        <button
          className={cn('icon-btn', mirrorY && 'is-on')}
          title="Mirror vertically"
          aria-pressed={mirrorY}
          onClick={() => {
            toggleMirrorY();
            play('tap');
          }}
        >
          <PixelIcon name="mirror" size={18} className="rot90" />
        </button>
        <button
          className={cn('icon-btn', showGrid && 'is-on')}
          title="Toggle grid"
          aria-pressed={showGrid}
          onClick={() => {
            toggleGrid();
            play('tap');
          }}
        >
          <PixelIcon name="grid" size={18} />
        </button>
      </div>

      <div className="toolbar-div" />

      <div className="toolbar-group">
        <button
          className="icon-btn"
          title="Undo"
          aria-label="Undo"
          onClick={() => {
            undo();
            play('tap');
          }}
        >
          <PixelIcon name="undo" size={18} />
        </button>
        <button
          className="icon-btn"
          title="Redo"
          aria-label="Redo"
          onClick={() => {
            redo();
            play('tap');
          }}
        >
          <PixelIcon name="redo" size={18} />
        </button>
        <button
          className="icon-btn"
          title="Clear layer"
          aria-label="Clear layer"
          onClick={() => {
            if (confirm('Clear this layer?')) {
              clearLayer();
              play('error');
            }
          }}
        >
          <PixelIcon name="trash" size={18} />
        </button>
      </div>
    </div>
  );
}
