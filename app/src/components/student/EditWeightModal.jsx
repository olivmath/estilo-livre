import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { S } from "@/components/student/shared";

// Sets an exercise's default weight (opened from WorkoutDetailOverlay).
export function EditWeightModal({ editingEx, value, onChange, onClose, onSave }) {
  return (
    <Dialog open={!!editingEx} onOpenChange={(o) => !o && onClose()}>
      <DialogContent style={{ background: "var(--bg2)", border: "1px solid var(--acc)", borderRadius: 16, color: "var(--text)", maxWidth: 280 }}>
        <DialogHeader>
          <DialogTitle style={{ color: "var(--text)", fontSize: 14 }}>Ajustar Carga</DialogTitle>
        </DialogHeader>
        <p style={{ fontSize: 12, color: "var(--sub)", marginBottom: 4 }}>
          Defina a carga padrão de: <br /><b>{editingEx?.name}</b>
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <Input
            type="number"
            value={value}
            step="2.5"
            min="0"
            onChange={(e) => onChange(e.target.value)}
            style={{ flex: 1, textAlign: "center", fontSize: 16, fontWeight: 700 }}
          />
          <span style={{ color: "var(--text)", fontWeight: 700 }}>kg</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ ...S.btnSecondary, padding: "8px 16px", flex: 1, fontSize: 13 }}>Cancelar</button>
          <button onClick={onSave} style={{ ...S.btnPrimary, padding: "8px 16px", flex: 1, fontSize: 13 }}>Salvar</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
