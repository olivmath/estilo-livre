import { useState } from "react";
import { S, diffColor, fmtDateFull, fmtDur, fmtVol } from "@/components/student/shared";
import { SessionEditOverlay } from "./SessionEditOverlay";
import { updateStudentSession } from "@/services/sessions";
import { useAuth } from "@/contexts/AuthContext";

// Read-only report for a past session, with option to edit; opened by tapping a HistoryTab row.
export function SessionReportOverlay({ session, onClose, onSessionUpdated }) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const avgDiff = session.exs?.length ? session.exs.reduce((a, r) => a + r.diff, 0) / session.exs.length : 5;
  const volume = session.exs?.reduce((a, r) => a + r.wt * r.sets * r.reps, 0) || 0;

  const handleSaveEdit = async (updatedExs) => {
    setIsSaving(true);
    try {
      await updateStudentSession(user.uid, session.id, updatedExs);
      onSessionUpdated?.();
      setIsEditing(false);
    } catch (e) {
      console.error("Error updating session:", e);
      alert("Erro ao atualizar treino. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isEditing) {
    return (
      <SessionEditOverlay
        session={session}
        onClose={() => setIsEditing(false)}
        onSave={handleSaveEdit}
        isSaving={isSaving}
      />
    );
  }

  return (
    <div style={{ ...S.overlay, overflowY: "auto" }}>
      <div style={{ width: "100%", maxWidth: 400, background: "var(--bg2)", border: "1px solid var(--blue)", borderRadius: 20, padding: "24px 20px", boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>
        <div style={{ paddingBottom: 16, marginBottom: 16, position: "relative", borderBottom: `3px solid ${session.wkColor}` }}>
          <button onClick={onClose} style={{ position: "absolute", top: 0, right: 0, background: "none", border: "none", color: "var(--sub)", fontSize: 18, cursor: "pointer" }}>✕</button>
          <span style={{ fontSize: 10, fontWeight: 700, color: session.wkColor, letterSpacing: 2 }}>TREINO REALIZADO</span>
          <h2 style={{ fontSize: 26, fontWeight: 850, marginTop: 4 }}>Treino {session.wkLabel}</h2>
          <p style={{ color: "var(--sub)", fontSize: 14 }}>{session.wkName}</p>
          <p style={{ color: "var(--sub)", fontSize: 12, marginTop: 4 }}>{fmtDateFull(session.date)}</p>
        </div>

        <div style={{ display: "flex", background: "var(--bg3)", borderRadius: 12, border: "1px solid var(--blue)", padding: 12, marginBottom: 20 }}>
          {[[fmtDur(session.dur), "Duração", session.wkColor], [fmtVol(volume), "Volume", session.wkColor], [`${avgDiff.toFixed(1)}/10`, "Dif. média", diffColor(avgDiff)]].map(([val, label, color], i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, textAlign: "center" }}>
              <span style={{ fontSize: 22, fontWeight: 800, color }}>{val}</span>
              <span style={{ fontSize: 11, color: "var(--sub)" }}>{label}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
          {session.exs?.map((res, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--bg3)", borderRadius: 10, padding: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                {res.num && <span style={{ padding: "2px 8px", color: "#fff", fontWeight: 700, fontSize: 11, borderRadius: 6, background: session.wkColor }}>{res.num}</span>}
                <span style={{ fontWeight: 600, fontSize: 14 }}>{res.name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "var(--sub)" }}>{res.sets} séries × {res.reps} reps · <b>{res.wt}kg</b></span>
                <span style={{ color: diffColor(res.diff), fontWeight: 700, fontSize: 13 }}>RPE {res.diff}/10</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onClose} style={{ ...S.btnSecondary, flex: 1 }}>Fechar</button>
          <button onClick={() => setIsEditing(true)} style={{ ...S.btnPrimary, flex: 1 }}>Editar</button>
        </div>
      </div>
    </div>
  );
}
