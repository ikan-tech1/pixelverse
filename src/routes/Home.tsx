import { type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { LivingCanvas } from '@/components/home/LivingCanvas';
import { LogoMark } from '@/components/ui/LogoMark';
import { PixelIcon, type IconName } from '@/components/ui/PixelIcon';
import { dailyFor } from '@/lib/daily';
import { useSfx } from '@/lib/useSfx';

interface Entry {
  to: string;
  icon: IconName;
  label: string;
  sub: string;
  glow: string;
}

export default function Home() {
  const play = useSfx();
  const today = dailyFor();

  const entries: Entry[] = [
    { to: '/studio', icon: 'studio', label: 'Create', sub: 'Draw & animate', glow: 'var(--accent)' },
    { to: '/play', icon: 'play', label: 'Play', sub: 'Sandbox & games', glow: 'var(--accent-3)' },
    { to: '/gallery', icon: 'gallery', label: 'Gallery', sub: 'Your pixels', glow: 'var(--accent-2)' },
    { to: '/daily', icon: 'daily', label: 'Daily', sub: today.prompt, glow: 'var(--warn)' },
  ];

  return (
    <div className="home-immersive">
      <LivingCanvas />
      <div className="home-veil" aria-hidden="true" />

      <Link
        to="/settings"
        className="home-gear icon-btn"
        aria-label="Settings"
        onClick={() => play('tap')}
      >
        <PixelIcon name="settings" size={18} />
      </Link>

      <div className="home-content">
        <header className="home-brand">
          <LogoMark size={40} pulse />
          <h1 className="home-word text-glow">PIXELVERSE</h1>
          <p className="home-tag">a place made of pixels</p>
        </header>

        <nav className="home-orbs" aria-label="Explore">
          {entries.map((e, i) => (
            <Link
              key={e.to}
              to={e.to}
              className="orb"
              style={{ '--glow': e.glow, animationDelay: `${i * 0.12}s` } as CSSProperties}
              onClick={() => play('select')}
            >
              <span className="orb-ic">
                <PixelIcon name={e.icon} size={28} />
              </span>
              <span className="orb-label">{e.label}</span>
              <span className="orb-sub">{e.sub}</span>
            </Link>
          ))}
        </nav>

        <p className="home-hint">
          <span className="home-hint-star">✦</span> tap &amp; drag anywhere to play
        </p>
      </div>
    </div>
  );
}
