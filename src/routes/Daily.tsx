import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dailyFor, getStreak, markToday } from '@/lib/daily';
import { buildDocPalette } from '@/data/palettes';
import { useEditor } from '@/store/editor';
import { PixelIcon } from '@/components/ui/PixelIcon';
import { useSfx } from '@/lib/useSfx';

export default function Daily() {
  const navigate = useNavigate();
  const newDoc = useEditor((s) => s.newDoc);
  const play = useSfx();
  const [streak, setStreak] = useState(getStreak());
  const today = dailyFor();

  function drawIt() {
    newDoc({
      width: 32,
      height: 32,
      name: `Daily — ${today.prompt}`,
      palette: buildDocPalette(today.palette.colors),
    });
    setStreak(markToday());
    play('success');
    navigate('/studio');
  }

  return (
    <div
      style={{
        maxWidth: 760,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        padding: '20px clamp(14px,4vw,28px) 128px',
      }}
    >
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span className="eyebrow">▸ Daily challenge · {today.key}</span>
          <h1 className="section-title">Today&apos;s prompt</h1>
        </div>
        <span className="px-chip" style={{ marginLeft: 'auto' }}>
          <PixelIcon name="spark" size={12} /> Streak: {streak}
        </span>
      </header>

      <section
        className="px-panel pixel-grid-bg scanlines"
        style={{ position: 'relative', padding: 'clamp(20px,5vw,40px)', display: 'flex', flexDirection: 'column', gap: 18 }}
      >
        <p
          className="text-glow"
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(18px,4.5vw,30px)', color: 'var(--accent)' }}
        >
          {today.prompt}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className="eyebrow">Palette of the day · {today.palette.name}</span>
          <div className="theme-swatches" style={{ width: 'fit-content' }}>
            {today.palette.colors.map((c, i) => (
              <span key={i} style={{ background: c, width: 26, height: 30 }} />
            ))}
          </div>
        </div>

        <button className="px-btn px-btn--accent" style={{ alignSelf: 'flex-start', fontSize: 16 }} onClick={drawIt}>
          <PixelIcon name="studio" size={16} /> Draw this
        </button>
      </section>

      <p style={{ color: 'var(--ink-dim)', fontSize: 14 }}>
        Come back each day for a fresh prompt and palette — keep your streak alive.
      </p>
    </div>
  );
}
