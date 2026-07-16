import { ChevronRight } from "lucide-react";

// Trend metrics cards showing RPE, load, streak, and session duration
export function TrendCards({ trendData, onSelectTrend, selectedTrendId }) {
  const rpe = trendData?.currentRpe ?? 0;
  const load = trendData?.avgLoad ?? 0;
  const streak = trendData?.streak ?? "0d";
  const duration = trendData?.avgDuration ?? 0;

  const cards = [
    { id: "rpe", label: "RPE", value: rpe > 0 ? rpe.toFixed(1) : "—", color: "#5BA3FF", darkColor: "#3D85FF" }, // Blue
    { id: "load", label: "Carga", value: load > 0 ? `+${load.toFixed(1)}` : "—", color: "#00E5FF", darkColor: "#00B8D4" }, // Cyan
    { id: "streak", label: "Streak", value: streak !== "0d" ? streak : "—", color: "#FF66D9", darkColor: "#FF4DB8" }, // Magenta
    { id: "session", label: "Sessão", value: duration > 0 ? `${Math.round(duration)}m` : "—", color: "#CCFF00", darkColor: "#99CC00" }, // Lime
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
        {cards.map((card) => {
          const isSelected = selectedTrendId === card.id;
          return (
            <button
              key={card.id}
              onClick={() => onSelectTrend?.(card.id)}
              style={{
                background: isSelected ? `rgba(${parseInt(card.color.slice(1, 3), 16)}, ${parseInt(card.color.slice(3, 5), 16)}, ${parseInt(card.color.slice(5, 7), 16)}, 0.15)` : "transparent",
                border: `2px solid ${card.color}`,
                borderRadius: 12,
                padding: "clamp(12px, 2.5vw, 16px)",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.25s ease",
                minWidth: "clamp(95px, 22vw, 120px)",
                flexShrink: 0,
                boxShadow: isSelected ? `0 0 16px ${card.color}40, inset 0 0 8px ${card.color}20` : "none",
                transform: isSelected ? "scale(1.05)" : "scale(1)",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: card.color, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>{card.label}</div>
              <div style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 900, color: card.color, lineHeight: 1 }}>{card.value}</div>
            </button>
          );
        })}
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
