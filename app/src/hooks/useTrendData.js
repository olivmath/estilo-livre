const bezierPath = (points) => points.reduce((acc, p, i, arr) => {
  if (i === 0) return `M ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  const prev = arr[i - 1];
  const cpx = ((prev.x + p.x) / 2).toFixed(1);
  return `${acc} C ${cpx},${prev.y.toFixed(1)} ${cpx},${p.y.toFixed(1)} ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
}, "");

const buildChartPath = (pts) => {
  const W = 300, H = 110, PAD_X = 8, PAD_Y = 10;
  const rawMin = Math.min(...pts), rawMax = Math.max(...pts);
  const range = rawMax - rawMin;
  const pad = range < 1 ? 0.15 : range * 0.15;
  const yMin = Math.max(0, rawMin - pad);
  const yMax = Math.min(10, rawMax + pad);

  const svgPts = pts.map((v, i) => {
    const x = PAD_X + (pts.length === 1 ? (W - PAD_X * 2) / 2 : (i / (pts.length - 1)) * (W - PAD_X * 2));
    const y = PAD_Y + (1 - (v - yMin) / (yMax - yMin)) * (H - PAD_Y * 2);
    return { x, y, v };
  });

  const bPath = bezierPath(svgPts);
  const last = svgPts[svgPts.length - 1];
  const aPath = `${bPath} L ${last.x.toFixed(1)},${H} L ${svgPts[0].x.toFixed(1)},${H} Z`;

  const span = yMax - yMin;
  const step = span <= 2 ? 0.5 : span <= 4 ? 1 : 2;
  const gridSet = new Set();
  const start = Math.ceil(yMin / step) * step;
  for (let v = start; v <= yMax; v = +(v + step).toFixed(1)) gridSet.add(+v.toFixed(1));
  if (yMin <= 6 && yMax >= 6) gridSet.add(6);
  gridSet.add(+yMin.toFixed(1));
  gridSet.add(+yMax.toFixed(1));
  const gridLevels = [...gridSet].sort((a, b) => a - b);

  return { svgPts, bezierPath: bPath, areaPath: aPath, W, H, yMin, yMax, gridLevels };
};

export function getTrendData(sessions) {
  const sortedSess = [...sessions].sort((a, b) => a.date - b.date).slice(-12);
  if (sortedSess.length < 2) return null;

  const pts = sortedSess.map((s) => {
    const exs = s.exs || [];
    return exs.length ? exs.reduce((acc, curr) => acc + (curr.diff || 5), 0) / exs.length : 5;
  });

  const { svgPts, bezierPath: bPath, areaPath, W, H, yMin, yMax, gridLevels } = buildChartPath(pts);
  const PAD_Y = 10;

  const first = svgPts[0], last = svgPts[svgPts.length - 1];
  const trendLine = `M ${first.x.toFixed(1)},${first.y.toFixed(1)} L ${last.x.toFixed(1)},${last.y.toFixed(1)}`;

  const avgRpe = pts.reduce((a, b) => a + b, 0) / pts.length;
  const currentRpe = pts[pts.length - 1];
  const trend = pts[pts.length - 1] - pts[0];

  const trendColor = avgRpe <= 6 ? "var(--red)" : trend > 0.5 ? "var(--green)" : trend < -0.5 ? "var(--red)" : "var(--acc)";
  const trendLabel = avgRpe <= 6 ? "↑ Aumentar carga" : trend > 0.5 ? "↑ Evoluindo" : trend < -0.5 ? "↓ Caindo" : "→ Estável";

  const toMs = (d) => (d?.toDate?.() ?? new Date(d)).getTime();
  const fmtDate = (ms) => new Date(ms).toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
  const firstMs = toMs(sortedSess[0].date), lastMs = toMs(sortedSess[sortedSess.length - 1].date);
  const msRange = lastMs - firstMs || 1;
  const DAY = 86400000, WEEK = 7 * DAY;
  const mondayAfter = (ms) => { const d = new Date(ms); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + ((8 - d.getDay()) % 7 || 7)); return d.getTime(); };
  const xTicks = [];
  for (let wk = mondayAfter(firstMs); wk < lastMs; wk += WEEK) {
    const t = (wk - firstMs) / msRange;
    xTicks.push({ x: 8 + t * (300 - 16), label: fmtDate(wk) });
  }

  return { bezierPath: bPath, areaPath, trendLine, svgPts, trendColor, trendLabel, title: "Intensidade do treino", cardLabels: ["RPE atual", "RPE médio", "sessões"], W, H, yMin, yMax, gridLevels, xTicks, sessionsList: sortedSess, avgRpe, currentRpe, trend };
}
