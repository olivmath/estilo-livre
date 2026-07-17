import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

// Draft banner (paused workout) — compact alert bar, fully responsive
export function DraftBanner({ draft, onResume, onStartFromScratch }) {
  const { t } = useTranslation();
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
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        gap: spacing.sm,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: "clamp(13px, 3.5vw, 16px)", color: "var(--acc)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {draft.label} — {draft.name}
        </div>
        <div style={{ fontSize: "clamp(11px, 3vw, 14px)", color: "var(--sub)" }}>
          {draft.results?.length ?? 0}/{draft.exercises?.length ?? 0} {t("common.exercises")}
        </div>
      </div>

      <Button size="sm" onClick={() => onResume(draft)} style={{ flexShrink: 0 }}>
        {t("common.resume")}
      </Button>

      <button
        onClick={() => setConfirmReset(true)}
        style={{
          flexShrink: 0, width: 28, height: 28, borderRadius: "50%",
          background: "none", border: "1px solid var(--blue)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", padding: 0,
        }}
        aria-label={t("draft.closeBanner")}
      >
        <X size={14} color="var(--sub)" />
      </button>

      <Dialog open={confirmReset} onOpenChange={setConfirmReset}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>⚠️ {t("draft.resetTitle")}</DialogTitle>
          </DialogHeader>
          <div style={{ marginBottom: spacing.sm }}>
            <div style={{ fontSize: "clamp(13px, 3.5vw, 16px)", fontWeight: 600, marginBottom: spacing.px, color: "var(--text)" }}>
              {draft.label} — {draft.name}
            </div>
            <div style={{ fontSize: "clamp(12px, 3vw, 15px)", color: "var(--sub)", lineHeight: 1.6 }}>
              {t("draft.resetMsg", { n: draft.results?.length ?? 0 })}
            </div>
          </div>
          <DialogFooter style={{ gap: spacing.px }}>
            <Button variant="outline" onClick={() => setConfirmReset(false)}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={() => { setConfirmReset(false); onStartFromScratch(draft.id); }}>
              {t("draft.reset")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
