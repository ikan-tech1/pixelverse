import { useEditor } from '@/store/editor';
import { PALETTES } from '@/data/palettes';
import { PixelIcon } from '@/components/ui/PixelIcon';
import { cn } from '@/lib/cn';
import { useSfx } from '@/lib/useSfx';

function normalizeHex(c: string): string {
  if (!c || c === 'transparent') return '#000000';
  return c.length === 9 ? c.slice(0, 7) : c;
}

export function PalettePanel({ bare }: { bare?: boolean } = {}) {
  const palette = useEditor((s) => s.doc.palette);
  const primaryIndex = useEditor((s) => s.primaryIndex);
  const setPrimaryIndex = useEditor((s) => s.setPrimaryIndex);
  const setPaletteColor = useEditor((s) => s.setPaletteColor);
  const addPaletteColor = useEditor((s) => s.addPaletteColor);
  const applyPalette = useEditor((s) => s.applyPalette);
  const play = useSfx();

  const current = palette[primaryIndex] ?? '#000000';

  return (
    <div className={cn('palette-panel', !bare && 'px-panel')}>
      <div className="panel-head">
        <PixelIcon name="spark" size={14} />
        <span className="eyebrow">Palette</span>
      </div>

      <div className="swatch-grid">
        {palette.map((c, i) =>
          i === 0 ? (
            <button
              key="transparent"
              className={cn('swatch swatch-transparent', primaryIndex === 0 && 'is-active')}
              title="Transparent / eraser"
              aria-label="Transparent"
              onClick={() => {
                setPrimaryIndex(0);
                play('tap');
              }}
            />
          ) : (
            <button
              key={i}
              className={cn('swatch', primaryIndex === i && 'is-active')}
              style={{ background: c }}
              title={c}
              aria-label={`Color ${c}`}
              onClick={() => {
                setPrimaryIndex(i);
                play('tap');
              }}
            />
          ),
        )}
        <button
          className="swatch swatch-add"
          title="Add color"
          aria-label="Add color"
          onClick={() => {
            addPaletteColor('#ffffff');
            play('select');
          }}
        >
          <PixelIcon name="plus" size={12} />
        </button>
      </div>

      <div className="palette-edit">
        <input
          type="color"
          aria-label="Edit selected color"
          value={normalizeHex(current)}
          disabled={primaryIndex === 0}
          onChange={(e) => setPaletteColor(primaryIndex, e.target.value)}
        />
        <span className="tool-readout">{primaryIndex === 0 ? 'transparent' : current}</span>
      </div>

      <div className="palette-presets">
        <span className="eyebrow">Presets</span>
        <div className="preset-row">
          {PALETTES.map((p) => (
            <button
              key={p.id}
              className="preset"
              title={p.name}
              aria-label={`Apply ${p.name} palette`}
              onClick={() => {
                applyPalette(p.colors);
                play('select');
              }}
            >
              {p.colors.slice(0, 6).map((c, i) => (
                <span key={i} style={{ background: c }} />
              ))}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
