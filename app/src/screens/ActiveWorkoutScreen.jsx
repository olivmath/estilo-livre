import { useEffect, useRef } from "react";

const RING_CIRC = 2 * Math.PI * 82; // ≈ 515
const RPE_LABELS = [
  "Muito fácil", "Fácil", "Leve", "Moderado leve", "Moderado",
  "Moderado intenso", "Intenso", "Muito intenso", "Exaustivo", "Quase máximo", "Máximo",
];

function diffColor(v) {
  if (v <= 4) return "var(--green)";
  if (v <= 7) return "var(--acc)";
  return "var(--red)";
}

function fmtVol(exs) {
  const vol = exs.reduce((a, r) => a + r.wt * r.sets * r.reps, 0);
  return vol >= 1000 ? `${(vol / 1000).toFixed(1)}t` : `${vol}kg`;
}

function fmtDur(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

/* ── RestOverlay ── */
function RestOverlay({ restTime, restTotal, restType, nextExName, onSkip }) {
  const ringRef = useRef(null);

  useEffect(() => {
    if (!ringRef.current || restTotal == null || restTime == null) return;
    const pct = 1 - restTime / restTotal;
    ringRef.current.style.strokeDashoffset = RING_CIRC * pct;
  }, [restTime, restTotal]);

  const isTransition = restType === "transition";

  return (
    <div style={S.overlay}>
      <p style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1, color: "var(--text)", marginBottom: 24 }}>
        {isTransition ? "Transição" : "Descanse"}
      </p>

      <div style={{ position: "relative", width: 180, height: 180, marginBottom: 24 }}>
        <svg width="180" height="180" viewBox="0 0 180 180" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="90" cy="90" r="82" fill="none" strokeWidth="6" stroke="var(--bg3)" />
          <circle
            ref={ringRef}
            cx="90" cy="90" r="82"
            fill="none" strokeWidth="6" stroke="var(--acc)" strokeLinecap="round"
            strokeDasharray={RING_CIRC}
            strokeDashoffset={0}
            style={{ transition: "stroke-dashoffset 0.9s linear" }}
          />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
          <span style={{ fontSize: 52, fontWeight: 900, letterSpacing: -2, color: "var(--text)", fontVariantNumeric: "tabular-nums", minWidth: "2ch", textAlign: "right" }}>
            {restTime}
          </span>
          <span style={{ fontSize: 20, fontWeight: 600, color: "var(--sub)", marginTop: 10 }}>s</span>
        </div>
      </div>

      {isTransition && nextExName && (
        <p style={{ fontSize: 13, color: "var(--sub)", marginBottom: 36, textAlign: "center" }}>
          Próximo: <strong style={{ color: "var(--text)" }}>{nextExName}</strong>
        </p>
      )}

      <button onClick={onSkip} style={S.skipBtn}>
        {isTransition && nextExName ? `Próximo: ${nextExName} →` : "Pular descanso →"}
      </button>
    </div>
  );
}

/* ── RpeOverlay ── */
function RpeOverlay({ exName, rpeValue, setRpeValue, onConfirm }) {
  return (
    <div style={{ ...S.overlay, flexDirection: "column", padding: "0 28px", gap: 0 }}>
      <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "var(--sub)", marginBottom: 6, textAlign: "center" }}>
        Como foi?
      </p>
      <p style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", marginBottom: 4, textAlign: "center", lineHeight: 1.1 }}>
        {exName}
      </p>
      <p style={{ fontSize: 12, color: "var(--sub)", marginBottom: 28, textAlign: "center" }}>
        todas as séries concluídas
      </p>
      <p style={{ fontSize: 80, fontWeight: 900, color: "var(--acc)", lineHeight: 1, letterSpacing: -3, textAlign: "center", marginBottom: 8, fontVariantNumeric: "tabular-nums" }}>
        {rpeValue}
      </p>
      <p style={{ fontSize: 15, color: "var(--sub)", textAlign: "center", marginBottom: 28, minHeight: 22 }}>
        {RPE_LABELS[rpeValue] || ""}
      </p>

      <input
        type="range" min="0" max="10" value={rpeValue}
        onChange={(e) => setRpeValue(parseInt(e.target.value))}
        style={{ width: "100%", WebkitAppearance: "none", height: 6, borderRadius: 3, background: "var(--bg3)", outline: "none", marginBottom: 10, cursor: "pointer", accentColor: "var(--acc)" }}
      />

      <div style={{ display: "flex", width: "100%", marginBottom: 36 }}>
        {[{ n: 0, l: "Fácil" }, { n: 5, l: "Médio" }, { n: 10, l: "Máximo" }].map(({ n, l }, i) => (
          <span key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: i === 0 ? "flex-start" : i === 2 ? "flex-end" : "center", gap: 2, fontSize: 11, color: "var(--sub)", lineHeight: 1.2 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--sub)" }}>{n}</span>
            {l}
          </span>
        ))}
      </div>

      <button onClick={onConfirm} style={S.ctaBtn}>Confirmar</button>
    </div>
  );
}

