import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Share2 } from "lucide-react";
import { locName } from "@/lib/localize";
import { useShareWorkout } from "@/hooks/useShareWorkout";

function fmtDur(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export function SummaryOverlay({ summaryData, onSave, onDiscard }) {
  const { t } = useTranslation();
  const captureRef = useRef(null);
  const { share, sharing } = useShareWorkout();
  if (!summaryData) return null;
  const totalSeries = summaryData.exs.reduce((a, r) => a + r.sets, 0);

  const stats = [
    { val: fmtDur(summaryData.dur), lbl: t("summary.time") },
    { val: summaryData.exs.length, lbl: t("summary.exercises") },
    { val: totalSeries, lbl: t("summary.sets") },
  ];

  return (
    <div style={S.overlay}>
      <div ref={captureRef} style={S.captureArea}>
        <p style={{ fontSize: 48, textAlign: "center", width: "100%", marginBottom: 12 }}>🏆</p>
        <p style={S.title}>{t("summary.title")}</p>
        <p style={S.subtitle}>{summaryData.wkName}</p>

        <div style={S.statsGrid}>
          {stats.map(({ val, lbl }) => (
            <div key={lbl} style={S.statBox}>
              <p style={S.statVal}>{val}</p>
              <p style={S.statLbl}>{lbl}</p>
            </div>
          ))}
        </div>

        <div style={S.exList}>
          {summaryData.exs.map((res, i) => (
            <div key={i} style={S.sumItem}>
              <span style={{ color: "var(--green)", fontSize: 14, flexShrink: 0 }}>✓</span>
              <span style={S.exName}>{locName(res)}</span>
              <span style={S.exMeta}>{res.sets}×{res.kg ?? res.wt}kg · RPE {res.diff ?? res.rpe}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={S.actions}>
        <button onClick={onDiscard} style={{ ...S.skipBtn, flex: 1 }}>{t("summary.discard")}</button>
        <button
          onClick={() => share(captureRef, summaryData.wkName)}
          disabled={sharing}
          style={{ ...S.shareBtn, flex: 1 }}
        >
          <Share2 size={16} />
        </button>
        <button onClick={onSave} style={{ ...S.ctaBtn, flex: 2 }}>{t("summary.saveAndExit")}</button>
      </div>
    </div>
  );
}

const S = {
  overlay: { position: "fixed", inset: 0, maxWidth: 430, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", zIndex: 100, background: "var(--bg)", overflowY: "auto", padding: "60px 20px 32px" },
  captureArea: { width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", alignItems: "center", background: "var(--bg)", padding: "0 0 8px" },
  title: { fontSize: 28, fontWeight: 900, textAlign: "center", marginBottom: 4, color: "var(--text)" },
  subtitle: { fontSize: 13, color: "var(--sub)", textAlign: "center", marginBottom: 36 },
  statsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, width: "100%", marginBottom: 28 },
  statBox: { background: "var(--bg2)", borderRadius: 14, padding: "16px 10px", textAlign: "center", border: "1px solid var(--blue)" },
  statVal: { fontSize: 26, fontWeight: 900, color: "var(--acc)", lineHeight: 1 },
  statLbl: { fontSize: 10, color: "var(--sub)", letterSpacing: 0.5, marginTop: 4, textTransform: "uppercase" },
  exList: { width: "100%", display: "flex", flexDirection: "column", gap: 6, marginBottom: 32 },
  sumItem: { display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 12, background: "rgba(0,200,83,0.06)", border: "1px solid rgba(0,200,83,0.2)" },
  exName: { flex: 1, fontSize: 14, color: "var(--text)", fontWeight: 500 },
  exMeta: { fontSize: 11, color: "var(--sub)" },
  actions: { display: "flex", gap: 12, width: "100%", maxWidth: 400 },
  skipBtn: { padding: "14px 20px", borderRadius: 14, border: "1px solid var(--blue)", background: "var(--bg2)", color: "var(--sub)", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  shareBtn: { padding: "14px 16px", borderRadius: 14, border: "1px solid var(--blue)", background: "var(--bg2)", color: "var(--acc)", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  ctaBtn: { padding: 17, borderRadius: 15, border: "none", background: "var(--acc)", color: "#000", fontSize: 17, fontWeight: 800, cursor: "pointer" },
};
