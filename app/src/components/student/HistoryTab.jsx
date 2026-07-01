import { Clock } from "lucide-react";
import { S, diffColor, fmtDateFull, fmtDur } from "@/components/student/shared";

// "Histórico" tab: list of completed sessions, tap to open SessionReportOverlay.
export function HistoryTab({ sessions, onOpenSession }) {
  return (
    <div>
      <h2 style={S.pageTitle}>Histórico de Treinos</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
        {sessions.length > 0 ? (
          sessions.map((sess, idx) => {
            const avgRpe = sess.exs?.length ? sess.exs.reduce((a, r) => a + r.diff, 0) / sess.exs.length : null;
            return (
              <div key={idx} onClick={() => onOpenSession(sess)} style={{ background: "var(--bg2)", border: "1px solid var(--blue)", borderRadius: 16, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 11, color: "var(--sub)" }}>{fmtDateFull(sess.date)}</span>
                  <h4 style={{ fontWeight: 700, fontSize: 15, marginTop: 2 }}>Treino {sess.wkLabel} — {sess.wkName}</h4>
                  <span style={{ fontSize: 12, color: "var(--sub)", display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                    <Clock size={12} /> {fmtDur(sess.dur)}
                  </span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 20, fontWeight: 900, color: diffColor(avgRpe ?? 5) }}>{avgRpe?.toFixed(1) ?? "—"}</span>
                  <p style={{ fontSize: 10, color: "var(--sub)", marginTop: 2 }}>dif. média</p>
                </div>
              </div>
            );
          })
        ) : (
          <div style={S.cardEmpty}><p>Nenhum treino realizado ainda. Seus treinos salvos aparecerão aqui!</p></div>
        )}
      </div>
    </div>
  );
}
