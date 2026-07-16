// Computes home-screen stats from session history: streak, weekly load delta,
// average duration, RPE series, and the text verdict for trend direction.

function rpeColor(v) {
  if (v <= 3.9) return "#4DD9B8";
  if (v <= 6.4) return "#F0C64A";
  return "#E8705E";
}

function verdict(series) {
  if (series.length < 2) return { word: "—", phrase: "dados insuficientes", color: "#8A93B2" };
  const recent = series.slice(-6);
  const delta = recent[recent.length - 1] - recent[0];
  if (delta > 0.4) return { word: "Subindo", phrase: "esforço aumentando sessão a sessão", color: "#E8705E" };
  if (delta < -0.4) return { word: "Caindo", phrase: "ficando mais fácil — candidato a subir carga", color: "#4DD9B8" };
  return { word: "Estável", phrase: "esforço constante nas últimas sessões", color: "#F0C64A" };
}

export function getHomeStats(sessions, workouts, cycleInfo) {
  const sorted = [...sessions].sort((a, b) => a.date - b.date);

  // Streak: consecutive days with at least one session
  let streak = 0;
  if (sorted.length) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    let check = new Date(today);
    const hasSessOn = (d) => sorted.some((s) => {
      const sd = new Date(s.date); sd.setHours(0, 0, 0, 0);
      return sd.getTime() === d.getTime();
    });
    if (!hasSessOn(check)) { check.setDate(check.getDate() - 1); }
    while (hasSessOn(check)) { streak++; check.setDate(check.getDate() - 1); }
  }

  // Weekly sessions
  const weekAgo = Date.now() - 7 * 86400000;
  const weekCount = sessions.filter((s) => s.date > weekAgo).length;

  // Avg duration (minutes)
  const avgDur = sessions.length ? Math.round(sessions.reduce((a, s) => a + s.dur, 0) / sessions.length / 60) : 0;

  // RPE series (last 12 sessions, chronological)
  const rpeSeries = sorted.slice(-12).map((s) => {
    const exs = s.exs || [];
    return exs.length ? +(exs.reduce((a, e) => a + (e.diff || 5), 0) / exs.length).toFixed(1) : 5;
  });
  const rpeAvg = rpeSeries.length ? +(rpeSeries.reduce((a, b) => a + b, 0) / rpeSeries.length).toFixed(1) : 0;

  // Load delta: sum of weight increases in current cycle
  const cycleStart = sorted.length - (cycleInfo.done?.size || 0);
  const cycleSessions = sorted.slice(Math.max(0, cycleStart));
  let loadDelta = 0;
  cycleSessions.forEach((s, i) => {
    if (i === 0) return;
    const prev = cycleSessions[i - 1];
    (s.exs || []).forEach((ex) => {
      const prevEx = (prev.exs || []).find((e) => e.name === ex.name);
      if (prevEx && ex.wt > prevEx.wt) loadDelta += ex.wt - prevEx.wt;
    });
  });

  // Streak series (last 7 days)
  const streakSeries = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i);
    streakSeries.push(sessions.filter((s) => {
      const sd = new Date(s.date); sd.setHours(0, 0, 0, 0);
      return sd.getTime() === d.getTime();
    }).length);
  }

  // Duration series
  const durSeries = sorted.slice(-12).map((s) => Math.round(s.dur / 60));

  // Load series
  const loadSeries = sorted.slice(-12).map((s) =>
    (s.exs || []).reduce((a, e) => a + (e.wt || 0), 0) / Math.max(1, (s.exs || []).length),
  );

  return {
    streak, weekCount, avgDur, loadDelta,
    rpeSeries, rpeAvg, streakSeries, durSeries, loadSeries,
    rpeColor, verdict,
    metrics: {
      rpe:    { label: "RPE",    value: rpeAvg.toFixed(1), series: rpeSeries, color: "#F0C64A", scale: [0, 10], unit: "" },
      carga:  { label: "Carga",  value: `+${loadDelta.toLocaleString("pt-BR")}kg`, series: loadSeries, color: "#9BE55A", scale: [0, 15], unit: "kg" },
      streak: { label: "Streak", value: `${streak}d`, series: streakSeries, color: "#4DD9B8", scale: [0, 7], unit: "d" },
      sessao: { label: "Sessão", value: `${avgDur}m`, series: durSeries, color: "#5BA8F5", scale: [0, 60], unit: "min" },
    },
  };
}

export { rpeColor, verdict };
