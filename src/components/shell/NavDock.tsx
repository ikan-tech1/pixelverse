import { NavLink } from 'react-router-dom';
import { PixelIcon, type IconName } from '@/components/ui/PixelIcon';
import { cn } from '@/lib/cn';
import { useSfx } from '@/lib/useSfx';

const ITEMS: { to: string; icon: IconName; label: string; end?: boolean }[] = [
  { to: '/', icon: 'spark', label: 'Worlds', end: true },
  { to: '/play', icon: 'play', label: 'Play' },
  { to: '/gallery', icon: 'gallery', label: 'Gallery' },
  { to: '/daily', icon: 'daily', label: 'Daily' },
  { to: '/make', icon: 'studio', label: 'Make' },
];

/** Floating, glassy bottom dock for hopping between the main areas. */
export function NavDock() {
  const play = useSfx();
  return (
    <nav className="nav-dock" aria-label="Primary">
      {ITEMS.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          end={it.end}
          onClick={() => play('tap')}
          className={({ isActive }) => cn('dock-item', isActive && 'is-active')}
        >
          <PixelIcon name={it.icon} size={20} />
          <span>{it.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
