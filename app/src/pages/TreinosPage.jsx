import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { getTreinos, createTreino, updateTreino, deleteTreino, assignTreino } from "@/services/workouts";
import { getExercises } from "@/services/exercises";
import { getStudents } from "@/services/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Spinner, Field } from "@/components/shared";
import { locName, locGroup } from "@/lib/localize";
import { Plus, Edit2, Trash2, X, UserPlus } from "lucide-react";

const PALETTE = [
  "#2352c8", "#1B3487", "#F5C400", "#00c853", "#f44336",
  "#9c27b0", "#ff6d00", "#00bcd4", "#e91e63", "#607d8b",
  "#795548", "#43a047",
];

const inputStyle = { background: "var(--bg3)", border: "1px solid var(--blue)", color: "var(--text)" };

const EMPTY = { label: "A", name: "", color: PALETTE[0], exercises: [] };

function TreinoModal({ open, onClose, initial, allExercises, onSaved }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(initial ?? EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addingEx, setAddingEx] = useState(false);
  const [exPick, setExPick] = useState("");

  useEffect(() => { setForm(initial ?? EMPTY); setError(null); setAddingEx(false); }, [initial, open]);

  function set(k, v) { setForm((p) => ({ ...p, [k]: v })); }

  function addExercise() {
    if (!exPick) return;
    const ex = allExercises.find((e) => e.id === exPick);
    if (!ex) return;
    setForm((p) => ({
      ...p,
      exercises: [...p.exercises, { id: ex.id, name: ex.name, machine: ex.machine ?? "", sets: ex.sets ?? 3, reps: ex.reps ?? 12, wt: 0, notes: "" }],
    }));
    setExPick("");
    setAddingEx(false);
  }

  function updateEx(i, k, v) {
    setForm((p) => {
      const exs = [...p.exercises];
      exs[i] = { ...exs[i], [k]: v };
      return { ...p, exercises: exs };
    });
  }

  function removeEx(i) {
    setForm((p) => ({ ...p, exercises: p.exercises.filter((_, j) => j !== i) }));
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const payload = { label: form.label, name: form.name, color: form.color, exercises: form.exercises };
      if (form.id) {
        await updateTreino(form.id, payload);
      } else {
        await createTreino(payload);
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
      <DialogContent style={{ background: "var(--bg2)", border: "1px solid var(--blue)", borderRadius: 16, color: "var(--text)", maxHeight: "90vh", overflowY: "auto" }}>
        <DialogHeader>
          <DialogTitle style={{ color: "var(--text)" }}>{form.id ? t("treinosPage.editWorkout") : t("treinosPage.newWorkout")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit}>
          {error && <p style={{ color: "var(--red)", fontSize: 13, marginBottom: 12 }}>{error}</p>}

          <div style={{ display: "grid", gridTemplateColumns: "64px 1fr", gap: 12 }}>
            <Field label={t("treinosPage.label")} htmlFor="tk-label">
              <Input id="tk-label" style={inputStyle} value={form.label} onChange={(e) => set("label", e.target.value.toUpperCase().slice(0, 2))} placeholder="A" maxLength={2} />
            </Field>
            <Field label={t("treinosPage.name")} htmlFor="tk-nome">
              <Input id="tk-nome" style={inputStyle} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder={t("treinosPage.namePlaceholder")} required />
            </Field>
          </div>

          <Field label={t("treinosPage.color")}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => set("color", c)}
                  style={{
                    width: 28, height: 28, borderRadius: "50%", background: c,
                    border: form.color === c ? "3px solid var(--text)" : "3px solid transparent",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
          </Field>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <label style={{ fontSize: 12, color: "var(--sub)" }}>{t("treinosPage.exercises")} ({form.exercises.length})</label>
              <button type="button" onClick={() => setAddingEx(true)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--acc)", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                <Plus size={13} /> {t("treinosPage.add")}
              </button>
            </div>

            {addingEx && (
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <Select value={exPick} onValueChange={setExPick}>
                  <SelectTrigger style={{ ...inputStyle, flex: 1, height: 40 }}>
                    <SelectValue placeholder={t("treinosPage.select")} />
                  </SelectTrigger>
                  <SelectContent style={{ background: "var(--bg2)", border: "1px solid var(--blue)" }}>
                    {allExercises.map((e) => (
                      <SelectItem key={e.id} value={e.id}>{locName(e)} ({locGroup(e)})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" size="sm" onClick={addExercise} disabled={!exPick}>OK</Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setAddingEx(false)}><X size={14} /></Button>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {form.exercises.map((ex, i) => (
                <div key={i} style={{
                  background: "var(--bg3)", borderRadius: 8, padding: "10px 12px",
                  borderLeft: `3px solid ${form.color}`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{locName(ex)}</span>
                    <button type="button" onClick={() => removeEx(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--red)" }}>
                      <X size={13} />
                    </button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                    {[
                      { k: "sets", label: t("common.sets") },
                      { k: "reps", label: t("common.reps") },
                      { k: "wt", label: t("common.weightKg") },
                    ].map(({ k, label }) => (
                      <div key={k}>
                        <p style={{ fontSize: 10, color: "var(--sub)", marginBottom: 2 }}>{label}</p>
                        <Input
                          type="number"
                          min={0}
                          value={ex[k]}
                          onChange={(e) => updateEx(i, k, Number(e.target.value))}
                          style={{ ...inputStyle, padding: "6px 8px", fontSize: 13, height: 32 }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={loading} style={{ width: "100%", height: 40 }}>
            {loading ? t("common.saving") : t("treinosPage.saveWorkout")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AssignModal({ open, onClose, treinoId, students }) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => { setSelected(""); setDone(false); }, [open]);

  async function handle() {
    if (!selected) return;
    setLoading(true);
    try {
      await assignTreino(selected, treinoId);
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent style={{ background: "var(--bg2)", border: "1px solid var(--blue)", borderRadius: 16, color: "var(--text)" }}>
        <DialogHeader>
          <DialogTitle style={{ color: "var(--text)" }}>{t("treinosPage.assignToStudent")}</DialogTitle>
        </DialogHeader>
        {done ? (
          <p style={{ color: "var(--green)", fontSize: 13 }}>{t("treinosPage.assignSuccess")}</p>
        ) : (
          <>
            <Select value={selected} onValueChange={setSelected}>
              <SelectTrigger style={{ background: "var(--bg3)", border: "1px solid var(--blue)", color: "var(--text)", marginBottom: 16 }}>
                <SelectValue placeholder={t("treinosPage.selectStudent")} />
              </SelectTrigger>
              <SelectContent style={{ background: "var(--bg2)", border: "1px solid var(--blue)" }}>
                {students.map((s) => <SelectItem key={s.uid} value={s.uid}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={handle} disabled={loading || !selected} style={{ width: "100%", height: 40 }}>
              {loading ? t("treinosPage.assigning") : t("treinosPage.assign")}
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function TreinosPage() {
  const { t } = useTranslation();
  const [treinos, setTreinos] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([getTreinos(), getExercises(), getStudents()])
      .then(([tr, e, s]) => { setTreinos(tr); setExercises(e); setStudents(s); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id) {
    if (!confirm(t("treinosPage.confirmDelete"))) return;
    await deleteTreino(id);
    load();
  }

  function handleEdit(t) { setEditing({ ...t }); setModalOpen(true); }
  function handleNew() { setEditing(null); setModalOpen(true); }

  if (loading) return <Spinner />;
  if (error) return <div style={{ padding: 24, color: "var(--red)", fontSize: 13 }}>{error}</div>;

  return (
    <div style={{ padding: "20px 16px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)" }}>{t("treinosPage.title")}</h1>
        <Button size="sm" onClick={handleNew}>
          <Plus size={15} /> {t("treinosPage.new")}
        </Button>
      </div>

      {treinos.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--sub)" }}>{t("treinosPage.noWorkouts")}</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }} className="sm:grid-cols-2">
          {treinos.map((tr) => (
            <div key={tr.id} style={{
              background: "var(--bg2)", border: "1px solid var(--blue)",
              borderRadius: 12, padding: "16px 18px",
              borderLeft: `4px solid ${tr.color ?? "var(--blue)"}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 20,
                      background: `${tr.color ?? "var(--blue)"}22`, color: tr.color ?? "var(--sub)",
                    }}>
                      {tr.label}
                    </span>
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{tr.name}</p>
                  <p style={{ fontSize: 12, color: "var(--sub)", marginTop: 4 }}>
                    {t("treinosPage.exerciseCount", { n: tr.exercises?.length ?? 0 })}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    onClick={() => { setAssignTarget(tr.id); setAssignOpen(true); }}
                    title={t("treinosPage.assignToStudent")}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--acc)", padding: 6 }}
                  >
                    <UserPlus size={15} />
                  </button>
                  <button onClick={() => handleEdit(tr)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--sub)", padding: 6 }}>
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(tr.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--red)", padding: 6 }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <TreinoModal open={modalOpen} onClose={() => setModalOpen(false)} initial={editing} allExercises={exercises} onSaved={load} />
      <AssignModal open={assignOpen} onClose={() => setAssignOpen(false)} treinoId={assignTarget} students={students} />
    </div>
  );
}
