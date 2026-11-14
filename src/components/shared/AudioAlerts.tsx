"use client";

// Web Audio API Synthesizer for Kitchen and Waiter alerts
export function playAlertSound(type: "new_order" | "addon" | "ready_to_serve") {
  if (typeof window === "undefined") return;

  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    if (type === "new_order") {
      // Pleasant double bell chime
      playTone(ctx, 587.33, 0, 0.2); // D5
      playTone(ctx, 880.0, 0.2, 0.4); // A5
    } else if (type === "addon") {
      // Urgent triple pulse for add-ons
      playTone(ctx, 783.99, 0, 0.15); // G5
      playTone(ctx, 783.99, 0.2, 0.15);
      playTone(ctx, 1046.5, 0.4, 0.3); // C6
    } else if (type === "ready_to_serve") {
      // Upward ready fanfare
      playTone(ctx, 523.25, 0, 0.15); // C5
      playTone(ctx, 659.25, 0.15, 0.15); // E5
      playTone(ctx, 783.99, 0.3, 0.3); // G5
    }
  } catch (err) {
    console.warn("Audio chime prevented or unsupported:", err);
  }
}

function playTone(ctx: AudioContext, freq: number, startTime: number, duration: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

  gain.gain.setValueAtTime(0.2, ctx.currentTime + startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime + startTime);
  osc.stop(ctx.currentTime + startTime + duration);
}
