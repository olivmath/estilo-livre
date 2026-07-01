// Derives which workout is "next" and how many full loops the student has
// completed, purely from session history (no stored pointer) — see CLAUDE.md.
export function getCycleInfo(workouts, sessions) {
  if (!workouts.length) return { done: new Set(), next: null, pct: 0, cycles: 0 };
  const ids = workouts.map((w) => w.id);
  const sortedSess = [...sessions].sort((a, b) => a.date - b.date);
  let done = [];
  let cycles = 0;
  for (const s of sortedSess) {
    if (!ids.includes(s.wkId)) continue;
    done.push(s.wkId);
    if (ids.every((id) => done.includes(id))) {
      cycles++;
      done = [];
    }
  }
  const doneSet = new Set(done);
  const nextId = ids.find((id) => !doneSet.has(id)) || ids[0] || null;
  const pct = ids.length ? (doneSet.size / ids.length) * 100 : 0;
  return { done: doneSet, next: nextId, pct, cycles };
}

export function lastWeightFor(sessions, exName, fallback = 1) {
  for (const s of sessions) {
    const r = s.exs?.find((e) => e.name === exName);
    if (r?.wt) return r.wt;
  }
  return fallback || 1;
}
