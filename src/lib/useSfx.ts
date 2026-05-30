import { useCallback } from 'react';
import { useSettings } from '@/store/settings';
import { playSfx, type Sfx } from './sound';
import { haptic, hapticForSfx } from './haptics';

/** Returns a feedback() bound to the user's sound + haptic settings. */
export function useSfx(): (name: Sfx) => void {
  const sound = useSettings((s) => s.sound);
  const haptics = useSettings((s) => s.haptics);
  return useCallback(
    (name: Sfx) => {
      playSfx(name, sound);
      const h = hapticForSfx(name);
      if (h) haptic(h, haptics);
    },
    [sound, haptics],
  );
}
