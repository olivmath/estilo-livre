// Flags exercises whose recent average RPE is low (<=4), suggesting a weight
// increase, per the RPE scale rule in CLAUDE.md.
export function getSuggestions(workouts, sessions) {
  const out = [];
  workouts.forEach((wk) => {
    const recent = sessions.filter((s) => s.wkId === wk.id).slice(0, 3);
    if (recent.length < 2) return;
    wk.exercises?.forEach((ex) => {
      const rows = recent.flatMap((s) => s.exs?.filter((e) => e.name === ex.name) || []);
      if (rows.length < 2) return;
      const avg = rows.reduce((acc, curr) => acc + curr.diff, 0) / rows.length;
      const lastWeight = rows[0]?.wt ?? ex.wt;
      if (avg <= 4) {
        out.push({
          wkName: wk.name,
          wkLabel: wk.label,
          name: ex.name,
          num: ex.num,
          cur: lastWeight,
          sug: +(lastWeight + 2.5).toFixed(1),
        });
      }
    });
  });
  return out;
}
