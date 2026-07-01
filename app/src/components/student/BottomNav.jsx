import { LayoutDashboard, Dumbbell, History, User } from "lucide-react";

const ITEMS = [
  { id: "home", icon: LayoutDashboard, label: "Início" },
  { id: "workouts", icon: Dumbbell, label: "Treinos" },
  { id: "history", icon: History, label: "Histórico" },
  { id: "profile", icon: User, label: "Perfil" },
];

// Fixed bottom tab bar for the student app's 4 sections.
export function BottomNav({ tab, onChangeTab }) {
  return (
    <nav style={S.bottomNav}>
      {ITEMS.map(({ id, icon: Icon, label }) => (
        <button key={id} onClick={() => onChangeTab(id)} style={{ ...S.navItem, color: tab === id ? "var(--acc)" : "var(--sub)" }}>
          <Icon size={20} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

const S = {
  bottomNav: { position: "fixed", bottom: 0, left: 0, right: 0, background: "var(--bg2)", borderTop: "1px solid var(--blue)", display: "flex", justifyContent: "space-around", padding: "10px 0 16px", zIndex: 50 },
  navItem: { background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 500, cursor: "pointer" },
};
