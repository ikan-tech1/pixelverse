import { THEMES } from '@/data/themes';
import { useSettings } from '@/store/settings';
import { Toggle } from '@/components/ui/Toggle';
import { PixelIcon } from '@/components/ui/PixelIcon';
import { cn } from '@/lib/cn';
import { useSfx } from '@/lib/useSfx';

export default function Settings() {
  const {
    theme,
    scanlines,
    sound,
    haptics,
    pixelCursor,
    setTheme,
    setScanlines,
    setSound,
    setHaptics,
    setPixelCursor,
  } = useSettings();
  const play = useSfx();

  return (
    <div
      style={{
        maxWidth: 820,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        padding: '20px clamp(14px,4vw,28px) 128px',
      }}
    >
      <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span className="eyebrow">▸ Settings</span>
        <h1 className="section-title">Make it yours</h1>
      </header>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h2 className="eyebrow">Theme</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 12,
          }}
        >
          {THEMES.map((t) => (
            <button
              key={t.id}
              className={cn('theme-option', theme === t.id && 'is-active')}
              style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10, padding: 12 }}
              onClick={() => {
                setTheme(t.id);
                play('select');
              }}
            >
              <span
                className="theme-swatches"
                style={{ width: '100%' }}
                aria-hidden="true"
              >
                {t.swatches.map((s, i) => (
                  <span key={i} style={{ background: s, flex: 1, height: 28 }} />
                ))}
              </span>
              <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <strong style={{ fontSize: 15 }}>{t.name}</strong>
                <span style={{ fontSize: 13, color: 'var(--ink-dim)' }}>{t.blurb}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <h2 className="eyebrow">Feel</h2>
        <div className="px-panel" style={{ padding: '8px 16px', display: 'flex', flexDirection: 'column' }}>
          <Toggle checked={scanlines} onChange={setScanlines} label="CRT scanlines" />
          <Toggle checked={sound} onChange={setSound} label="Chiptune sound effects" />
          <Toggle checked={haptics} onChange={setHaptics} label="Haptic feedback (vibration)" />
          <Toggle checked={pixelCursor} onChange={setPixelCursor} label="Pixel cursor" />
        </div>
      </section>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h2 className="eyebrow">About</h2>
        <div className="px-panel" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ fontSize: 15, color: 'var(--ink)' }}>
            <strong>Pixelverse</strong> v0.1.0 — an all-pixel-art creative playground.
          </p>
          <p style={{ fontSize: 14, color: 'var(--ink-dim)' }}>
            Everything is stored on your device. To install: use your browser&apos;s{' '}
            <em style={{ fontStyle: 'normal', color: 'var(--accent-3)' }}>Add to Home Screen</em> /
            Install option.
          </p>
          <span className="px-chip" style={{ alignSelf: 'flex-start' }}>
            <PixelIcon name="heart" size={12} /> Made with pixels
          </span>
        </div>
      </section>
    </div>
  );
}
