// Right-side drawer containing the exercise list during active workout.
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ExerciseList } from "./ExerciseList";

export function ExerciseDrawer({ open, onOpenChange, exItems, currentSet, onVideoClick, onSelect }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        style={{
          background: "var(--bg2)", border: "1px solid var(--blue)",
          width: "min(320px, 85vw)", padding: "20px 12px",
        }}
      >
        <p style={S.title}>Exercícios</p>
        <ExerciseList
          exItems={exItems}
          currentSet={currentSet}
          onVideoClick={(item) => { onOpenChange(false); onVideoClick(item); }}
          onSelect={onSelect ? (idx) => { onOpenChange(false); onSelect(idx); } : undefined}
        />
      </SheetContent>
    </Sheet>
  );
}

const S = {
  title: {
    fontSize: 11, fontWeight: 600, letterSpacing: 1.5,
    textTransform: "uppercase", color: "var(--sub)", marginBottom: 12,
  },
};
