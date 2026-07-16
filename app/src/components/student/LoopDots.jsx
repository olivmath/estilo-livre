import { Button } from "@/components/ui/button";

// Horizontal dots showing workouts + current position with keyboard accessibility
export function LoopDots({ workouts, cycleInfo, onSelect }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "clamp(8px, 2.5vw, 12px)",
        marginTop: "clamp(4px, 1vw, 8px)",
        flexWrap: "wrap",
      }}
      role="group"
      aria-label="Seletor de treinos"
    >
      {workouts.map((w, idx) => {
        const letter = w.label?.charAt(0).toUpperCase() || String.fromCharCode(65 + idx);
        const isDone = cycleInfo.done.has(w.id);
        const isNext = w.id === cycleInfo.next;

        let variant = "outline";
        if (isNext) variant = "default";
        if (isDone) variant = "secondary";

        const status = isDone ? "concluído" : isNext ? "próximo" : "não iniciado";
        const label = `Treino ${letter} — ${w.name} (${status})`;

        return (
          <Button
            key={w.id}
            variant={variant}
            size="icon"
            onClick={() => onSelect?.(w.id)}
            style={{
              width: "clamp(40px, 10vw, 48px)",
              height: "clamp(40px, 10vw, 48px)",
              borderRadius: "50%",
              boxShadow: isNext
                ? "0 0 clamp(8px, 2vw, 12px) rgba(245,196,0,0.3)"
                : isDone
                  ? "0 0 clamp(8px, 2vw, 12px) rgba(0,200,83,0.2)"
                  : "none",
            }}
            className={isDone ? "bg-[var(--green)] hover:bg-[var(--green)]" : isNext ? "bg-[var(--acc)] hover:bg-[var(--acc)]" : ""}
            aria-label={label}
            aria-pressed={isNext}
          >
            {letter}
          </Button>
        );
      })}
    </div>
  );
}
