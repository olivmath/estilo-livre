import { useTranslation } from "react-i18next";
import { UserAvatar } from "@/components/shared";
import { S } from "@/components/student/shared";
import { LoopRingHero } from "@/components/student/LoopRingHero";
import { LoopDots } from "@/components/student/LoopDots";
import { TrendChart } from "@/components/student/TrendChart";
import { DraftBanner } from "@/components/student/DraftBanner";

export function HomeTab({
  profile, workouts, cycleInfo, draft, trendChart, suggestions, user, reload,
  onAvatarClick, onStart, onResumeDraft, onStartFromScratch, onShowRpeTutorial,
}) {
  const { t } = useTranslation();
  const spacing = {
    px: "clamp(4px, 1.5vw, 8px)",
    sm: "clamp(6px, 2vw, 10px)",
    md: "clamp(10px, 3vw, 16px)",
  };

  return (
    <div style={{ padding: spacing.px }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: spacing.px,
          marginBottom: spacing.sm,
        }}
        role="banner"
      >
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, lineHeight: 1.2 }}>
            {t("home.greeting", { name: profile?.name?.split(" ")[0] ?? t("common.athlete") })} 👋
          </h1>
          <span
            style={{
              fontSize: 10,
              color: "var(--acc)",
              fontWeight: 700,
              letterSpacing: 2,
              display: "block",
            }}
            aria-label={t("home.academyName")}
          >
            {t("home.academyName")}
          </span>
        </div>
        <button
          onClick={onAvatarClick}
          style={{
            cursor: "pointer",
            flexShrink: 0,
            border: "none",
            background: "transparent",
            padding: 0,
          }}
          aria-label={t("home.editProfile", { name: profile?.name ?? t("common.athlete") })}
        >
          <UserAvatar name={profile?.name} photoURL={profile?.photoURL} size={44} />
        </button>
      </div>

      {/* Draft Banner */}
      {draft && (
        <div style={{ marginBottom: spacing.sm }}>
          <DraftBanner draft={draft} onResume={onResumeDraft} onStartFromScratch={onStartFromScratch} />
        </div>
      )}

      {/* Hero: Loop Ring + Dots — all same spacing (spacing.sm) */}
      {workouts.length > 0 && (
        <div style={{ marginBottom: spacing.md }}>
          <LoopRingHero
            loopsCompleted={cycleInfo.cycles}
            totalWorkouts={workouts.length}
            done={cycleInfo.done}
            hasDraft={!!draft}
          />
          <LoopDots workouts={workouts} cycleInfo={cycleInfo} onSelect={onStart} />
        </div>
      )}

      {/* Trend chart */}
      {trendChart && <TrendChart chart={trendChart} suggestions={suggestions} user={user} workouts={workouts} reload={reload} onInfoClick={() => onShowRpeTutorial?.()} />}

      {/* Empty state */}
      {workouts.length === 0 && (
        <div style={S.cardEmpty} role="status" aria-live="polite">
          <p>{t("home.noWorkouts")}</p>
        </div>
      )}
    </div>
  );
}
