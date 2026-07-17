import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import {
  getStudents, createStudent,
  deleteStudent, toggleBlock, getStudentStats,
} from "@/services/users";
import { getStudentSessions } from "@/services/sessions";
import {
  getStudentWorkouts, getTreinos, assignTreino,
  createCustomWorkout, updateStudentWorkout, deleteStudentWorkout, reorderStudentWorkouts,
} from "@/services/workouts";
import { getExercises } from "@/services/exercises";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Spinner, UserAvatar, Field } from "@/components/shared";
import { locName, locGroup } from "@/lib/localize";
import { X, Plus, Search, Trash2, ChevronRight, ChevronDown, Lock, KeyRound, Edit2, ChevronUp } from "lucide-react";

const PALETTE = [
  "#2352c8", "#1B3487", "#F5C400", "#00c853", "#f44336",
  "#9c27b0", "#ff6d00", "#00bcd4", "#e91e63", "#607d8b",
];

const STATUS_COLORS = {
  active:   { bg: "rgba(0,200,83,0.12)",  text: "var(--green)",  labelKey: "common.active" },
  warning:  { bg: "rgba(245,196,0,0.12)", text: "var(--acc)",    labelKey: "common.attention" },
  inactive: { bg: "rgba(244,67,54,0.12)", text: "var(--red)",    labelKey: "common.inactive" },
  blocked:  { bg: "rgba(121,134,203,0.15)", text: "var(--sub)",  labelKey: "common.blocked" },
};

const STATUS_FILTERS = ["todos", "active", "warning", "inactive", "blocked"];

function StatusBadge({ status }) {
  const { t } = useTranslation();
  const c = STATUS_COLORS[status] ?? STATUS_COLORS.inactive;
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
      background: c.bg, color: c.text,
    }}>
      {t(c.labelKey)}
    </span>
  );
}

