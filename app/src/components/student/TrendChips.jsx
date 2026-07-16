// 4 selectable metric chips (RPE/Carga/Streak/Sessão) with verdict text and
// a MiniChart that updates when the selected chip changes.
import { useState } from "react";
import { MiniChart } from "@/components/student/MiniChart";
import { verdict } from "@/hooks/useHomeStats";

const KEYS = ["rpe", "carga", "streak", "sessao"];

export function TrendChips({ metrics, onDrillDown }) {
  const [sel, setSel] = useState("rpe");
  const m = metrics[sel];
  const v = verdict(m.series);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: "#F5F3EC" }}>Tendências</span>
        {onDrillDown && (
          <button onClick={onDrillDown} aria-label="Ver RPE detalhado"
            style={{ width: 22, height: 22, borderRadius: "50%", background: "#1C2440", border: "none",
              color: "#8A93B2", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            ›
          </button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 8 }}>
        {KEYS.map((k) => {
          const metric = metrics[k];
          const active = k === sel;
          return (
            <button key={k} onClick={() => setSel(k)} style={{
              background: "#131A30", border: active ? `1px solid ${metric.color}` : "1px solid transparent",
              borderRadius: 10, padding: "6px 4px", cursor: "pointer", textAlign: "center",
            }}>
              <div style={{ fontSize: 9, color: "#8A93B2" }}>{metric.label}</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: metric.color, marginTop: 2 }}>{metric.value}</div>
            </button>
          );
        })}
      </div>

      <div style={{ textAlign: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: v.color, fontWeight: 500 }}>{v.word}</span>
        <span style={{ fontSize: 11, color: "#8A93B2" }}> · {v.phrase}</span>
      </div>

      <MiniChart series={m.series} color={m.color} scale={m.scale} height={58} label={m.label} />
    </div>
  );
}