/* ── SummaryOverlay ── */
function SummaryOverlay({ summaryData, onSave, onDiscard }) {
  if (!summaryData) return null;
  const totalSeries = summaryData.exs.reduce((a, r) => a + r.sets, 0);

  return (
    <div style={{ ...S.overlay, flexDirection: "column", justifyContent: "flex-start", paddingTop: 60, overflowY: "auto" }}>
      <p style={{ fontSize: 48, textAlign: "center", width: "100%", marginBottom: 12 }}>🏆</p>
      <p style={{ fontSize: 28, fontWeight: 900, textAlign: "center", marginBottom: 4, color: "var(--text)" }}>Treino Concluído!</p>
      <p style={{ fontSize: 13, color: "var(--sub)", textAlign: "center", marginBottom: 36 }}>
        {summaryData.wkName}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, width: "100%", maxWidth: 400, marginBottom: 28 }}>
        {[
          { val: fmtDur(summaryData.dur), lbl: "Tempo" },
          { val: summaryData.exs.length, lbl: "Exercícios" },
          { val: totalSeries, lbl: "Séries" },
        ].map(({ val, lbl }) => (
          <div key={lbl} style={S.statBox}>
            <p style={{ fontSize: 26, fontWeight: 900, color: "var(--acc)", lineHeight: 1 }}>{val}</p>
            <p style={{ fontSize: 10, color: "var(--sub)", letterSpacing: 0.5, marginTop: 4, textTransform: "uppercase" }}>{lbl}</p>
          </div>
        ))}
      </div>

      <div style={{ width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", gap: 6, marginBottom: 32 }}>
        {summaryData.exs.map((res, i) => (
          <div key={i} style={S.sumItem}>
            <span style={{ color: "var(--green)", fontSize: 14, flexShrink: 0 }}>✓</span>
            <span style={{ flex: 1, fontSize: 14, color: "var(--text)", fontWeight: 500 }}>{res.name}</span>
            <span style={{ fontSize: 11, color: "var(--sub)" }}>
              {res.sets}×{res.kg ?? res.wt}kg · RPE {res.diff ?? res.rpe}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, width: "100%", maxWidth: 400 }}>
        <button onClick={onDiscard} style={{ ...S.skipBtn, flex: 1 }}>Descartar</button>
        <button onClick={onSave} style={{ ...S.ctaBtn, flex: 2 }}>Salvar e Sair</button>
      </div>
    </div>
  );
}

/* ── ExitSheet ── */
function ExitSheet({ onConfirm, onCancel }) {
  return (
    <div style={S.exitBackdrop}>
      <div style={S.exitSheet}>
        <p style={{ fontSize: 18, fontWeight: 800, marginBottom: 6, color: "var(--text)" }}>Sair do treino?</p>
        <p style={{ fontSize: 13, color: "var(--sub)", marginBottom: 24 }}>O progresso desta sessão será perdido.</p>
        <button onClick={onConfirm} style={S.exitDangerBtn}>Sair sem salvar</button>
        <button onClick={onCancel} style={S.exitCancelBtn}>Continuar treinando</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════ */
export function ActiveWorkoutScreen({
  activeWk,
  elapsedTime,
  restTime,
  restTotal,
  restType,
  showRpe,
  rpeValue,
  setRpeValue,
  showSummary,
  summaryData,
  showExit,
  onNextSet,
  onConfirmRpe,
  onAdjustWeight,
  onSaveSession,
  onSkipRest,
  onShowExit,
  onHideExit,
  onConfirmExit,
}) {
  const ex = activeWk.exercises[activeWk.exIdx];
  const currentSet = activeWk.set + 1;
  const nextEx = activeWk.exercises[activeWk.exIdx + 1];

  const exItems = activeWk.exercises.map((e, i) => {
    const doneIdx = activeWk.results.findIndex((r) => r.name === e.name);
    if (doneIdx !== -1) return { ...e, status: "done", result: activeWk.results[doneIdx] };
    if (i === activeWk.exIdx) return { ...e, status: "current" };
    return { ...e, status: "upcoming" };
  });

  return (
    <div style={S.page}>
      {/* ── Overlays ── */}
      {restTime !== null && (
        <RestOverlay
          restTime={restTime}
          restTotal={restTotal}
          restType={restType}
          nextExName={nextEx?.name}
          onSkip={onSkipRest}
        />
      )}
      {showRpe && (
        <RpeOverlay
          exName={ex.name}
          rpeValue={rpeValue}
          setRpeValue={setRpeValue}
          onConfirm={onConfirmRpe}
        />
      )}
      {showSummary && (
        <SummaryOverlay
          summaryData={summaryData}
          onSave={onSaveSession}
          onDiscard={onConfirmExit}
        />
      )}
      {showExit && (
        <ExitSheet onConfirm={onConfirmExit} onCancel={onHideExit} />
      )}

      {/* ── Top Nav ── */}
      <div style={S.topnav}>
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.2, color: "var(--acc)", textTransform: "uppercase" }}>
            Treino {activeWk.label}
          </span>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{activeWk.name}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={S.timerPill}>
            <div style={S.liveDot} />
            <span style={{ fontSize: 12, fontVariantNumeric: "tabular-nums", fontWeight: 500, color: "var(--sub)" }}>
              {elapsedTime}
            </span>
          </div>
          <button onClick={onShowExit} style={S.closeBtn}>✕</button>
        </div>
      </div>

      {/* ── 2-Column Body ── */}
      <div style={S.body}>

        {/* Left: Metrics */}
        <div style={S.colLeft}>
          {/* Reps card */}
          <div style={S.metricCard}>
            <span style={S.mcLabel}>Repetições</span>
            <div style={{ fontSize: 62, fontWeight: 900, lineHeight: 1, letterSpacing: -2, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text)" }}>
              <span style={{ fontSize: 22, fontWeight: 600, color: "var(--sub)", letterSpacing: -1, marginRight: 2 }}>{ex.sets}×</span>
              {ex.reps}
            </div>
            {/* Series dots */}
            <div style={{ display: "flex", gap: 5, width: "100%", flexShrink: 0 }}>
              {Array.from({ length: ex.sets }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1, height: 6, borderRadius: 3,
                    background: i < activeWk.set ? "var(--green)" : i === activeWk.set ? "var(--acc)" : "var(--bg3)",
                    border: `1px solid ${i < activeWk.set ? "var(--green)" : i === activeWk.set ? "var(--acc)" : "var(--blue)"}`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Carga card */}
          <div style={S.metricCard}>
            <span style={S.mcLabel}>Carga</span>
            <div style={{ fontSize: 56, fontWeight: 900, lineHeight: 1, letterSpacing: -2, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--acc)" }}>
              {activeWk.currentWeight % 1 === 0 ? activeWk.currentWeight : activeWk.currentWeight.toFixed(1)}
              <span style={{ fontSize: 18, fontWeight: 600, color: "var(--sub)", letterSpacing: 0, marginLeft: 4 }}>kg</span>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => onAdjustWeight(-2.5)} style={S.wBtn}>−</button>
              <button onClick={() => onAdjustWeight(2.5)} style={S.wBtn}>+</button>
            </div>
          </div>
        </div>

        {/* Right: Exercise list */}
        <div style={S.colRight}>
          {exItems.map((e, i) => {
            const isDone = e.status === "done";
            const isCurrent = e.status === "current";
            return (
              <div
                key={i}
                style={{
                  flexShrink: 0,
                  height: 68,
                  borderRadius: 12,
                  padding: "0 12px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: 3,
                  background: isDone
                    ? "rgba(0,200,83,0.08)"
                    : isCurrent
                    ? "rgba(245,196,0,0.08)"
                    : "var(--bg2)",
                  border: isDone
                    ? "1px solid rgba(0,200,83,0.2)"
                    : isCurrent
                    ? "1.5px solid rgba(245,196,0,0.4)"
                    : "1px solid var(--blue)",
                }}
              >
                <span
                  style={{
                    lineHeight: 1.2,
                    fontSize: isDone ? 13 : isCurrent ? 15 : 13,
                    fontWeight: isDone ? 600 : isCurrent ? 800 : 500,
                    color: isDone ? "var(--green)" : isCurrent ? "var(--acc)" : "var(--sub)",
                  }}
                >
                  {e.name}
                </span>
                <span
                  style={{
                    fontSize: isDone ? 10 : isCurrent ? 11 : 10,
                    letterSpacing: 0.3,
                    color: isDone ? "rgba(0,200,83,0.6)" : isCurrent ? "rgba(245,196,0,0.6)" : "var(--blue2)",
                  }}
                >
                  {isDone
                    ? `✓ ${e.sets} séries · ${e.result?.wt ?? 0}kg`
                    : isCurrent
                    ? `Série ${currentSet}/${e.sets}`
                    : `${e.sets}×${e.reps}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{ padding: "10px 14px 26px", flexShrink: 0 }}>
        <button onClick={onNextSet} style={S.ctaBtn}>Concluir Série</button>
      </div>
    </div>
  );
}

/* ── Styles ── */
const S = {
  page: {
    background: "var(--bg)",
    color: "var(--text)",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
    height: "100dvh",
    display: "flex",
    flexDirection: "column",
    maxWidth: 430,
    margin: "0 auto",
    overflow: "hidden",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    maxWidth: 430,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    background: "var(--bg)",
  },
  topnav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 16px 10px",
    flexShrink: 0,
  },
  timerPill: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    background: "var(--bg3)",
    borderRadius: 20,
    padding: "5px 10px",
    border: "1px solid var(--blue)",
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: "50%",
    background: "var(--green)",
    animation: "blink 1.4s infinite",
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    border: "1px solid var(--blue)",
    background: "var(--bg3)",
    color: "var(--sub)",
    fontSize: 13,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flex: 1,
    display: "flex",
    gap: 10,
    padding: "0 14px",
    overflow: "hidden",
    minHeight: 0,
  },
  colLeft: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    width: "44%",
    flexShrink: 0,
  },
  metricCard: {
    background: "var(--bg2)",
    borderRadius: 16,
    border: "1px solid var(--blue)",
    flex: "none",
    height: 200,
    flexDirection: "column",
    alignItems: "stretch",
    padding: "10px 14px 12px",
    display: "flex",
    gap: 0,
  },
  mcLabel: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "var(--sub)",
    lineHeight: 1.3,
    flexShrink: 0,
    textAlign: "left",
  },
  colRight: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 6,
    overflow: "hidden",
  },
  wBtn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    border: "1px solid var(--blue)",
    background: "var(--bg3)",
    color: "var(--acc)",
    fontSize: 22,
    fontWeight: 400,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.1s",
    lineHeight: 1,
  },
  ctaBtn: {
    width: "100%",
    padding: 17,
    borderRadius: 15,
    border: "none",
    background: "var(--acc)",
    color: "#000",
    fontSize: 17,
    fontWeight: 800,
    cursor: "pointer",
    letterSpacing: 0.1,
    transition: "opacity 0.12s, transform 0.1s",
  },
  skipBtn: {
    padding: "14px 40px",
    borderRadius: 14,
    border: "1px solid var(--blue)",
    background: "var(--bg2)",
    color: "var(--sub)",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  statBox: {
    background: "var(--bg2)",
    borderRadius: 14,
    padding: "16px 10px",
    textAlign: "center",
    border: "1px solid var(--blue)",
  },
  sumItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    borderRadius: 12,
    background: "rgba(0,200,83,0.06)",
    border: "1px solid rgba(0,200,83,0.2)",
  },
  exitBackdrop: {
    position: "fixed",
    inset: 0,
    maxWidth: 430,
    margin: "0 auto",
    zIndex: 110,
    background: "rgba(6,9,26,0.85)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    display: "flex",
    alignItems: "flex-end",
  },
  exitSheet: {
    background: "var(--bg2)",
    borderRadius: "20px 20px 0 0",
    padding: "28px 20px 16px",
    width: "100%",
    borderTop: "1px solid var(--blue)",
  },
  exitDangerBtn: {
    width: "100%",
    padding: 16,
    borderRadius: 13,
    border: "1px solid var(--red)",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    marginBottom: 10,
    background: "rgba(244,67,54,0.1)",
    color: "var(--red)",
  },
  exitCancelBtn: {
    width: "100%",
    padding: 16,
    borderRadius: 13,
    border: "1px solid var(--blue)",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    background: "var(--bg3)",
    color: "var(--sub)",
  },
};
