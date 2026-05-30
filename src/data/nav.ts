import type { IconName } from '@/components/ui/PixelIcon';

export interface NavItem {
  to: string;
  icon: IconName;
  label: string;
  blurb: string;
  end?: boolean;
}

/** Primary destinations — used by the desktop rail, mobile tab bar, and Home tiles. */
export const NAV_ITEMS: NavItem[] = [
  { to: '/', icon: 'home', label: 'Home', blurb: 'Back to base', end: true },
  { to: '/studio', icon: 'studio', label: 'Studio', blurb: 'Draw & animate' },
  { to: '/gallery', icon: 'gallery', label: 'Gallery', blurb: 'Your creations' },
  { to: '/play', icon: 'play', label: 'Play', blurb: 'Sandbox & games' },
  { to: '/daily', icon: 'daily', label: 'Daily', blurb: "Today's prompt" },
];
