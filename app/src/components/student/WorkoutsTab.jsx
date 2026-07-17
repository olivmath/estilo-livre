import { useTranslation } from "react-i18next";
import { S } from "@/components/student/shared";
import { WorkoutListItem } from "@/components/student/WorkoutListItem";
import { CycleTracker } from "@/components/student/CycleTracker";

// "Meus Treinos" tab: compact loop widget + full list of assigned workouts.
export function WorkoutsTab({ workouts, cycleInfo, onStart, onOpenDetail }) {
  const { t } = useTranslation();
  return (
    <div>
      <h2 style={S.pageTitle}>{t("workoutsTab.title")}</h2>
      {workouts.length > 0 && (
        <div style={{ ...S.dashboardCard, padding: 12 }}>
          <h4 style={{ ...S.cardTitle, fontSize: 13, marginBottom: 8 }}>Loop</h4>
          <CycleTracker workouts={workouts} cycleInfo={cycleInfo} size={32} />
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
        {workouts.map((w) => (
          <WorkoutListItem
            key={w.id} w={w} variant="list"
            isDone={cycleInfo.done.has(w.id)} isNext={w.id === cycleInfo.next}
            onStart={onStart} onOpenDetail={onOpenDetail}
          />
        ))}
      </div>
    </div>
  );
}
