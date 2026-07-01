import { Sheet, SheetContent } from "@/components/ui/sheet";

// Lets the student switch to a different workout mid-session — the current
// one is auto-saved as a draft by the caller before switching.
export function WorkoutSwitchSheet({ open, onOpenChange, workouts, currentId, onSelect }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        style={{ background: "var(--bg2)", borderRadius: "20px 20px 0 0", maxWidth: 430, margin: "0 auto", padding: "20px 16px 24px", border: "1px solid var(--blue)", maxHeight: "80vh", overflowY: "auto" }}
      >
        <p style={{ textAlign: "center", fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--sub)", marginBottom: 4 }}>
          Trocar de treino
        </p>
        <p style={{ textAlign: "center", fontSize: 12, color: "var(--sub)", marginBottom: 16 }}>
          Seu progresso atual será salvo para continuar depois.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {workouts.map((w) => {
            const active = w.id === currentId;
            return (
              <button
                key={w.id}
                onClick={() => onSelect(w.id)}
                disabled={active}
                style={{
                  display: "flex", flexDirection: "column", gap: 2, textAlign: "left",
                  padding: "12px 14px", borderRadius: 12,
                  border: `1px solid ${active ? "var(--acc)" : "var(--blue)"}`,
                  background: active ? "var(--bg3)" : "transparent",
                  cursor: active ? "default" : "pointer",
                  opacity: active ? 0.6 : 1,
                }}
              >
                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, color: "var(--acc)", textTransform: "uppercase" }}>
                  Treino {w.label}{active ? " · atual" : ""}
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{w.name}</span>
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
