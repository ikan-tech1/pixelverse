import type { ThemeId } from '@/store/settings';

export interface ThemeMeta {
  id: ThemeId;
  name: string;
  blurb: string;
  /** [bg, accent, accent-2, accent-3] — used for swatch previews + meta theme-color. */
  swatches: [string, string, string, string];
}

export const THEMES: ThemeMeta[] = [
  {
    id: 'neon',
    name: 'Neon Arcade',
    blurb: 'Dark, glowing, electric.',
    swatches: ['#0b0b1a', '#19f0d8', '#ff2e97', '#b4ff39'],
  },
  {
    id: 'retro',
    name: 'Retro Console',
    blurb: 'Handheld greens, pure nostalgia.',
    swatches: ['#0f380f', '#c6ff6e', '#9bbc0f', '#e0ff9a'],
  },
  {
    id: 'pastel',
    name: 'Cozy Pastel',
    blurb: 'Soft, warm, friendly.',
    swatches: ['#f5ede1', '#ff86a8', '#6fb7d8', '#a7d977'],
  },
  {
    id: 'mono',
    name: 'Clean Mono',
    blurb: '1-bit elegance, pure focus.',
    swatches: ['#0c0c0c', '#ffffff', '#c8c8c8', '#2e2e2e'],
  },
];

export const themeBg = (id: ThemeId): string =>
  THEMES.find((t) => t.id === id)?.swatches[0] ?? '#0b0b1a';
