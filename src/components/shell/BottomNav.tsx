import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '@/data/nav';
import { PixelIcon } from '@/components/ui/PixelIcon';
import { cn } from '@/lib/cn';
import { useSfx } from '@/lib/useSfx';

export function BottomNav() {
  const play = useSfx();
  return (
    <nav className="bottom-nav" aria-label="Primary">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={() => play('tap')}
          className={({ isActive }) => cn('bottom-link', isActive && 'is-active')}
        >
          <span className="bn-dot" aria-hidden="true" />
          <PixelIcon name={item.icon} size={20} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
