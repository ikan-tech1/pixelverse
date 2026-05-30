import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const THEME_IDS = ['neon', 'retro', 'pastel', 'mono'] as const;
export type ThemeId = (typeof THEME_IDS)[number];

interface SettingsState {
  theme: ThemeId;
  scanlines: boolean;
  sound: boolean;
  pixelCursor: boolean;
  setTheme: (theme: ThemeId) => void;
  setScanlines: (v: boolean) => void;
  setSound: (v: boolean) => void;
  setPixelCursor: (v: boolean) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'neon',
      scanlines: true,
      sound: true,
      pixelCursor: true,
      setTheme: (theme) => set({ theme }),
      setScanlines: (scanlines) => set({ scanlines }),
      setSound: (sound) => set({ sound }),
      setPixelCursor: (pixelCursor) => set({ pixelCursor }),
    }),
    { name: 'pixelverse:settings' },
  ),
);
