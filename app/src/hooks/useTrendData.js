const bezierPath = (points) => points.reduce((acc, p, i, arr) => {
  if (i === 0) return `M ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  const prev = arr[i - 1];
  const cpx = ((prev.x + p.x) / 2).toFixed(1);
  return `${acc} C ${cpx},${prev.y.toFixed(1)} ${cpx},${p.y.toFixed(1)} ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
}, "");

const buildChartPath = (pts) => {
  const W = 300, H = 110, PAD_X = 8, PAD_Y = 10;
  const svgPts = pts.map((v, i) => {
    const x = PAD_X + (pts.length === 1 ? (W - PAD_X * 2) / 2 : (i / (pts.length - 1)) * (W - PAD_X * 2));
    const y = PAD_Y + (1 - Math.min(v, 10) / 10) * (H - PAD_Y * 2);
    return { x, y, v };
  });

  const bPath = bezierPath(svgPts);
  const last = svgPts[svgPts.length - 1];
  const aPath = `${bPath} L ${last.x.toFixed(1)},${H} L ${svgPts[0].x.toFixed(1)},${H} Z`;
  return { svgPts, bezierPath: bPath, areaPath: aPath, W, H };
};

export function getTrendData(sessions) {
  const sortedSess = [...sessions].sort((a, b) => a.date - b.date).slice(-12);
  if (sortedSess.length < 2) return null;

  const pts = sortedSess.map((s) => {
    const exs = s.exs || [];
    return exs.length ? exs.reduce((acc, curr) => acc + (curr.diff || 5), 0) / exs.length : 5;
  });

  const { svgPts, bezierPath: bPath, areaPath, W, H } = buildChartPath(pts);
  const PAD_Y = 10;

  const WINDOW = 3;
  const maPts = pts.length >= WINDOW
    ? pts.slice(WINDOW - 1).map((_, i) => {
        const slice = pts.slice(i, i + WINDOW);
        const avg = slice.reduce((a, b) => a + b, 0) / WINDOW;
        const srcIdx = i + WINDOW - 1;
        return { x: svgPts[srcIdx].x, y: PAD_Y + (1 - avg / 10) * (H - PAD_Y * 2), avg };
      })
    : null;

  const maPath = maPts ? bezierPath(maPts) : null;

  const trend = pts[pts.length - 1] - pts[0];
  const trendColor = trend > 0.5 ? "var(--green)" : trend < -0.5 ? "var(--red)" : "var(--acc)";
  const trendLabel = trend > 0.5 ? "↑ Evoluindo" : trend < -0.5 ? "↓ Caindo" : "→ Estável";

  const avgRpe = pts.reduce((a, b) => a + b, 0) / pts.length;
  const currentRpe = pts[pts.length - 1];

  const sessionList = sortedSess.slice(-4);
  const avgLoadBySession = sessionList.map(s => {
    const weights = (s.exs || []).map(e => e.wt || 0);
    return weights.length ? weights.reduce((a, b) => a + b, 0) / weights.length : 0;
  });
  const avgLoad = avgLoadBySession.length ? avgLoadBySession.reduce((a, b) => a + b, 0) / avgLoadBySession.length : 0;

  const now = Date.now();
  const lastWeek = sortedSess.filter(s => (now - s.date) < 7 * 24 * 60 * 60 * 1000);
  const streak = lastWeek.length > 0 ? `${lastWeek.length}d` : "0d";

  const avgDuration = sessionList.length
    ? sessionList.reduce((acc, s) => acc + (s.duration || 0), 0) / sessionList.length
    : 0;

  const insight = trend > 0.5
    ? { status: "Evoluindo", message: "RPE consistente com tendência de alta" }
    : trend < -0.5
      ? { status: "Caindo", message: "RPE em queda, foque na recuperação" }
      : { status: "Estável", message: "RPE consistente com as últimas semanas" };

  return { bezierPath: bPath, areaPath, maPath, svgPts, trendColor, trendLabel, W, H, sessionsList: sortedSess, avgRpe, currentRpe, trend, avgLoad, streak, avgDuration, insight };
}

export function getTrendChartForMetric(sessions, metricId) {
  const sortedSess = [...sessions].sort((a, b) => a.date - b.date).slice(-12);
  if (sortedSess.length < 2) return null;

  let pts, title, color;

  if (metricId === "load") {
    pts = sortedSess.map((s) => {
      const weights = (s.exs || []).map(e => e.wt || 0);
      return weights.length ? weights.reduce((a, b) => a + b, 0) / weights.length : 0;
    });
    title = "Carga média por sessão";
    color = "var(--green)";
  } else if (metricId === "streak") {
    pts = sortedSess.map((s) => (s.exs?.length || 0) > 0 ? 1 : 0);
    title = "Sessões completadas";
    color = "var(--green)";
  } else if (metricId === "session") {
    pts = sortedSess.map((s) => (s.duration || 0) / 60);
    title = "Duração média da sessão";
    color = "var(--blue2)";
  } else {
    pts = sortedSess.map((s) => {
      const exs = s.exs || [];
      return exs.length ? exs.reduce((acc, curr) => acc + (curr.diff || 5), 0) / exs.length : 5;
    });
    title = "Intensidade do treino";
    color = "var(--acc)";
  }

  const { svgPts, bezierPath: bPath, areaPath, W, H } = buildChartPath(pts);
  const avgValue = pts.reduce((a, b) => a + b, 0) / pts.length;
  const currentValue = pts[pts.length - 1];

  return { bezierPath: bPath, areaPath, svgPts, W, H, sessionsList: sortedSess, trendColor: color, currentRpe: currentValue, avgRpe: avgValue, trendLabel: title };
}
