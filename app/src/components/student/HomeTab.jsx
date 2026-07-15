import { UserAvatar } from "@/components/shared";
import { S } from "@/components/student/shared";
import { DraftBanner } from "@/components/student/DraftBanner";
import { CycleTracker } from "@/components/student/CycleTracker";
import { TrendChart } from "@/components/student/TrendChart";
import { SuggestionsCard } from "@/components/student/SuggestionsCard";

// Home tab: hero with loop progress, stats, next workout, trend chart, suggestions.
export function HomeTab({
  profile, workouts, draft, cycleInfo, trendChart, suggestions, sessions,
  onAvatarClick, onStart, onResumeDraft, onStartFromScratch, onShowRpeTutorial,
}) {
  const calcStats = () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekSessions = sessions.filter((s) => new Date(s.date) > weekAgo).length;
    const avgDur = sessions.length ? Math.round(sessions.reduce((a, s) => a + s.dur, 0) / sessions.length / 60) : 0;
    return { week: weekSessions, avg: avgDur, total: sessions.length };
  };
  const stats = calcStats();
  const nextWk = workouts.find((w) => w.id === cycleInfo.next);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 24, marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800 }}>Bom treino 👋</h2>
          <span style={{ fontSize: 10, color: "var(--acc)", fontWeight: 700, letterSpacing: 2 }}>ACADEMIA ESTILO LIVRE</span>
        </div>
        <div onClick={onAvatarClick} style={{ cursor: "pointer" }}>
          <UserAvatar name={profile?.name} photoURL={profile?.photoURL} size={44} />
        </div>
      </div>

      {workouts.length > 0 && (
        <div style={{ background: "linear-gradient(180deg, #151C38, #10162E)", borderRadius: 24, padding: 24, marginBottom: 20, boxShadow: "0 0 40px rgba(235, 200, 75, 0.08)" }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 11, color: "#98A2C4", fontWeight: 600, letterSpacing: 2 }}>LOOPS COMPLETADOS</p>
            <div style={{ fontSize: 56, fontWeight: 800, marginTop: 4 }}>{cycleInfo.cycles}</div>
            <p style={{ fontSize: 15, color: "#C9D0E5", marginTop: 8 }}>
              Você está no <b>Loop {cycleInfo.cycles + 1}</b>
            </p>
          </div>
          <div style={{ margin: "20px 0", height: 8, background: "#2A3156", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", background: "var(--acc)", width: `${cycleInfo.pct}%`, transition: "width 0.5s" }} />
          </div>
          <p style={{ textAlign: "center", color: "#95A0C5", fontSize: 13 }}>{Math.round(cycleInfo.pct)}% concluído</p>
          <div style={{ marginTop: 16 }}>
            <CycleTracker workouts={workouts} cycleInfo={cycleInfo} onSelect={onStart} size={36} />
          </div>
          {nextWk && (
            <button onClick={() => onStart(nextWk.id)} style={{ ...S.btnPrimary, width: "100%", marginTop: 16 }}>
              ▶ CONTINUAR TREINO
              <span style={{ display: "block", fontSize: 12, marginTop: 4, fontWeight: 500 }}>
                {nextWk.label} • {nextWk.name} • ~{Math.round((nextWk.exercises?.length ?? 1) * 8)}min
              </span>
            </button>
          )}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 20 }}>
        <div style={{ ...S.dashboardCard, padding: 14, marginBottom: 0 }}>
          <p style={{ fontSize: 11, color: "var(--sub)" }}>STREAK</p>
          <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>🔥{Math.max(stats.week, 0)}</div>
        </div>
        <div style={{ ...S.dashboardCard, padding: 14, marginBottom: 0 }}>
          <p style={{ fontSize: 11, color: "var(--sub)" }}>SEMANA</p>
          <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>{stats.week}x</div>
        </div>
        <div style={{ ...S.dashboardCard, padding: 14, marginBottom: 0 }}>
          <p style={{ fontSize: 11, color: "var(--sub)" }}>MÉDIA</p>
          <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>{stats.avg}m</div>
        </div>
        <div style={{ ...S.dashboardCard, padding: 14, marginBottom: 0 }}>
          <p style={{ fontSize: 11, color: "var(--sub)" }}>FEITOS</p>
          <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>{stats.total}/{workouts.length * cycleInfo.cycles}</div>
        </div>
      </div>

      {draft && <DraftBanner draft={draft} onResume={onResumeDraft} onStartFromScratch={onStartFromScratch} />}

      {trendChart && <TrendChart chart={trendChart} onInfoClick={onShowRpeTutorial} />}
      <SuggestionsCard suggestions={suggestions} />
    </div>
  );
}
