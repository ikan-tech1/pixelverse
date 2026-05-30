import { Link } from 'react-router-dom';
import { PixelIcon, type IconName } from '@/components/ui/PixelIcon';
import { useSfx } from '@/lib/useSfx';

interface Toy {
  to?: string;
  icon: IconName;
  title: string;
  blurb: string;
  soon?: boolean;
}

const TOYS: Toy[] = [
  { to: '/play/sandbox', icon: 'spark', title: 'Sandbox', blurb: 'Falling-sand physics: sand, water, fire & plants.' },
  { to: '/play/snake', icon: 'play', title: 'Pixel Snake', blurb: 'The classic, rendered in glowing pixels.' },
  { to: '/play/pixelizer', icon: 'gallery', title: 'Pixelizer', blurb: 'Turn a photo into editable pixel art.' },
  { to: '/play/nonogram', icon: 'grid', title: 'Nonogram', blurb: 'Paint-by-pixel logic puzzles from the sprites.' },
];

export default function Playground() {
  const play = useSfx();
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span className="eyebrow">▸ Playground</span>
        <h1 className="section-title">Play around</h1>
      </header>

      <div
        className="stagger"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}
      >
        {TOYS.map((t) =>
          t.soon || !t.to ? (
            <div key={t.title} className="tile" style={{ opacity: 0.6, cursor: 'default' }} aria-disabled="true">
              <span className="tile-icon">
                <PixelIcon name={t.icon} size={34} />
              </span>
              <span className="tile-title">{t.title}</span>
              <span className="tile-blurb">{t.blurb}</span>
              <span className="px-chip" style={{ alignSelf: 'flex-start' }}>
                Soon
              </span>
            </div>
          ) : (
            <Link key={t.title} to={t.to} className="tile" onClick={() => play('click')}>
              <span className="tile-icon">
                <PixelIcon name={t.icon} size={34} />
              </span>
              <span className="tile-title">{t.title}</span>
              <span className="tile-blurb">{t.blurb}</span>
            </Link>
          ),
        )}
      </div>
    </div>
  );
}
