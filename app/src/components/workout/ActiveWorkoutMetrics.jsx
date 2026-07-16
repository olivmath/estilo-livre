// Reps + weight metric cards for the active workout screen.
import { Pencil } from "lucide-react";

export function ActiveWorkoutMetrics({ ex, currentSetIdx, currentWeight, onWeightClick, onSetsRepsClick }) {
  return (
    <div style={S.metricsRow}>
      <div style={S.metricCard}>
        <div style={S.cardHeader}>
          <span style={S.mcLabel}>Repetições</span>
          <button onClick={onSetsRepsClick} style={S.editBtn}>
            <Pencil size={13} color="var(--acc)" />
          </button>
        </div>
        <div style={S.repsValue}>
          <span style={S.repsSets}>{ex.sets}×</span>{ex.reps}
        </div>
        <div style={S.progressBar}>
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
        <div style={S.cardHeader}>
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
      </div>
    </div>
  );
}

const blue = "var(--blue)", bg2 = "var(--bg2)", bg3 = "var(--bg3)";
const S = {
  metricsRow: { display: "flex", gap: 10 },
  metricCard: { flex: 1, background: bg2, borderRadius: 16, border: `1px solid ${blue}`, height: 200, display: "flex", flexDirection: "column", alignItems: "stretch", padding: "10px 14px 12px" },
  cardHeader: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  mcLabel: { fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: "var(--sub)", lineHeight: 1.3, flexShrink: 0 },
  editBtn: { width: 28, height: 28, borderRadius: 8, border: `1px solid ${blue}`, background: bg3, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  repsValue: { fontSize: 62, fontWeight: 900, lineHeight: 1, letterSpacing: -2, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text)" },
  repsSets: { fontSize: 22, fontWeight: 600, color: "var(--sub)", marginRight: 2 },
  progressBar: { display: "flex", gap: 5, width: "100%", flexShrink: 0 },
  weightBtn: { background: "none", border: "none", padding: 0, cursor: "pointer", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 0 },
  weightValue: { fontSize: 52, fontWeight: 900, lineHeight: 1, letterSpacing: -2, color: "var(--acc)", fontVariantNumeric: "tabular-nums" },
  weightUnit: { fontSize: 16, fontWeight: 600, color: "var(--sub)", marginLeft: 3, marginTop: 8 },
};