function NovoAlunoModal({ open, onClose, onCreated }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await createStudent({ email: email.trim() });
      setEmail("");
      onCreated();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" style={{ maxWidth: 520, margin: "0 auto" }}>
        <SheetHeader>
          <SheetTitle>{t("alunosPage.inviteTitle")}</SheetTitle>
        </SheetHeader>
        <form onSubmit={submit} style={{ padding: "0 0 16px" }}>
          {error && <p style={{ color: "var(--red)", fontSize: 13, marginBottom: 12 }}>{error}</p>}
          <Field label={t("alunosPage.studentEmail")}>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" required />
          </Field>
          <p style={{ fontSize: 12, color: "var(--sub)", marginBottom: 16 }}>
            {t("alunosPage.inviteHint")}
          </p>
          <Button type="submit" disabled={loading} style={{ width: "100%", height: 40 }}>
            {loading ? t("alunosPage.sending") : t("alunosPage.addToList")}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function RpeChart({ sessions }) {
  const { t } = useTranslation();
  const withRpe = sessions.filter((s) => s.exercises?.some((e) => e.rpe > 0));
  if (!withRpe.length) return <p style={{ fontSize: 13, color: "var(--sub)" }}>{t("alunosPage.noRpeData")}</p>;

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

const WORKOUT_EMPTY = { label: "A", name: "", color: PALETTE[0], exercises: [] };

function WorkoutModal({ open, onClose, uid, initial, allExercises, onSaved }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(WORKOUT_EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addingEx, setAddingEx] = useState(false);
  const [exSearch, setExSearch] = useState("");

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...initial, exercises: [...(initial.exercises ?? [])] } : WORKOUT_EMPTY);
      setError(null);
      setAddingEx(false);
      setExSearch("");
    }
  }, [open, initial]);

  function set(k, v) { setForm((p) => ({ ...p, [k]: v })); }

  function addExercise(ex) {
    setForm((p) => ({
      ...p,
      exercises: [...p.exercises, { id: ex.id, name: ex.name, group: ex.group, sets: ex.sets ?? 3, reps: ex.reps ?? 12, wt: 0 }],
    }));
    setExSearch("");
    setAddingEx(false);
  }

  function updateEx(i, k, v) {
    setForm((p) => {
      const exs = [...p.exercises];
      exs[i] = { ...exs[i], [k]: Number(v) };
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
      const payload = {
        label: form.label,
        name: form.name.trim(),
        color: form.color,
        exercises: form.exercises,
      };
      if (initial?.id) {
        await updateStudentWorkout(uid, initial.id, payload);
      } else {
        await createCustomWorkout(uid, payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const alreadyIds = new Set(form.exercises.map((e) => e.id));
  const filteredExs = allExercises.filter((e) => {
    if (alreadyIds.has(e.id)) return false;
    if (!exSearch) return true;
    const q = exSearch.toLowerCase();
    return e.name.toLowerCase().includes(q) || e.group?.toLowerCase().includes(q);
  });

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" style={{ maxWidth: 520, margin: "0 auto", maxHeight: "92vh", overflowY: "auto" }}>
        <SheetHeader>
          <SheetTitle>{initial?.id ? t("alunosPage.editWorkout") : t("alunosPage.newCustomWorkout")}</SheetTitle>
        </SheetHeader>
      <form onSubmit={submit} style={{ padding: "0 0 16px" }}>
        {error && <p style={{ color: "var(--red)", fontSize: 13, marginBottom: 12 }}>{error}</p>}

        <div style={{ display: "grid", gridTemplateColumns: "64px 1fr", gap: 12 }}>
          <Field label={t("alunosPage.label")}>
            <Input
              value={form.label}
              onChange={(e) => set("label", e.target.value.toUpperCase().slice(0, 2))}
              placeholder="A"
              maxLength={2}
            />
          </Field>
          <Field label={t("alunosPage.name")}>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Ex: Treino A — Peito e Tríceps"
              required
            />
          </Field>
        </div>

        <Field label={t("alunosPage.color")}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => set("color", c)}
                style={{
                  width: 28, height: 28, borderRadius: "50%", background: c,
                  border: form.color === c ? "3px solid white" : "3px solid transparent",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
        </Field>

        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <label style={{ fontSize: 12, color: "var(--sub)" }}>
              {t("alunosPage.exercises")} ({form.exercises.length})
            </label>
            {!addingEx && (
              <button
                type="button"
                onClick={() => setAddingEx(true)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--acc)", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}
              >
                <Plus size={13} /> {t("alunosPage.add")}
              </button>
            )}
          </div>

          {addingEx && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--sub)", zIndex: 1 }} />
                  <Input
                    autoFocus
                    value={exSearch}
                    onChange={(e) => setExSearch(e.target.value)}
                    placeholder={t("alunosPage.searchExercise")}
                    style={{
                      paddingLeft: 30,
                      background: "var(--bg2)", border: "1px solid var(--blue)",
                      color: "var(--text)", fontSize: 13,
                    }}
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => { setAddingEx(false); setExSearch(""); }}
                >
                  <X size={14} />
                </Button>
              </div>
              <div style={{ maxHeight: 160, overflowY: "auto", display: "flex", flexDirection: "column", gap: 3 }}>
                {filteredExs.slice(0, 30).map((ex) => (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => addExercise(ex)}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "8px 10px", background: "var(--bg3)", borderRadius: 6,
                      border: "none", cursor: "pointer", color: "var(--text)", textAlign: "left",
                    }}
                  >
                    <span style={{ fontSize: 13 }}>{locName(ex)}</span>
                    <span style={{ fontSize: 11, color: "var(--sub)" }}>{locGroup(ex)}</span>
                  </button>
                ))}
                {filteredExs.length === 0 && (
                  <p style={{ fontSize: 13, color: "var(--sub)", padding: "8px 0" }}>{t("alunosPage.noExerciseFound")}</p>
                )}
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {form.exercises.map((ex, i) => (
              <div key={i} style={{
                background: "var(--bg3)", borderRadius: 8, padding: "10px 12px",
                borderLeft: `3px solid ${form.color}`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{locName(ex)}</span>
                    {ex.group && (
                      <span style={{ fontSize: 11, color: "var(--sub)", marginLeft: 6 }}>{locGroup(ex)}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeEx(i)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--red)" }}
                  >
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
                        value={ex[k] ?? 0}
                        onChange={(e) => updateEx(i, k, e.target.value)}
                        style={{
                          padding: "6px 8px", background: "var(--bg2)",
                          border: "1px solid var(--blue)", color: "var(--text)",
                          fontSize: 13,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button type="submit" disabled={loading} style={{ width: "100%", height: 40 }}>
          {loading ? t("common.saving") : initial?.id ? t("alunosPage.saveChanges") : t("alunosPage.createWorkout")}
        </Button>
      </form>
      </SheetContent>
    </Sheet>
  );
}

function StudentDetail({ uid, role: _role }) {
  const { t } = useTranslation();
  const [tab, setTab] = useState("progresso");
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [treinos, setTreinos] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  const [assignOpen, setAssignOpen] = useState(false);
  const [assigning, setAssigning] = useState(null);

  const [wkModal, setWkModal] = useState(false);
  const [wkEditing, setWkEditing] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [expandedWk, setExpandedWk] = useState(new Set());

  useEffect(() => {
    if (!uid) return;
    setLoading(true);
    Promise.all([
      getStudentStats(uid),
      getStudentSessions(uid, 10),
      getStudentWorkouts(uid),
      getTreinos(),
      getExercises(),
    ]).then(([s, sess, wks, tmpl, exs]) => {
      setStats(s);
      setSessions(sess);
      setWorkouts(wks);
      setTreinos(tmpl);
      setExercises(exs);
    }).finally(() => setLoading(false));
  }, [uid]);

  async function refreshWorkouts() {
    const wks = await getStudentWorkouts(uid);
    setWorkouts(wks);
  }

  async function handleAssign(templateId) {
    setAssigning(templateId);
    try {
      await assignTreino(uid, templateId);
      await refreshWorkouts();
      setAssignOpen(false);
    } finally {
      setAssigning(null);
    }
  }

  async function handleDeleteWk() {
    if (!deleteTarget) return;
    await deleteStudentWorkout(uid, deleteTarget);
    setWorkouts((p) => p.filter((w) => w.id !== deleteTarget));
    setDeleteTarget(null);
  }

  async function handleMoveWk(wkId, direction) {
    const idx = workouts.findIndex((w) => w.id === wkId);
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === workouts.length - 1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    const next = [...workouts];
    [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
    setWorkouts(next);
    await reorderStudentWorkouts(uid, next.map((w) => w.id));
  }

  function toggleExpand(wkId) {
    setExpandedWk((prev) => {
      const next = new Set(prev);
      if (next.has(wkId)) next.delete(wkId); else next.add(wkId);
      return next;
    });
  }

  if (loading) return <Spinner />;

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "var(--bg3)", borderRadius: 8, padding: 4 }}>
        {["progresso", "treinos"].map((tabKey) => {
          const TAB_LABELS = { progresso: t("alunosPage.progress"), treinos: t("alunosPage.workouts") };
          return (
            <button key={tabKey} onClick={() => setTab(tabKey)} style={{
              flex: 1, padding: "8px 0", borderRadius: 6, border: "none",
              background: tab === tabKey ? "var(--blue2)" : "transparent",
              color: tab === tabKey ? "var(--text)" : "var(--sub)",
              fontSize: 13, fontWeight: tab === tabKey ? 600 : 400, cursor: "pointer",
              textTransform: "capitalize",
            }}>
              {TAB_LABELS[tabKey]}
            </button>
          );
        })}
      </div>

      {tab === "progresso" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 16 }}>
            {[
              { label: t("alunosPage.totalSessions"), value: stats?.totalSessions ?? 0 },
              { label: t("alunosPage.week"), value: stats?.weekSessions ?? 0 },
              { label: t("alunosPage.month"), value: stats?.monthSessions ?? 0 },
              { label: t("alunosPage.daysNoTraining"), value: stats?.daysLastWorkout ?? "—" },
              { label: t("alunosPage.avgRpe"), value: stats?.avgRpe != null ? stats.avgRpe.toFixed(1) : "—" },
              { label: t("profileTab.loops"), value: stats?.cycles ?? 0 },
            ].map((c) => (
              <div key={c.label} style={{
                background: "var(--bg3)", borderRadius: 8, padding: "10px 12px", textAlign: "center",
              }}>
                <p style={{ fontSize: 18, fontWeight: 800, color: "var(--acc)" }}>{c.value}</p>
                <p style={{ fontSize: 10, color: "var(--sub)", marginTop: 2 }}>{c.label}</p>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 12, color: "var(--sub)", marginBottom: 8 }}>{t("alunosPage.rpeLast")}</p>
            <RpeChart sessions={sessions} />
          </div>

          <p style={{ fontSize: 12, color: "var(--sub)", marginBottom: 8 }}>{t("alunosPage.lastSessions")}</p>
          {sessions.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--sub)" }}>{t("alunosPage.noSessions")}</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {sessions.map((s) => {
                const ms = s.date?.toMillis?.() ?? (typeof s.date === "number" ? s.date : 0);
                const days = Math.floor((Date.now() - ms) / 86400000);
                return (
                  <div key={s.id} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "8px 12px", background: "var(--bg3)", borderRadius: 8,
                  }}>
                    <span style={{ fontSize: 13, color: "var(--text)" }}>{s.wkName ?? t("dashboardPage.workout")}</span>
                    <span style={{ fontSize: 11, color: "var(--sub)" }}>
                      {days === 0 ? t("dashboardPage.today") : t("dashboardPage.daysAgo", { n: days })}
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
            <Button
              size="sm"
              onClick={() => setAssignOpen((p) => !p)}
              style={{ flex: 1 }}
            >
              {t("alunosPage.assignWorkout")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => { setWkEditing(null); setWkModal(true); }}
              style={{ flex: 1 }}
            >
              {t("alunosPage.newCustom")}
            </Button>
          </div>

          {/* Template picker */}
          {assignOpen && (
            <div style={{
              background: "var(--bg3)", borderRadius: 10, padding: 12, marginBottom: 12,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <p style={{ fontSize: 12, color: "var(--sub)", fontWeight: 600 }}>{t("alunosPage.selectTemplate")}</p>
                <button
                  onClick={() => setAssignOpen(false)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--sub)" }}
                >
                  <X size={14} />
                </button>
              </div>
              {treinos.length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--sub)" }}>{t("alunosPage.noTemplates")}</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {treinos.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      onClick={() => handleAssign(tmpl.id)}
                      disabled={assigning !== null}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "10px 12px", background: "var(--bg2)",
                        borderRadius: 8, border: "1px solid var(--blue)",
                        borderLeft: `3px solid ${tmpl.color ?? "var(--blue)"}`,
                        cursor: assigning ? "default" : "pointer",
                        color: "var(--text)", textAlign: "left",
                        opacity: assigning === tmpl.id ? 0.6 : 1,
                      }}
                    >
                      <span style={{
                        fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 20,
                        background: `${tmpl.color ?? "var(--blue)"}22`, color: tmpl.color ?? "var(--sub)",
                        flexShrink: 0,
                      }}>
                        {tmpl.label}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{tmpl.name}</p>
                        <p style={{ fontSize: 11, color: "var(--sub)" }}>
                          {t("alunosPage.exerciseCount", { n: tmpl.exercises?.length ?? 0 })}
                        </p>
                      </div>
                      {assigning === tmpl.id && (
                        <div className="w-4 h-4 rounded-full border-2 animate-spin"
                          style={{ borderColor: "var(--bg3)", borderTopColor: "var(--acc)", flexShrink: 0 }} />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Workout list */}
          {workouts.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--sub)" }}>{t("alunosPage.noWorkouts")}</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {workouts.map((w) => {
                const expanded = expandedWk.has(w.id);
                const exCount = w.exercises?.length ?? 0;
                return (
                  <div key={w.id} style={{
                    background: "var(--bg3)", borderRadius: 10,
                    borderLeft: `3px solid ${w.color ?? "var(--blue)"}`,
                    overflow: "hidden",
                  }}>
                    <div style={{
                      display: "flex", alignItems: "center",
                      padding: "12px 14px", gap: 8,
                    }}>
                      {/* Expand toggle */}
                      <button
                        onClick={() => toggleExpand(w.id)}
                        style={{
                          flex: 1, display: "flex", alignItems: "center", gap: 8,
                          background: "none", border: "none", cursor: "pointer", textAlign: "left", minWidth: 0,
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                            <span style={{
                              fontSize: 10, fontWeight: 800, padding: "1px 6px", borderRadius: 20,
                              background: `${w.color ?? "var(--blue)"}22`, color: w.color ?? "var(--sub)",
                            }}>
                              {w.label}
                            </span>
                            {!w.fromTemplateId && (
                              <span style={{ fontSize: 10, color: "var(--sub)" }}>{t("alunosPage.custom")}</span>
                            )}
                          </div>
                          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {w.name}
                          </p>
                          <p style={{ fontSize: 11, color: "var(--sub)" }}>
                            {t("alunosPage.exerciseCount", { n: exCount })}
                          </p>
                        </div>
                        <span style={{
                          fontSize: 10, color: "var(--sub)", flexShrink: 0, marginLeft: "auto",
                          transform: expanded ? "rotate(180deg)" : "none",
                          display: "inline-block", transition: "transform .2s",
                        }}>▾</span>
                      </button>

                      {/* Actions */}
                      <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
                        <button
                          onClick={() => handleMoveWk(w.id, "up")}
                          disabled={workouts.indexOf(w) === 0}
                          title={t("alunosPage.moveUp")}
                          style={{ background: "none", border: "none", cursor: workouts.indexOf(w) === 0 ? "default" : "pointer", color: "var(--sub)", padding: 6, opacity: workouts.indexOf(w) === 0 ? 0.3 : 1 }}
                        >
                          <ChevronUp size={13} />
                        </button>
                        <button
                          onClick={() => handleMoveWk(w.id, "down")}
                          disabled={workouts.indexOf(w) === workouts.length - 1}
                          title={t("alunosPage.moveDown")}
                          style={{ background: "none", border: "none", cursor: workouts.indexOf(w) === workouts.length - 1 ? "default" : "pointer", color: "var(--sub)", padding: 6, opacity: workouts.indexOf(w) === workouts.length - 1 ? 0.3 : 1 }}
                        >
                          <ChevronDown size={13} />
                        </button>
                        <button
                          onClick={() => { setWkEditing(w); setWkModal(true); }}
                          title={t("common.edit")}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--sub)", padding: 6 }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(w.id)}
                          title={t("alunosPage.remove")}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--red)", padding: 6 }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {expanded && (
                      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "8px 14px 12px" }}>
                        {exCount === 0 ? (
                          <p style={{ fontSize: 12, color: "var(--sub)" }}>{t("alunosPage.noExercisesEdit")}</p>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            {w.exercises.map((ex, i) => (
                              <div key={i} style={{
                                display: "flex", justifyContent: "space-between", alignItems: "center",
                                padding: "6px 0",
                                borderBottom: i < exCount - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                              }}>
                                <span style={{ fontSize: 13, color: "var(--text)" }}>{locName(ex)}</span>
                                <span style={{ fontSize: 11, color: "var(--sub)", flexShrink: 0, marginLeft: 8 }}>
                                  {ex.sets}×{ex.reps}{ex.wt > 0 ? ` · ${ex.wt}kg` : ""}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <WorkoutModal
        open={wkModal}
        onClose={() => setWkModal(false)}
        uid={uid}
        initial={wkEditing}
        allExercises={exercises}
        onSaved={refreshWorkouts}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("alunosPage.removeWorkoutTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("alunosPage.removeWorkoutDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteWk} style={{ background: "var(--red)" }}>
              {t("alunosPage.remove")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function AlunosPage() {
  const { t } = useTranslation();
  const { role } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [statsMap, setStatsMap] = useState({});

  const [selected, setSelected] = useState(new Set());
  const [bulkConfirm, setBulkConfirm] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  const [novoOpen, setNovoOpen] = useState(false);
  const [detailUid, setDetailUid] = useState(null);
  const [detailName, setDetailName] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setSelected(new Set());
    getStudents()
      .then((list) => { setStudents(list); loadStats(list); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function loadStats(list) {
    const entries = await Promise.all(
      list.map(async (s) => {
        try { return [s.uid, await getStudentStats(s.uid)]; }
        catch { return [s.uid, null]; }
      })
    );
    setStatsMap(Object.fromEntries(entries));
  }

  useEffect(() => { load(); }, [load]);

  const filtered = students.filter((s) => {
    const st = statsMap[s.uid];
    const status = st?.status ?? (s.active === false ? "blocked" : "inactive");
    if (statusFilter !== "todos" && status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q);
    }
    return true;
  });

  function toggleSelect(uid) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid); else next.add(uid);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((s) => s.uid)));
  }

  async function executeBulk() {
    if (!bulkConfirm) return;
    setBulkLoading(true);
    try {
      const { action, uids } = bulkConfirm;
      if (action === "delete") {
        await Promise.all(uids.map((uid) => deleteStudent(uid)));
      } else {
        const blockedUids = new Set(students.filter((s) => s.active === false).map((s) => s.uid));
        await Promise.all(uids.map((uid) => {
          const isBlocked = blockedUids.has(uid);
          if (action === "block" && !isBlocked) return toggleBlock(uid);
          if (action === "unblock" && isBlocked) return toggleBlock(uid);
          return Promise.resolve();
        }));
      }
    } finally {
      setBulkLoading(false);
      setBulkConfirm(null);
      load();
    }
  }

  const bulkLabels = {
    block:   { title: t("alunosPage.bulkBlockTitle"),   desc: (n) => t("alunosPage.bulkBlockDesc", { n }),   action: t("common.block"),   danger: true  },
    unblock: { title: t("alunosPage.bulkUnblockTitle"), desc: (n) => t("alunosPage.bulkUnblockDesc", { n }), action: t("common.unblock"), danger: false },
    delete:  { title: t("alunosPage.bulkDeleteTitle"),  desc: (n) => t("alunosPage.bulkDeleteDesc", { n }),  action: t("common.delete"),  danger: true  },
  };

  if (loading) return <Spinner />;
  if (error) return <div style={{ padding: 24, color: "var(--red)", fontSize: 13 }}>{error}</div>;

  const nSelected = selected.size;
  const allSelected = nSelected > 0 && nSelected === filtered.length;
  const someSelected = nSelected > 0 && nSelected < filtered.length;

  return (
    <div style={{ padding: "20px 16px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)" }}>{t("alunosPage.title")}</h1>
        <Button size="sm" onClick={() => setNovoOpen(true)}>
          <Plus size={15} /> {t("alunosPage.newStudent")}
        </Button>
      </div>

      <div style={{ position: "relative", marginBottom: 12 }}>
        <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--sub)", zIndex: 1 }} />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("alunosPage.searchPlaceholder")}
          style={{
            paddingLeft: 36,
            background: "var(--bg2)", border: "1px solid var(--blue)",
            color: "var(--text)", fontSize: 14,
          }}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
        {STATUS_FILTERS.map((f) => (
          <button key={f} onClick={() => setStatusFilter(f)} style={{
            padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer",
            fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
            background: statusFilter === f ? "var(--acc)" : "var(--bg3)",
            color: statusFilter === f ? "#000" : "var(--sub)",
          }}>
            {{
              todos: t("alunosPage.all"),
              active: t("common.active"),
              warning: t("common.attention"),
              inactive: t("common.inactive"),
              blocked: t("common.blocked"),
            }[f]}
          </button>
        ))}

        <div style={{ marginLeft: "auto", flexShrink: 0 }}>
          <DropdownMenu>
            <DropdownMenuTrigger
              disabled={nSelected === 0}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "6px 12px", borderRadius: 20, border: "1px solid",
                borderColor: nSelected > 0 ? "var(--blue2)" : "var(--blue)",
                background: nSelected > 0 ? "var(--blue2)" : "var(--bg3)",
                color: nSelected > 0 ? "var(--text)" : "var(--sub)",
                fontSize: 12, fontWeight: 600, cursor: nSelected > 0 ? "pointer" : "default",
                opacity: nSelected === 0 ? 0.45 : 1,
                transition: "background .15s, border-color .15s",
              }}
            >
              {t("alunosPage.actions")}
              {nSelected > 0 && (
                <span style={{
                  background: "rgba(255,255,255,0.15)", borderRadius: 10,
                  padding: "1px 6px", fontSize: 11, fontWeight: 700,
                }}>{nSelected}</span>
              )}
              <ChevronDown size={13} />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              style={{
                background: "var(--bg2)",
                border: "1px solid var(--blue)",
                borderRadius: 10,
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                padding: "4px",
                minWidth: 200,
              }}
            >
              <DropdownMenuItem
                onClick={() => setBulkConfirm({ action: "block", uids: [...selected] })}
                style={{ color: "var(--text)", borderRadius: 7, padding: "8px 12px", cursor: "pointer" }}
              >
                <Lock size={13} style={{ color: "var(--acc)" }} /> {t("common.block")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setBulkConfirm({ action: "unblock", uids: [...selected] })}
                style={{ color: "var(--text)", borderRadius: 7, padding: "8px 12px", cursor: "pointer" }}
              >
                <KeyRound size={13} style={{ color: "var(--green)" }} /> {t("common.unblock")}
              </DropdownMenuItem>
              {role === "admin" && (
                <>
                  <DropdownMenuSeparator style={{ background: "var(--blue)", margin: "4px 0" }} />
                  <DropdownMenuItem
                    onClick={() => setBulkConfirm({ action: "delete", uids: [...selected] })}
                    style={{ color: "var(--red)", borderRadius: 7, padding: "8px 12px", cursor: "pointer" }}
                  >
                    <Trash2 size={13} /> {t("common.delete")}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--sub)" }}>{t("alunosPage.noStudents")}</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "4px 14px" }}>
            <button
              onClick={toggleAll}
              aria-label={allSelected ? "Desmarcar todos" : "Selecionar todos"}
              style={{
                width: 18, height: 18, borderRadius: 5, border: "2px solid",
                borderColor: allSelected || someSelected ? "var(--blue2)" : "var(--sub)",
                background: allSelected ? "var(--blue2)" : someSelected ? "var(--blue)" : "transparent",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {(allSelected || someSelected) && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  {allSelected
                    ? <polyline points="1.5,5 4,7.5 8.5,2.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    : <line x1="2" y1="5" x2="8" y2="5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                  }
                </svg>
              )}
            </button>
            <span style={{ fontSize: 11, color: "var(--sub)" }}>
              {nSelected > 0 ? t("alunosPage.selectedCount", { n: nSelected }) : t("alunosPage.selectAll")}
            </span>
          </div>

          {filtered.map((s) => {
            const st = statsMap[s.uid];
            const status = st?.status ?? (s.active === false ? "blocked" : "inactive");
            const isSelected = selected.has(s.uid);
            return (
              <div key={s.uid} style={{
                background: isSelected ? "rgba(35,82,200,0.15)" : "var(--bg2)",
                border: `1px solid ${isSelected ? "var(--blue2)" : "var(--blue)"}`,
                borderRadius: 10, padding: "12px 14px",
                display: "flex", alignItems: "center", gap: 12,
                transition: "background .15s, border-color .15s",
              }}>
                <button
                  onClick={() => toggleSelect(s.uid)}
                  aria-label={isSelected ? `Desmarcar ${s.name}` : `Selecionar ${s.name}`}
                  style={{
                    width: 18, height: 18, borderRadius: 5, border: "2px solid",
                    borderColor: isSelected ? "var(--blue2)" : "var(--sub)",
                    background: isSelected ? "var(--blue2)" : "transparent",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, transition: "background .15s, border-color .15s",
                  }}
                >
                  {isSelected && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <polyline points="1.5,5 4,7.5 8.5,2.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>

                <UserAvatar name={s.name} photoURL={s.photoURL} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {s.name}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--sub)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {s.email}
                  </p>
                </div>

                <div style={{ display: "flex", gap: 16, alignItems: "center" }} className="hidden sm:flex">
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{st?.weekSessions ?? "—"}</p>
                    <p style={{ fontSize: 10, color: "var(--sub)" }}>{t("alunosPage.sessPerWeek")}</p>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{st?.avgRpe != null ? st.avgRpe.toFixed(1) : "—"}</p>
                    <p style={{ fontSize: 10, color: "var(--sub)" }}>RPE</p>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{st?.cycles ?? "—"}</p>
                    <p style={{ fontSize: 10, color: "var(--sub)" }}>loops</p>
                  </div>
                </div>

                <StatusBadge status={status} />

                <button
                  onClick={() => { setDetailUid(s.uid); setDetailName(s.name); }}
                  aria-label={`Ver detalhes de ${s.name}`}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--sub)", padding: 6 }}
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <NovoAlunoModal open={novoOpen} onClose={() => setNovoOpen(false)} onCreated={load} />

      <AlertDialog open={!!bulkConfirm} onOpenChange={(open) => !open && setBulkConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{bulkConfirm && bulkLabels[bulkConfirm.action].title}</AlertDialogTitle>
            <AlertDialogDescription>
              {bulkConfirm && bulkLabels[bulkConfirm.action].desc(bulkConfirm.uids.length)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkLoading}>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeBulk}
              disabled={bulkLoading}
              style={bulkConfirm && bulkLabels[bulkConfirm.action].danger ? { background: "var(--red)" } : {}}
            >
              {bulkLoading ? t("alunosPage.wait") : bulkConfirm && bulkLabels[bulkConfirm.action].action}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Student detail slide-over */}
      <Sheet open={!!detailUid} onOpenChange={(o) => !o && setDetailUid(null)}>
        <SheetContent side="right" style={{ maxWidth: 480, background: "var(--bg2)", borderLeft: "1px solid var(--blue)", padding: "24px 20px", overflowY: "auto" }}>
          <SheetHeader>
            <SheetTitle style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{detailName}</SheetTitle>
          </SheetHeader>
          <StudentDetail uid={detailUid} role={role} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
