/**
 * Chiptune SFX synthesized live with the Web Audio API — no asset files,
 * so it stays tiny and works fully offline. All blips are short square/triangle
 * tones with a fast exponential envelope for that 8-bit "blip" character.
 */
let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  // Browsers start the context suspended until a user gesture.
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function blip(
  c: AudioContext,
  at: number,
  freq: number,
  dur: number,
  type: OscillatorType = 'square',
  gain = 0.05,
): void {
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, at);
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(gain, at + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(g).connect(c.destination);
  osc.start(at);
  osc.stop(at + dur + 0.02);
}

export type Sfx =
  | 'tap'
  | 'click'
  | 'select'
  | 'pop'
  | 'success'
  | 'error'
  | 'draw'
  | 'erase';

export function playSfx(name: Sfx, enabled = true): void {
  if (!enabled) return;
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;
  switch (name) {
    case 'tap':
      blip(c, t, 440, 0.06, 'square', 0.035);
      break;
    case 'click':
      blip(c, t, 660, 0.05, 'square', 0.04);
      break;
    case 'select':
      blip(c, t, 880, 0.05, 'triangle', 0.05);
      break;
    case 'pop':
      blip(c, t, 520, 0.04, 'square', 0.045);
      blip(c, t + 0.04, 784, 0.05, 'square', 0.045);
      break;
    case 'success':
      blip(c, t, 523, 0.07, 'square', 0.05);
      blip(c, t + 0.07, 659, 0.07, 'square', 0.05);
      blip(c, t + 0.14, 784, 0.11, 'square', 0.05);
      break;
    case 'error':
      blip(c, t, 196, 0.12, 'sawtooth', 0.045);
      blip(c, t + 0.1, 147, 0.16, 'sawtooth', 0.045);
      break;
    case 'draw':
      blip(c, t, 1320, 0.012, 'square', 0.012);
      break;
    case 'erase':
      blip(c, t, 240, 0.02, 'triangle', 0.02);
      break;
  }
}
