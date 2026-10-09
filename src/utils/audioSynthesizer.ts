// Web Audio API zero-dependency sound generator for sports timers

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a high-clarity sports beep with customizable frequency, duration, and type
 */
export function playTone(freq: number, durationSec: number = 0.15, type: OscillatorType = 'sine', gainVal: number = 0.25) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    // Envelope for crisp sports punch without clicking
    gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(gainVal, ctx.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSec);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + durationSec);
  } catch (err) {
    console.warn('Audio tone could not play:', err);
  }
}

/**
 * 3-2-1 countdown tick beep
 */
export function playCountdownTick() {
  playTone(660, 0.12, 'square', 0.15);
}

/**
 * Start Work / Go beep (double high punch)
 */
export function playStartWorkBeep() {
  playTone(880, 0.25, 'triangle', 0.35);
  setTimeout(() => {
    playTone(1046.5, 0.35, 'sine', 0.35);
  }, 120);
}

/**
 * Rest phase beep (soothing low tone)
 */
export function playRestBeep() {
  playTone(440, 0.2, 'sine', 0.25);
  setTimeout(() => {
    playTone(330, 0.3, 'sine', 0.25);
  }, 140);
}

/**
 * Finish workout fanfare chime
 */
export function playFinishFanfare() {
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  notes.forEach((freq, idx) => {
    setTimeout(() => {
      playTone(freq, 0.3, 'sine', 0.3);
    }, idx * 110);
  });
}

/**
 * Authentic sports referee whistle effect (سوت داوری ورزشی)
 */
export function playSportsWhistle() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Dual frequency whistle modulated sound (2600Hz + 2950Hz)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(2600, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(2850, ctx.currentTime + 0.08);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(2950, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(3200, ctx.currentTime + 0.08);

    gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + 0.03);
    gainNode.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + 0.4);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(ctx.currentTime);
    osc2.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.6);
    osc2.stop(ctx.currentTime + 0.6);
  } catch (err) {
    console.warn('Whistle play error:', err);
  }
}

/**
 * Send browser system notification
 */
export async function sendWorkoutNotification(title: string, body: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  try {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
      });
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(title, { body });
      }
    }
  } catch (e) {
    console.warn('Notification error:', e);
  }
}
