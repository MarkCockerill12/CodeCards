/**
 * Sound packs, synthesised with the Web Audio API.
 *
 * No audio files ship with the app — every pack is a handful of oscillators, which keeps
 * the static bundle tiny and means a "sound pack" cosmetic costs zero bytes to add.
 */

export type SoundEvent =
  | 'flip'
  | 'grade-again'
  | 'grade-hard'
  | 'grade-good'
  | 'grade-easy'
  | 'levelup'
  | 'chest'
  | 'purchase'
  | 'complete';

type Voice = 'sine' | 'square' | 'triangle' | 'sawtooth';

interface Note {
  freq: number;
  at: number;
  dur: number;
  gain: number;
  type: Voice;
}

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

const n = (freq: number, at: number, dur: number, gain: number, type: Voice): Note => ({
  freq,
  at,
  dur,
  gain,
  type,
});

type Pack = Partial<Record<SoundEvent, Note[]>>;

const PACKS: Record<string, Pack> = {
  'sound-off': {},

  'sound-soft': {
    flip: [n(520, 0, 0.09, 0.05, 'sine')],
    'grade-again': [n(220, 0, 0.16, 0.06, 'sine')],
    'grade-hard': [n(330, 0, 0.13, 0.05, 'sine')],
    'grade-good': [n(587, 0, 0.11, 0.06, 'sine'), n(880, 0.07, 0.12, 0.04, 'sine')],
    'grade-easy': [n(659, 0, 0.1, 0.06, 'sine'), n(988, 0.06, 0.16, 0.05, 'sine')],
    levelup: [n(523, 0, 0.14, 0.07, 'sine'), n(659, 0.12, 0.14, 0.07, 'sine'), n(784, 0.24, 0.3, 0.08, 'sine')],
    chest: [n(392, 0, 0.1, 0.06, 'sine'), n(523, 0.1, 0.1, 0.06, 'sine'), n(784, 0.2, 0.32, 0.07, 'sine')],
    purchase: [n(880, 0, 0.08, 0.05, 'sine'), n(1174, 0.07, 0.14, 0.05, 'sine')],
    complete: [n(659, 0, 0.12, 0.06, 'sine'), n(880, 0.12, 0.24, 0.06, 'sine')],
  },

  'sound-mech': {
    flip: [n(1400, 0, 0.02, 0.07, 'square'), n(320, 0.01, 0.05, 0.05, 'triangle')],
    'grade-again': [n(180, 0, 0.07, 0.08, 'square')],
    'grade-hard': [n(240, 0, 0.05, 0.07, 'square')],
    'grade-good': [n(1600, 0, 0.02, 0.06, 'square'), n(420, 0.02, 0.06, 0.06, 'triangle')],
    'grade-easy': [n(1800, 0, 0.02, 0.06, 'square'), n(520, 0.02, 0.07, 0.06, 'triangle')],
    levelup: [n(300, 0, 0.05, 0.08, 'square'), n(450, 0.06, 0.05, 0.08, 'square'), n(600, 0.12, 0.18, 0.08, 'square')],
    chest: [n(160, 0, 0.09, 0.08, 'triangle'), n(900, 0.1, 0.04, 0.06, 'square')],
    purchase: [n(1200, 0, 0.03, 0.06, 'square'), n(1500, 0.04, 0.05, 0.05, 'square')],
    complete: [n(500, 0, 0.05, 0.07, 'square'), n(750, 0.07, 0.12, 0.07, 'square')],
  },

  'sound-arcade': {
    flip: [n(660, 0, 0.05, 0.05, 'square')],
    'grade-again': [n(200, 0, 0.1, 0.07, 'sawtooth'), n(150, 0.09, 0.14, 0.07, 'sawtooth')],
    'grade-hard': [n(392, 0, 0.07, 0.06, 'square')],
    'grade-good': [n(784, 0, 0.06, 0.06, 'square'), n(1046, 0.06, 0.1, 0.06, 'square')],
    'grade-easy': [n(880, 0, 0.05, 0.06, 'square'), n(1318, 0.05, 0.14, 0.06, 'square')],
    levelup: [
      n(523, 0, 0.07, 0.07, 'square'),
      n(659, 0.07, 0.07, 0.07, 'square'),
      n(784, 0.14, 0.07, 0.07, 'square'),
      n(1046, 0.21, 0.26, 0.08, 'square'),
    ],
    chest: [n(1046, 0, 0.06, 0.06, 'square'), n(1318, 0.07, 0.06, 0.06, 'square'), n(1568, 0.14, 0.22, 0.07, 'square')],
    purchase: [n(1046, 0, 0.05, 0.05, 'square'), n(1568, 0.05, 0.1, 0.05, 'square')],
    complete: [n(659, 0, 0.08, 0.06, 'square'), n(988, 0.09, 0.2, 0.06, 'square')],
  },

  'sound-zen': {
    flip: [n(396, 0, 0.5, 0.03, 'sine')],
    'grade-again': [n(198, 0, 0.8, 0.04, 'sine')],
    'grade-hard': [n(297, 0, 0.7, 0.035, 'sine')],
    'grade-good': [n(432, 0, 0.9, 0.04, 'sine'), n(648, 0, 0.9, 0.02, 'sine')],
    'grade-easy': [n(528, 0, 1.1, 0.04, 'sine'), n(792, 0, 1.1, 0.02, 'sine')],
    levelup: [n(432, 0, 1.6, 0.05, 'sine'), n(648, 0.2, 1.4, 0.03, 'sine'), n(864, 0.4, 1.2, 0.02, 'sine')],
    chest: [n(528, 0, 1.4, 0.05, 'sine'), n(792, 0.3, 1.2, 0.03, 'sine')],
    purchase: [n(639, 0, 0.9, 0.04, 'sine')],
    complete: [n(432, 0, 1.2, 0.04, 'sine'), n(540, 0.3, 1.0, 0.03, 'sine')],
  },
};

let currentPack = 'sound-soft';
let muted = false;

export function setSoundPack(id: string) {
  currentPack = PACKS[id] ? id : 'sound-off';
}

export function setMuted(value: boolean) {
  muted = value;
}

export function play(event: SoundEvent) {
  if (muted) return;
  const pack = PACKS[currentPack];
  const notes = pack?.[event];
  if (!notes || notes.length === 0) return;

  const context = audio();
  if (!context) return;
  const now = context.currentTime;

  for (const note of notes) {
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = note.type;
    osc.frequency.setValueAtTime(note.freq, now + note.at);
    gain.gain.setValueAtTime(0.0001, now + note.at);
    gain.gain.exponentialRampToValueAtTime(note.gain, now + note.at + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + note.at + note.dur);
    osc.connect(gain).connect(context.destination);
    osc.start(now + note.at);
    osc.stop(now + note.at + note.dur + 0.02);
  }
}
