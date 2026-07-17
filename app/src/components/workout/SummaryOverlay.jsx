import { useTranslation } from "react-i18next";

function fmtDur(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export function SummaryOverlay({ summaryData, onSave, onDiscard }) {
  const { t } = useTranslation();
  if (!summaryData) return null;
  const totalSeries = summaryData.exs.reduce((a, r) => a + r.sets, 0);

  const stats = [
    { val: fmtDur(summaryData.dur), lbl: t("summary.time") },
    { val: summaryData.exs.length, lbl: t("summary.exercises") },
    { val: totalSeries, lbl: t("summary.sets") },
  ];

  return (
    <div style={S.overlay}>
      <p style={{ fontSize: 48, textAlign: "center", width: "100%", marginBottom: 12 }}>🏆</p>
      <p style={{ fontSize: 28, fontWeight: 900, textAlign: "center", marginBottom: 4, color: "var(--text)" }}>{t("summary.title")}</p>
      <p style={{ fontSize: 13, color: "var(--sub)", textAlign: "center", marginBottom: 36 }}>{summaryData.wkName}</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, width: "100%", maxWidth: 400, marginBottom: 28 }}>
        {stats.map(({ val, lbl }) => (
          <div key={lbl} style={S.statBox}>
            <p style={{ fontSize: 26, fontWeight: 900, color: "var(--acc)", lineHeight: 1 }}>{val}</p>
            <p style={{ fontSize: 10, color: "var(--sub)", letterSpacing: 0.5, marginTop: 4, textTransform: "uppercase" }}>{lbl}</p>
          </div>
        ))}
      </div>

      <div style={{ width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", gap: 6, marginBottom: 32 }}>
        {summaryData.exs.map((res, i) => (
          <div key={i} style={S.sumItem}>
            <span style={{ color: "var(--green)", fontSize: 14, flexShrink: 0 }}>✓</span>
            <span style={{ flex: 1, fontSize: 14, color: "var(--text)", fontWeight: 500 }}>{res.name}</span>
            <span style={{ fontSize: 11, color: "var(--sub)" }}>{res.sets}×{res.kg ?? res.wt}kg · RPE {res.diff ?? res.rpe}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, width: "100%", maxWidth: 400 }}>
        <button onClick={onDiscard} style={{ ...S.skipBtn, flex: 1 }}>{t("summary.discard")}</button>
        <button onClick={onSave} style={{ ...S.ctaBtn, flex: 2 }}>{t("summary.saveAndExit")}</button>
      </div>
    </div>
  );
}

const S = {
  overlay: { position: "fixed", inset: 0, maxWidth: 430, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", paddingTop: 60, zIndex: 100, background: "var(--bg)", overflowY: "auto", padding: "60px 20px 32px" },
  statBox: { background: "var(--bg2)", borderRadius: 14, padding: "16px 10px", textAlign: "center", border: "1px solid var(--blue)" },
  sumItem: { display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 12, background: "rgba(0,200,83,0.06)", border: "1px solid rgba(0,200,83,0.2)" },
  skipBtn: { padding: "14px 20px", borderRadius: 14, border: "1px solid var(--blue)", background: "var(--bg2)", color: "var(--sub)", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  ctaBtn: { padding: 17, borderRadius: 15, border: "none", background: "var(--acc)", color: "#000", fontSize: 17, fontWeight: 800, cursor: "pointer" },
};
