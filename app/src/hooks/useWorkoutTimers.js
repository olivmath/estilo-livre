import { useEffect, useRef, useState } from "react";

function playBellSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const t = ctx.currentTime;
    const dur = 2;

    const tones = [
      { freq: 150, gain: 0.5 },
      { freq: 400, gain: 0.3 },
      { freq: 800, gain: 0.15 },
    ];

    tones.forEach(({ freq, gain: vol }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + dur);
    });

    const strike = ctx.createOscillator();
    const strikeGain = ctx.createGain();
    strike.type = "square";
    strike.frequency.setValueAtTime(300, t);
    strikeGain.gain.setValueAtTime(0.4, t);
    strikeGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    strike.connect(strikeGain);
    strikeGain.connect(ctx.destination);
    strike.start(t);
    strike.stop(t + 0.08);
  } catch {
    /* AudioContext may be unavailable */
  }
}

// Elapsed-time clock while a workout is active, plus the between-set/exercise
// rest countdown (30s / 45s — see CLAUDE.md Constraints).
export function useWorkoutTimers(activeWk, showSummary, restTime, setRestTime) {
  const timerRef = useRef(null);
  const restTimerRef = useRef(null);
  const [elapsedTime, setElapsedTime] = useState("00:00");

  useEffect(() => {
    if (activeWk && !showSummary) {
      timerRef.current = setInterval(() => {
        const sec = Math.floor((Date.now() - activeWk.start) / 1000);
        const m = String(Math.floor(sec / 60)).padStart(2, "0");
        const s = String(sec % 60).padStart(2, "0");
        setElapsedTime(`${m}:${s}`);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [activeWk, showSummary]);

  useEffect(() => {
    if (restTime !== null && restTime > 0) {
      restTimerRef.current = setInterval(() => {
        setRestTime((prev) => {
          if (prev <= 1) {
            clearInterval(restTimerRef.current);
            playBellSound();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(restTimerRef.current);
    }
    return () => clearInterval(restTimerRef.current);
  }, [restTime, setRestTime]);

  return { elapsedTime, setElapsedTime };
}
