import { Slider } from "@/components/ui/slider";

const RPE_LABELS = [
  "Muito fácil", "Fácil", "Leve", "Moderado leve", "Moderado",
  "Moderado intenso", "Intenso", "Muito intenso", "Exaustivo", "Quase máximo", "Máximo",
];

export function RpeOverlay({ exName, rpeValue, setRpeValue, onConfirm }) {
  return (
    <div style={S.overlay}>
      <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "var(--sub)", marginBottom: 6, textAlign: "center" }}>
        Como foi?
      </p>
      <p style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", marginBottom: 4, textAlign: "center", lineHeight: 1.1 }}>
        {exName}
      </p>
      <p style={{ fontSize: 12, color: "var(--sub)", marginBottom: 28, textAlign: "center" }}>
        todas as séries concluídas
      </p>
      <p style={{ fontSize: 80, fontWeight: 900, color: "var(--acc)", lineHeight: 1, letterSpacing: -3, textAlign: "center", marginBottom: 8, fontVariantNumeric: "tabular-nums" }}>
        {rpeValue}
      </p>
      <p style={{ fontSize: 15, color: "var(--sub)", textAlign: "center", marginBottom: 28, minHeight: 22 }}>
        {RPE_LABELS[rpeValue] || ""}
      </p>

      <Slider
        min={0} max={10} step={1} value={[rpeValue]}
        onValueChange={([v]) => setRpeValue(v)}
        style={{ marginBottom: 10 }}
      />

      <div style={{ display: "flex", width: "100%", marginBottom: 36 }}>
        {[{ n: 0, l: "Fácil" }, { n: 5, l: "Médio" }, { n: 10, l: "Máximo" }].map(({ n, l }, i) => (
          <span key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: i === 0 ? "flex-start" : i === 2 ? "flex-end" : "center", gap: 2, fontSize: 11, color: "var(--sub)", lineHeight: 1.2 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--sub)" }}>{n}</span>
            {l}
          </span>
        ))}
      </div>

      <button onClick={onConfirm} style={S.ctaBtn}>Confirmar</button>
    </div>
  );
}

const S = {
  overlay: {
    position: "fixed", inset: 0, maxWidth: 430, margin: "0 auto",
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    zIndex: 100, background: "var(--bg)", padding: "0 28px",
  },
  ctaBtn: {
    width: "100%", padding: 17, borderRadius: 15, border: "none",
    background: "var(--acc)", color: "#000", fontSize: 17, fontWeight: 800, cursor: "pointer",
  },
};
