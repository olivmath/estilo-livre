import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

// Draft banner (paused workout) — compact alert bar
export function DraftBanner({ draft, onResume, onStartFromScratch }) {
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div
      style={{
        background: "var(--bg3)",
        padding: "12px 16px",
        borderRadius: "4px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        position: "relative",
      }}
    >
      {/* Close button — top right */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setConfirmReset(true)}
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          width: 32,
          height: 32,
        }}
        aria-label="Fechar banner"
      >
        <X size={16} />
      </Button>

      {/* Content + Resume button */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--acc)" }}>
            {draft.label} — {draft.name}
          </div>
          <div style={{ fontSize: 12, color: "var(--sub)" }}>
            {draft.results?.length ?? 0}/{draft.exercises?.length ?? 0} exercícios
          </div>
        </div>

        <Button size="sm" onClick={() => onResume(draft)} style={{ flexShrink: 0 }}>
          Retomar
        </Button>
      </div>

      <Dialog open={confirmReset} onOpenChange={setConfirmReset}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>⚠️ Resetar treino?</DialogTitle>
          </DialogHeader>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: "var(--text)" }}>
              {draft.label} — {draft.name}
            </div>
            <div style={{ fontSize: 13, color: "var(--sub)", lineHeight: 1.6 }}>
              Vai deletar <strong>{draft.results?.length ?? 0} exercícios completados</strong> e recomeçar do zero.
            </div>
          </div>
          <DialogFooter style={{ gap: 8 }}>
            <Button variant="outline" onClick={() => setConfirmReset(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={() => { setConfirmReset(false); onStartFromScratch(draft.id); }}>
              Resetar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
