import { PALETTES, type NamedPalette } from '@/data/palettes';

const PROMPTS = [
  'A tiny dragon',
  'Your favorite snack',
  'A cozy little house',
  'A robot friend',
  'A magic potion',
  'A sleepy cat',
  'A spaceship',
  'A mushroom forest',
  'A treasure chest',
  'A rainy day',
  'A pixel self-portrait',
  'A retro game hero',
  'A haunted ghost',
  'A flower in bloom',
  'A slice of cake',
  'A wise old wizard',
  'A jumping slime',
  'A neon sign',
  'A campfire at night',
  'A friendly monster',
  'A floating island',
  'A cup of coffee',
  'A tiny knight',
  'A shooting star',
  'A koi fish',
  'A jack-o-lantern',
  'A cactus in a pot',
  'A vinyl record',
  'A snowy mountain',
  'A curious owl',
];

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function todayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export interface DailyChallenge {
  key: string;
  prompt: string;
  palette: NamedPalette;
}

/** Deterministic per-day prompt + palette (same for everyone, stable across reloads). */
export function dailyFor(date = new Date()): DailyChallenge {
  const key = todayKey(date);
  const seed = hashStr(key);
  return {
    key,
    prompt: PROMPTS[seed % PROMPTS.length],
    palette: PALETTES[(seed >>> 4) % PALETTES.length],
  };
}

interface DailyState {
  lastDate: string;
  streak: number;
}

const STREAK_KEY = 'pixelverse:daily';

function readState(): DailyState | null {
  try {
    return JSON.parse(localStorage.getItem(STREAK_KEY) || 'null');
  } catch {
    return null;
  }
}

export function getStreak(): number {
  return readState()?.streak ?? 0;
}

/** Record engagement for today; bumps the streak if yesterday was the last day. */
export function markToday(): number {
  const today = todayKey();
  const state = readState();
  if (state?.lastDate === today) return state.streak;
  const yesterday = todayKey(new Date(Date.now() - 86_400_000));
  const streak = state && state.lastDate === yesterday ? state.streak + 1 : 1;
  localStorage.setItem(STREAK_KEY, JSON.stringify({ lastDate: today, streak }));
  return streak;
}
