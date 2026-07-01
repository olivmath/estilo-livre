import { useState, useEffect } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";

const SHORTCUTS = [2.5, 5, 7.5, 10, 15, 20, 30, 40, 50, 60, 80, 100];

// digits stored as integer cents: 1000 → 10.00 kg
function digitsToDisplay(d) {
  return (d / 100).toFixed(2);
}

export function WeightSheet({ open, onOpenChange, value, onChange }) {
  const [digits, setDigits] = useState(0);

  useEffect(() => {
    if (open) setDigits(Math.round((value ?? 0) * 100));
  }, [open, value]);

  const numKey = (k) => setDigits((prev) => {
    const next = prev * 10 + k;
    return next > 99999 ? prev : next; // max 999.99
  });

  const numDel = () => setDigits((prev) => Math.floor(prev / 10));

  const confirm = () => {
    onChange(digits / 100);
    onOpenChange(false);
  };

  const displayVal = digitsToDisplay(digits);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        style={{ background: "var(--bg2)", borderRadius: "20px 20px 0 0", maxWidth: 430, margin: "0 auto", padding: "20px 16px 24px", border: "1px solid var(--blue)" }}
      >
        <p style={{ textAlign: "center", fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--sub)", marginBottom: 12 }}>
          Carga
        </p>

        <div style={{ textAlign: "center", fontSize: 52, fontWeight: 900, color: "var(--acc)", letterSpacing: -2, marginBottom: 12, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
          {displayVal}<span style={{ fontSize: 20, color: "var(--sub)", marginLeft: 4 }}>kg</span>
        </div>

        {/* Shortcuts */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 5, marginBottom: 14 }}>
          {SHORTCUTS.map((s) => (
            <button
              key={s}
              onClick={() => setDigits(Math.round(s * 100))}
              style={{
                padding: "7px 0", borderRadius: 8, border: "1px solid var(--blue)",
                background: digits === Math.round(s * 100) ? "var(--acc)" : "var(--bg3)",
                color: digits === Math.round(s * 100) ? "#000" : "var(--sub)",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Numpad (no decimal key — handled automatically) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 12 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, "⌫"].map((k, idx) => (
            <button
              key={idx}
              onClick={() => k === "⌫" ? numDel() : k !== null ? numKey(k) : null}
              disabled={k === null}
              style={{
                padding: 14, borderRadius: 10, border: "1px solid var(--blue)",
                background: "var(--bg3)", color: k === "⌫" ? "var(--red)" : k === null ? "transparent" : "var(--text)",
                fontSize: k === "⌫" ? 18 : 20, fontWeight: 700, cursor: k === null ? "default" : "pointer",
                border: k === null ? "none" : "1px solid var(--blue)",
              }}
            >
              {k === null ? "" : k}
            </button>
          ))}
        </div>

        <button onClick={confirm} style={{ width: "100%", padding: 16, borderRadius: 13, border: "none", background: "var(--acc)", color: "#000", fontSize: 17, fontWeight: 800, cursor: "pointer" }}>
          Confirmar
        </button>
      </SheetContent>
    </Sheet>
  );
}
