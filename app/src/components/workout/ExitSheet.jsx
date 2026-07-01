export function ExitSheet({ onSavePartial, onCancel }) {
  return (
    <div style={S.backdrop}>
      <div style={S.sheet}>
        <p style={{ fontSize: 18, fontWeight: 800, marginBottom: 6, color: "var(--text)" }}>Sair do treino?</p>
        <p style={{ fontSize: 13, color: "var(--sub)", marginBottom: 24 }}>Seu progresso será salvo para continuar depois.</p>
        <button onClick={onCancel} style={S.ctaBtn}>Voltar ao treino</button>
        <div style={{ height: 10 }} />
        <button onClick={onSavePartial} style={S.cancelBtn}>Continuar depois</button>
      </div>
    </div>
  );
}

const S = {
  backdrop: {
    position: "fixed", inset: 0, maxWidth: 430, margin: "0 auto",
    zIndex: 110, background: "rgba(6,9,26,0.85)",
    backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
    display: "flex", alignItems: "flex-end",
  },
  sheet: {
    background: "var(--bg2)", borderRadius: "20px 20px 0 0",
    padding: "28px 20px 16px", width: "100%", borderTop: "1px solid var(--blue)",
  },
  ctaBtn: {
    width: "100%", padding: 16, borderRadius: 13, border: "none",
    background: "var(--acc)", color: "#000", fontSize: 16, fontWeight: 800, cursor: "pointer",
  },
  cancelBtn: {
    width: "100%", padding: 16, borderRadius: 13,
    border: "1px solid var(--blue)", fontSize: 16, fontWeight: 700,
    cursor: "pointer", background: "var(--bg3)", color: "var(--sub)",
  },
};
