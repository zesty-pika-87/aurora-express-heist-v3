// The Masquerade Ball — every sound the ballroom makes, from WebAudio only.
// No audio files, no network: small oscillators and noise shaped into waltz,
// footsteps, alarms, lockpick clicks and the crown chime.

let ctx = null;
let musicTimer = null;
let musicOn = false;

export function ensureAudio() {
  if (ctx === null) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
}

function tone(freq, dur, type, vol, when = 0, slideTo = 0) {
  if (!ctx) return;
  const t0 = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo > 0) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function noiseBurst(dur, vol, freq) {
  if (!ctx) return;
  const len = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filt = ctx.createBiquadFilter();
  filt.type = 'lowpass';
  filt.frequency.value = freq;
  const gain = ctx.createGain();
  gain.gain.value = vol;
  src.connect(filt);
  filt.connect(gain);
  gain.connect(ctx.destination);
  src.start();
}

export function playStep() {
  tone(150 + Math.random() * 40, 0.07, 'triangle', 0.05);
}

export function playClick() {
  tone(880, 0.05, 'square', 0.06);
}

export function playLockpickTick(progress) {
  tone(520 + progress * 420, 0.06, 'square', 0.07);
}

export function playSmoke() {
  noiseBurst(0.5, 0.16, 900);
}

export function playEmp() {
  tone(1400, 0.35, 'sawtooth', 0.08, 0, 180);
  noiseBurst(0.25, 0.1, 3200);
}

export function playCrownChime() {
  tone(523, 0.5, 'sine', 0.14);
  tone(659, 0.5, 'sine', 0.14, 0.09);
  tone(784, 0.7, 'sine', 0.16, 0.18);
  tone(1047, 0.9, 'sine', 0.12, 0.27);
}

export function playAlarmSting(stage) {
  const base = stage >= 2 ? 220 : 330;
  tone(base, 0.28, 'sawtooth', 0.1);
  tone(base * 1.5, 0.28, 'sawtooth', 0.1, 0.16);
  if (stage >= 2) tone(base * 0.75, 0.4, 'sawtooth', 0.1, 0.32);
}

export function playCaught() {
  tone(392, 0.3, 'sawtooth', 0.12, 0, 110);
  tone(311, 0.5, 'sawtooth', 0.12, 0.28, 90);
}

export function playEscape() {
  tone(523, 0.25, 'triangle', 0.12);
  tone(659, 0.25, 'triangle', 0.12, 0.2);
  tone(784, 0.25, 'triangle', 0.12, 0.4);
  tone(1047, 0.6, 'triangle', 0.14, 0.6);
}

const WALTZ = [523, 659, 784, 659, 587, 784, 880, 784, 698, 880, 1047, 880];

export function startWaltz() {
  if (musicOn || !ctx) return;
  musicOn = true;
  let step = 0;
  musicTimer = window.setInterval(() => {
    if (!ctx) return;
    const note = WALTZ[step % WALTZ.length];
    tone(note, 0.42, 'sine', 0.045);
    if (step % 3 === 0) tone(note / 2, 0.5, 'triangle', 0.03);
    step++;
  }, 420);
}

export function stopMusic() {
  musicOn = false;
  if (musicTimer !== null) {
    window.clearInterval(musicTimer);
    musicTimer = null;
  }
}
