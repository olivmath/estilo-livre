import { useTranslation } from "react-i18next";
import { locName } from "@/lib/localize";

export function SuggestionsCard({ suggestions }) {
  const { t } = useTranslation();
  if (!suggestions.length) return null;
  return (
    <div style={{ background: "rgba(245,196,0,0.06)", border: "1px solid rgba(245,196,0,0.2)", borderRadius: 16, padding: 20, marginBottom: 20 }}>
      <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--acc)", display: "flex", gap: 6, alignItems: "center" }}>
        {t("suggestions.title")}
      </h4>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
        {suggestions.map((s, idx) => (
          <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 10, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{locName(s)}</span>
              <span style={{ fontSize: 11, color: "var(--sub)" }}>{t("workoutsTab.workoutLabel", { label: s.wkLabel, name: s.wkName })}</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700 }}>
              {s.cur}kg → <span style={{ color: "var(--green)" }}>{s.sug}kg</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
