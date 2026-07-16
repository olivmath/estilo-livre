import { UserAvatar } from "@/components/shared";
import { S } from "@/components/student/shared";
import { DraftBanner } from "@/components/student/DraftBanner";
import { WorkoutListItem } from "@/components/student/WorkoutListItem";
import { CycleTracker } from "@/components/student/CycleTracker";
import { TrendChart } from "@/components/student/TrendChart";
import { SuggestionsCard } from "@/components/student/SuggestionsCard";

// Home tab: greeting header, paused-draft banner or next-workout card,
// loop progress, RPE trend chart and progression suggestions.
export function HomeTab({
  profile, workouts, draft, cycleInfo, trendChart, suggestions,
  onAvatarClick, onStart, onOpenDetail, onResumeDraft, onStartFromScratch, onShowRpeTutorial,
}) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 32, marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>
            Bom treino, {profile?.name?.split(" ")[0] ?? "Atleta"} 👋
          </h2>
          <span style={{ fontSize: 10, color: "var(--acc)", fontWeight: 700, letterSpacing: 2 }}>ACADEMIA ESTILO LIVRE</span>
        </div>
        <div onClick={onAvatarClick} style={{ cursor: "pointer" }}>
          <UserAvatar name={profile?.name} photoURL={profile?.photoURL} size={44} />
        </div>
      </div>

      {draft ? (
        <DraftBanner draft={draft} onResume={onResumeDraft} onStartFromScratch={onStartFromScratch} />
      ) : workouts.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {workouts.filter((w) => w.id === cycleInfo.next).map((w) => (
            <WorkoutListItem
              key={w.id} w={w} variant="home"
              isDone={cycleInfo.done.has(w.id)} isNext={w.id === cycleInfo.next}
              onStart={onStart} onOpenDetail={onOpenDetail}
            />
          ))}
        </div>
      ) : (
        <div style={S.cardEmpty}><p>Sem treinos atribuídos pelo professor. Fale com seu instrutor.</p></div>
      )}

      {workouts.length > 0 && (
        <div style={S.dashboardCard}>
          <h4 style={S.cardTitle}>Seu loop</h4>
          <CycleTracker workouts={workouts} cycleInfo={cycleInfo} onSelect={onStart} />
        </div>
      )}

      {trendChart && <TrendChart chart={trendChart} onInfoClick={onShowRpeTutorial} />}

      <SuggestionsCard suggestions={suggestions} />
    </div>
  );
}
