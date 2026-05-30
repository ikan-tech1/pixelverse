export interface NamedPalette {
  id: string;
  name: string;
  /** Colors only — the transparent slot (index 0) is added when building a doc. */
  colors: string[];
}

/** Curated, well-known pixel-art palettes. */
export const PALETTES: NamedPalette[] = [
  {
    id: 'sweetie16',
    name: 'Sweetie 16',
    colors: [
      '#1a1c2c', '#5d275d', '#b13e53', '#ef7d57', '#ffcd75', '#a7f070', '#38b764', '#257179',
      '#29366f', '#3b5dc9', '#41a6f6', '#73eff7', '#f4f4f4', '#94b0c2', '#566c86', '#333c57',
    ],
  },
  {
    id: 'pico8',
    name: 'PICO-8',
    colors: [
      '#000000', '#1d2b53', '#7e2553', '#008751', '#ab5236', '#5f574f', '#c2c3c7', '#fff1e8',
      '#ff004d', '#ffa300', '#ffec27', '#00e436', '#29adff', '#83769c', '#ff77a8', '#ffccaa',
    ],
  },
  {
    id: 'na16',
    name: 'NA16',
    colors: [
      '#8c8fae', '#584563', '#3e2137', '#9a6348', '#d79b7d', '#f5edba', '#c0c741', '#647d34',
      '#e4943a', '#9d303b', '#d26471', '#70377f', '#7ec4c1', '#34859d', '#17434b', '#1f0e1c',
    ],
  },
  {
    id: 'gameboy',
    name: 'Game Boy',
    colors: ['#0f380f', '#306230', '#8bac0f', '#9bbc0f'],
  },
  {
    id: 'grayscale',
    name: 'Grayscale',
    colors: [
      '#000000', '#222222', '#444444', '#666666', '#888888', '#aaaaaa', '#cccccc', '#ffffff',
    ],
  },
];

export const TRANSPARENT = 'transparent';

export const DEFAULT_PALETTE_ID = 'sweetie16';

export function paletteById(id: string): NamedPalette {
  return PALETTES.find((p) => p.id === id) ?? PALETTES[0];
}

/** Doc palette = transparent slot (index 0) + the named colors. */
export function buildDocPalette(colors: string[]): string[] {
  return [TRANSPARENT, ...colors];
}

export const DEFAULT_PALETTE = buildDocPalette(paletteById(DEFAULT_PALETTE_ID).colors);
