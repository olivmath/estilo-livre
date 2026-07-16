import { ChevronRight } from "lucide-react";

// Trend metrics cards showing RPE, load, streak, and session duration
export function TrendCards({ trendData, onSelectTrend, selectedTrendId }) {
  const rpe = trendData?.currentRpe ?? 0;
  const load = trendData?.avgLoad ?? 0;
  const streak = trendData?.streak ?? "0d";
  const duration = trendData?.avgDuration ?? 0;

  const cards = [
    { id: "rpe", label: "RPE", value: rpe > 0 ? rpe.toFixed(1) : "—", color: "#FFB366" }, // Orange (accessible)
    { id: "load", label: "Carga", value: load > 0 ? `+${load.toFixed(1)}` : "—", color: "#00D9FF" }, // Cyan (accessible)
    { id: "streak", label: "Streak", value: streak !== "0d" ? streak : "—", color: "#B366FF" }, // Purple (accessible)
    { id: "session", label: "Sessão", value: duration > 0 ? `${Math.round(duration)}m` : "—", color: "#00D9FF" }, // Cyan (accessible)
  ];

  return (
    <div style={{ marginBottom: "clamp(16px, 4vw, 24px)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "clamp(12px, 3vw, 16px)" }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Tendências</h3>
        <button
          onClick={() => onSelectTrend?.(null)}
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "rgba(27,52,135,0.6)",
            border: "1px solid var(--blue)",
            color: "var(--text)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
          }}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Cards horizontal scroll */}
      <div style={{ display: "flex", gap: "clamp(8px, 2vw, 12px)", marginBottom: "clamp(12px, 3vw, 16px)", overflowX: "auto", paddingBottom: 8, scrollBehavior: "smooth" }}>
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => onSelectTrend?.(card.id)}
            style={{
              background: selectedTrendId === card.id ? "rgba(245,196,0,0.1)" : "transparent",
              border: `2px solid ${selectedTrendId === card.id ? "var(--acc)" : card.color}`,
              borderRadius: 10,
              padding: "clamp(10px, 2vw, 14px)",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.2s",
              minWidth: "clamp(90px, 20vw, 110px)",
              flexShrink: 0,
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 600, color: "var(--sub)", marginBottom: 2 }}>{card.label}</div>
            <div style={{ fontSize: "clamp(18px, 4vw, 22px)", fontWeight: 800, color: card.color }}>{card.value}</div>
          </button>
        ))}
      </div>

      {/* Insight text */}
      {trendData?.insight && (
        <div style={{ fontSize: 12, color: "var(--sub)", lineHeight: 1.4 }}>
          <span style={{ color: "var(--acc)", fontWeight: 700 }}>{trendData.insight.status}</span>
          {" · "}
          {trendData.insight.message}
        </div>
      )}
    </div>
  );
}
