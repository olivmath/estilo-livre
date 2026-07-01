import { useEffect, useRef, useState } from "react";

// Elapsed-time clock + rest countdown for an active workout session.
function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.frequency.value = 880;
    o.type = "sine";
    g.gain.setValueAtTime(0.3, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    o.start();
    o.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.error(e);
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
            beep();
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
