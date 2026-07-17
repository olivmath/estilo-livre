import { getLocale } from "@/lib/i18n";

// Style tokens shared by the student tab components (home/workouts/history/profile).
export const S = {
  mobileContainer: {
    width: "100%", maxWidth: 430, margin: "0 auto", padding: "16px 16px 80px",
    minHeight: "100vh", background: "var(--bg)", color: "var(--text)",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", position: "relative",
  },
  pageTitle: { fontSize: 22, fontWeight: 800, paddingTop: 32, marginBottom: 20 },
  dashboardCard: { background: "var(--bg2)", border: "1px solid var(--blue)", borderRadius: 16, padding: 20, marginBottom: 20, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" },
  cardTitle: { fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 16 },
  cardEmpty: { background: "var(--bg2)", border: "1px dotted var(--blue)", borderRadius: 16, padding: 32, textAlign: "center", color: "var(--sub)", fontSize: 14 },
  btnPrimary: { background: "var(--acc)", color: "#000", border: "none", borderRadius: 12, padding: "14px 24px", fontWeight: 700, fontSize: 15, cursor: "pointer", textAlign: "center" },
  btnSecondary: { background: "var(--bg3)", color: "var(--text)", border: "1px solid var(--blue)", borderRadius: 12, padding: "14px 24px", fontWeight: 600, fontSize: 15, cursor: "pointer", textAlign: "center" },
  overlay: { position: "fixed", inset: 0, zIndex: 100, background: "rgba(6,9,26,0.92)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 },
};

export function diffColor(v) {
  if (v <= 4) return "var(--green)";
  if (v <= 7) return "var(--acc)";
  return "var(--red)";
}

export function fmtDateFull(timestamp, locale) {
  return new Date(timestamp).toLocaleDateString(locale || getLocale(), { weekday: "short", day: "2-digit", month: "2-digit" });
}

export function fmtDur(sec) {
  return `${Math.floor(sec / 60)} min`;
}

export function fmtVol(vol) {
  return vol >= 1000 ? `${(vol / 1000).toFixed(1)}t` : `${vol}kg`;
}
