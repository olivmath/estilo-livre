import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { getExercises, createExercise, updateExercise, deleteExercise } from "@/services/exercises";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Spinner, Field } from "@/components/shared";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight } from "lucide-react";

const GROUPS = [
  "Peito", "Costas", "Ombros", "Bíceps", "Tríceps",
  "Abdômen", "Glúteos", "Quadríceps", "Posterior", "Panturrilha", "Outro",
];

const inputStyle = { background: "var(--bg3)", border: "1px solid var(--blue)", color: "var(--text)" };

const EMPTY_FORM = { name: "", machine: "", group: GROUPS[0], sets: 3, reps: 12, alteres: false };

function ExerciseModal({ open, onClose, initial, onSaved }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(initial ?? EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { setForm(initial ?? EMPTY_FORM); setError(null); }, [initial, open]);

  function set(k, v) { setForm((p) => ({ ...p, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const payload = { name: form.name, machine: form.machine, group: form.group, sets: Number(form.sets), reps: Number(form.reps), alteres: Boolean(form.alteres) };
      if (form.id) {
        await updateExercise(form.id, payload);
      } else {
        await createExercise(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent style={{ background: "var(--bg2)", border: "1px solid var(--blue)", borderRadius: 16, color: "var(--text)" }}>
        <DialogHeader>
          <DialogTitle style={{ color: "var(--text)" }}>{form.id ? t("exerciciosPage.editExercise") : t("exerciciosPage.newExercise")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit}>
          {error && <p style={{ color: "var(--red)", fontSize: 13, marginBottom: 12 }}>{error}</p>}
          <Field label={t("exerciciosPage.name")} htmlFor="ex-nome">
            <Input id="ex-nome" style={inputStyle} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder={t("exerciciosPage.namePlaceholder")} required />
          </Field>
          <Field label={t("exerciciosPage.machineLabel")} htmlFor="ex-maquina">
            <Input id="ex-maquina" style={inputStyle} value={form.machine} onChange={(e) => set("machine", e.target.value)} placeholder={t("exerciciosPage.machinePlaceholder")} />
          </Field>
          <Field label={t("exerciciosPage.muscleGroup")} htmlFor="ex-grupo">
            <Select value={form.group} onValueChange={(v) => set("group", v)}>
              <SelectTrigger id="ex-grupo" style={{ ...inputStyle, height: 40 }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{ background: "var(--bg2)", border: "1px solid var(--blue)" }}>
                {GROUPS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label={t("common.sets")} htmlFor="ex-sets">
              <Input id="ex-sets" style={inputStyle} type="number" min={1} max={20} value={form.sets} onChange={(e) => set("sets", e.target.value)} />
            </Field>
            <Field label={t("common.reps")} htmlFor="ex-reps">
              <Input id="ex-reps" style={inputStyle} type="number" min={1} max={100} value={form.reps} onChange={(e) => set("reps", e.target.value)} />
            </Field>
          </div>
          <Field label={t("common.equipment")}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, height: 40 }}>
              <Checkbox id="ex-alteres" checked={!!form.alteres} onCheckedChange={(v) => set("alteres", v)} />
              <Label htmlFor="ex-alteres" style={{ color: "var(--text)", fontSize: 13, cursor: "pointer" }}>{t("exerciciosPage.usesDumbbells")}</Label>
            </div>
          </Field>
          <Button type="submit" disabled={loading} style={{ width: "100%", height: 40, marginTop: 4 }}>
            {loading ? t("common.saving") : t("common.save")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function GroupSection({ group, exercises, onEdit, onDelete }) {
  const [open, setOpen] = useState(true);

  return (
    <div style={{ marginBottom: 12 }}>
      <button
        onClick={() => setOpen((p) => !p)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 14px", background: "var(--bg3)", borderRadius: 10,
          border: "none", cursor: "pointer", color: "var(--text)",
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 700 }}>{group}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: "var(--sub)" }}>{exercises.length}</span>
          {open ? <ChevronDown size={16} color="var(--sub)" /> : <ChevronRight size={16} color="var(--sub)" />}
        </div>
      </button>

      {open && (
        <div style={{ marginTop: 4, display: "flex", flexDirection: "column", gap: 4 }}>
          {exercises.map((ex) => (
            <div key={ex.id} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 14px", background: "var(--bg2)",
              border: "1px solid var(--blue)", borderRadius: 8,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{ex.name}</p>
                {ex.machine && <p style={{ fontSize: 11, color: "var(--sub)" }}>{ex.machine}</p>}
              </div>
              <span style={{ fontSize: 12, color: "var(--sub)", flexShrink: 0 }}>
                {ex.sets}×{ex.reps}
              </span>
              <button onClick={() => onEdit(ex)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--sub)", padding: 4 }}>
                <Edit2 size={14} />
              </button>
              <button onClick={() => onDelete(ex.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--red)", padding: 4 }}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ExerciciosPage() {
  const { t } = useTranslation();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    getExercises()
      .then(setExercises)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id) {
    if (!confirm(t("exerciciosPage.confirmDelete"))) return;
    await deleteExercise(id);
    load();
  }

  function handleEdit(ex) { setEditing(ex); setModalOpen(true); }
  function handleNew() { setEditing(null); setModalOpen(true); }

  const grouped = exercises.reduce((acc, ex) => {
    const g = ex.group ?? "Outro";
    if (!acc[g]) acc[g] = [];
    acc[g].push(ex);
    return acc;
  }, {});

  const sortedGroups = Object.keys(grouped).sort();

  if (loading) return <Spinner />;
  if (error) return <div style={{ padding: 24, color: "var(--red)", fontSize: 13 }}>{error}</div>;

  return (
    <div style={{ padding: "20px 16px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)" }}>{t("exerciciosPage.title")}</h1>
        <Button size="sm" onClick={handleNew}>
          <Plus size={15} /> {t("exerciciosPage.new")}
        </Button>
      </div>

      {exercises.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--sub)" }}>{t("exerciciosPage.noExercises")}</p>
      ) : (
        sortedGroups.map((g) => (
          <GroupSection key={g} group={g} exercises={grouped[g]} onEdit={handleEdit} onDelete={handleDelete} />
        ))
      )}

      <ExerciseModal open={modalOpen} onClose={() => setModalOpen(false)} initial={editing} onSaved={load} />
    </div>
  );
}
