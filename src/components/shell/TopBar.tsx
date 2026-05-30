import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogoMark } from '@/components/ui/LogoMark';
import { PixelIcon } from '@/components/ui/PixelIcon';
import { ThemeMenu } from './ThemeMenu';
import { useSfx } from '@/lib/useSfx';

export function TopBar() {
  const [themeOpen, setThemeOpen] = useState(false);
  const play = useSfx();

  return (
    <header className="top-bar">
      <Link
        to="/"
        onClick={() => play('tap')}
        style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--ink)' }}
      >
        <LogoMark size={26} pulse />
        <span className="brand-word">PIXELVERSE</span>
      </Link>

      <div style={{ flex: 1 }} />

      <div style={{ position: 'relative' }}>
        <button
          className="icon-btn"
          aria-label="Choose theme"
          aria-expanded={themeOpen}
          onClick={() => {
            play('click');
            setThemeOpen((o) => !o);
          }}
        >
          <PixelIcon name="spark" size={20} />
        </button>
        {themeOpen && <ThemeMenu onClose={() => setThemeOpen(false)} />}
      </div>

      <Link to="/settings" className="icon-btn" aria-label="Settings" onClick={() => play('tap')}>
        <PixelIcon name="settings" size={20} />
      </Link>
    </header>
  );
}
