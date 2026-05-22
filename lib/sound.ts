/** WebAudio synth — no audio assets. All functions are safe no-ops on failure. */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  try {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, durationMs: number, startDelayMs = 0, type: OscillatorType = 'sine', gain = 0.12) {
  const ac = getCtx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t0 = ac.currentTime + startDelayMs / 1000;
  const t1 = t0 + durationMs / 1000;
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t1);
  osc.connect(g).connect(ac.destination);
  osc.start(t0);
  osc.stop(t1);
}

export function playDrop() {
  tone(330, 110, 0, 'triangle');
  tone(190, 80, 60, 'sine', 0.08);
}

export function playWin() {
  tone(523, 160, 0);     // C5
  tone(659, 160, 120);   // E5
  tone(784, 280, 240);   // G5
}

export function playIllegal() {
  tone(140, 90, 0, 'square', 0.06);
}
