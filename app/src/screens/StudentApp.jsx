import { useState, useEffect, useRef, useCallback } from "react";
import { signOut } from "firebase/auth";
import { collection, query, getDocs, addDoc, doc, updateDoc, orderBy, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Dumbbell,
  History,
  User,
  Play,
  ChevronLeft,
  Plus,
  Clock,
} from "lucide-react";
import { ActiveWorkoutScreen } from "@/screens/ActiveWorkoutScreen";

export function StudentApp() {
  const { user, profile } = useAuth();
  const [tab, setTab] = useState("home"); // "home", "workouts", "history", "profile"
  const [workouts, setWorkouts] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Draft (partial workout saved for later)
  const [draft, setDraft] = useState(null);

  // Active workout states
  const [activeWk, setActiveWk] = useState(null); // { id, label, name, color, exercises: [...], exIdx: 0, set: 0, start: 0, results: [], currentWeight: 0, exStart: 0 }
  const [restTime, setRestTime] = useState(null); // seconds
  const [restTotal, setRestTotal] = useState(null); // total seconds for ring animation
  const [restType, setRestType] = useState(null); // 'rest' | 'transition'
  const [showExit, setShowExit] = useState(false);
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

  // RPE tutorial
  const [showRpeTutorial, setShowRpeTutorial] = useState(false);
  const [rpeTutSlide, setRpeTutSlide] = useState(0);
  const RPE_TUT_TOTAL = 3;

  const timerRef = useRef(null);
  const restTimerRef = useRef(null);
  const [elapsedTime, setElapsedTime] = useState("00:00");
  const prevPctRef = useRef(null);

  // Load data from Firestore
  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const wksRef = query(collection(db, "users", user.uid, "workouts"), orderBy("order"));
      const wksSnap = await getDocs(wksRef);
      const wksList = wksSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setWorkouts(wksList);

      const sessRef = collection(db, "users", user.uid, "sessions");
      const sessQuery = query(sessRef, orderBy("date", "desc"));
      const sessSnap = await getDocs(sessQuery);
      const sessList = sessSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setSessions(sessList);

      const draftSnap = await getDoc(doc(db, "users", user.uid, "draft"));
      setDraft(draftSnap.exists() ? draftSnap.data() : null);
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
    const H = 110;
    const PAD_X = 8;
    const PAD_Y = 10;

    const svgPts = pts.map((v, i) => {
      const x = PAD_X + (pts.length === 1 ? (W - PAD_X * 2) / 2 : (i / (pts.length - 1)) * (W - PAD_X * 2));
      const y = PAD_Y + (1 - v / 10) * (H - PAD_Y * 2);
      return { x, y, v };
    });

    // smooth bezier path
    const bezierPath = svgPts.reduce((acc, p, i, arr) => {
      if (i === 0) return `M ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      const prev = arr[i - 1];
      const cpx = ((prev.x + p.x) / 2).toFixed(1);
      return `${acc} C ${cpx},${prev.y.toFixed(1)} ${cpx},${p.y.toFixed(1)} ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    }, "");

    const last = svgPts[svgPts.length - 1];
    const areaPath = `${bezierPath} L ${last.x.toFixed(1)},${H} L ${svgPts[0].x.toFixed(1)},${H} Z`;

    // 3-point moving average (only computed when pts.length >= 3)
    const WINDOW = 3;
    const maPts = pts.length >= WINDOW
      ? pts.slice(WINDOW - 1).map((_, i) => {
          const slice = pts.slice(i, i + WINDOW);
          const avg = slice.reduce((a, b) => a + b, 0) / WINDOW;
          const srcIdx = i + WINDOW - 1;
          return { x: svgPts[srcIdx].x, y: PAD_Y + (1 - avg / 10) * (H - PAD_Y * 2), avg };
        })
      : null;

    const maPath = maPts
      ? maPts.reduce((acc, p, i, arr) => {
          if (i === 0) return `M ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
          const prev = arr[i - 1];
          const cpx = ((prev.x + p.x) / 2).toFixed(1);
          return `${acc} C ${cpx},${prev.y.toFixed(1)} ${cpx},${p.y.toFixed(1)} ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
        }, "")
      : null;

    const trend = pts[pts.length - 1] - pts[0];
    const trendColor = trend > 0.5 ? "var(--green)" : trend < -0.5 ? "var(--red)" : "var(--acc)";
    const trendLabel = trend > 0.5 ? "↑ Evoluindo" : trend < -0.5 ? "↓ Caindo" : "→ Estável";

    const avgRpe = pts.reduce((a, b) => a + b, 0) / pts.length;
    const currentRpe = pts[pts.length - 1];

    return { bezierPath, areaPath, maPath, svgPts, trendColor, trendLabel, W, H, sessionsList: sortedSess, avgRpe, currentRpe, trend };
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
  const lastWeightFor = (exName, fallback = 1) => {
    for (const s of sessions) {
      const r = s.exs?.find((e) => e.name === exName);
      if (r?.wt) return r.wt;
    }
    return fallback || 1;
  };

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
      currentWeight: lastWeightFor(wk.exercises[0]?.name, wk.exercises[0]?.wt || 0),
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
      setRestTotal(30);
      setRestType("rest");
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
        currentWeight: lastWeightFor(prev.exercises[nextIdx].name, prev.exercises[nextIdx].wt || 0),
        exStart: Date.now(),
      }));
      setRestTotal(45);
      setRestType("transition");
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
      launchConfetti();
      await loadData();
      setTab("home");
    } catch (e) {
      console.error("Error saving session: ", e);
      alert("Erro ao salvar treino. Tente novamente.");
    }
  };

  const discardWorkout = () => {
    setActiveWk(null);
    setShowSummary(false);
    setSummaryData(null);
    setShowExit(false);
  };

  const deleteDraft = async () => {
    await deleteDoc(doc(db, "users", user.uid, "draft"));
    setDraft(null);
  };

  const savePartialWorkout = async () => {
    const draftRef = doc(db, "users", user.uid, "draft");
    await setDoc(draftRef, { ...activeWk, savedAt: Date.now() });
    setDraft({ ...activeWk, savedAt: Date.now() });
    discardWorkout();
  };

  const resumeWorkout = (d) => {
    const { savedAt, ...wkState } = d;
    setActiveWk({ ...wkState, start: Date.now() - (savedAt - wkState.start) });
    deleteDraft();
  };

  const startFromScratch = async (wkId) => {
    await deleteDraft();
    startWorkout(wkId);
  };

  const skipRest = () => {
    setRestTime(null);
    setRestType(null);
    setRestTotal(null);
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
  const _fmtDate = (timestamp) => {
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

  const launchConfetti = useCallback(() => {
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    const COLORS = ["#F5C400", "#2352c8", "#00c853", "#fff", "#f44336", "#1B3487"];
    const particles = Array.from({ length: 140 }, () => ({
      x: Math.random() * canvas.width,
      y: canvas.height * (Math.random() * 0.4),
      vx: (Math.random() - 0.5) * 7,
      vy: -(Math.random() * 6 + 3),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      w: Math.random() * 10 + 5,
      h: Math.random() * 5 + 3,
      rot: Math.random() * 360,
      rotV: (Math.random() - 0.5) * 10,
    }));
    let raf;
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.18;
        p.rot += p.rotV;
        if (p.y < canvas.height + 20) alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (alive) raf = requestAnimationFrame(tick);
      else canvas.remove();
    };
    raf = requestAnimationFrame(tick);
    setTimeout(() => { cancelAnimationFrame(raf); canvas.remove(); }, 5000);
  }, []);

  useEffect(() => {
    if (prevPctRef.current !== null && prevPctRef.current < 100 && cycleInfoObj.pct === 100) {
      launchConfetti();
    }
    prevPctRef.current = cycleInfoObj.pct;
  }, [cycleInfoObj.pct, launchConfetti]);

  // If a workout session is active
  if (activeWk) {
    return (
      <ActiveWorkoutScreen
        activeWk={activeWk}
        elapsedTime={elapsedTime}
        restTime={restTime}
        restTotal={restTotal}
        restType={restType}
        showRpe={showRpe}
        rpeValue={rpeValue}
        setRpeValue={setRpeValue}
        showSummary={showSummary}
        summaryData={summaryData}
        showExit={showExit}
        onNextSet={handleNextSet}
        onConfirmRpe={confirmRpe}
        onAdjustWeight={adjustActiveWeight}
        onSaveSession={saveWorkoutSession}
        onSkipRest={skipRest}
        onShowExit={() => setShowExit(true)}
        onHideExit={() => setShowExit(false)}
        onConfirmExit={discardWorkout}
        onSavePartial={savePartialWorkout}
      />
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
              <Input
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
                  <h2 style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>
                    Bom treino, {profile?.name?.split(" ")[0] ?? "Atleta"} 👋
                  </h2>
                  <span style={{ fontSize: 10, color: "var(--acc)", fontWeight: 700, letterSpacing: 2 }}>ACADEMIA ESTILO LIVRE</span>
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

              {/* Resume Draft Banner */}
              {draft && (
                <div style={styles.resumeBanner}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--acc)" }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: "var(--acc)", letterSpacing: 1, textTransform: "uppercase" }}>
                      Treino pausado
                    </span>
                  </div>
                  <p style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", marginBottom: 2 }}>
                    Treino {draft.label} — {draft.name}
                  </p>
                  <p style={{ fontSize: 12, color: "var(--sub)", marginBottom: 14 }}>
                    <span style={{ color: "var(--acc)", fontWeight: 600 }}>
                      {draft.results?.length ?? 0}/{draft.exercises?.length ?? 0} exercícios
                    </span>{" "}
                    concluídos
                  </p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => resumeWorkout(draft)}
                      style={{ ...styles.btnPrimary, flex: 2, padding: "12px 0" }}
                    >
                      ▶ Continuar treino
                    </button>
                    <button
                      onClick={() => startFromScratch(draft.id)}
                      style={{ ...styles.btnSecondary, flex: 1, padding: "12px 0" }}
                    >
                      Começar do zero
                    </button>
                  </div>
                </div>
              )}

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
                  <h4 style={styles.cardTitle}>Seu loop</h4>
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
                      ? "🎉 Fique no loop!"
                      : cycleInfoObj.pct ? `${Math.round(cycleInfoObj.pct)}% concluído — não saia do loop!` : "Entre no loop!"}
                  </p>
                </div>
              )}

              {/* SVG Trend Chart */}
              {(() => {
                const chart = getTrendData();
                if (!chart) return null;
                const lastPt = chart.svgPts[chart.svgPts.length - 1];
                const gridLevels = [2, 4, 6, 8, 10];
                return (
                  <div style={styles.dashboardCard}>
                    {/* Header row */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                      <h4 style={{ ...styles.cardTitle, marginBottom: 0, display: "flex", alignItems: "center", gap: 6 }}>
                        Intensidade do treino
                        <button onClick={() => { setShowRpeTutorial(true); setRpeTutSlide(0); }} style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--acc)", border: "none", color: "var(--bg)", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>i</button>
                      </h4>
                      {/* Trend badge */}
                      <span style={{ fontSize: 11, fontWeight: 700, color: chart.trendColor, background: `color-mix(in srgb, ${chart.trendColor} 12%, transparent)`, border: `1px solid color-mix(in srgb, ${chart.trendColor} 30%, transparent)`, borderRadius: 99, padding: "3px 10px" }}>
                        {chart.trendLabel}
                      </span>
                    </div>

                    {/* RPE summary row */}
                    <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                      <div style={{ flex: 1, background: "var(--bg3)", borderRadius: 10, padding: "8px 12px", textAlign: "center" }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: chart.trendColor, lineHeight: 1.2 }}>{chart.currentRpe.toFixed(1)}</div>
                        <div style={{ fontSize: 10, color: "var(--sub)", marginTop: 2 }}>RPE atual</div>
                      </div>
                      <div style={{ flex: 1, background: "var(--bg3)", borderRadius: 10, padding: "8px 12px", textAlign: "center" }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", lineHeight: 1.2 }}>{chart.avgRpe.toFixed(1)}</div>
                        <div style={{ fontSize: 10, color: "var(--sub)", marginTop: 2 }}>RPE médio</div>
                      </div>
                      <div style={{ flex: 1, background: "var(--bg3)", borderRadius: 10, padding: "8px 12px", textAlign: "center" }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", lineHeight: 1.2 }}>{chart.sessionsList.length}</div>
                        <div style={{ fontSize: 10, color: "var(--sub)", marginTop: 2 }}>sessões</div>
                      </div>
                    </div>

                    {/* Chart */}
                    <div style={{ position: "relative" }}>
                      <svg width="100%" height={chart.H} viewBox={`0 0 ${chart.W} ${chart.H}`} style={{ display: "block", overflow: "visible" }}>
                        <defs>
                          <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={chart.trendColor} stopOpacity={0.3} />
                            <stop offset="100%" stopColor={chart.trendColor} stopOpacity={0} />
                          </linearGradient>
                          <filter id="glow">
                            <feGaussianBlur stdDeviation="2" result="blur" />
                            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                          </filter>
                        </defs>

                        {/* Grid lines */}
                        {gridLevels.map((lvl) => {
                          const gy = 10 + (1 - lvl / 10) * (chart.H - 20);
                          return (
                            <g key={lvl}>
                              <line x1={0} y1={gy} x2={chart.W} y2={gy} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                              <text x={chart.W - 2} y={gy - 2} fontSize="8" fill="rgba(136,153,187,0.5)" textAnchor="end">{lvl}</text>
                            </g>
                          );
                        })}

                        {/* Area fill */}
                        <path d={chart.areaPath} fill="url(#tg)" />

                        {/* Bezier line */}
                        <path
                          d={chart.bezierPath}
                          fill="none"
                          stroke={chart.trendColor}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {/* Moving average line */}
                        {chart.maPath && (
                          <path
                            d={chart.maPath}
                            fill="none"
                            stroke="rgba(136,153,187,0.7)"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeDasharray="4 3"
                          />
                        )}

                        {/* Dots */}
                        {chart.svgPts.map((p, idx) => {
                          const isLast = idx === chart.svgPts.length - 1;
                          return (
                            <g key={idx}>
                              {isLast && <circle cx={p.x} cy={p.y} r="8" fill={chart.trendColor} opacity={0.15} />}
                              <circle
                                cx={p.x} cy={p.y}
                                r={isLast ? 5 : 3}
                                fill={isLast ? chart.trendColor : "var(--bg2)"}
                                stroke={chart.trendColor}
                                strokeWidth={isLast ? 0 : 1.5}
                              />
                            </g>
                          );
                        })}

                        {/* Tooltip on last point */}
                        {(() => {
                          const p = lastPt;
                          const boxW = 38;
                          const boxH = 18;
                          const bx = Math.min(p.x - boxW / 2, chart.W - boxW - 2);
                          const by = p.y - boxH - 8;
                          return (
                            <g filter="url(#glow)">
                              <rect x={bx} y={by} width={boxW} height={boxH} rx="5" fill={chart.trendColor} opacity={0.9} />
                              <text x={bx + boxW / 2} y={by + 12} fontSize="9" fill="#000" textAnchor="middle" fontWeight="800">
                                {p.v.toFixed(1)}
                              </text>
                            </g>
                          );
                        })()}
                      </svg>
                    </div>

                    {/* Legend */}
                    <div style={{ display: "flex", gap: 12, marginTop: 8, alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <svg width="18" height="6"><line x1="0" y1="3" x2="18" y2="3" stroke={chart.trendColor} strokeWidth="2.5" strokeLinecap="round" /></svg>
                        <span style={{ fontSize: 10, color: "var(--sub)" }}>RPE</span>
                      </div>
                      {chart.maPath && (
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <svg width="18" height="6"><line x1="0" y1="3" x2="18" y2="3" stroke="rgba(136,153,187,0.7)" strokeWidth="1.5" strokeDasharray="4 3" strokeLinecap="round" /></svg>
                          <span style={{ fontSize: 10, color: "var(--sub)" }}>Média móvel (3)</span>
                        </div>
                      )}
                    </div>

                    {/* Date axis */}
                    {/* <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--sub)", marginTop: 4 }}>
                      <span>{fmtDate(chart.sessionsList[0].date)}</span>
                      <span>{fmtDate(chart.sessionsList[chart.sessionsList.length - 1].date)}</span>
                    </div> */}
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
                  <h4 style={{ ...styles.cardTitle, fontSize: 13, marginBottom: 8 }}>Loop</h4>
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
                      <Input type="file" accept="image/*" onChange={uploadPhoto} style={{ display: "none" }} />
                    </label>
                  </div>

                  <h3 style={{ fontSize: 18, fontWeight: 800 }}>{profile?.name}</h3>
                  <span style={{ fontSize: 13, color: "var(--sub)" }}>{profile?.email}</span>
                  <span style={styles.badgeProfileRole}>Aluno Especial</span>
                </div>

                <div style={styles.profileStatsBox}>
                  <div style={{ flex: 1, textAlign: "center", borderRight: "1px solid var(--blue)" }}>
                    <h3 style={{ fontSize: 24, fontWeight: 900, color: "var(--acc)" }}>{sessions.length}</h3>
                    <span style={{ fontSize: 11, color: "var(--sub)" }}>Sessões completas</span>
                  </div>
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <h3 style={{ fontSize: 24, fontWeight: 900, color: "var(--acc)" }}>{cycleInfoObj.cycles}</h3>
                    <span style={{ fontSize: 11, color: "var(--sub)" }}>Loops</span>
                  </div>
                </div>

                <button onClick={() => signOut(auth)} style={styles.btnSignout} className="mt-8">
                  Sair do Aplicativo
                </button>

                <p style={{ marginTop: 16, fontSize: 11, color: "var(--sub)", opacity: 0.45 }}>
                  v{__APP_VERSION__}
                </p>
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

      {/* RPE Tutorial Modal */}
      <Sheet open={showRpeTutorial} onOpenChange={setShowRpeTutorial}>
        <SheetContent side="bottom" style={{ background: "#0b1228", border: "none", borderRadius: "20px 20px 0 0", padding: "20px 20px 44px", maxHeight: "88vh", overflowY: "auto", maxWidth: 430, margin: "0 auto" }}>
            <div style={{ width: 40, height: 4, background: "#162040", borderRadius: 2, margin: "0 auto 18px" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <span style={{ fontSize: 17, fontWeight: 700 }}>Entendendo o gráfico</span>
              <button onClick={() => setShowRpeTutorial(false)} style={{ width: 36, height: 36, borderRadius: 8, background: "#162040", border: "none", color: "#8899bb", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>

            <div style={{ overflow: "hidden" }}>
              {rpeTutSlide === 0 && (
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>O que é RPE?</div>
                  <div style={{ fontSize: 13, color: "#8899bb", lineHeight: 1.6, marginBottom: 14 }}>RPE significa <b style={{ color: "#fff" }}>Esforço Percebido</b> — uma nota de 0 a 10 que você dá ao exercício logo depois de terminar.</div>
                  <div style={{ background: "#162040", borderRadius: 10, padding: "14px 12px 10px", marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "10px 0 4px" }}>
                      <span style={{ fontSize: 11, color: "#3a4a70", width: 28 }}>0</span>
                      <div style={{ flex: 1, height: 10, borderRadius: 5, background: "linear-gradient(to right,#00c853,#F5C400,#f44336)" }} />
                      <span style={{ fontSize: 11, color: "#3a4a70", width: 28, textAlign: "right" }}>10</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#3a4a70", marginTop: 4, padding: "0 36px" }}>
                      <span>sem esforço</span><span>máximo</span>
                    </div>
                    <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 7 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}><span style={{ fontSize: 16 }}>😴</span><span><b style={{ color: "#00c853" }}>1–3</b> — fácil, poderia continuar por horas</span></div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}><span style={{ fontSize: 16 }}>💪</span><span><b style={{ color: "#F5C400" }}>4–6</b> — moderado, desafiador mas controlado</span></div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}><span style={{ fontSize: 16 }}>🔥</span><span><b style={{ color: "#f44336" }}>7–10</b> — intenso, perto do limite</span></div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: "#8899bb", lineHeight: 1.6 }}>O gráfico mostra a <b style={{ color: "#fff" }}>média do RPE</b> ao longo dos seus treinos, do mais antigo para o mais recente.</div>
                </div>
              )}

              {rpeTutSlide === 1 && (
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: "#00c853" }}>↑ Evoluindo</div>
                  <div style={{ fontSize: 13, color: "#8899bb", lineHeight: 1.6, marginBottom: 14 }}>Quando o RPE sobe ao longo do tempo, você está <b style={{ color: "#fff" }}>se superando</b> — cargas maiores, mais séries, menos descanso. Isso é evolução.</div>
                  <div style={{ background: "#162040", borderRadius: 10, padding: "14px 12px 10px", marginBottom: 14 }}>
                    <svg width="100%" height="60" viewBox="0 0 260 60" preserveAspectRatio="none" style={{ display: "block", marginBottom: 6 }}>
                      <defs><linearGradient id="tg-up2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00c853" stopOpacity="0.3"/><stop offset="100%" stopColor="#00c853" stopOpacity="0"/></linearGradient></defs>
                      <polygon points="4,60 4,40 69,35 134,30 199,20 256,14 256,60" fill="url(#tg-up2)"/>
                      <polyline points="4,40 69,35 134,30 199,20 256,14" fill="none" stroke="#00c853" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      {[[4,40],[69,35],[134,30],[199,20],[256,14]].map(([cx,cy],i)=><circle key={i} cx={cx} cy={cy} r="3.5" fill="#00c853"/>)}
                    </svg>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#3a4a70" }}><span>treino 1</span><span>treino mais recente</span></div>
                  </div>
                  <div style={{ background: "rgba(0,200,83,.08)", border: "1px solid rgba(0,200,83,.2)", borderRadius: 10, padding: 12, fontSize: 13, color: "#8899bb", lineHeight: 1.5 }}>
                    RPE crescendo = você está se desafiando cada vez mais.<br/><b style={{ color: "#00c853" }}>Continue assim! 🚀</b>
                  </div>
                </div>
              )}

              {rpeTutSlide === 2 && (
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: "#F5C400" }}>↓ Acomodando</div>
                  <div style={{ fontSize: 13, color: "#8899bb", lineHeight: 1.6, marginBottom: 14 }}>Quando o RPE cai, o treino está ficando <b style={{ color: "#fff" }}>fácil demais</b> — seu corpo se adaptou e está pedindo mais estímulo.</div>
                  <div style={{ background: "#162040", borderRadius: 10, padding: "14px 12px 10px", marginBottom: 14 }}>
                    <svg width="100%" height="60" viewBox="0 0 260 60" preserveAspectRatio="none" style={{ display: "block", marginBottom: 6 }}>
                      <defs><linearGradient id="tg-dn2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#F5C400" stopOpacity="0.3"/><stop offset="100%" stopColor="#F5C400" stopOpacity="0"/></linearGradient></defs>
                      <polygon points="4,60 4,14 69,20 134,30 199,35 256,40 256,60" fill="url(#tg-dn2)"/>
                      <polyline points="4,14 69,20 134,30 199,35 256,40" fill="none" stroke="#F5C400" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      {[[4,14],[69,20],[134,30],[199,35],[256,40]].map(([cx,cy],i)=><circle key={i} cx={cx} cy={cy} r="3.5" fill="#F5C400"/>)}
                    </svg>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#3a4a70" }}><span>treino 1</span><span>treino mais recente</span></div>
                  </div>
                  <div style={{ background: "rgba(245,196,0,.08)", border: "1px solid rgba(245,196,0,.2)", borderRadius: 10, padding: 12, fontSize: 13, color: "#8899bb", lineHeight: 1.5 }}>
                    RPE caindo = hora de aumentar peso ou intensidade.<br/><b style={{ color: "#F5C400" }}>Fique de olho nas sugestões de progressão abaixo! 💡</b>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 22 }}>
              <button onClick={() => setRpeTutSlide(s => s - 1)} style={{ visibility: rpeTutSlide === 0 ? "hidden" : "visible", background: "#162040", border: "none", color: "#fff", fontSize: 14, fontWeight: 600, padding: "10px 20px", borderRadius: 10, cursor: "pointer" }}>← Anterior</button>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {Array.from({ length: RPE_TUT_TOTAL }, (_, i) => (
                  <div key={i} style={{ width: i === rpeTutSlide ? 18 : 6, height: 6, borderRadius: 3, background: i === rpeTutSlide ? "#F5C400" : "#162040", transition: "all .25s" }} />
                ))}
              </div>
              {rpeTutSlide < RPE_TUT_TOTAL - 1
                ? <button onClick={() => setRpeTutSlide(s => s + 1)} style={{ background: "#F5C400", border: "none", color: "#06091a", fontSize: 14, fontWeight: 600, padding: "10px 20px", borderRadius: 10, cursor: "pointer" }}>Próximo →</button>
                : <button onClick={() => setShowRpeTutorial(false)} style={{ background: "#F5C400", border: "none", color: "#06091a", fontSize: 14, fontWeight: 600, padding: "10px 20px", borderRadius: 10, cursor: "pointer" }}>Fechar ✓</button>
              }
            </div>
        </SheetContent>
      </Sheet>
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
  resumeBanner: {
    margin: "0 16px 20px",
    padding: 16,
    borderRadius: 16,
    background: "linear-gradient(135deg, rgba(245,196,0,0.08), rgba(245,196,0,0.04))",
    border: "1px solid rgba(245,196,0,0.3)",
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
