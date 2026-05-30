import type { Sfx } from './sound';

export type HapticKind = 'soft' | 'tap' | 'success' | 'heavy';

/** Fire a vibration if the device + setting allow it (no-ops on iOS Safari). */
export function haptic(kind: HapticKind, enabled = true): void {
  if (!enabled) return;
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
  switch (kind) {
    case 'soft':
      navigator.vibrate(5);
      break;
    case 'tap':
      navigator.vibrate(10);
      break;
    case 'success':
      navigator.vibrate([8, 26, 14]);
      break;
    case 'heavy':
      navigator.vibrate(20);
      break;
  }
}

/** Map a sound cue to a haptic; null = stay silent (high-frequency cues like drawing). */
export function hapticForSfx(name: Sfx): HapticKind | null {
  switch (name) {
    case 'tap':
      return 'soft';
    case 'click':
    case 'select':
    case 'pop':
      return 'tap';
    case 'success':
      return 'success';
    case 'error':
      return 'heavy';
    default:
      return null;
  }
}
