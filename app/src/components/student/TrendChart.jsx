const GRID_LEVELS = [2, 4, 6, 8, 10];

// SVG line chart of average RPE over the last sessions, plus a 3-session
// moving average, feeding from useTrendData's precomputed path data.
export function TrendChart({ chart, onInfoClick }) {
  const lastPt = chart.svgPts[chart.svgPts.length - 1];
  const boxW = 38, boxH = 18;
  const bx = Math.min(lastPt.x - boxW / 2, chart.W - boxW - 2);
  const by = lastPt.y - boxH - 8;

  return (
    <div style={{ background: "var(--bg2)", border: "1px solid var(--blue)", borderRadius: 16, padding: 20, marginBottom: 20, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 0, display: "flex", alignItems: "center", gap: 6 }}>
          {chart.title || "Intensidade do treino"}
          <button onClick={onInfoClick} style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--acc)", border: "none", color: "var(--bg)", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>i</button>
        </h4>
        <span style={{ fontSize: 11, fontWeight: 700, color: chart.trendColor, background: `color-mix(in srgb, ${chart.trendColor} 12%, transparent)`, border: `1px solid color-mix(in srgb, ${chart.trendColor} 30%, transparent)`, borderRadius: 99, padding: "3px 10px" }}>
          {chart.trendLabel || "—"}
        </span>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {[[chart.currentRpe.toFixed(1), "RPE atual", chart.trendColor], [chart.avgRpe.toFixed(1), "RPE médio", "var(--text)"], [chart.sessionsList.length, "sessões", "var(--text)"]].map(([val, label, color], i) => (
          <div key={i} style={{ flex: 1, background: "var(--bg3)", borderRadius: 10, padding: "8px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color, lineHeight: 1.2 }}>{val}</div>
            <div style={{ fontSize: 10, color: "var(--sub)", marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      <svg width="100%" height={chart.H} viewBox={`0 0 ${chart.W} ${chart.H}`} style={{ display: "block", overflow: "visible" }}>
        <defs>
          <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chart.trendColor} stopOpacity={0.3} />
            <stop offset="100%" stopColor={chart.trendColor} stopOpacity={0} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {GRID_LEVELS.map((lvl) => {
          const gy = 10 + (1 - lvl / 10) * (chart.H - 20);
          return (
            <g key={lvl}>
              <line x1={0} y1={gy} x2={chart.W} y2={gy} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <text x={chart.W - 2} y={gy - 2} fontSize="8" fill="rgba(136,153,187,0.5)" textAnchor="end">{lvl}</text>
            </g>
          );
        })}

        <path d={chart.areaPath} fill="url(#tg)" />
        <path d={chart.bezierPath} fill="none" stroke={chart.trendColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {chart.maPath && (
          <path d={chart.maPath} fill="none" stroke="rgba(136,153,187,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 3" />
        )}

        {chart.svgPts.map((p, idx) => {
          const isLast = idx === chart.svgPts.length - 1;
          return (
            <g key={idx}>
              {isLast && <circle cx={p.x} cy={p.y} r="8" fill={chart.trendColor} opacity={0.15} />}
              <circle cx={p.x} cy={p.y} r={isLast ? 5 : 3} fill={isLast ? chart.trendColor : "var(--bg2)"} stroke={chart.trendColor} strokeWidth={isLast ? 0 : 1.5} />
            </g>
          );
        })}

        <g filter="url(#glow)">
          <rect x={bx} y={by} width={boxW} height={boxH} rx="5" fill={chart.trendColor} opacity={0.9} />
          <text x={bx + boxW / 2} y={by + 12} fontSize="9" fill="#000" textAnchor="middle" fontWeight="800">{lastPt.v.toFixed(1)}</text>
        </g>
      </svg>

      <div style={{ display: "flex", gap: 12, marginTop: 8, alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <svg width="18" height="6"><line x1="0" y1="3" x2="18" y2="3" stroke={chart.trendColor} strokeWidth="2.5" strokeLinecap="round" /></svg>
          <span style={{ fontSize: 10, color: "var(--sub)" }}>RPE</span>
        </div>
        {chart.maPath && (
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <svg width="18" height="6"><line x1="0" y1="3" x2="18" y2="3" stroke="rgba(136,153,187,0.7)" strokeWidth="1.5" strokeDasharray="4 3" strokeLinecap="round" /></svg>
            <span style={{ fontSize: 10, color: "var(--sub)" }}>Média móvel (3)</span>
          </div>
        )}
      </div>
    </div>
  );
}
