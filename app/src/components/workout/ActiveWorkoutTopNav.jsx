// Header of the active workout screen: tap to open the workout switcher.
export function ActiveWorkoutTopNav({ label, name, elapsedTime, onSwitchClick, onShowExit }) {
  return (
    <div style={S.topnav}>
      <button onClick={onSwitchClick} style={S.switchBtn}>
        <span style={S.label}>Treino {label}</span>
        <span style={S.name}>{name}</span>
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={S.timerPill}>
          <div style={S.liveDot} />
          <span style={S.timerText}>{elapsedTime}</span>
        </div>
        <button onClick={onShowExit} style={S.closeBtn}>✕</button>
      </div>
    </div>
  );
}

const blue = "var(--blue)", bg3 = "var(--bg3)", sub = "var(--sub)", grn = "var(--green)";
const S = {
  topnav: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 10px", flexShrink: 0 },
  switchBtn: { display: "flex", flexDirection: "column", gap: 1, background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left" },
  label: { fontSize: 10, fontWeight: 600, letterSpacing: 1.2, color: "var(--acc)", textTransform: "uppercase" },
  name: { fontSize: 14, fontWeight: 600, color: "var(--text)" },
  timerPill: { display: "flex", alignItems: "center", gap: 5, background: bg3, borderRadius: 20, padding: "5px 10px", border: `1px solid ${blue}` },
  liveDot: { width: 5, height: 5, borderRadius: "50%", background: grn, animation: "blink 1.4s infinite" },
  timerText: { fontSize: 12, fontVariantNumeric: "tabular-nums", fontWeight: 500, color: sub },
  closeBtn: { width: 28, height: 28, borderRadius: "50%", border: `1px solid ${blue}`, background: bg3, color: sub, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
};
