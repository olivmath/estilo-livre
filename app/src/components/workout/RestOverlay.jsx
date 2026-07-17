import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

const RING_CIRC = 2 * Math.PI * 82;

export function RestOverlay({ restTime, restTotal, restType, nextExName, nextExMachine, onSkip }) {
  const { t } = useTranslation();
  const ringRef = useRef(null);

  useEffect(() => {
    if (!ringRef.current || restTotal == null || restTime == null) return;
    ringRef.current.style.strokeDashoffset = RING_CIRC * (1 - restTime / restTotal);
  }, [restTime, restTotal]);

  const isTransition = restType === "transition";

  return (
    <div style={S.overlay}>
      <p style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1, color: "var(--text)", marginBottom: 24 }}>
        {isTransition ? t("activeWorkout.transition") : t("activeWorkout.rest")}
      </p>

      <div style={{ position: "relative", width: 180, height: 180, marginBottom: 24 }}>
        <svg width="180" height="180" viewBox="0 0 180 180" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="90" cy="90" r="82" fill="none" strokeWidth="6" stroke="var(--bg3)" />
          <circle ref={ringRef} cx="90" cy="90" r="82" fill="none" strokeWidth="6" stroke="var(--acc)" strokeLinecap="round" strokeDasharray={RING_CIRC} strokeDashoffset={0} style={{ transition: "stroke-dashoffset 0.9s linear" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
          <span style={{ fontSize: 52, fontWeight: 900, letterSpacing: -2, color: "var(--text)", fontVariantNumeric: "tabular-nums", minWidth: "2ch", textAlign: "right" }}>{restTime}</span>
          <span style={{ fontSize: 20, fontWeight: 600, color: "var(--sub)", marginTop: 10 }}>s</span>
        </div>
      </div>

      {isTransition && nextExName && (
        <p style={{ fontSize: 13, color: "var(--sub)", marginBottom: 36, textAlign: "center" }}>
          {t("activeWorkout.nextExercise", { name: "" })}<strong style={{ color: "var(--text)" }}>{nextExName}</strong>
          {nextExMachine && <span style={{ display: "block", fontSize: 12, color: "var(--acc)", marginTop: 4, fontWeight: 600 }}>{nextExMachine}</span>}
        </p>
      )}

      <button onClick={onSkip} style={S.skipBtn}>
        {isTransition && nextExName ? t("activeWorkout.nextExercise", { name: nextExName }) + " →" : t("activeWorkout.skipRest")}
      </button>
    </div>
  );
}

const S = {
  overlay: { position: "fixed", inset: 0, maxWidth: 430, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 100, background: "var(--bg)" },
  skipBtn: { padding: "14px 40px", borderRadius: 14, border: "1px solid var(--blue)", background: "var(--bg2)", color: "var(--sub)", fontSize: 14, fontWeight: 600, cursor: "pointer" },
};
