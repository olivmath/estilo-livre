import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "@/components/shared";
import { ActiveWorkoutScreen } from "@/screens/ActiveWorkoutScreen";
import { useStudentData } from "@/hooks/useStudentData";
import { getCycleInfo } from "@/hooks/useWorkoutCycle";
import { getTrendData } from "@/hooks/useTrendData";
import { getSuggestions } from "@/hooks/useSuggestions";
import { useActiveWorkoutSession } from "@/hooks/useActiveWorkoutSession";
import { useUploadPhoto } from "@/hooks/useUploadPhoto";
import { useEditWeight } from "@/hooks/useEditWeight";
import { useCelebrateCycle } from "@/hooks/useCelebrateCycle";
import { BottomNav } from "@/components/student/BottomNav";
import { HomeTab } from "@/components/student/HomeTab";
import { WorkoutsTab } from "@/components/student/WorkoutsTab";
import { HistoryTab } from "@/components/student/HistoryTab";
import { ProfileTab } from "@/components/student/ProfileTab";
import { WorkoutDetailOverlay } from "@/components/student/WorkoutDetailOverlay";
import { SessionReportOverlay } from "@/components/student/SessionReportOverlay";
import { EditWeightModal } from "@/components/student/EditWeightModal";
import { RpeTutorialSheet } from "@/components/student/RpeTutorialSheet";
import { S } from "@/components/student/shared";

// Student role entry point: 4-tab shell (home/workouts/history/profile) that
// hands off to ActiveWorkoutScreen while a session is running.
export function StudentApp() {
  const { user, profile } = useAuth();
  const [tab, setTab] = useState("home");
  const [selectedWk, setSelectedWk] = useState(null);
  const [viewingSession, setViewingSession] = useState(null);
  const [showRpeTutorial, setShowRpeTutorial] = useState(false);
  const [rpeTutSlide, setRpeTutSlide] = useState(0);

  const { workouts, sessions, draft, setDraft, loading, reload } = useStudentData(user);
  const cycleInfo = getCycleInfo(workouts, sessions);
  const trendChart = getTrendData(sessions);
  const suggestions = getSuggestions(workouts, sessions);
  useCelebrateCycle(cycleInfo.pct);

  const session = useActiveWorkoutSession({ user, workouts, sessions, setDraft, reload, onSaved: () => setTab("workouts") });
  const uploadPhoto = useUploadPhoto(user, reload);
  const editWeight = useEditWeight(user, workouts, reload);

  const changeTab = (t) => { setSelectedWk(null); setTab(t); };

  if (session.activeWk) {
    return (
      <ActiveWorkoutScreen
        activeWk={session.activeWk}
        workouts={workouts}
        elapsedTime={session.elapsedTime}
        restTime={session.restTime}
        restTotal={session.restTotal}
        restType={session.restType}
        showRpe={session.showRpe}
        rpeValue={session.rpeValue}
        setRpeValue={session.setRpeValue}
        showSummary={session.showSummary}
        summaryData={session.summaryData}
        showExit={session.showExit}
        onNextSet={session.handleNextSet}
        onConfirmRpe={session.confirmRpe}
        onAdjustWeight={session.adjustActiveWeight}
        onSaveSession={session.saveWorkoutSession}
        onSkipRest={session.skipRest}
        onShowExit={() => session.setShowExit(true)}
        onHideExit={() => session.setShowExit(false)}
        onConfirmExit={session.discardWorkout}
        onSavePartial={session.savePartialWorkout}
        onSwitchWorkout={session.switchWorkout}
        onSelectExercise={session.selectExercise}
        onExitWithoutSave={session.exitWithoutSave}
      />
    );
  }

  return (
    <div style={S.mobileContainer}>
      <EditWeightModal
        editingEx={editWeight.editingEx}
        value={editWeight.exWeightInput}
        onChange={editWeight.setExWeightInput}
        onClose={editWeight.closeEditWeight}
        onSave={editWeight.saveEditedWeight}
      />

      {selectedWk && (
        <WorkoutDetailOverlay wk={selectedWk} onClose={() => setSelectedWk(null)} onStart={session.startWorkout} onOpenExercise={editWeight.openSetWeightModal} />
      )}

      {viewingSession && (
        <SessionReportOverlay session={viewingSession} onClose={() => setViewingSession(null)} />
      )}

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", gap: 16 }}>
          <Spinner />
          <p style={{ color: "var(--sub)", fontSize: 14 }}>Carregando dados do aluno…</p>
        </div>
      ) : (
        <div style={{ paddingBottom: 80 }}>
          {tab === "home" && (
            <HomeTab
              profile={profile} workouts={workouts} draft={draft} cycleInfo={cycleInfo}
              trendChart={trendChart} suggestions={suggestions}
              onAvatarClick={() => changeTab("profile")}
              onStart={session.startWorkout} onOpenDetail={setSelectedWk}
              onResumeDraft={session.resumeWorkout} onStartFromScratch={session.startFromScratch}
              onShowRpeTutorial={() => { setShowRpeTutorial(true); setRpeTutSlide(0); }}
            />
          )}
          {tab === "workouts" && (
            <WorkoutsTab workouts={workouts} cycleInfo={cycleInfo} onStart={session.startWorkout} onOpenDetail={setSelectedWk} />
          )}
          {tab === "history" && (
            <HistoryTab sessions={sessions} onOpenSession={setViewingSession} />
          )}
          {tab === "profile" && (
            <ProfileTab profile={profile} sessionsCount={sessions.length} loopsCount={cycleInfo.cycles} onUploadPhoto={uploadPhoto} onSignOut={() => signOut(auth)} />
          )}
        </div>
      )}

      <BottomNav tab={tab} onChangeTab={changeTab} />

      <RpeTutorialSheet open={showRpeTutorial} onOpenChange={setShowRpeTutorial} slide={rpeTutSlide} setSlide={setRpeTutSlide} />
    </div>
  );
}
