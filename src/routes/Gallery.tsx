import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  listCreations,
  getCreation,
  deleteCreation,
  saveCreation,
  type CreationMeta,
} from '@/lib/storage';
import { featuredDocs } from '@/data/featured';
import { useEditor } from '@/store/editor';
import { thumbnailDataUrl } from '@/lib/exporters';
import { cloneDoc } from '@/pixel/doc';
import { uid } from '@/lib/id';
import type { PixelDoc } from '@/pixel/types';
import { PixelIcon } from '@/components/ui/PixelIcon';
import { useSfx } from '@/lib/useSfx';

export default function Gallery() {
  const [items, setItems] = useState<CreationMeta[] | null>(null);
  const navigate = useNavigate();
  const loadDoc = useEditor((s) => s.loadDoc);
  const play = useSfx();
  const featured = useMemo(() => featuredDocs(), []);

  async function refresh() {
    setItems(await listCreations());
  }
  useEffect(() => {
    void refresh();
  }, []);

  async function openSaved(id: string) {
    const rec = await getCreation(id);
    if (rec) {
      loadDoc(rec.doc, rec.id);
      play('select');
      navigate('/studio');
    }
  }
  function openDoc(doc: PixelDoc) {
    loadDoc(cloneDoc(doc));
    play('select');
    navigate('/studio');
  }
  async function duplicate(id: string) {
    const rec = await getCreation(id);
    if (!rec) return;
    const now = Date.now();
    await saveCreation({
      ...rec,
      id: uid(),
      name: `${rec.name} copy`,
      createdAt: now,
      updatedAt: now,
      doc: cloneDoc(rec.doc),
    });
    play('pop');
    void refresh();
  }
  async function remove(id: string) {
    if (confirm('Delete this creation? This cannot be undone.')) {
      await deleteCreation(id);
      play('error');
      void refresh();
    }
  }

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        padding: '20px clamp(14px,4vw,28px) 128px',
      }}
    >
      <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span className="eyebrow">▸ Gallery</span>
        <h1 className="section-title">Your creations</h1>
      </header>

      {items === null ? (
        <div className="empty">
          <span className="eyebrow">Loading…</span>
        </div>
      ) : items.length === 0 ? (
        <div className="px-panel empty">
          <PixelIcon name="gallery" size={40} className="tile-icon" />
          <p style={{ fontSize: 16 }}>Nothing saved yet — your art lives here once you hit Save.</p>
          <button
            className="px-btn px-btn--accent"
            onClick={() => {
              play('success');
              navigate('/studio');
            }}
          >
            <PixelIcon name="plus" size={16} /> Start drawing
          </button>
        </div>
      ) : (
        <div className="gallery-grid">
          {items.map((it) => (
            <div key={it.id} className="art-card">
              <button className="art-thumb" onClick={() => openSaved(it.id)} title="Open">
                <img src={it.thumb} alt={it.name} />
              </button>
              <div className="art-meta">
                <span className="art-name">{it.name}</span>
                <span className="art-sub">
                  {it.width}×{it.height}
                  {it.frameCount > 1 ? ` · ${it.frameCount}f` : ''}
                </span>
              </div>
              <div className="art-actions">
                <button title="Open" aria-label="Open" onClick={() => openSaved(it.id)}>
                  <PixelIcon name="studio" size={14} />
                </button>
                <button title="Duplicate" aria-label="Duplicate" onClick={() => duplicate(it.id)}>
                  <PixelIcon name="layers" size={14} />
                </button>
                <button title="Delete" aria-label="Delete" onClick={() => remove(it.id)}>
                  <PixelIcon name="trash" size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <header style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
        <span className="eyebrow">▸ Featured</span>
        <h2 className="section-title">Open &amp; remix</h2>
      </header>
      <div className="gallery-grid">
        {featured.map((doc, i) => (
          <div key={i} className="art-card">
            <button className="art-thumb" onClick={() => openDoc(doc)} title={`Open ${doc.name}`}>
              <img src={thumbnailDataUrl(doc)} alt={doc.name} />
            </button>
            <div className="art-meta">
              <span className="art-name">{doc.name}</span>
              <span className="art-sub">
                {doc.width}×{doc.height}
              </span>
            </div>
            <div className="art-actions">
              <button title="Open" aria-label="Open" onClick={() => openDoc(doc)}>
                <PixelIcon name="studio" size={14} /> Remix
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
