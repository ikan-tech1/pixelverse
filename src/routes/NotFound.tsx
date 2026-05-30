import { Link } from 'react-router-dom';
import { useSfx } from '@/lib/useSfx';

export default function NotFound() {
  const play = useSfx();
  return (
    <div className="empty" style={{ maxWidth: 560, margin: '40px auto' }}>
      <h1 className="text-glow" style={{ fontFamily: 'var(--font-display)', fontSize: 48, color: 'var(--accent-2)' }}>
        404
      </h1>
      <p className="eyebrow">This pixel wandered off the grid</p>
      <Link to="/" className="px-btn px-btn--accent" onClick={() => play('click')}>
        Back to base
      </Link>
    </div>
  );
}
