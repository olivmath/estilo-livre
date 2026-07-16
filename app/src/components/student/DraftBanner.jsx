import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

// Draft banner (paused workout) — compact alert bar, fully responsive
export function DraftBanner({ draft, onResume, onStartFromScratch }) {
  const [confirmReset, setConfirmReset] = useState(false);

  const spacing = {
    px: "clamp(4px, 1.5vw, 8px)",
    sm: "clamp(6px, 2vw, 10px)",
  };

  return (
    <div
      style={{
        background: "var(--bg3)",
        padding: spacing.sm,
        borderRadius: "4px",
        display: "flex",
        flexDirection: "column",
        gap: spacing.px,
        position: "relative",
      }}
    >
      {/* Close button — top right corner */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setConfirmReset(true)}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "clamp(28px, 8vw, 36px)",
          height: "clamp(28px, 8vw, 36px)",
          transform: "translate(25%, -25%)",
        }}
        aria-label="Fechar banner"
      >
        <X size={16} />
      </Button>

      {/* Content + Resume button */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: spacing.px,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "clamp(2px, 1vw, 4px)", flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: "clamp(13px, 3.5vw, 16px)", color: "var(--acc)" }}>
            {draft.label} — {draft.name}
          </div>
          <div style={{ fontSize: "clamp(11px, 3vw, 14px)", color: "var(--sub)" }}>
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
          <div style={{ marginBottom: spacing.sm }}>
            <div style={{ fontSize: "clamp(13px, 3.5vw, 16px)", fontWeight: 600, marginBottom: spacing.px, color: "var(--text)" }}>
              {draft.label} — {draft.name}
            </div>
            <div style={{ fontSize: "clamp(12px, 3vw, 15px)", color: "var(--sub)", lineHeight: 1.6 }}>
              Vai deletar <strong>{draft.results?.length ?? 0} exercícios completados</strong> e recomeçar do zero.
            </div>
          </div>
          <DialogFooter style={{ gap: spacing.px }}>
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
