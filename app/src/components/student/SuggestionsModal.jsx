import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function SuggestionsModal({ open, onClose, suggestions, user, workouts, reload }) {
  const [saving, setSaving] = useState(false);

  const accept = async () => {
    setSaving(true);
    try {
      const byWk = new Map();
      suggestions.forEach((s) => {
        if (!byWk.has(s.wkId)) byWk.set(s.wkId, []);
        byWk.get(s.wkId).push(s);
      });

      for (const [wkId, items] of byWk) {
        const wk = workouts.find((w) => w.id === wkId);
        if (!wk) continue;
        const updated = wk.exercises.map((ex) => {
          const match = items.find((s) => s.name === ex.name);
          return match ? { ...ex, wt: match.sug } : ex;
        });
        await updateDoc(doc(db, "users", user.uid, "workouts", wkId), { exercises: updated });
      }
      await reload();
      onClose();
    } catch (e) {
      console.error("Error applying suggestions:", e);
    } finally {
      setSaving(false);
    }
  };

  const sp = "clamp(10px, 3vw, 16px)";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent style={{ background: "var(--bg2)", border: "1px solid var(--blue)", maxWidth: 400 }}>
        <DialogHeader>
          <DialogTitle style={{ fontSize: 16, fontWeight: 700 }}>Sugestões de Progressão</DialogTitle>
        </DialogHeader>

        <div style={{ display: "flex", flexDirection: "column", gap: sp, marginTop: sp }}>
          {suggestions.map((s, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: sp, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</div>
                <div style={{ fontSize: 11, color: "var(--sub)" }}>Treino {s.wkLabel}</div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700 }}>
                {s.cur}kg → <span style={{ color: "var(--green)" }}>{s.sug}kg</span>
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: sp, marginTop: sp }}>
          <Button variant="outline" onClick={onClose} style={{ flex: 1 }}>Fechar</Button>
          <Button onClick={accept} disabled={saving} style={{ flex: 1, background: "var(--green)", color: "#000" }}>
            {saving ? "Salvando..." : "Aceitar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
