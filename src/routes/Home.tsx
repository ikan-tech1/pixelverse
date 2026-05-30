import { Link } from 'react-router-dom';
import { LogoMark } from '@/components/ui/LogoMark';
import { PixelIcon } from '@/components/ui/PixelIcon';
import { NAV_ITEMS } from '@/data/nav';
import { dailyFor } from '@/lib/daily';
import { useSfx } from '@/lib/useSfx';

const FOOTER_CHIPS = ['Local-first', 'Installable', 'Works offline', 'v0.1.0'];

export default function Home() {
  const play = useSfx();
  const tiles = NAV_ITEMS.filter((n) => n.to !== '/');
  const today = dailyFor();

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Hero */}
      <section
        className="px-panel pixel-grid-bg scanlines"
        style={{ position: 'relative', overflow: 'hidden', padding: 'clamp(22px, 5vw, 44px)' }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 28,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <span className="eyebrow">▸ Local-first pixel studio</span>
            <h1
              className="text-glow"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(28px, 8vw, 60px)',
                color: 'var(--accent)',
                lineHeight: 1.05,
              }}
            >
              PIXEL
              <br />
              VERSE
            </h1>
            <p style={{ fontSize: 17, color: 'var(--ink)', maxWidth: 440 }}>
              Create, view, and play with pixel art — in an app that&apos;s{' '}
              <em style={{ color: 'var(--accent-3)', fontStyle: 'normal' }}>made of</em> pixel art.
              Draw, animate, play, and share. No login. Works offline.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 4 }}>
              <Link
                to="/studio"
                className="px-btn px-btn--accent"
                onClick={() => play('success')}
                style={{ fontSize: 16 }}
              >
                <PixelIcon name="studio" size={18} /> Open Studio
              </Link>
              <Link to="/play" className="px-btn" onClick={() => play('click')}>
                <PixelIcon name="play" size={18} /> Playground
              </Link>
            </div>
          </div>

          <div
            style={{ flex: '0 0 auto', display: 'grid', placeItems: 'center', padding: 8 }}
            aria-hidden="true"
          >
            <LogoMark size={132} pulse />
          </div>
        </div>
      </section>

      {/* Daily teaser */}
      <section className="banner">
        <div className="tile-icon">
          <PixelIcon name="daily" size={34} />
        </div>
        <div style={{ flex: '1 1 240px' }}>
          <span className="eyebrow">Daily prompt</span>
          <p style={{ fontSize: 16, margin: '4px 0 0' }}>
            Today: <strong style={{ color: 'var(--accent-3)' }}>{today.prompt}</strong>
          </p>
        </div>
        <Link to="/daily" className="px-btn" onClick={() => play('click')}>
          See today <PixelIcon name="spark" size={16} />
        </Link>
      </section>

      {/* Explore tiles */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h2 className="section-title">Explore</h2>
        <div
          className="stagger"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 14,
          }}
        >
          {tiles.map((t) => (
            <Link key={t.to} to={t.to} className="tile" onClick={() => play('click')}>
              <span className="tile-icon">
                <PixelIcon name={t.icon} size={34} />
              </span>
              <span className="tile-title">{t.label}</span>
              <span className="tile-blurb">{t.blurb}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent creations (populated once the gallery store lands) */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h2 className="section-title">Your creations</h2>
        <div className="px-panel empty">
          <PixelIcon name="gallery" size={40} className="tile-icon" />
          <p style={{ fontSize: 16 }}>No pixels yet. Your saved art will appear here.</p>
          <Link to="/studio" className="px-btn px-btn--accent" onClick={() => play('success')}>
            <PixelIcon name="plus" size={16} /> Make your first
          </Link>
        </div>
      </section>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {FOOTER_CHIPS.map((c) => (
          <span key={c} className="px-chip">
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}
