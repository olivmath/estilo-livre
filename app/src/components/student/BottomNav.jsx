import { useTranslation } from "react-i18next";
import { LayoutDashboard, Dumbbell, History, User } from "lucide-react";

const ITEM_KEYS = [
  { id: "home", icon: LayoutDashboard, key: "nav.home" },
  { id: "workouts", icon: Dumbbell, key: "nav.workouts" },
  { id: "history", icon: History, key: "nav.history" },
  { id: "profile", icon: User, key: "nav.profile" },
];

// Fixed bottom tab bar for the student app's 4 sections.
export function BottomNav({ tab, onChangeTab }) {
  const { t } = useTranslation();
  return (
    <nav style={S.bottomNav}>
      {ITEM_KEYS.map(({ id, icon: Icon, key }) => (
        <button key={id} onClick={() => onChangeTab(id)} style={{ ...S.navItem, color: tab === id ? "var(--acc)" : "var(--sub)" }}>
          <Icon size={20} />
          <span>{t(key)}</span>
        </button>
      ))}
    </nav>
  );
}

const S = {
  bottomNav: { position: "fixed", bottom: 0, left: 0, right: 0, background: "var(--bg2)", borderTop: "1px solid var(--blue)", display: "flex", justifyContent: "space-around", padding: "10px 0 16px", zIndex: 50 },
  navItem: { background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 500, cursor: "pointer" },
};
