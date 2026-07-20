import { useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

function rpeColor(v) {
  const t = v / 10;
  if (t <= 0.45) {
    const p = t / 0.45;
    return `rgb(${Math.round(p * 245)},${Math.round(200 + p * -4)},${Math.round(83 - p * 83)})`;
  }
  const p = (t - 0.45) / 0.55;
  return `rgb(${Math.round(245 - p)},${Math.round(196 - p * 129)},${Math.round(p * 54)})`;
}

function MoodFace({ value, size = 120 }) {
  const canvasRef = useRef(null);
  const s = size * 2;
  const cx = s / 2, cy = s / 2, r = s * 0.33;

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, s, s);

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = rpeColor(value);
    ctx.fill();

    const grad = ctx.createRadialGradient(cx, cy - r * 0.25, r * 0.1, cx, cy, r);
    grad.addColorStop(0, "rgba(255,255,255,0.15)");
    grad.addColorStop(1, "rgba(0,0,0,0.12)");
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.fillStyle = "#1a1200";
    const eyeSquish = value >= 8 ? 0.5 : 1;
    const eyeY = cy - r * 0.15 + (value >= 9 ? r * 0.05 : 0);
    const eyeRx = r * 0.09, eyeRy = r * 0.11 * eyeSquish;
    ctx.beginPath();
    ctx.ellipse(cx - r * 0.31, eyeY, eyeRx, eyeRy, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + r * 0.31, eyeY, eyeRx, eyeRy, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#1a1200";
    ctx.lineWidth = r * 0.05;
    ctx.lineCap = "round";
    const browAngle = (value / 10) * r * 0.12 - r * 0.025;
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.47, cy - r * 0.35 + browAngle);
    ctx.quadraticCurveTo(cx - r * 0.31, cy - r * 0.45, cx - r * 0.17, cy - r * 0.37 - browAngle * 0.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + r * 0.17, cy - r * 0.37 - browAngle * 0.5);
    ctx.quadraticCurveTo(cx + r * 0.31, cy - r * 0.45, cx + r * 0.47, cy - r * 0.35 + browAngle);
    ctx.stroke();

    const mouthY = cy + r * 0.35;
    if (value >= 9) {
      ctx.beginPath();
      ctx.ellipse(cx, mouthY, r * 0.17, r * 0.12, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#1a1200";
      ctx.fill();
    } else {
      const curve = r * 0.19 - (value / 10) * r * 0.37;
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.27, mouthY);
      ctx.quadraticCurveTo(cx, mouthY + curve, cx + r * 0.27, mouthY);
      ctx.stroke();
    }

    if (value >= 7) {
      ctx.fillStyle = "rgba(100,180,255,0.6)";
      ctx.beginPath();
      ctx.ellipse(cx + r * 0.52, cy + r * 0.06 + (value - 7) * r * 0.04, r * 0.06, r * 0.09, 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [value, s, cx, cy, r]);

  useEffect(() => { draw(); }, [draw]);

  return <canvas ref={canvasRef} width={s} height={s} style={{ width: size, height: size }} />;
}

const sp = {
  xs: "clamp(4px, 1.5vw, 8px)",
  sm: "clamp(8px, 2.5vw, 14px)",
  md: "clamp(12px, 4vw, 24px)",
  lg: "clamp(16px, 5vw, 28px)",
  xl: "clamp(20px, 5vw, 32px)",
};

export function RpeOverlay({ exName, rpeValue, setRpeValue, onConfirm }) {
  const { t } = useTranslation();
  const labels = t("rpe.labels", { returnObjects: true });
  const color = rpeColor(rpeValue);

  return (
    <div style={S.overlay}>
      <p style={S.eyebrow}>{t("rpe.howWasIt")}</p>
      <p style={S.exName}>{exName}</p>
      <p style={{ ...S.completed, marginBottom: sp.md }}>{t("rpe.allSetsCompleted")}</p>

      <div style={S.faceWrap}>
        <div style={{ ...S.glow, background: color }} />
        <MoodFace value={rpeValue} size={160} />
      </div>

      <p style={{ ...S.word, color }}>{labels[rpeValue] || ""}</p>
      <p style={S.number}>{rpeValue} / 10</p>

      <div style={{ flex: 1 }} />

      <Slider min={0} max={10} step={1} value={[rpeValue]} onValueChange={([v]) => setRpeValue(v)} style={{ marginBottom: sp.xs }} />

      <div style={S.ticks}>
        {Array.from({ length: 11 }, (_, i) => (
          <span key={i} style={{ ...S.tick, ...(i === rpeValue ? { color: "var(--acc)", fontWeight: 800 } : {}) }}>{i}</span>
        ))}
      </div>

      <Button onClick={onConfirm} size="lg" className="w-full rounded-[14px] text-[17px] font-extrabold" style={{ padding: "clamp(14px, 4vw, 20px)", background: "var(--acc)", color: "var(--bg)" }}>{t("common.confirm")}</Button>
    </div>
  );
}

const S = {
  overlay: { position: "fixed", inset: 0, maxWidth: 430, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", paddingTop: "clamp(48px, 12vh, 80px)", zIndex: 100, background: "var(--bg)", padding: `clamp(48px, 12vh, 80px) ${sp.xl} clamp(24px, 5vh, 40px)` },
  eyebrow: { fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--sub)", marginBottom: sp.xs, textAlign: "center" },
  exName: { fontSize: 28, fontWeight: 900, color: "var(--text)", marginBottom: sp.xs, textAlign: "center", lineHeight: 1.1 },
  completed: { fontSize: 13, color: "var(--sub)", textAlign: "center" },
  faceWrap: { position: "relative", width: 160, height: 160, marginBottom: sp.sm },
  glow: { position: "absolute", inset: -24, borderRadius: "50%", filter: "blur(30px)", opacity: 0.25, pointerEvents: "none", transition: "background 0.3s" },
  word: { fontSize: 15, fontWeight: 800, marginBottom: sp.xs, minHeight: 22, letterSpacing: 0.3, textAlign: "center", transition: "color 0.3s" },
  number: { fontSize: 12, fontWeight: 700, color: "var(--sub)", marginBottom: sp.lg, fontVariantNumeric: "tabular-nums" },
  ticks: { display: "flex", justifyContent: "space-between", width: "100%", padding: `${sp.xs} 2px 0`, marginBottom: sp.xl },
  tick: { fontSize: 14, fontWeight: 600, color: "var(--sub)", fontVariantNumeric: "tabular-nums", width: 20, textAlign: "center", transition: "color 0.2s" },
};
