import { useEffect, useState, useCallback } from "react";
import { getTreinos, createTreino, updateTreino, deleteTreino, assignTreino } from "@/services/workouts";
import { getExercises } from "@/services/exercises";
import { getStudents } from "@/services/users";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, X, UserPlus } from "lucide-react";

const PALETTE = [
  "#2352c8", "#1B3487", "#F5C400", "#00c853", "#f44336",
  "#9c27b0", "#ff6d00", "#00bcd4", "#e91e63", "#607d8b",
  "#795548", "#43a047",
];

function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
      <div className="w-8 h-8 rounded-full border-[3px] animate-spin"
        style={{ borderColor: "var(--bg3)", borderTopColor: "var(--acc)" }} />
    </div>
  );
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      display: "flex", alignItems: "flex-end",
      background: "rgba(0,0,0,0.6)",
    }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%", maxWidth: 540, margin: "0 auto",
          background: "var(--bg2)", borderTopLeftRadius: 20, borderTopRightRadius: 20,
          border: "1px solid var(--blue)", borderBottom: "none",
          padding: "24px 20px 32px", maxHeight: "92vh", overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--sub)" }}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "10px 12px", background: "var(--bg3)",
  border: "1px solid var(--blue)", borderRadius: 8, color: "var(--text)",
  fontSize: 14, outline: "none",
};

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 12, color: "var(--sub)", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

const EMPTY = { label: "A", name: "", color: PALETTE[0], exercises: [] };

function TreinoModal({ open, onClose, initial, allExercises, onSaved }) {
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
      exercises: [...p.exercises, { id: ex.id, name: ex.name, sets: ex.sets ?? 3, reps: ex.reps ?? 12, wt: 0, notes: "" }],
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
    <Modal open={open} onClose={onClose} title={form.id ? "Editar Treino" : "Novo Treino"}>
      <form onSubmit={submit}>
        {error && <p style={{ color: "var(--red)", fontSize: 13, marginBottom: 12 }}>{error}</p>}

        <div style={{ display: "grid", gridTemplateColumns: "64px 1fr", gap: 12 }}>
          <Field label="Label">
            <input style={inputStyle} value={form.label} onChange={(e) => set("label", e.target.value.toUpperCase().slice(0, 2))} placeholder="A" maxLength={2} />
          </Field>
          <Field label="Nome">
            <input style={inputStyle} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Ex: Treino A — Peito e Tríceps" required />
          </Field>
        </div>

        <Field label="Cor">
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

        {/* Exercises */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <label style={{ fontSize: 12, color: "var(--sub)" }}>Exercícios ({form.exercises.length})</label>
            <button type="button" onClick={() => setAddingEx(true)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--acc)", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
              <Plus size={13} /> Adicionar
            </button>
          </div>

          {addingEx && (
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <select
                value={exPick}
                onChange={(e) => setExPick(e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
              >
                <option value="">Selecione…</option>
                {allExercises.map((e) => (
                  <option key={e.id} value={e.id}>{e.name} ({e.group})</option>
                ))}
              </select>
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
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{ex.name}</span>
                  <button type="button" onClick={() => removeEx(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--red)" }}>
                    <X size={13} />
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                  {[
                    { k: "sets", label: "Séries" },
                    { k: "reps", label: "Reps" },
                    { k: "wt", label: "Peso (kg)" },
                  ].map(({ k, label }) => (
                    <div key={k}>
                      <p style={{ fontSize: 10, color: "var(--sub)", marginBottom: 2 }}>{label}</p>
                      <input
                        type="number"
                        min={0}
                        value={ex[k]}
                        onChange={(e) => updateEx(i, k, Number(e.target.value))}
                        style={{ ...inputStyle, padding: "6px 8px", fontSize: 13 }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button type="submit" disabled={loading} style={{ width: "100%", height: 40 }}>
          {loading ? "Salvando…" : "Salvar Treino"}
        </Button>
      </form>
    </Modal>
  );
}

function AssignModal({ open, onClose, treinoId, students }) {
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
    <Modal open={open} onClose={onClose} title="Atribuir a Aluno">
      {done ? (
        <p style={{ color: "var(--green)", fontSize: 13 }}>Treino atribuído com sucesso!</p>
      ) : (
        <>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            style={{
              width: "100%", padding: "10px 12px", background: "var(--bg3)",
              border: "1px solid var(--blue)", borderRadius: 8, color: "var(--text)",
              fontSize: 14, outline: "none", marginBottom: 16,
            }}
          >
            <option value="">Selecione um aluno…</option>
            {students.map((s) => <option key={s.uid} value={s.uid}>{s.name}</option>)}
          </select>
          <Button onClick={handle} disabled={loading || !selected} style={{ width: "100%", height: 40 }}>
            {loading ? "Atribuindo…" : "Atribuir"}
          </Button>
        </>
      )}
    </Modal>
  );
}

export function TreinosPage() {
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
      .then(([t, e, s]) => { setTreinos(t); setExercises(e); setStudents(s); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id) {
    if (!confirm("Deletar treino?")) return;
    await deleteTreino(id);
    load();
  }

  function handleEdit(t) {
    setEditing({ ...t });
    setModalOpen(true);
  }

  function handleNew() {
    setEditing(null);
    setModalOpen(true);
  }

  if (loading) return <Spinner />;
  if (error) return <div style={{ padding: 24, color: "var(--red)", fontSize: 13 }}>{error}</div>;

  return (
    <div style={{ padding: "24px 20px", maxWidth: 900 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)" }}>Treinos</h1>
        <Button size="sm" onClick={handleNew}>
          <Plus size={15} /> Novo
        </Button>
      </div>

      {treinos.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--sub)" }}>Nenhum treino criado</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }} className="sm:grid-cols-2">
          {treinos.map((t) => (
            <div key={t.id} style={{
              background: "var(--bg2)", border: "1px solid var(--blue)",
              borderRadius: 12, padding: "16px 18px",
              borderLeft: `4px solid ${t.color ?? "var(--blue)"}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 20,
                      background: `${t.color ?? "var(--blue)"}22`, color: t.color ?? "var(--sub)",
                    }}>
                      {t.label}
                    </span>
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{t.name}</p>
                  <p style={{ fontSize: 12, color: "var(--sub)", marginTop: 4 }}>
                    {t.exercises?.length ?? 0} exercício{(t.exercises?.length ?? 0) !== 1 ? "s" : ""}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    onClick={() => { setAssignTarget(t.id); setAssignOpen(true); }}
                    title="Atribuir a aluno"
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--acc)", padding: 6 }}
                  >
                    <UserPlus size={15} />
                  </button>
                  <button onClick={() => handleEdit(t)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--sub)", padding: 6 }}>
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(t.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--red)", padding: 6 }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <TreinoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={editing}
        allExercises={exercises}
        onSaved={load}
      />

      <AssignModal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        treinoId={assignTarget}
        students={students}
      />
    </div>
  );
}
