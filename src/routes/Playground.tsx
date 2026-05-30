import { Link } from 'react-router-dom';
import { PixelIcon, type IconName } from '@/components/ui/PixelIcon';
import { useSfx } from '@/lib/useSfx';

interface Game {
  to: string;
  icon: IconName;
  title: string;
  blurb: string;
}

const GAMES: Game[] = [
  { to: '/play/snake', icon: 'play', title: 'Pixel Snake', blurb: 'The classic, in glowing pixels' },
  { to: '/play/nonogram', icon: 'grid', title: 'Nonogram', blurb: 'Paint-by-pixel logic puzzles' },
];

export default function Playground() {
  const play = useSfx();
  return (
    <div
      style={{
        maxWidth: 720,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        padding: '24px clamp(14px,4vw,28px) 128px',
      }}
    >
      <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span className="eyebrow">▸ Play</span>
        <h1 className="section-title">Little games</h1>
      </header>

      <div
        className="stagger"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14 }}
      >
        {GAMES.map((g) => (
          <Link key={g.to} to={g.to} className="tile" onClick={() => play('click')}>
            <span className="tile-icon">
              <PixelIcon name={g.icon} size={34} />
            </span>
            <span className="tile-title">{g.title}</span>
            <span className="tile-blurb">{g.blurb}</span>
          </Link>
        ))}
      </div>

      <p style={{ color: 'var(--ink-dim)', fontSize: 14 }}>
        Looking for sand, fire, and fish? Those live in <Link to="/">Worlds</Link>.
      </p>
    </div>
  );
}
