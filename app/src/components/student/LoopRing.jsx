// SVG ring showing loop progress (gold arc) with completed-loops count centered.
export function LoopRing({ cycles, pct }) {
  const size = 88, stroke = 7, r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1C2440" strokeWidth={stroke} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F0C64A" strokeWidth={stroke}
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.6s ease" }} />
        </svg>
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: 34, fontWeight: 500, color: "#F5F3EC", lineHeight: 1 }}>{cycles}</span>
          <span style={{ fontSize: 9, color: "#8A93B2", marginTop: 2 }}>loops completos</span>
        </div>
      </div>
    </div>
  );
}
