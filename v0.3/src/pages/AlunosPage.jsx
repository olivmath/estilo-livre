import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getStudents, getStudent, createStudent, updateStudent,
  deleteStudent, toggleBlock, getStudentStats,
} from "@/services/users";
import { getStudentSessions } from "@/services/sessions";
import { getStudentWorkouts, getTreinos, assignTreino, createCustomWorkout, deleteStudentWorkout } from "@/services/workouts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Search, Edit2, Trash2, Lock, Unlock, ChevronRight } from "lucide-react";

const STATUS_COLORS = {
  active:   { bg: "rgba(0,200,83,0.12)",  text: "var(--green)",  label: "Ativo" },
  warning:  { bg: "rgba(245,196,0,0.12)", text: "var(--acc)",    label: "Atenção" },
  inactive: { bg: "rgba(244,67,54,0.12)", text: "var(--red)",    label: "Inativo" },
  blocked:  { bg: "rgba(121,134,203,0.15)", text: "var(--sub)",  label: "Bloqueado" },
};

const STATUS_FILTERS = ["todos", "active", "warning", "inactive", "blocked"];
const STATUS_LABELS  = { todos: "Todos", ...Object.fromEntries(Object.entries(STATUS_COLORS).map(([k, v]) => [k, v.label])) };

function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
      <div className="w-8 h-8 rounded-full border-[3px] animate-spin"
        style={{ borderColor: "var(--bg3)", borderTopColor: "var(--acc)" }} />
    </div>
  );
}

function Avatar({ name, photoURL, size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: photoURL ? "transparent" : "var(--blue)",
      overflow: "hidden", flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.4, fontWeight: 700, color: "var(--acc)",
    }}>
      {photoURL
        ? <img src={photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : (name?.[0]?.toUpperCase() ?? "?")}
    </div>
  );
}

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] ?? STATUS_COLORS.inactive;
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
      background: c.bg, color: c.text,
    }}>
      {c.label}
    </span>
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
          width: "100%", maxWidth: 520, margin: "0 auto",
          background: "var(--bg2)", borderTopLeftRadius: 20, borderTopRightRadius: 20,
          border: "1px solid var(--blue)", borderBottom: "none",
          padding: "24px 20px 32px", maxHeight: "90vh", overflowY: "auto",
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

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 12, color: "var(--sub)", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

function Input({ ...props }) {
  return (
    <input
      style={{
        width: "100%", padding: "10px 12px", background: "var(--bg3)",
        border: "1px solid var(--blue)", borderRadius: 8, color: "var(--text)",
        fontSize: 14, outline: "none",
      }}
      {...props}
    />
  );
}

function NovoAlunoModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function set(k, v) { setForm((p) => ({ ...p, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await createStudent({ name: form.name.trim(), email: form.email.trim() });
      setForm({ name: "", email: "" });
      onCreated();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Novo Aluno">
      <form onSubmit={submit}>
        {error && <p style={{ color: "var(--red)", fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <Field label="Nome">
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Nome completo" required />
        </Field>
        <Field label="Email">
          <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="email@exemplo.com" required />
        </Field>
        <Button type="submit" disabled={loading} style={{ width: "100%", height: 40, marginTop: 4 }}>
          {loading ? "Criando…" : "Criar Aluno"}
        </Button>
      </form>
    </Modal>
  );
}

function RpeChart({ sessions }) {
  const withRpe = sessions.filter((s) => s.exercises?.some((e) => e.rpe > 0));
  if (!withRpe.length) return <p style={{ fontSize: 13, color: "var(--sub)" }}>Sem dados de RPE</p>;

  const data = withRpe.slice(0, 10).reverse().map((s) => {
    const rpes = s.exercises?.map((e) => Number(e.rpe)).filter((r) => r > 0) ?? [];
    const avg = rpes.length ? rpes.reduce((a, b) => a + b, 0) / rpes.length : 0;
    return { avg, date: s.date };
  });

  const max = 10;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 60 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <div style={{
            width: "100%", height: Math.max(4, (d.avg / max) * 50),
            background: d.avg <= 4 ? "var(--green)" : d.avg <= 7 ? "var(--acc)" : "var(--red)",
            borderRadius: 3,
          }} />
          <span style={{ fontSize: 9, color: "var(--sub)" }}>{d.avg.toFixed(1)}</span>
        </div>
      ))}
    </div>
  );
}

function StudentDetail({ uid, onClose, role }) {
  const [tab, setTab] = useState("progresso");
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [treinos, setTreinos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedTreino, setSelectedTreino] = useState("");
  const [assigning, setAssigning] = useState(false);

  const [newWkOpen, setNewWkOpen] = useState(false);
  const [newWkName, setNewWkName] = useState("");
  const [creatingWk, setCreatingWk] = useState(false);

  useEffect(() => {
    if (!uid) return;
    setLoading(true);
    Promise.all([
      getStudentStats(uid),
      getStudentSessions(uid, 10),
      getStudentWorkouts(uid),
      getTreinos(),
    ]).then(([s, sess, wks, tmpl]) => {
      setStats(s);
      setSessions(sess);
      setWorkouts(wks);
      setTreinos(tmpl);
    }).finally(() => setLoading(false));
  }, [uid]);

  async function handleAssign() {
    if (!selectedTreino) return;
    setAssigning(true);
    try {
      await assignTreino(uid, selectedTreino);
      const wks = await getStudentWorkouts(uid);
      setWorkouts(wks);
      setAssignOpen(false);
      setSelectedTreino("");
    } finally {
      setAssigning(false);
    }
  }

  async function handleNewWk() {
    if (!newWkName.trim()) return;
    setCreatingWk(true);
    try {
      await createCustomWorkout(uid, { name: newWkName.trim(), label: "A", color: "#2352c8", exercises: [] });
      const wks = await getStudentWorkouts(uid);
      setWorkouts(wks);
      setNewWkOpen(false);
      setNewWkName("");
    } finally {
      setCreatingWk(false);
    }
  }

  async function handleDeleteWk(wkId) {
    await deleteStudentWorkout(uid, wkId);
    setWorkouts((p) => p.filter((w) => w.id !== wkId));
  }

  if (loading) return <Spinner />;

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "var(--bg3)", borderRadius: 8, padding: 4 }}>
        {["progresso", "treinos"].map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: "8px 0", borderRadius: 6, border: "none",
            background: tab === t ? "var(--blue2)" : "transparent",
            color: tab === t ? "var(--text)" : "var(--sub)",
            fontSize: 13, fontWeight: tab === t ? 600 : 400, cursor: "pointer",
            textTransform: "capitalize",
          }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "progresso" && (
        <div>
          {/* Stats cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 16 }}>
            {[
              { label: "Total Sessões", value: stats?.totalSessions ?? 0 },
              { label: "Semana", value: stats?.weekSessions ?? 0 },
              { label: "Mês", value: stats?.monthSessions ?? 0 },
              { label: "Dias s/ treinar", value: stats?.daysLastWorkout ?? "—" },
              { label: "RPE médio", value: stats?.avgRpe != null ? stats.avgRpe.toFixed(1) : "—" },
              { label: "Ciclos", value: stats?.cycles ?? 0 },
            ].map((c) => (
              <div key={c.label} style={{
                background: "var(--bg3)", borderRadius: 8, padding: "10px 12px", textAlign: "center",
              }}>
                <p style={{ fontSize: 18, fontWeight: 800, color: "var(--acc)" }}>{c.value}</p>
                <p style={{ fontSize: 10, color: "var(--sub)", marginTop: 2 }}>{c.label}</p>
              </div>
            ))}
          </div>

          {/* RPE chart */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 12, color: "var(--sub)", marginBottom: 8 }}>RPE (últimas sessões)</p>
            <RpeChart sessions={sessions} />
          </div>

          {/* Sessions table */}
          <p style={{ fontSize: 12, color: "var(--sub)", marginBottom: 8 }}>Últimas sessões</p>
          {sessions.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--sub)" }}>Nenhuma sessão registrada</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {sessions.map((s) => {
                const ms = s.date?.toMillis?.() ?? 0;
                const days = Math.floor((Date.now() - ms) / 86400000);
                return (
                  <div key={s.id} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "8px 12px", background: "var(--bg3)", borderRadius: 8,
                  }}>
                    <span style={{ fontSize: 13, color: "var(--text)" }}>{s.wkName ?? "Treino"}</span>
                    <span style={{ fontSize: 11, color: "var(--sub)" }}>
                      {days === 0 ? "hoje" : `${days}d atrás`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "treinos" && (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <Button size="sm" onClick={() => setAssignOpen(true)} style={{ flex: 1 }}>
              Atribuir Treino
            </Button>
            <Button size="sm" variant="outline" onClick={() => setNewWkOpen(true)} style={{ flex: 1 }}>
              Novo Customizado
            </Button>
          </div>

          {assignOpen && (
            <div style={{
              background: "var(--bg3)", borderRadius: 8, padding: 12, marginBottom: 12,
              display: "flex", gap: 8, alignItems: "center",
            }}>
              <select
                value={selectedTreino}
                onChange={(e) => setSelectedTreino(e.target.value)}
                style={{
                  flex: 1, padding: "8px 10px", background: "var(--bg2)",
                  border: "1px solid var(--blue)", borderRadius: 8, color: "var(--text)", fontSize: 13,
                }}
              >
                <option value="">Selecione…</option>
                {treinos.map((t) => (
                  <option key={t.id} value={t.id}>{t.label} — {t.name}</option>
                ))}
              </select>
              <Button size="sm" onClick={handleAssign} disabled={assigning || !selectedTreino}>
                {assigning ? "…" : "OK"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setAssignOpen(false)}>
                <X size={14} />
              </Button>
            </div>
          )}

          {newWkOpen && (
            <div style={{
              background: "var(--bg3)", borderRadius: 8, padding: 12, marginBottom: 12,
              display: "flex", gap: 8, alignItems: "center",
            }}>
              <input
                value={newWkName}
                onChange={(e) => setNewWkName(e.target.value)}
                placeholder="Nome do treino"
                style={{
                  flex: 1, padding: "8px 10px", background: "var(--bg2)",
                  border: "1px solid var(--blue)", borderRadius: 8, color: "var(--text)", fontSize: 13,
                }}
              />
              <Button size="sm" onClick={handleNewWk} disabled={creatingWk || !newWkName.trim()}>
                {creatingWk ? "…" : "OK"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setNewWkOpen(false)}>
                <X size={14} />
              </Button>
            </div>
          )}

          {workouts.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--sub)" }}>Nenhuma ficha atribuída</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {workouts.map((w) => (
                <div key={w.id} style={{
                  background: "var(--bg3)", borderRadius: 10, padding: "12px 14px",
                  borderLeft: `3px solid ${w.color ?? "var(--blue)"}`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                    <div>
                      <span style={{ fontSize: 10, color: "var(--sub)", fontWeight: 600 }}>{w.label}</span>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{w.name}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteWk(w.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--red)", padding: 4 }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {w.exercises?.length > 0 && (
                    <p style={{ fontSize: 11, color: "var(--sub)" }}>
                      {w.exercises.length} exercício{w.exercises.length !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AlunosPage() {
  const { role } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [statsMap, setStatsMap] = useState({});
  const [statsLoading, setStatsLoading] = useState(false);

  const [novoOpen, setNovoOpen] = useState(false);
  const [detailUid, setDetailUid] = useState(null);
  const [detailName, setDetailName] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    getStudents()
      .then((list) => {
        setStudents(list);
        loadStats(list);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function loadStats(list) {
    setStatsLoading(true);
    const entries = await Promise.all(
      list.map(async (s) => {
        try {
          const st = await getStudentStats(s.uid);
          return [s.uid, st];
        } catch {
          return [s.uid, null];
        }
      })
    );
    setStatsMap(Object.fromEntries(entries));
    setStatsLoading(false);
  }

  useEffect(() => { load(); }, [load]);

  const filtered = students.filter((s) => {
    const st = statsMap[s.uid];
    const status = st?.status ?? "inactive";
    if (statusFilter !== "todos" && status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q);
    }
    return true;
  });

  async function handleToggleBlock(uid) {
    await toggleBlock(uid);
    load();
  }

  async function handleDelete(uid) {
    if (!confirm("Deletar aluno? Esta ação não pode ser desfeita.")) return;
    await deleteStudent(uid);
    load();
  }

  if (loading) return <Spinner />;
  if (error) return <div style={{ padding: 24, color: "var(--red)", fontSize: 13 }}>{error}</div>;

  return (
    <div style={{ padding: "24px 20px", maxWidth: 900 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)" }}>Alunos</h1>
        <Button size="sm" onClick={() => setNovoOpen(true)}>
          <Plus size={15} /> Novo Aluno
        </Button>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 12 }}>
        <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--sub)" }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou email…"
          style={{
            width: "100%", padding: "10px 12px 10px 36px",
            background: "var(--bg2)", border: "1px solid var(--blue)",
            borderRadius: 8, color: "var(--text)", fontSize: 14, outline: "none",
          }}
        />
      </div>

      {/* Status filter */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
        {STATUS_FILTERS.map((f) => (
          <button key={f} onClick={() => setStatusFilter(f)} style={{
            padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer",
            fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
            background: statusFilter === f ? "var(--acc)" : "var(--bg3)",
            color: statusFilter === f ? "#000" : "var(--sub)",
          }}>
            {STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--sub)" }}>Nenhum aluno encontrado</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {filtered.map((s) => {
            const st = statsMap[s.uid];
            const status = st?.status ?? (s.active === false ? "blocked" : "inactive");
            return (
              <div key={s.uid} style={{
                background: "var(--bg2)", border: "1px solid var(--blue)",
                borderRadius: 10, padding: "12px 14px",
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <Avatar name={s.name} photoURL={s.photoURL} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {s.name}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--sub)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {s.email}
                  </p>
                </div>

                {/* Stats */}
                <div style={{ display: "flex", gap: 16, alignItems: "center" }} className="hidden sm:flex">
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{st?.weekSessions ?? "—"}</p>
                    <p style={{ fontSize: 10, color: "var(--sub)" }}>sess/sem</p>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
                      {st?.avgRpe != null ? st.avgRpe.toFixed(1) : "—"}
                    </p>
                    <p style={{ fontSize: 10, color: "var(--sub)" }}>RPE</p>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{st?.cycles ?? "—"}</p>
                    <p style={{ fontSize: 10, color: "var(--sub)" }}>ciclos</p>
                  </div>
                </div>

                <StatusBadge status={status} />

                {/* Actions */}
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    onClick={() => handleToggleBlock(s.uid)}
                    title={s.active === false ? "Desbloquear" : "Bloquear"}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--sub)", padding: 6 }}
                  >
                    {s.active === false ? <Unlock size={15} /> : <Lock size={15} />}
                  </button>
                  {role === "admin" && (
                    <button
                      onClick={() => handleDelete(s.uid)}
                      title="Deletar"
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--red)", padding: 6 }}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                  <button
                    onClick={() => { setDetailUid(s.uid); setDetailName(s.name); }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--sub)", padding: 6 }}
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <NovoAlunoModal open={novoOpen} onClose={() => setNovoOpen(false)} onCreated={load} />

      {/* Student detail slide-over */}
      {detailUid && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 100,
          display: "flex", justifyContent: "flex-end",
          background: "rgba(0,0,0,0.5)",
        }}
          onClick={() => setDetailUid(null)}
        >
          <div
            style={{
              width: "100%", maxWidth: 480, height: "100%",
              background: "var(--bg2)", borderLeft: "1px solid var(--blue)",
              overflowY: "auto", padding: "24px 20px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{detailName}</h2>
              <button onClick={() => setDetailUid(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--sub)" }}>
                <X size={18} />
              </button>
            </div>
            <StudentDetail uid={detailUid} onClose={() => setDetailUid(null)} role={role} />
          </div>
        </div>
      )}
    </div>
  );
}
