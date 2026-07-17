import { useTranslation } from "react-i18next";
import { Dumbbell } from "lucide-react";

export function ExerciseCard({ item, currentSet, onVideoClick, onSelect }) {
  const { t } = useTranslation();
  const { status, name, sets, reps, machine, result } = item;
  const isDone = status === "done";
  const isCurrent = status === "current";
  const hasMachine = machine && machine !== "0";
  const canSelect = onSelect && !isDone && !isCurrent;

  return (
    <div
      onClick={canSelect ? onSelect : undefined}
      style={{
        flexShrink: 0, height: 68, borderRadius: 12,
        display: "flex", alignItems: "center", gap: 8, padding: "0 8px 0 10px",
        background: isDone ? "rgba(0,200,83,0.08)" : isCurrent ? "rgba(245,196,0,0.06)" : "var(--bg2)",
        border: isDone ? "1px solid rgba(0,200,83,0.2)" : isCurrent ? "1.5px solid rgba(245,196,0,0.35)" : "1px solid var(--blue)",
        boxShadow: isCurrent ? "inset 3px 0 0 var(--acc)" : "none",
        cursor: canSelect ? "pointer" : "default",
        touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
      }}
    >
      {/* Icon widget */}
      <div style={{
        width: 30, height: 30, borderRadius: 9, flexShrink: 0,
        background: "var(--bg3)", border: isDone ? "1px solid rgba(0,200,83,0.3)" : "1px solid var(--blue)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1,
      }}>
        {isDone ? (
          <span style={{ fontSize: 13, color: "var(--green)", fontWeight: 700, lineHeight: 1 }}>✓</span>
        ) : hasMachine ? (
          <>
            <span style={{ fontSize: 7, color: "var(--sub)", fontWeight: 600, letterSpacing: 0.3, lineHeight: 1 }}>{t("common.machine")}</span>
            <span style={{ fontSize: 12, color: "var(--acc)", fontWeight: 800, lineHeight: 1 }}>{machine}</span>
          </>
        ) : (
          <Dumbbell size={14} color="var(--sub)" />
        )}
      </div>

      {/* Name + meta */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
        <span style={{
          fontSize: isCurrent ? 13 : 12, fontWeight: isCurrent ? 700 : isDone ? 600 : 500,
          color: isDone ? "var(--green)" : isCurrent ? "var(--acc)" : "var(--sub)",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: 1.2,
        }}>
          {name}
        </span>
        <span style={{
          fontSize: 10, letterSpacing: 0.2,
          color: isDone ? "rgba(0,200,83,0.55)" : isCurrent ? "rgba(245,196,0,0.65)" : "var(--blue2)",
        }}>
          {isDone ? `${sets}×${result?.wt ?? 0}kg` : isCurrent ? t("activeWorkout.setProgress", { current: currentSet, total: sets }) : `${sets}×${reps}`}
        </span>
      </div>

      {/* › button */}
      <button
        onClick={(e) => { e.stopPropagation(); onVideoClick(item); }}
        style={{
          width: 24, height: 24, borderRadius: 6, border: "1px solid var(--blue)",
          background: "var(--bg3)", color: "var(--sub)", fontSize: 13, fontWeight: 700,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, lineHeight: 1,
        }}
      >
        ›
      </button>
    </div>
  );
}
