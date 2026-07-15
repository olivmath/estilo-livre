import { useState } from "react";
import { S, diffColor } from "@/components/student/shared";

// Edit mode for a past session: modify weight, reps, RPE per exercise.
export function SessionEditOverlay({ session, onClose, onSave, isSaving }) {
  const [exs, setExs] = useState(session.exs ?? []);

  const updateExercise = (idx, field, value) => {
    setExs((prev) =>
      prev.map((ex, i) => (i === idx ? { ...ex, [field]: value } : ex))
    );
  };

  const handleSave = async () => {
    await onSave(exs);
  };

  return (
    <div style={{ ...S.overlay, overflowY: "auto" }}>
      <div style={{ width: "100%", maxWidth: 400, background: "var(--bg2)", border: "1px solid var(--blue)", borderRadius: 20, padding: "24px 20px", boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>
        <div style={{ paddingBottom: 16, marginBottom: 16, position: "relative", borderBottom: `3px solid ${session.wkColor}` }}>
          <button onClick={onClose} style={{ position: "absolute", top: 0, right: 0, background: "none", border: "none", color: "var(--sub)", fontSize: 18, cursor: "pointer" }}>✕</button>
          <span style={{ fontSize: 10, fontWeight: 700, color: session.wkColor, letterSpacing: 2 }}>EDITAR TREINO</span>
          <h2 style={{ fontSize: 26, fontWeight: 850, marginTop: 4 }}>Treino {session.wkLabel}</h2>
          <p style={{ color: "var(--sub)", fontSize: 14 }}>{session.wkName}</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 20 }}>
          {exs.map((ex, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--bg3)", borderRadius: 10, padding: 12 }}>
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{ex.name}</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {/* Peso */}
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: 10, color: "var(--sub)", fontWeight: 600, textTransform: "uppercase" }}>Peso (kg)</label>
                  <input
                    type="number"
                    value={ex.wt ?? ex.kg ?? ""}
                    onChange={(e) => updateExercise(i, "wt", parseFloat(e.target.value) || 0)}
                    style={{
                      padding: "8px 6px",
                      borderRadius: 6,
                      border: "1px solid var(--blue)",
                      background: "var(--bg3)",
                      color: "var(--text)",
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  />
                </div>

                {/* Reps */}
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: 10, color: "var(--sub)", fontWeight: 600, textTransform: "uppercase" }}>Reps</label>
                  <input
                    type="number"
                    value={ex.reps ?? ""}
                    onChange={(e) => updateExercise(i, "reps", parseInt(e.target.value) || 0)}
                    style={{
                      padding: "8px 6px",
                      borderRadius: 6,
                      border: "1px solid var(--blue)",
                      background: "var(--bg3)",
                      color: "var(--text)",
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  />
                </div>

                {/* RPE */}
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: 10, color: "var(--sub)", fontWeight: 600, textTransform: "uppercase" }}>RPE</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={ex.diff ?? ex.rpe ?? ""}
                    onChange={(e) => updateExercise(i, "diff", parseInt(e.target.value) || 0)}
                    style={{
                      padding: "8px 6px",
                      borderRadius: 6,
                      border: `1px solid ${diffColor(ex.diff ?? ex.rpe ?? 5)}`,
                      background: "var(--bg3)",
                      color: diffColor(ex.diff ?? ex.rpe ?? 5),
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12, width: "100%" }}>
          <button onClick={onClose} disabled={isSaving} style={{ ...S.btnSecondary, flex: 1, opacity: isSaving ? 0.5 : 1, cursor: isSaving ? "not-allowed" : "pointer" }}>Cancelar</button>
          <button onClick={handleSave} disabled={isSaving} style={{ ...S.btnPrimary, flex: 1, opacity: isSaving ? 0.5 : 1, cursor: isSaving ? "not-allowed" : "pointer" }}>{isSaving ? "Salvando..." : "Salvar"}</button>
        </div>
      </div>
    </div>
  );
}
