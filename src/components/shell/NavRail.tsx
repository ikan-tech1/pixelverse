import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '@/data/nav';
import { PixelIcon } from '@/components/ui/PixelIcon';
import { cn } from '@/lib/cn';
import { useSfx } from '@/lib/useSfx';

export function NavRail() {
  const play = useSfx();
  return (
    <nav className="nav-rail" aria-label="Primary">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={() => play('tap')}
          className={({ isActive }) => cn('nav-link', isActive && 'is-active')}
        >
          <PixelIcon name={item.icon} size={22} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
