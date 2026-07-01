import { ChevronLeft, Play } from "lucide-react";

export function VideoScreen({ exercise, onClose }) {
  if (!exercise) return null;
  const { name, sets, reps, machine, alteres } = exercise;
  const hasMachine = machine && machine !== "0";
  const equipment = hasMachine ? `Máquina ${machine}` : alteres ? "Alteres" : "Livre";

  return (
    <div style={S.screen}>
      {/* Top bar */}
      <div style={S.topbar}>
        <button onClick={onClose} style={S.backBtn}>
          <ChevronLeft size={20} color="var(--text)" />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {name}
          </p>
          <p style={{ fontSize: 11, color: "var(--sub)", margin: 0 }}>
            {sets}×{reps} · {equipment}
          </p>
        </div>
      </div>

      {/* Video placeholder */}
      <div style={S.videoBox}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--acc)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Play size={28} color="#000" fill="#000" style={{ marginLeft: 3 }} />
        </div>
        <p style={{ color: "var(--sub)", fontSize: 12, marginTop: 12 }}>Vídeo disponível em breve</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "0 16px 20px" }}>
        {[
          { lbl: "Séries", val: sets },
          { lbl: "Reps", val: reps },
          { lbl: "Equipamento", val: equipment },
        ].map(({ lbl, val }) => (
          <div key={lbl} style={S.statBox}>
            <p style={{ fontSize: 16, fontWeight: 800, color: "var(--acc)", margin: 0, lineHeight: 1.2 }}>{val}</p>
            <p style={{ fontSize: 10, color: "var(--sub)", margin: 0, marginTop: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>{lbl}</p>
          </div>
        ))}
      </div>

      {/* Tips */}
      <div style={{ padding: "0 16px", flex: 1 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--sub)", marginBottom: 10 }}>Dicas de execução</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {["Mantenha a postura alinhada durante o movimento", "Controle a descida — não solte o peso", "Respire: inspire na descida, expire na subida"].map((tip, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ color: "var(--acc)", fontWeight: 700, flexShrink: 0, fontSize: 14, marginTop: 1 }}>·</span>
              <p style={{ fontSize: 13, color: "var(--sub)", margin: 0, lineHeight: 1.5 }}>{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const S = {
  screen: {
    position: "fixed", inset: 0, zIndex: 200, background: "var(--bg)",
    maxWidth: 430, margin: "0 auto", display: "flex", flexDirection: "column", overflowY: "auto",
  },
  topbar: {
    display: "flex", alignItems: "center", gap: 10, padding: "14px 16px 12px",
    borderBottom: "1px solid var(--blue)", flexShrink: 0,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10, border: "1px solid var(--blue)",
    background: "var(--bg3)", cursor: "pointer", display: "flex", alignItems: "center",
    justifyContent: "center", flexShrink: 0,
  },
  videoBox: {
    width: "100%", aspectRatio: "16/9", background: "#000",
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    flexShrink: 0, marginBottom: 16,
  },
  statBox: {
    background: "var(--bg2)", borderRadius: 12, padding: "12px 10px",
    textAlign: "center", border: "1px solid var(--blue)",
  },
};
