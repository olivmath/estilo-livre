// Tela 2: RPE by workout. Lists workouts with avg RPE; tapping a row selects
// it and shows its RPE chart; tapping the chevron navigates to exercise drill-down.
import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Minus } from "lucide-react";
import { MiniChart } from "@/components/student/MiniChart";
import { rpeColor, verdict } from "@/hooks/useHomeStats";

export function RpeDrillScreen({ workouts, sessions, onBack, onDrillExercise }) {
  const [selId, setSelId] = useState(workouts[0]?.id ?? null);

  const wkStats = workouts.map((wk) => {
    const wkSess = sessions.filter((s) => s.wkId === wk.id).slice(0, 6);
    const rpeSeries = wkSess.map((s) => {
      const exs = s.exs || [];
      return exs.length ? +(exs.reduce((a, e) => a + (e.diff || 5), 0) / exs.length).toFixed(1) : 5;
    }).reverse();
    const avg = rpeSeries.length ? +(rpeSeries.reduce((a, b) => a + b, 0) / rpeSeries.length).toFixed(1) : 0;
    const v = verdict(rpeSeries);
    return { ...wk, rpeSeries, avg, verdict: v };
  });

  const sel = wkStats.find((w) => w.id === selId) || wkStats[0];

  return (
    <div style={{ paddingTop: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <button onClick={onBack} aria-label="Voltar" style={{
          width: 28, height: 28, borderRadius: "50%", background: "#1C2440", border: "none",
          color: "#F5F3EC", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        }}><ChevronLeft size={16} /></button>
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 500, color: "#F5F3EC" }}>RPE por treino</h2>
          <span style={{ fontSize: 10, color: "#8A93B2" }}>toque num treino para ver a evolução</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10, marginBottom: 12 }}>
        {wkStats.map((wk) => {
          const active = wk.id === selId;
          const DirIcon = wk.verdict.word === "Subindo" ? ChevronUp : wk.verdict.word === "Caindo" ? ChevronDown : Minus;
          return (
            <div key={wk.id} onClick={() => setSelId(wk.id)} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 11,
              background: "#131A30", cursor: "pointer",
              border: active ? `1px solid ${rpeColor(wk.avg)}` : "1px solid transparent",
            }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#1C2440",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 500, color: "#F0C64A" }}>{wk.label}</div>
              <span style={{ flex: 1, fontSize: 12, color: "#F5F3EC", overflow: "hidden",
                textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{wk.name}</span>
              <span style={{ fontSize: 14, fontWeight: 500, color: rpeColor(wk.avg), minWidth: 28, textAlign: "right" }}>
                {wk.avg.toFixed(1)}
              </span>
              <DirIcon size={14} style={{ color: "#8A93B2" }} />
              <button onClick={(e) => { e.stopPropagation(); onDrillExercise(wk); }}
                aria-label={`Detalhes do treino ${wk.label}`}
                style={{ width: 22, height: 22, borderRadius: "50%", background: "#1C2440", border: "none",
                  color: "#8A93B2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ChevronRight size={12} />
              </button>
            </div>
          );
        })}
      </div>

      {sel && (
        <>
          <div style={{ textAlign: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: sel.verdict.color, fontWeight: 500 }}>{sel.verdict.word}</span>
            <span style={{ fontSize: 11, color: "#8A93B2" }}> · {sel.verdict.phrase}</span>
          </div>
          <MiniChart series={sel.rpeSeries} color={rpeColor(sel.avg)} scale={[0, 10]} height={80} label="RPE" />
        </>
      )}
    </div>
  );
}
