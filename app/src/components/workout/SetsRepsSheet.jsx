// Bottom sheet for editing sets and reps count of the current exercise.
import { useState, useEffect } from "react";
import { Minus, Plus } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useTranslation } from "react-i18next";

export function SetsRepsSheet({ open, onOpenChange, sets, reps, onChange }) {
  const { t } = useTranslation();
  const [localSets, setLocalSets] = useState(sets);
  const [localReps, setLocalReps] = useState(reps);

  useEffect(() => {
    if (open) { setLocalSets(sets); setLocalReps(reps); }
  }, [open, sets, reps]);

  const confirm = () => {
    onChange({ sets: localSets, reps: localReps });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        style={{
          background: "var(--bg2)", borderRadius: "20px 20px 0 0",
          maxWidth: 430, margin: "0 auto", padding: "20px 16px 24px",
          border: "1px solid var(--blue)",
        }}
      >
        <p style={S.label}>{t("setsReps.title")}</p>

        <div style={S.row}>
          <Counter label={t("common.sets")} value={localSets} min={1} max={20} onChange={setLocalSets} />
          <div style={S.sep}>×</div>
          <Counter label={t("common.reps")} value={localReps} min={1} max={99} onChange={setLocalReps} />
        </div>

        <button onClick={confirm} style={S.cta}>{t("common.confirm")}</button>
      </SheetContent>
    </Sheet>
  );
}

function Counter({ label, value, min, max, onChange }) {
  return (
    <div style={S.counter}>
      <span style={S.counterLabel}>{label}</span>
      <div style={S.counterRow}>
        <button onClick={() => onChange(Math.max(min, value - 1))} style={S.btn} disabled={value <= min}>
          <Minus size={18} />
        </button>
        <span style={S.counterValue}>{value}</span>
        <button onClick={() => onChange(Math.min(max, value + 1))} style={S.btn} disabled={value >= max}>
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
}

const S = {
  label: {
    textAlign: "center", fontSize: 11, fontWeight: 600, letterSpacing: 1.5,
    textTransform: "uppercase", color: "var(--sub)", marginBottom: 20,
  },
  row: {
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: 12, marginBottom: 24,
  },
  sep: {
    fontSize: 28, fontWeight: 700, color: "var(--sub)", marginTop: 20,
  },
  counter: { display: "flex", flexDirection: "column", alignItems: "center", gap: 8 },
  counterLabel: { fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: "var(--sub)" },
  counterRow: { display: "flex", alignItems: "center", gap: 8 },
  counterValue: {
    fontSize: 42, fontWeight: 900, color: "var(--acc)",
    width: 56, textAlign: "center", lineHeight: 1, fontVariantNumeric: "tabular-nums",
  },
  btn: {
    width: 40, height: 40, borderRadius: 12,
    border: "1px solid var(--blue)", background: "var(--bg3)",
    color: "var(--acc)", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  cta: {
    width: "100%", padding: 16, borderRadius: 13, border: "none",
    background: "var(--acc)", color: "#000", fontSize: 17, fontWeight: 800, cursor: "pointer",
  },
};
