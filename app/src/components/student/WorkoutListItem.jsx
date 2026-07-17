import { useTranslation } from "react-i18next";
import { ChevronRight } from "lucide-react";

// A single "Treino X" row — reused by HomeTab's next-workout card and
// WorkoutsTab's full list. variant="home" adds the gradient highlight.
export function WorkoutListItem({ w, isDone, isNext, variant = "list", onStart, onOpenDetail }) {
  const { t } = useTranslation();
  const highlighted = variant === "home" && isNext;
  return (
    <div
      onClick={() => onStart(w.id)}
      style={{
        display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 16,
        cursor: "pointer", touchAction: "manipulation", WebkitTapHighlightColor: "transparent", userSelect: "none",
        background: highlighted
          ? `linear-gradient(135deg, ${w.color || "var(--blue)"}22, ${w.color || "var(--blue)"}0a)`
          : "var(--bg2)",
        border: isNext ? `1.5px solid ${w.color || "var(--acc)"}88` : "1px solid var(--blue)",
        boxShadow: variant === "list" && isNext ? `0 0 12px ${w.color || "var(--acc)"}33` : "none",
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 800, fontSize: 14, color: "#fff",
        background: isDone ? "var(--green)" : w.color || "var(--acc)",
      }}>
        {isDone ? "✓" : w.label}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 700, fontSize: 15, color: "var(--text)", margin: 0 }}>
          {t("workoutsTab.workoutLabel", { label: w.label, name: w.name })}
        </p>
        <p style={{ fontSize: 12, margin: "2px 0 0", color: isNext ? (w.color || "var(--acc)") : "var(--sub)", fontWeight: isNext ? 700 : 400 }}>
          {t("workoutsTab.exerciseCount", { n: w.exercises?.length || 0 })}{isNext ? ` · ${t("common.next")}` : isDone ? ` · ${t("common.done")}` : ""}
        </p>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onOpenDetail(w); }}
        style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid var(--blue)", background: "var(--bg3)", color: "var(--sub)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
