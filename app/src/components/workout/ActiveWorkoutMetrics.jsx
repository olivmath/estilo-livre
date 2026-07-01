import { Pencil } from "lucide-react";

// Left column of the active workout screen: reps progress + weight controls.
export function ActiveWorkoutMetrics({ ex, currentSetIdx, currentWeight, onWeightClick, onAdjustWeight }) {
  return (
    <div style={S.colLeft}>
      <div style={S.metricCard}>
        <span style={S.mcLabel}>Repetições</span>
        <div style={S.repsValue}>
          <span style={S.repsSets}>{ex.sets}×</span>
          {ex.reps}
        </div>
        <div style={{ display: "flex", gap: 5, width: "100%", flexShrink: 0 }}>
          {Array.from({ length: ex.sets }).map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 6, borderRadius: 3,
              background: i < currentSetIdx ? "var(--green)" : i === currentSetIdx ? "var(--acc)" : "var(--bg3)",
              border: `1px solid ${i < currentSetIdx ? "var(--green)" : i === currentSetIdx ? "var(--acc)" : "var(--blue)"}`,
            }} />
          ))}
        </div>
      </div>

      <div style={S.metricCard}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={S.mcLabel}>Carga</span>
          <button onClick={onWeightClick} style={S.editBtn}>
            <Pencil size={13} color="var(--acc)" />
          </button>
        </div>
        <button onClick={onWeightClick} style={S.weightBtn}>
          <span style={S.weightValue}>
            {currentWeight % 1 === 0 ? currentWeight : currentWeight.toFixed(1)}
          </span>
          <span style={S.weightUnit}>kg</span>
        </button>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => onAdjustWeight(-2.5)} style={S.wBtn}>−</button>
          <button onClick={() => onAdjustWeight(2.5)} style={S.wBtn}>+</button>
        </div>
      </div>
    </div>
  );
}

const blue = "var(--blue)", bg2 = "var(--bg2)", bg3 = "var(--bg3)", acc = "var(--acc)", sub = "var(--sub)";
const S = {
  colLeft: { display: "flex", flexDirection: "column", gap: 10, width: "44%", flexShrink: 0 },
  metricCard: { background: bg2, borderRadius: 16, border: `1px solid ${blue}`, flex: "none", height: 200, flexDirection: "column", alignItems: "stretch", padding: "10px 14px 12px", display: "flex" },
  mcLabel: { fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: sub, lineHeight: 1.3, flexShrink: 0 },
  repsValue: { fontSize: 62, fontWeight: 900, lineHeight: 1, letterSpacing: -2, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text)" },
  repsSets: { fontSize: 22, fontWeight: 600, color: sub, marginRight: 2 },
  editBtn: { width: 28, height: 28, borderRadius: 8, border: `1px solid ${blue}`, background: bg3, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  weightBtn: { background: "none", border: "none", padding: 0, cursor: "pointer", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 0 },
  weightValue: { fontSize: 52, fontWeight: 900, lineHeight: 1, letterSpacing: -2, color: acc, fontVariantNumeric: "tabular-nums" },
  weightUnit: { fontSize: 16, fontWeight: 600, color: sub, marginLeft: 3, marginTop: 8 },
  wBtn: { flex: 1, height: 44, borderRadius: 8, border: `1px solid ${blue}`, background: bg3, color: acc, fontSize: 22, fontWeight: 400, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 },
};
