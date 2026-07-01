// Row of workout-label dots + progress bar showing loop progress; reused by
// HomeTab (full size, clickable) and WorkoutsTab (compact, display-only).
export function CycleTracker({ workouts, cycleInfo, onSelect, size = 36 }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 6 }}>
        {workouts.map((w) => {
          const isDone = cycleInfo.done.has(w.id);
          const isNext = w.id === cycleInfo.next;
          return (
            <div
              key={w.id}
              onClick={onSelect ? () => onSelect(w.id) : undefined}
              style={{
                width: size, height: size, borderRadius: "50%", display: "flex",
                alignItems: "center", justifyContent: "center", fontSize: size * 0.36, fontWeight: 700,
                transition: "all 0.25s ease", touchAction: "manipulation", WebkitTapHighlightColor: "transparent", userSelect: "none",
                background: isDone ? "var(--green)" : isNext ? w.color : "var(--bg3)",
                border: isNext ? `2.5px solid ${w.color}` : "none",
                boxShadow: isNext ? `0 0 10px ${w.color}88` : "none",
                color: isDone || isNext ? "#fff" : "var(--sub)",
                cursor: onSelect ? "pointer" : "default",
              }}
            >
              {isDone ? "✓" : w.label}
            </div>
          );
        })}
      </div>
      {onSelect && (
        <>
          <div style={{ width: "100%", height: 6, background: "var(--bg3)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", background: "var(--acc)", borderRadius: 99, transition: "width 0.5s ease", width: `${cycleInfo.pct}%` }} />
          </div>
          <p style={{ fontSize: 12, color: "var(--sub)", textAlign: "center", marginTop: 8 }}>
            {cycleInfo.pct === 100
              ? "🎉 Fique no loop!"
              : cycleInfo.pct ? `${Math.round(cycleInfo.pct)}% concluído — não saia do loop!` : "Entre no loop!"}
          </p>
        </>
      )}
    </div>
  );
}
