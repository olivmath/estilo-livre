import { useState, useEffect, useRef, useCallback } from "react";
import { signOut } from "firebase/auth";
import { collection, query, getDocs, addDoc, doc, updateDoc, orderBy } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Dumbbell,
  History,
  User,
  Play,
  ChevronLeft,
  X,
  Plus,
  Clock,
} from "lucide-react";

export function StudentApp() {
  const { user, profile } = useAuth();
  const [tab, setTab] = useState("home"); // "home", "workouts", "history", "profile"
  const [workouts, setWorkouts] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active workout states
  const [activeWk, setActiveWk] = useState(null); // { id, label, name, color, exercises: [...], exIdx: 0, set: 0, start: 0, results: [], currentWeight: 0, exStart: 0 }
  const [restTime, setRestTime] = useState(null); // seconds
  const [showRpe, setShowRpe] = useState(false);
  const [rpeValue, setRpeValue] = useState(5);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState(null);

  // Detail & set weight modals
  const [selectedWk, setSelectedWk] = useState(null);
  const [editingEx, setEditingEx] = useState(null); // { wkId, exId, weight }
  const [exWeightInput, setExWeightInput] = useState(0);

  // Viewed past session
  const [viewingSession, setViewingSession] = useState(null);

  const timerRef = useRef(null);
  const restTimerRef = useRef(null);
  const [elapsedTime, setElapsedTime] = useState("00:00");

  // Load data from Firestore
  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const wksRef = collection(db, "users", user.uid, "workouts");
      const wksSnap = await getDocs(wksRef);
      const wksList = wksSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setWorkouts(wksList);

      const sessRef = collection(db, "users", user.uid, "sessions");
      const sessQuery = query(sessRef, orderBy("date", "desc"));
      const sessSnap = await getDocs(sessQuery);
      const sessList = sessSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setSessions(sessList);
    } catch (e) {
      console.error("Error loading data from Firestore: ", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Active workout timer
  useEffect(() => {
    if (activeWk && !showSummary) {
      timerRef.current = setInterval(() => {
        const sec = Math.floor((Date.now() - activeWk.start) / 1000);
        const m = String(Math.floor(sec / 60)).padStart(2, "0");
        const s = String(sec % 60).padStart(2, "0");
        setElapsedTime(`${m}:${s}`);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [activeWk, showSummary]);

  // Rest timer countdown
  useEffect(() => {
    if (restTime !== null && restTime > 0) {
      restTimerRef.current = setInterval(() => {
        setRestTime((prev) => {
          if (prev <= 1) {
            clearInterval(restTimerRef.current);
            beep();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(restTimerRef.current);
    }
    return () => clearInterval(restTimerRef.current);
  }, [restTime]);

  const beep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.frequency.value = 880;
      o.type = "sine";
      g.gain.setValueAtTime(0.3, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      o.start();
      o.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.error(e);
    }
  };

  // Cycle progress info
  const getCycleInfo = () => {
    if (!workouts.length) return { done: new Set(), next: null, pct: 0, cycles: 0 };
    const ids = workouts.map((w) => w.id);
    const sortedSess = [...sessions].sort((a, b) => a.date - b.date);
    let done = [];
    let cycles = 0;
    for (const s of sortedSess) {
      if (!ids.includes(s.wkId)) continue;
      done.push(s.wkId);
      if (ids.every((id) => done.includes(id))) {
        cycles++;
        done = [];
      }
    }
    const doneSet = new Set(done);
    const nextId = ids.find((id) => !doneSet.has(id)) || ids[0] || null;
    const pct = ids.length ? (doneSet.size / ids.length) * 100 : 0;
    return { done: doneSet, next: nextId, pct, cycles };
  };

  // Trend Chart points calculation
  const getTrendData = () => {
    const sortedSess = [...sessions].sort((a, b) => a.date - b.date).slice(-12);
    if (sortedSess.length < 2) return null;

    const pts = sortedSess.map((s) => {
      const exs = s.exs || [];
      return exs.length ? exs.reduce((acc, curr) => acc + (curr.diff || 5), 0) / exs.length : 5;
    });

    const W = 300;
    const H = 70;
    const PAD = 6;

    const svgPts = pts.map((v, i) => {
      const x = PAD + (pts.length === 1 ? W / 2 : (i / (pts.length - 1)) * (W - PAD * 2));
      const y = PAD + (1 - v / 10) * (H - PAD * 2);
      return { x, y, v };
    });

    const polyline = svgPts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
    const area = `${svgPts[0].x.toFixed(1)},${H} ` + polyline + ` ${svgPts[svgPts.length - 1].x.toFixed(1)},${H}`;

    const trend = pts[pts.length - 1] - pts[0];
    const trendColor = trend < -0.5 ? "var(--green)" : trend > 0.5 ? "var(--red)" : "var(--acc)";
    const trendLabel = trend < -0.5 ? "↓ Melhorando" : trend > 0.5 ? "↑ Ficando difícil" : "Estável";

    return { polyline, area, svgPts, trendColor, trendLabel, W, H, sessionsList: sortedSess };
  };

  // suggestions algorithm
  const getSuggestions = () => {
    const out = [];
    workouts.forEach((wk) => {
      const recent = sessions.filter((s) => s.wkId === wk.id).slice(0, 3);
      if (recent.length < 2) return;
      wk.exercises?.forEach((ex) => {
        const rows = recent.flatMap((s) => s.exs?.filter((e) => e.name === ex.name) || []);
        if (rows.length < 2) return;
        const avg = rows.reduce((acc, curr) => acc + curr.diff, 0) / rows.length;
        const lastWeight = rows[0]?.wt ?? ex.wt;
        if (avg <= 4) {
          out.push({
            wkName: wk.name,
            wkLabel: wk.label,
            name: ex.name,
            num: ex.num,
            cur: lastWeight,
            sug: +(lastWeight + 2.5).toFixed(1),
          });
        }
      });
    });
    return out;
  };

  // Workout controls
  const startWorkout = (wkId) => {
    const wk = workouts.find((w) => w.id === wkId);
    if (!wk?.exercises?.length) return alert("Este treino não possui exercícios cadastrados.");
    setActiveWk({
      id: wk.id,
      label: wk.label,
      name: wk.name,
      color: wk.color || "var(--acc)",
      exercises: wk.exercises.map((ex) => ({ ...ex })),
      exIdx: 0,
      set: 0,
      start: Date.now(),
      results: [],
      currentWeight: wk.exercises[0]?.wt || 0,
      exStart: Date.now(),
    });
    setRestTime(null);
    setShowRpe(false);
    setShowSummary(false);
    setElapsedTime("00:00");
  };

  const handleNextSet = () => {
    const ex = activeWk.exercises[activeWk.exIdx];
    const newSet = activeWk.set + 1;

    if (newSet >= ex.sets) {
      // Finished all sets for this exercise, show RPE difficulty screen
      setRpeValue(5);
      setShowRpe(true);
    } else {
      setActiveWk((prev) => ({ ...prev, set: newSet }));
      setRestTime(30); // 30s rest between sets
    }
  };

  const confirmRpe = () => {
    const ex = activeWk.exercises[activeWk.exIdx];
    const timeSpent = Math.floor((Date.now() - activeWk.exStart) / 1000);

    const resultItem = {
      exId: ex.id || uid(),
      num: ex.num || "",
      name: ex.name,
      mac: ex.mac || "",
      wt: activeWk.currentWeight,
      diff: rpeValue,
      sets: ex.sets,
      reps: ex.reps,
      time: timeSpent,
    };

    const updatedResults = [...activeWk.results, resultItem];
    const nextIdx = activeWk.exIdx + 1;

    setShowRpe(false);

    if (nextIdx >= activeWk.exercises.length) {
      // Completed all exercises, show summary report
      const sec = Math.floor((Date.now() - activeWk.start) / 1000);
      const pendingSess = {
        wkId: activeWk.id,
        wkLabel: activeWk.label,
        wkName: activeWk.name,
        wkColor: activeWk.color,
        date: Date.now(),
        dur: sec,
        exs: updatedResults,
      };
      setSummaryData(pendingSess);
      setShowSummary(true);
    } else {
      // Move to next exercise, trigger rest
      setActiveWk((prev) => ({
        ...prev,
        results: updatedResults,
        exIdx: nextIdx,
        set: 0,
        currentWeight: prev.exercises[nextIdx].wt || 0,
        exStart: Date.now(),
      }));
      setRestTime(45); // 45s rest between exercises
    }
  };

  const saveWorkoutSession = async () => {
    if (!summaryData) return;
    try {
      // 1. Add session to Firestore
      const sessRef = collection(db, "users", user.uid, "sessions");
      await addDoc(sessRef, summaryData);

      // 2. Update default weights in student's workouts in Firestore
      const wk = workouts.find((w) => w.id === summaryData.wkId);
      if (wk) {
        const updatedExs = wk.exercises.map((ex) => {
          const res = summaryData.exs.find((r) => r.name === ex.name);
          return res ? { ...ex, wt: res.wt } : ex;
        });

        const wkDocRef = doc(db, "users", user.uid, "workouts", summaryData.wkId);
        await updateDoc(wkDocRef, { exercises: updatedExs });
      }

      // 3. Reset states & reload data
      setActiveWk(null);
      setShowSummary(false);
      setSummaryData(null);
      await loadData();
      setTab("home");
    } catch (e) {
      console.error("Error saving session: ", e);
      alert("Erro ao salvar treino. Tente novamente.");
    }
  };

  const discardWorkout = () => {
    if (!confirm("Deseja descartar o treino atual? Suas alterações não serão salvas.")) return;
    setActiveWk(null);
    setShowSummary(false);
    setSummaryData(null);
  };

  // Adjust weight in active workout
  const adjustActiveWeight = (val) => {
    setActiveWk((prev) => ({
      ...prev,
      currentWeight: Math.max(0, parseFloat((prev.currentWeight + val).toFixed(1))),
    }));
  };

  // Update default weights on workouts list
  const openSetWeightModal = (wk, ex) => {
    setEditingEx({ wkId: wk.id, exId: ex.id, name: ex.name, currentWeight: ex.wt || 0 });
    setExWeightInput(ex.wt || 0);
  };

  const saveEditedWeight = async () => {
    if (!editingEx) return;
    try {
      const wk = workouts.find((w) => w.id === editingEx.wkId);
      if (wk) {
        const updatedExs = wk.exercises.map((ex) =>
          ex.id === editingEx.exId ? { ...ex, wt: parseFloat(exWeightInput) || 0 } : ex
        );
        const wkDocRef = doc(db, "users", user.uid, "workouts", editingEx.wkId);
        await updateDoc(wkDocRef, { exercises: updatedExs });
        setEditingEx(null);
        await loadData();
        // Update selected workout view if opened
        if (selectedWk && selectedWk.id === editingEx.wkId) {
          setSelectedWk((prev) => ({ ...prev, exercises: updatedExs }));
        }
      }
    } catch (e) {
      console.error("Error updating weight: ", e);
      alert("Erro ao salvar carga.");
    }
  };

  const uploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext("2d");
        const s = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 200, 200);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        try {
          const userDocRef = doc(db, "users", user.uid);
          await updateDoc(userDocRef, { photoURL: dataUrl });
          alert("Foto atualizada com sucesso!");
          await loadData();
          window.location.reload();
        } catch (err) {
          console.error(err);
          alert("Erro ao atualizar foto de perfil.");
        }
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const uid = () => Math.random().toString(36).slice(2, 10);

  const diffColor = (v) => {
    if (v <= 4) return "var(--green)";
    if (v <= 7) return "var(--acc)";
    return "var(--red)";
  };

  const initials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Helper formats
  const fmtDate = (timestamp) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  };

  const fmtDateFull = (timestamp) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" });
  };

  const fmtDur = (sec) => {
    const m = Math.floor(sec / 60);
    return `${m} min`;
  };

  const fmtVol = (vol) => {
    return vol >= 1000 ? `${(vol / 1000).toFixed(1)}t` : `${vol}kg`;
  };

  const cycleInfoObj = getCycleInfo();

  // If a workout session is active
  if (activeWk) {
    const ex = activeWk.exercises[activeWk.exIdx];
    const nextEx = activeWk.exercises[activeWk.exIdx + 1];

    return (
      <div style={styles.activePage}>
        {/* Rest Overlay */}
        {restTime !== null && (
          <div style={styles.overlay}>
            <div style={styles.overlayContent}>
              <p style={{ color: "var(--sub)", fontSize: 13, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>Descanso</p>
              <h2 style={{ fontSize: 72, fontWeight: 900, color: "var(--acc)", lineHeight: 1 }}>{restTime}s</h2>
              <p style={{ color: "var(--text)", fontSize: 14, marginTop: 12, opacity: 0.8 }}>Relaxe e prepare-se.</p>
              <button onClick={() => setRestTime(null)} style={styles.btnSecondary} className="mt-8">
                Pular descanso
              </button>
            </div>
          </div>
        )}

        {/* Rpe Overlay */}
        {showRpe && (
          <div style={styles.overlay}>
            <div style={styles.overlayContentCard}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>Avalie a Dificuldade</h3>
              <p style={{ fontSize: 13, color: "var(--sub)", marginBottom: 20 }}>
                Como foi a execução de <b>{ex.name}</b>?
              </p>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
                <span style={{ fontSize: 48, fontWeight: 900, color: diffColor(rpeValue), lineHeight: 1 }}>
                  {rpeValue}
                </span>
                <span style={{ fontSize: 13, color: "var(--sub)", marginTop: 4 }}>
                  {rpeValue <= 4 ? "Fácil / Leve" : rpeValue <= 7 ? "Moderado / Ideal" : "Muito Difícil / Limite"}
                </span>
              </div>

              <input
                type="range"
                min="1"
                max="10"
                value={rpeValue}
                onChange={(e) => setRpeValue(parseInt(e.target.value))}
                style={{
                  width: "100%",
                  accentColor: diffColor(rpeValue),
                  marginBottom: 32,
                  cursor: "pointer",
                }}
              />

              <button
                onClick={confirmRpe}
                style={{
                  width: "100%",
                  padding: 16,
                  borderRadius: 12,
                  background: diffColor(rpeValue),
                  color: "#000",
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: "pointer",
                }}
              >
                Confirmar Dificuldade
              </button>
            </div>
          </div>
        )}

        {/* Summary Overlay */}
        {showSummary && summaryData && (
          <div style={{ ...styles.overlay, overflowY: "auto" }}>
            <div style={styles.summaryCard}>
              <div style={{ ...styles.summaryHdr, borderBottom: `3px solid ${summaryData.wkColor}` }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: summaryData.wkColor, letterSpacing: 2 }}>TREINO CONCLUÍDO</span>
                <h2 style={{ fontSize: 26, fontWeight: 850, marginTop: 4 }}>Treino {summaryData.wkLabel}</h2>
                <p style={{ color: "var(--sub)", fontSize: 14 }}>{summaryData.wkName}</p>
              </div>

              <div style={styles.summaryStats}>
                <div style={styles.summaryStatItem}>
                  <span style={{ fontSize: 22, fontWeight: 800, color: "var(--acc)" }}>{elapsedTime}</span>
                  <span style={{ fontSize: 11, color: "var(--sub)" }}>Duração</span>
                </div>
                <div style={styles.summaryStatItem}>
                  <span style={{ fontSize: 22, fontWeight: 800, color: "var(--acc)" }}>
                    {fmtVol(summaryData.exs.reduce((a, r) => a + r.wt * r.sets * r.reps, 0))}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--sub)" }}>Volume total</span>
                </div>
                <div style={styles.summaryStatItem}>
                  <span style={{
                    fontSize: 22, fontWeight: 800,
                    color: diffColor(parseFloat(summaryData.exs.length ? (summaryData.exs.reduce((a, r) => a + r.diff, 0) / summaryData.exs.length) : 5))
                  }}>
                    {(summaryData.exs.length ? (summaryData.exs.reduce((a, r) => a + r.diff, 0) / summaryData.exs.length).toFixed(1) : "—")}/10
                  </span>
                  <span style={{ fontSize: 11, color: "var(--sub)" }}>Dificuldade média</span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
                {summaryData.exs.map((res, i) => (
                  <div key={i} style={styles.summaryExCard}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      {res.num && <span style={{ ...styles.badgeNum, background: summaryData.wkColor }}>{res.num}</span>}
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{res.name}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: "var(--sub)" }}>
                        {res.sets} séries × {res.reps} reps · <b>{res.wt}kg</b>
                      </span>
                      <span style={{ color: diffColor(res.diff), fontWeight: 700, fontSize: 13 }}>
                        RPE {res.diff}/10
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={discardWorkout} style={{ ...styles.btnSecondary, flex: 1 }}>Descartar</button>
                <button onClick={saveWorkoutSession} style={{ ...styles.btnPrimary, flex: 2 }}>Salvar Treino</button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div style={styles.activeHdr}>
          <div>
            <span style={{ fontSize: 11, color: "var(--sub)", textTransform: "uppercase", letterSpacing: 1.5 }}>
              Treino {activeWk.label}
            </span>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>{activeWk.name}</h2>
          </div>
          <button onClick={discardWorkout} style={styles.btnClose}>
            <X size={18} />
          </button>
        </div>

        {/* Timer */}
        <div style={styles.timerBox}>
          <h1 style={{ fontSize: 40, fontWeight: 900, color: "var(--text)", lineHeight: 1 }}>{elapsedTime}</h1>
          <span style={{ fontSize: 11, color: "var(--sub)", textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>tempo ativo</span>
        </div>

        {/* Central Card */}
        <div style={styles.activeCard}>
          {/* Badges */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            {ex.num && <span style={{ ...styles.badgeNum, background: activeWk.color }}>{ex.num}</span>}
            {ex.mac && <span style={styles.badgeMachine}>Máq. {ex.mac}</span>}
            {ex.obs && <span style={styles.badgeObs}>{ex.obs}</span>}
          </div>

          <h3 style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", marginBottom: 20 }}>{ex.name}</h3>

          {/* Weight Adjuster */}
          <div style={styles.weightSelector}>
            <div style={styles.weightBox}>
              <h2 style={{ fontSize: 44, fontWeight: 900, color: "var(--acc)", lineHeight: 1 }}>{activeWk.currentWeight}</h2>
              <span style={{ fontSize: 12, color: "var(--sub)", marginTop: 2 }}>kg · carga atual</span>
              <div style={styles.weightAdjustBtns}>
                <button onClick={() => adjustActiveWeight(-2.5)} style={styles.adjBtn}>−</button>
                <button onClick={() => adjustActiveWeight(2.5)} style={styles.adjBtn}>+</button>
              </div>
            </div>
            <div style={styles.repsBox}>
              <h2 style={{ fontSize: 44, fontWeight: 900, color: "var(--text)", lineHeight: 1 }}>{ex.reps}</h2>
              <span style={{ fontSize: 12, color: "var(--sub)", marginTop: 2 }}>repetições meta</span>
            </div>
          </div>

          {/* Set Status */}
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 13, color: "var(--sub)" }}>
              Série <b>{activeWk.set + 1}</b> de {ex.sets}
            </span>
          </div>

          {/* Progress dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 8 }}>
            {Array.from({ length: ex.sets }).map((_, i) => {
              const bg = i < activeWk.set ? "var(--green)" : i === activeWk.set ? "var(--acc)" : "var(--bg3)";
              return (
                <div
                  key={i}
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: bg,
                    transition: "background 0.3s",
                    boxShadow: i === activeWk.set ? "0 0 8px var(--acc)" : "none",
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Primary Action Button */}
        <div style={{ padding: "20px 16px" }}>
          <button
            onClick={handleNextSet}
            style={{
              ...styles.btnPrimary,
              width: "100%",
              padding: 16,
              fontSize: 16,
              boxShadow: "0 4px 16px rgba(245,196,0,0.3)",
            }}
          >
            Concluir Série
          </button>
        </div>

        {/* Next exercise preview */}
        <div style={{ padding: "0 16px", textAlign: "center" }}>
          {nextEx ? (
            <p style={{ fontSize: 12, color: "var(--sub)" }}>
              Próximo: <b>{nextEx.num ? nextEx.num + " · " : ""}{nextEx.name}</b> · {nextEx.wt}kg
            </p>
          ) : (
            <p style={{ fontSize: 12, color: "var(--green)", fontWeight: 600 }}>
              ✓ Último exercício do treino!
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.mobileContainer}>
      {/* ── EDIT WEIGHT SUB-MODAL ── */}
      {editingEx && (
        <div style={styles.subOverlay}>
          <div style={styles.subModal}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700 }}>Ajustar Carga</h4>
              <button onClick={() => setEditingEx(null)} style={{ background: "none", border: "none", color: "var(--sub)", cursor: "pointer" }}>✕</button>
            </div>
            <p style={{ fontSize: 12, color: "var(--sub)", marginBottom: 16 }}>Defina a carga padrão de: <br /><b>{editingEx.name}</b></p>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <input
                type="number"
                value={exWeightInput}
                step="2.5"
                min="0"
                onChange={(e) => setExWeightInput(e.target.value)}
                style={styles.modalWeightInput}
              />
              <span style={{ color: "var(--text)", fontWeight: 700 }}>kg</span>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setEditingEx(null)} style={{ ...styles.btnSecondary, padding: "8px 16px", flex: 1, fontSize: 13 }}>Cancelar</button>
              <button onClick={saveEditedWeight} style={{ ...styles.btnPrimary, padding: "8px 16px", flex: 1, fontSize: 13 }}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── WORKOUT DETAIL OVERLAY ── */}
      {selectedWk && (
        <div style={{ ...styles.overlay, overflowY: "auto", display: "block" }}>
          <div style={{ ...styles.mobileContainer, minHeight: "100vh", background: "var(--bg)", padding: 16 }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <button onClick={() => setSelectedWk(null)} style={styles.btnBack}>
                <ChevronLeft size={20} /> Voltar
              </button>
            </div>

            <div style={{ ...styles.detailHeaderBox, borderLeft: `4px solid ${selectedWk.color || "var(--acc)"}` }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)" }}>Treino {selectedWk.label}</h2>
              <p style={{ color: "var(--sub)", fontSize: 14, marginTop: 2 }}>{selectedWk.name}</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
              {selectedWk.exercises?.map((ex, i) => (
                <div key={i} style={styles.exListItem} onClick={() => openSetWeightModal(selectedWk, ex)}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      {ex.num && <span style={{ ...styles.badgeNum, background: selectedWk.color }}>{ex.num}</span>}
                      {ex.mac && <span style={styles.badgeMachine}>Máq. {ex.mac}</span>}
                    </div>
                    <span style={{ fontWeight: 600, color: "var(--text)" }}>{ex.name}</span>
                    <span style={{ fontSize: 12, color: "var(--sub)" }}>{ex.sets} × {ex.reps} repetições</span>
                    {ex.obs && <span style={{ fontSize: 11, color: "var(--sub)", fontStyle: "italic" }}>{ex.obs}</span>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: "var(--acc)" }}>{ex.wt || 0}</span>
                    <span style={{ fontSize: 10, color: "var(--sub)" }}>kg</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setSelectedWk(null);
                startWorkout(selectedWk.id);
              }}
              style={{ ...styles.btnPrimary, width: "100%", padding: 16 }}
            >
              Iniciar Treino
            </button>
          </div>
        </div>
      )}

      {/* ── SESSION REPORT OVERLAY ── */}
      {viewingSession && (
        <div style={{ ...styles.overlay, overflowY: "auto" }}>
          <div style={styles.summaryCard}>
            <div style={{ ...styles.summaryHdr, borderBottom: `3px solid ${viewingSession.wkColor}` }}>
              <button onClick={() => setViewingSession(null)} style={styles.btnCloseReport}>✕</button>
              <span style={{ fontSize: 10, fontWeight: 700, color: viewingSession.wkColor, letterSpacing: 2 }}>TREINO REALIZADO</span>
              <h2 style={{ fontSize: 26, fontWeight: 850, marginTop: 4 }}>Treino {viewingSession.wkLabel}</h2>
              <p style={{ color: "var(--sub)", fontSize: 14 }}>{viewingSession.wkName}</p>
              <p style={{ color: "var(--sub)", fontSize: 12, marginTop: 4 }}>{fmtDateFull(viewingSession.date)}</p>
            </div>

            <div style={styles.summaryStats}>
              <div style={styles.summaryStatItem}>
                <span style={{ fontSize: 22, fontWeight: 800, color: viewingSession.wkColor }}>{fmtDur(viewingSession.dur)}</span>
                <span style={{ fontSize: 11, color: "var(--sub)" }}>Duração</span>
              </div>
              <div style={styles.summaryStatItem}>
                <span style={{ fontSize: 22, fontWeight: 800, color: viewingSession.wkColor }}>
                  {fmtVol(viewingSession.exs?.reduce((a, r) => a + r.wt * r.sets * r.reps, 0) || 0)}
                </span>
                <span style={{ fontSize: 11, color: "var(--sub)" }}>Volume</span>
              </div>
              <div style={styles.summaryStatItem}>
                <span style={{
                  fontSize: 22, fontWeight: 800,
                  color: diffColor(parseFloat(viewingSession.exs?.length ? (viewingSession.exs.reduce((a, r) => a + r.diff, 0) / viewingSession.exs.length) : 5))
                }}>
                  {(viewingSession.exs?.length ? (viewingSession.exs.reduce((a, r) => a + r.diff, 0) / viewingSession.exs.length).toFixed(1) : "—")}/10
                </span>
                <span style={{ fontSize: 11, color: "var(--sub)" }}>Dif. média</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              {viewingSession.exs?.map((res, i) => (
                <div key={i} style={styles.summaryExCard}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    {res.num && <span style={{ ...styles.badgeNum, background: viewingSession.wkColor }}>{res.num}</span>}
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{res.name}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "var(--sub)" }}>
                      {res.sets} séries × {res.reps} reps · <b>{res.wt}kg</b>
                    </span>
                    <span style={{ color: diffColor(res.diff), fontWeight: 700, fontSize: 13 }}>
                      RPE {res.diff}/10
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => setViewingSession(null)} style={{ ...styles.btnSecondary, width: "100%" }}>Fechar</button>
          </div>
        </div>
      )}

      {/* ── TAB CONTENT ── */}
      {loading ? (
        <div style={styles.loadingScreen}>
          <div style={styles.spinner} />
          <p style={{ color: "var(--sub)", fontSize: 14 }}>Carregando dados do aluno…</p>
        </div>
      ) : (
        <div style={{ paddingBottom: 80 }}>
          {/* TAB 1: HOME */}
          {tab === "home" && (
            <div>
              {/* Profile Header Banner */}
              <div style={styles.homeHdr}>
                <div>
                  <span style={{ fontSize: 10, color: "var(--acc)", fontWeight: 700, letterSpacing: 2 }}>FITTRACK · ACADEMIA ESTILO LIVRE</span>
                  <h2 style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>
                    Bom treino, {profile?.name?.split(" ")[0] ?? "Atleta"} 👋
                  </h2>
                </div>
                {profile?.photoURL ? (
                  <img
                    src={profile.photoURL}
                    onClick={() => setTab("profile")}
                    style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover", border: "1px solid var(--blue)", cursor: "pointer" }}
                  />
                ) : (
                  <div onClick={() => setTab("profile")} style={styles.avatarHeader}>
                    {initials(profile?.name)}
                  </div>
                )}
              </div>

              {/* Next Workout Recommendation Banner */}
              {workouts.length > 0 ? (
                (() => {
                  const nextWk = workouts.find((w) => w.id === cycleInfoObj.next) || workouts[0];
                  return (
                    <div
                      onClick={() => startWorkout(nextWk.id)}
                      style={{
                        ...styles.nextWkBanner,
                        background: `linear-gradient(135deg, ${nextWk.color || "var(--blue)"}dd, ${nextWk.color || "var(--blue)"}88)`,
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, opacity: 0.85 }}>PRÓXIMO TREINO DO CICLO</span>
                        <h3 style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>Treino {nextWk.label} - {nextWk.name}</h3>
                        <p style={{ fontSize: 13, marginTop: 4, opacity: 0.8 }}>{nextWk.exercises?.length || 0} exercícios cadastrados</p>
                      </div>
                      <div style={styles.playIconContainer}>
                        <Play size={20} fill="#000" stroke="#000" />
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div style={styles.cardEmpty}>
                  <p>Sem treinos atribuídos pelo professor. Fale com seu instrutor.</p>
                </div>
              )}

              {/* Cycle Tracker Card */}
              {workouts.length > 0 && (
                <div style={styles.dashboardCard}>
                  <h4 style={styles.cardTitle}>Ciclo de Treino Atual</h4>
                  <div style={styles.cycleDotsWrap}>
                    {workouts.map((w, i) => {
                      const isDone = cycleInfoObj.done.has(w.id);
                      const isNext = w.id === cycleInfoObj.next;
                      return (
                        <div
                          key={i}
                          style={{
                            ...styles.cycleDot,
                            background: isDone ? "var(--green)" : isNext ? w.color : "var(--bg3)",
                            border: isNext ? `2.5px solid ${w.color}` : "none",
                            boxShadow: isNext ? `0 0 10px ${w.color}88` : "none",
                            color: isDone || isNext ? "#fff" : "var(--sub)",
                          }}
                        >
                          {isDone ? "✓" : w.label}
                        </div>
                      );
                    })}
                  </div>
                  <div style={styles.progressBarWrap}>
                    <div style={{ ...styles.progressBarFill, width: `${cycleInfoObj.pct}%` }} />
                  </div>
                  <p style={{ fontSize: 12, color: "var(--sub)", textAlign: "center", marginTop: 8 }}>
                    {cycleInfoObj.pct === 100
                      ? "🎉 Todo o ciclo concluído! Parabéns."
                      : `${Math.round(cycleInfoObj.pct)}% concluído · Faltam ${workouts.length - cycleInfoObj.done.size} treinos`}
                  </p>
                </div>
              )}

              {/* SVG Trend Chart */}
              {(() => {
                const chart = getTrendData();
                if (!chart) return null;
                return (
                  <div style={styles.dashboardCard}>
                    <h4 style={styles.cardTitle}>Tendência de Dificuldade (RPE)</h4>
                    <div style={{ position: "relative" }}>
                      <svg width="100%" height={chart.H} viewBox={`0 0 ${chart.W} ${chart.H}`} style={{ display: "block" }}>
                        <defs>
                          <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={chart.trendColor} stopOpacity={0.25} />
                            <stop offset="100%" stopColor={chart.trendColor} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <polygon points={chart.area} fill="url(#tg)" />
                        <polyline
                          points={chart.polyline}
                          fill="none"
                          stroke={chart.trendColor}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {chart.svgPts.map((p, idx) => (
                          <circle key={idx} cx={p.x} cy={p.y} r="3" fill={chart.trendColor} />
                        ))}
                      </svg>
                      <div style={{ position: "absolute", top: -4, right: 0, fontSize: 11, color: chart.trendColor, fontWeight: 700 }}>
                        {chart.trendLabel}
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--sub)", marginTop: 8 }}>
                      <span>{fmtDate(chart.sessionsList[0].date)}</span>
                      <span>menor RPE = treino rendendo mais</span>
                      <span>{fmtDate(chart.sessionsList[chart.sessionsList.length - 1].date)}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Load Progression Suggestions */}
              {(() => {
                const sugs = getSuggestions();
                if (!sugs.length) return null;
                return (
                  <div style={styles.sugCard}>
                    <h4 style={{ ...styles.cardTitle, color: "var(--acc)", display: "flex", gap: 6, alignItems: "center" }}>
                      💡 Sugestões de Progressão
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
                      {sugs.map((s, idx) => (
                        <div key={idx} style={styles.sugRow}>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</span>
                            <span style={{ fontSize: 11, color: "var(--sub)" }}>Treino {s.wkLabel} · {s.wkName}</span>
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 700 }}>
                            {s.cur}kg → <span style={{ color: "var(--green)" }}>{s.sug}kg</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 2: TREINOS */}
          {tab === "workouts" && (
            <div>
              <h2 style={styles.pageTitle}>Meus Treinos</h2>
              {workouts.length > 0 && (
                <div style={{ ...styles.dashboardCard, padding: 12 }}>
                  <h4 style={{ ...styles.cardTitle, fontSize: 13, marginBottom: 8 }}>Ciclo atual</h4>
                  <div style={{ ...styles.cycleDotsWrap, justifyContent: "flex-start", gap: 6 }}>
                    {workouts.map((w, idx) => (
                      <div
                        key={idx}
                        style={{
                          ...styles.cycleDot,
                          width: 32,
                          height: 32,
                          fontSize: 11,
                          background: cycleInfoObj.done.has(w.id) ? "var(--green)" : w.id === cycleInfoObj.next ? w.color : "var(--bg3)",
                          color: "#fff",
                        }}
                      >
                        {cycleInfoObj.done.has(w.id) ? "✓" : w.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
                {workouts.map((w, idx) => {
                  const isDone = cycleInfoObj.done.has(w.id);
                  return (
                    <div key={idx} style={styles.wkListItem} onClick={() => setSelectedWk(w)}>
                      <div style={{ ...styles.wkBadgeIcon, background: isDone ? "var(--green)" : w.color || "var(--acc)" }}>
                        {isDone ? "✓" : w.label}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontWeight: 700, fontSize: 15, color: "var(--text)" }}>Treino {w.label} - {w.name}</h4>
                        <span style={{ fontSize: 12, color: "var(--sub)" }}>
                          {w.exercises?.length || 0} exercícios {w.id === cycleInfoObj.next ? "· Próximo" : ""}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startWorkout(w.id);
                        }}
                        style={styles.btnStartWk}
                      >
                        <Play size={14} fill="currentColor" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: HISTÓRICO */}
          {tab === "history" && (
            <div>
              <h2 style={styles.pageTitle}>Histórico de Treinos</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
                {sessions.length > 0 ? (
                  sessions.map((sess, idx) => {
                    const avgRpe = sess.exs?.length
                      ? (sess.exs.reduce((a, r) => a + r.diff, 0) / sess.exs.length).toFixed(1)
                      : "—";
                    return (
                      <div key={idx} style={styles.historyCard} onClick={() => setViewingSession(sess)}>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: 11, color: "var(--sub)" }}>{fmtDateFull(sess.date)}</span>
                          <h4 style={{ fontWeight: 700, fontSize: 15, marginTop: 2 }}>
                            Treino {sess.wkLabel} — {sess.wkName}
                          </h4>
                          <span style={{ fontSize: 12, color: "var(--sub)", display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                            <Clock size={12} /> {fmtDur(sess.dur)}
                          </span>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontSize: 20, fontWeight: 900, color: diffColor(parseFloat(avgRpe)) }}>
                            {avgRpe}
                          </span>
                          <p style={{ fontSize: 10, color: "var(--sub)", marginTop: 2 }}>dif. média</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={styles.cardEmpty}>
                    <p>Nenhum treino realizado ainda. Seus treinos salvos aparecerão aqui!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: PERFIL */}
          {tab === "profile" && (
            <div>
              <h2 style={styles.pageTitle}>Meu Perfil</h2>
              <div style={styles.profileCard}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <div style={{ position: "relative" }}>
                    {profile?.photoURL ? (
                      <img
                        src={profile.photoURL}
                        style={{ width: 88, height: 88, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--acc)" }}
                      />
                    ) : (
                      <div style={styles.avatarProfile}>
                        {initials(profile?.name)}
                      </div>
                    )}
                    <label style={styles.btnUploadPhoto}>
                      <Plus size={16} />
                      <input type="file" accept="image/*" onChange={uploadPhoto} style={{ display: "none" }} />
                    </label>
                  </div>

                  <h3 style={{ fontSize: 18, fontWeight: 800 }}>{profile?.name}</h3>
                  <span style={{ fontSize: 13, color: "var(--sub)" }}>{profile?.email}</span>
                  <span style={styles.badgeProfileRole}>Aluno FitTrack</span>
                </div>

                <div style={styles.profileStatsBox}>
                  <div style={{ flex: 1, textAlign: "center", borderRight: "1px solid var(--blue)" }}>
                    <h3 style={{ fontSize: 24, fontWeight: 900, color: "var(--acc)" }}>{sessions.length}</h3>
                    <span style={{ fontSize: 11, color: "var(--sub)" }}>Sessões completas</span>
                  </div>
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <h3 style={{ fontSize: 24, fontWeight: 900, color: "var(--acc)" }}>{cycleInfoObj.cycles}</h3>
                    <span style={{ fontSize: 11, color: "var(--sub)" }}>Ciclos terminados</span>
                  </div>
                </div>

                <button onClick={() => signOut(auth)} style={styles.btnSignout} className="mt-8">
                  Sair do Aplicativo
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── BOTTOM NAV BAR ── */}
      <nav style={styles.bottomNav}>
        <button
          onClick={() => {
            setSelectedWk(null);
            setTab("home");
          }}
          style={{ ...styles.navItem, color: tab === "home" ? "var(--acc)" : "var(--sub)" }}
        >
          <LayoutDashboard size={20} />
          <span>Início</span>
        </button>
        <button
          onClick={() => {
            setSelectedWk(null);
            setTab("workouts");
          }}
          style={{ ...styles.navItem, color: tab === "workouts" ? "var(--acc)" : "var(--sub)" }}
        >
          <Dumbbell size={20} />
          <span>Treinos</span>
        </button>
        <button
          onClick={() => {
            setSelectedWk(null);
            setTab("history");
          }}
          style={{ ...styles.navItem, color: tab === "history" ? "var(--acc)" : "var(--sub)" }}
        >
          <History size={20} />
          <span>Histórico</span>
        </button>
        <button
          onClick={() => {
            setSelectedWk(null);
            setTab("profile");
          }}
          style={{ ...styles.navItem, color: tab === "profile" ? "var(--acc)" : "var(--sub)" }}
        >
          <User size={20} />
          <span>Perfil</span>
        </button>
      </nav>
    </div>
  );
}

const styles = {
  mobileContainer: {
    width: "100%",
    maxWidth: 430,
    margin: "0 auto",
    padding: "16px 16px 80px",
    minHeight: "100vh",
    background: "var(--bg)",
    color: "var(--text)",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    position: "relative",
  },
  loadingScreen: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "80vh",
    gap: 16,
  },
  spinner: {
    width: 32,
    height: 32,
    border: "3px solid var(--bg3)",
    borderTopColor: "var(--acc)",
    borderRadius: "50%",
    animation: "spin .8s linear infinite",
  },
  homeHdr: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 32,
    marginBottom: 24,
  },
  avatarHeader: {
    width: 44,
    height: 44,
    borderRadius: 10,
    background: "var(--blue)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    fontWeight: 700,
    color: "var(--acc)",
    border: "1px solid var(--blue)",
    cursor: "pointer",
  },
  nextWkBanner: {
    padding: 20,
    borderRadius: 16,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    cursor: "pointer",
    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
    transition: "transform 0.15s ease",
  },
  playIconContainer: {
    width: 42,
    height: 42,
    borderRadius: "50%",
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#000",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
  },
  dashboardCard: {
    background: "var(--bg2)",
    border: "1px solid var(--blue)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "var(--text)",
    marginBottom: 16,
  },
  cycleDotsWrap: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cycleDot: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 700,
    transition: "all 0.25s ease",
  },
  progressBarWrap: {
    width: "100%",
    height: 6,
    background: "var(--bg3)",
    borderRadius: 99,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    background: "var(--acc)",
    borderRadius: 99,
    transition: "width 0.5s ease",
  },
  sugCard: {
    background: "rgba(245,196,0,0.06)",
    border: "1px solid rgba(245,196,0,0.2)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sugRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 800,
    paddingTop: 32,
    marginBottom: 20,
  },
  wkListItem: {
    background: "var(--bg2)",
    border: "1px solid var(--blue)",
    borderRadius: 16,
    padding: 16,
    display: "flex",
    alignItems: "center",
    gap: 14,
    cursor: "pointer",
    transition: "transform 0.15s ease",
  },
  wkBadgeIcon: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 14,
    color: "#fff",
  },
  btnStartWk: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "var(--bg3)",
    border: "1px solid var(--blue)",
    color: "var(--acc)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  historyCard: {
    background: "var(--bg2)",
    border: "1px solid var(--blue)",
    borderRadius: 16,
    padding: 16,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
  },
  cardEmpty: {
    background: "var(--bg2)",
    border: "1px dotted var(--blue)",
    borderRadius: 16,
    padding: 32,
    textAlign: "center",
    color: "var(--sub)",
    fontSize: 14,
  },
  profileCard: {
    background: "var(--bg2)",
    border: "1px solid var(--blue)",
    borderRadius: 16,
    padding: 24,
    textAlign: "center",
  },
  avatarProfile: {
    width: 88,
    height: 88,
    borderRadius: "50%",
    background: "var(--blue)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 32,
    fontWeight: 750,
    color: "var(--acc)",
    border: "2.5px solid var(--acc)",
  },
  btnUploadPhoto: {
    position: "absolute",
    bottom: 0,
    right: 0,
    background: "var(--acc)",
    color: "#000",
    width: 26,
    height: 26,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
  },
  badgeProfileRole: {
    display: "inline-block",
    padding: "4px 12px",
    background: "rgba(245,196,0,0.1)",
    border: "1px solid rgba(245,196,0,0.25)",
    color: "var(--acc)",
    fontSize: 11,
    fontWeight: 700,
    borderRadius: 20,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 8,
  },
  profileStatsBox: {
    display: "flex",
    background: "var(--bg3)",
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    border: "1px solid var(--blue)",
  },
  btnSignout: {
    width: "100%",
    padding: 14,
    background: "transparent",
    color: "var(--red)",
    border: "1px solid var(--red)",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  bottomNav: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    background: "var(--bg2)",
    borderTop: "1px solid var(--blue)",
    display: "flex",
    justifyContent: "space-around",
    padding: "10px 0 16px",
    zIndex: 50,
  },
  navItem: {
    background: "none",
    border: "none",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    fontSize: 10,
    fontWeight: 500,
    cursor: "pointer",
  },

  // Active workout styles
  activePage: {
    background: "var(--bg)",
    minHeight: "100vh",
    color: "var(--text)",
    display: "flex",
    flexDirection: "column",
    paddingBottom: 24,
  },
  activeHdr: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px 16px 12px",
    borderBottom: "1px solid var(--bg3)",
  },
  btnClose: {
    background: "none",
    border: "none",
    color: "var(--sub)",
    cursor: "pointer",
    width: 32,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  timerBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 0 16px",
  },
  activeCard: {
    flex: 1,
    margin: "0 16px",
    background: "var(--bg2)",
    border: "1px solid var(--blue)",
    borderRadius: 20,
    padding: 24,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
  },
  badgeNum: {
    padding: "2px 8px",
    color: "#fff",
    fontWeight: 700,
    fontSize: 11,
    borderRadius: 6,
  },
  badgeMachine: {
    padding: "2px 8px",
    background: "var(--blue)",
    color: "#fff",
    fontWeight: 650,
    fontSize: 11,
    borderRadius: 6,
  },
  badgeObs: {
    padding: "2px 8px",
    background: "var(--bg3)",
    color: "var(--sub)",
    fontSize: 11,
    borderRadius: 6,
    fontStyle: "italic",
  },
  weightSelector: {
    display: "flex",
    gap: 16,
    marginBottom: 28,
  },
  weightBox: {
    flex: 1,
    background: "var(--bg3)",
    border: "1px solid var(--blue)",
    borderRadius: 14,
    padding: 16,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
  },
  repsBox: {
    flex: 1,
    background: "var(--bg3)",
    border: "1px solid var(--blue)",
    borderRadius: 14,
    padding: 16,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  weightAdjustBtns: {
    display: "flex",
    gap: 12,
    marginTop: 12,
  },
  adjBtn: {
    background: "var(--bg2)",
    border: "1px solid var(--blue)",
    color: "var(--text)",
    width: 36,
    height: 36,
    borderRadius: 8,
    fontSize: 18,
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimary: {
    background: "var(--acc)",
    color: "#000",
    border: "none",
    borderRadius: 12,
    padding: "14px 24px",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
    textAlign: "center",
  },
  btnSecondary: {
    background: "var(--bg3)",
    color: "var(--text)",
    border: "1px solid var(--blue)",
    borderRadius: 12,
    padding: "14px 24px",
    fontWeight: 600,
    fontSize: 15,
    cursor: "pointer",
    textAlign: "center",
  },

  // Overlays
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 100,
    background: "rgba(6,9,26,0.92)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  overlayContent: {
    textAlign: "center",
  },
  overlayContentCard: {
    width: "100%",
    maxWidth: 360,
    background: "var(--bg2)",
    border: "1px solid var(--blue)",
    borderRadius: 20,
    padding: 24,
    textAlign: "center",
    boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
  },

  // Summary styles
  summaryCard: {
    width: "100%",
    maxWidth: 400,
    background: "var(--bg2)",
    border: "1px solid var(--blue)",
    borderRadius: 20,
    padding: "24px 20px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
  },
  summaryHdr: {
    paddingBottom: 16,
    marginBottom: 16,
    position: "relative",
  },
  btnCloseReport: {
    position: "absolute",
    top: 0,
    right: 0,
    background: "none",
    border: "none",
    color: "var(--sub)",
    fontSize: 18,
    cursor: "pointer",
  },
  summaryStats: {
    display: "flex",
    background: "var(--bg3)",
    borderRadius: 12,
    border: "1px solid var(--blue)",
    padding: 12,
    marginBottom: 20,
  },
  summaryStatItem: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    textAlign: "center",
  },
  summaryExCard: {
    background: "rgba(255,255,255,0.01)",
    border: "1px solid var(--bg3)",
    borderRadius: 10,
    padding: 12,
  },

  // Detail Modal styles
  btnBack: {
    background: "none",
    border: "none",
    color: "var(--acc)",
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    padding: 0,
  },
  detailHeaderBox: {
    paddingLeft: 12,
    marginBottom: 24,
  },
  exListItem: {
    background: "var(--bg2)",
    border: "1px solid var(--bg3)",
    borderRadius: 12,
    padding: 14,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
  },

  // Sub-modal set weight
  subOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 110,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  subModal: {
    width: "100%",
    maxWidth: 280,
    background: "var(--bg2)",
    border: "1px solid var(--acc)",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
  },
  modalWeightInput: {
    flex: 1,
    background: "var(--bg3)",
    border: "1px solid var(--blue)",
    borderRadius: 8,
    color: "var(--text)",
    padding: "8px 12px",
    fontSize: 16,
    fontWeight: 700,
    textAlign: "center",
    outline: "none",
  },
};
