// Tela 3: RPE by exercise for a specific workout. Each exercise shows a
// horizontal RPE bar; tapping selects it and updates the chart below.
import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { MiniChart } from "@/components/student/MiniChart";
import { rpeColor, verdict } from "@/hooks/useHomeStats";

export function RpeExerciseScreen({ workout, sessions, onBack }) {
  const wkSessions = sessions.filter((s) => s.wkId === workout.id).slice(0, 6);
  const exercises = (workout.exercises || []).map((ex) => {
    const series = wkSessions.map((s) => {
      const found = (s.exs || []).find((e) => e.name === ex.name);
      return found ? +(found.diff || 5).toFixed(1) : null;
    }).filter((v) => v !== null).reverse();
    const avg = series.length ? +(series.reduce((a, b) => a + b, 0) / series.length).toFixed(1) : 0;
    return { ...ex, series, avg };
  });

  const [selIdx, setSelIdx] = useState(0);
  const sel = exercises[selIdx] || exercises[0];
  const wkAvg = exercises.length
    ? +(exercises.reduce((a, e) => a + e.avg, 0) / exercises.length).toFixed(1) : 0;
  const v = sel ? verdict(sel.series) : null;

  return (
    <div style={{ paddingTop: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <button onClick={onBack} aria-label="Voltar" style={{
          width: 28, height: 28, borderRadius: "50%", background: "#1C2440", border: "none",
          color: "#F5F3EC", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        }}><ChevronLeft size={16} /></button>
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 500, color: "#F5F3EC" }}>
            Treino {workout.label} · RPE {wkAvg.toFixed(1)}
          </h2>
          <span style={{ fontSize: 10, color: "#8A93B2" }}>{workout.name} · toque num exercício</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
        {exercises.map((ex, i) => {
          const active = i === selIdx;
          const barPct = Math.min(100, (ex.avg / 10) * 100);
          return (
            <div key={ex.name} onClick={() => setSelIdx(i)} style={{
              padding: "5px 11px", borderRadius: 9, background: "#131A30", cursor: "pointer",
              border: active ? `1px solid ${rpeColor(ex.avg)}` : "1px solid transparent",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "#F5F3EC", flex: 1, overflow: "hidden",
                  textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ex.name}</span>
                <span style={{ fontSize: 11, fontWeight: 500, color: rpeColor(ex.avg), minWidth: 28,
                  textAlign: "right" }}>{ex.avg.toFixed(1)}</span>
              </div>
              <div style={{ height: 3, background: "#1C2440", borderRadius: 3, marginTop: 4 }}>
                <div style={{ height: "100%", borderRadius: 3, background: rpeColor(ex.avg),
                  width: `${barPct}%`, transition: "width 0.3s" }} />
              </div>
            </div>
          );
        })}
      </div>

      {sel && v && (
        <>
          <div style={{ textAlign: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: v.color, fontWeight: 500 }}>{v.word}</span>
            <span style={{ fontSize: 11, color: "#8A93B2" }}> · {v.phrase}</span>
          </div>
          <MiniChart series={sel.series} color={rpeColor(sel.avg)} scale={[0, 10]} height={80} label={sel.name} />
        </>
      )}
    </div>
  );
}
