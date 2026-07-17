import { useTranslation } from "react-i18next";
import { ChevronLeft } from "lucide-react";
import { S } from "@/components/student/shared";

export function WorkoutDetailOverlay({ wk, onClose, onStart, onOpenExercise }) {
  const { t } = useTranslation();
  return (
    <div style={{ ...S.overlay, overflowY: "auto", display: "block" }}>
      <div style={{ ...S.mobileContainer, minHeight: "100vh", background: "var(--bg)", padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--acc)", display: "flex", alignItems: "center", gap: 4, fontSize: 14, fontWeight: 600, cursor: "pointer", padding: 0 }}>
            <ChevronLeft size={20} /> {t("common.back")}
          </button>
        </div>

        <div style={{ paddingLeft: 12, marginBottom: 24, borderLeft: `4px solid ${wk.color || "var(--acc)"}` }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)" }}>{t("workoutDetail.workoutLabel", { label: wk.label })}</h2>
          <p style={{ color: "var(--sub)", fontSize: 14, marginTop: 2 }}>{wk.name}</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
          {wk.exercises?.map((ex, i) => (
            <div key={i} onClick={() => onOpenExercise(wk, ex)} style={{ background: "var(--bg2)", border: "1px solid var(--bg3)", borderRadius: 12, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {ex.num && <span style={{ padding: "2px 8px", color: "#fff", fontWeight: 700, fontSize: 11, borderRadius: 6, background: wk.color }}>{ex.num}</span>}
                  {ex.mac && <span style={{ padding: "2px 8px", background: "var(--blue)", color: "#fff", fontWeight: 650, fontSize: 11, borderRadius: 6 }}>{t("common.machineN", { n: ex.mac })}</span>}
                </div>
                <span style={{ fontWeight: 600, color: "var(--text)" }}>{ex.name}</span>
                <span style={{ fontSize: 12, color: "var(--sub)" }}>{ex.sets} × {ex.reps} {t("workoutDetail.reps")}</span>
                {ex.obs && <span style={{ fontSize: 11, color: "var(--sub)", fontStyle: "italic" }}>{ex.obs}</span>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: "var(--acc)" }}>{ex.wt || 0}</span>
                <span style={{ fontSize: 10, color: "var(--sub)" }}>kg</span>
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => { onClose(); onStart(wk.id); }} style={{ ...S.btnPrimary, width: "100%", padding: 16 }}>
          {t("workoutDetail.startWorkout")}
        </button>
      </div>
    </div>
  );
}
