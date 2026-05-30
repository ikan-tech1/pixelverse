import { useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useSettings } from '@/store/settings';
import { themeBg } from '@/data/themes';
import { cn } from '@/lib/cn';
import { NavDock } from './NavDock';
import { PixelIcon } from '@/components/ui/PixelIcon';
import { useSfx } from '@/lib/useSfx';

export default function AppShell() {
  const theme = useSettings((s) => s.theme);
  const scanlines = useSettings((s) => s.scanlines);
  const { pathname } = useLocation();
  const play = useSfx();
  const onSettings = pathname === '/settings';

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeBg(theme));
  }, [theme]);

  return (
    <div className={cn('app-root', scanlines && 'scanlines')}>
      {!onSettings && (
        <Link to="/settings" className="settings-fab" aria-label="Settings" onClick={() => play('tap')}>
          <PixelIcon name="settings" size={18} />
        </Link>
      )}
      <Outlet />
      <NavDock />
    </div>
  );
}
