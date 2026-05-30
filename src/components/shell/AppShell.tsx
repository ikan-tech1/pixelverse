import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSettings } from '@/store/settings';
import { themeBg } from '@/data/themes';
import { cn } from '@/lib/cn';
import { TopBar } from './TopBar';
import { NavRail } from './NavRail';
import { BottomNav } from './BottomNav';

export default function AppShell() {
  const theme = useSettings((s) => s.theme);
  const scanlines = useSettings((s) => s.scanlines);
  const { pathname } = useLocation();
  // The Studio + playground toys manage their own full-height layout.
  const fullBleed = pathname.startsWith('/studio') || pathname.startsWith('/play/');

  // Reflect the theme on <html> + the browser chrome color.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeBg(theme));
  }, [theme]);

  return (
    <div className={cn('app-shell', scanlines && 'scanlines')}>
      <TopBar />
      <div className="app-body">
        <NavRail />
        <main className="app-main">
          {fullBleed ? (
            <Outlet />
          ) : (
            <div className="app-main-pad">
              <Outlet />
            </div>
          )}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
