import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSettings } from '@/store/settings';
import { themeBg } from '@/data/themes';
import { cn } from '@/lib/cn';
import { NavDock } from './NavDock';

export default function AppShell() {
  const theme = useSettings((s) => s.theme);
  const scanlines = useSettings((s) => s.scanlines);
  const { pathname } = useLocation();

  // Home is the hub (its own orbs); Studio + playground toys run full-screen with
  // their own controls. The floating dock only appears on the section screens.
  const isHome = pathname === '/';
  const isStudio = pathname.startsWith('/studio');
  const isToy = pathname.startsWith('/play/');
  const showDock = !isHome && !isStudio && !isToy;

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeBg(theme));
  }, [theme]);

  return (
    <div className={cn('app-root', scanlines && 'scanlines')}>
      <Outlet />
      {showDock && <NavDock />}
    </div>
  );
}
