// Reusable SVG line chart with dots, average line, and fixed-scale gridlines.
// Used on Home (trend chips), RPE-by-workout, and RPE-by-exercise screens.
export function MiniChart({ series, color, scale, height = 58, label }) {
  if (!series || series.length < 2) {
    return <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", color: "#5C6480", fontSize: 11 }}>Dados insuficientes</div>;
  }

  const W = 300, H = height, PX = 12, PY = 8;
  const [min, max] = scale;
  const toY = (v) => PY + (1 - (v - min) / (max - min)) * (H - PY * 2);
  const pts = series.map((v, i) => ({
    x: PX + (i / (series.length - 1)) * (W - PX * 2),
    y: toY(Math.min(Math.max(v, min), max)),
    v,
  }));

  const bezier = pts.reduce((acc, p, i, arr) => {
    if (i === 0) return `M ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    const prev = arr[i - 1];
    const cpx = ((prev.x + p.x) / 2).toFixed(1);
    return `${acc} C ${cpx},${prev.y.toFixed(1)} ${cpx},${p.y.toFixed(1)} ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }, "");

  const avg = series.reduce((a, b) => a + b, 0) / series.length;
  const avgY = toY(avg);
  const gridYs = [PY, H / 2, H - PY];
  const last = pts[pts.length - 1];

  return (
    <div style={{ position: "relative" }} role="img" aria-label={`Gráfico de ${label || "tendência"}`}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: "block" }}>
        {gridYs.map((y, i) => (
          <line key={i} x1={PX} y1={y} x2={W - PX} y2={y} stroke="#1C2440" strokeWidth={0.5} />
        ))}
        <line x1={PX} y1={avgY + 1} x2={W - PX} y2={avgY - 1} stroke="#F5F3EC" strokeWidth={2} strokeOpacity={0.8} />
        <path d={bezier} fill="none" stroke={color} strokeWidth={1.5} strokeOpacity={0.5} />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={i === pts.length - 1 ? 5 : 3.5} fill={color}
            stroke={i === pts.length - 1 ? "#0A0E1C" : "none"} strokeWidth={i === pts.length - 1 ? 2 : 0} />
        ))}
      </svg>
      <div style={{ position: "absolute", right: 4, bottom: 2, fontSize: 10, color: "#8A93B2" }}>
        hoje · {typeof last.v === "number" ? last.v.toFixed(1) : last.v}
      </div>
      <div style={{ position: "absolute", right: 4, top: 0, fontSize: 9, color: "#5C6480" }}>
        {min}–{max}
      </div>
    </div>
  );
}
