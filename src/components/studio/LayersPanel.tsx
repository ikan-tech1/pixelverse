import { useEditor } from '@/store/editor';
import { PixelIcon } from '@/components/ui/PixelIcon';
import { cn } from '@/lib/cn';
import { useSfx } from '@/lib/useSfx';

export function LayersPanel() {
  const layers = useEditor((s) => s.doc.layers);
  const activeLayer = useEditor((s) => s.doc.activeLayer);
  const setActiveLayer = useEditor((s) => s.setActiveLayer);
  const addLayer = useEditor((s) => s.addLayer);
  const removeLayer = useEditor((s) => s.removeLayer);
  const toggleLayerVisible = useEditor((s) => s.toggleLayerVisible);
  const moveLayer = useEditor((s) => s.moveLayer);
  const play = useSfx();

  return (
    <div className="layers-panel px-panel">
      <div className="panel-head">
        <PixelIcon name="layers" size={14} />
        <span className="eyebrow">Layers</span>
        <button
          className="icon-btn icon-btn--sm"
          title="Add layer"
          aria-label="Add layer"
          style={{ marginLeft: 'auto' }}
          onClick={() => {
            addLayer();
            play('select');
          }}
        >
          <PixelIcon name="plus" size={12} />
        </button>
      </div>

      <div className="layer-list">
        {[...layers.keys()].reverse().map((i) => {
          const l = layers[i];
          return (
            <div
              key={l.id}
              className={cn('layer-row', i === activeLayer && 'is-active')}
              onClick={() => {
                setActiveLayer(i);
                play('tap');
              }}
            >
              <button
                className="layer-vis"
                title={l.visible ? 'Hide layer' : 'Show layer'}
                aria-label={l.visible ? 'Hide layer' : 'Show layer'}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLayerVisible(i);
                  play('tap');
                }}
              >
                <PixelIcon name={l.visible ? 'eye' : 'eyeoff'} size={14} />
              </button>
              <span className="layer-name">{l.name}</span>
              <div className="layer-actions">
                <button
                  title="Move up"
                  aria-label="Move layer up"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveLayer(i, 1);
                    play('tap');
                  }}
                >
                  ▲
                </button>
                <button
                  title="Move down"
                  aria-label="Move layer down"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveLayer(i, -1);
                    play('tap');
                  }}
                >
                  ▼
                </button>
                <button
                  title="Delete layer"
                  aria-label="Delete layer"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (layers.length > 1) removeLayer(i);
                    play('tap');
                  }}
                >
                  <PixelIcon name="trash" size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
