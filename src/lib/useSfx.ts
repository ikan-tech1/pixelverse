import { useCallback } from 'react';
import { useSettings } from '@/store/settings';
import { playSfx, type Sfx } from './sound';

/** Returns a play() bound to the user's current sound setting. */
export function useSfx(): (name: Sfx) => void {
  const sound = useSettings((s) => s.sound);
  return useCallback((name: Sfx) => playSfx(name, sound), [sound]);
}
