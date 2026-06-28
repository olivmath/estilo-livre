import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, Users, Dumbbell, ClipboardList,
  Trophy, UserCog, LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "alunos",    label: "Alunos",    icon: Users },
  { key: "exercicios",label: "Exercícios",icon: Dumbbell },
  { key: "treinos",   label: "Treinos",   icon: ClipboardList },
  { key: "ranking",   label: "Ranking",   icon: Trophy },
  { key: "contas",    label: "Contas",    icon: UserCog, adminOnly: true },
];

const ROLE_LABEL = {
  admin:     "Administrador",
  professor: "Professor",
  aluno:     "Aluno",
  pendente:  "Pendente",
};

export function DashboardLayout() {
  const { profile, role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const base = location.pathname.startsWith("/admin") ? "/admin" : "/prof";

  const items = NAV_ITEMS.filter((i) => !i.adminOnly || role === "admin");

  function NavItem({ item }) {
    const to = `${base}/${item.key}`;
    const Icon = item.icon;
    return (
      <NavLink
        to={to}
        style={({ isActive }) => ({
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 12px",
          borderRadius: 10,
          fontSize: 14,
          fontWeight: isActive ? 600 : 400,
          color: isActive ? "var(--acc)" : "var(--sub)",
          background: isActive ? "rgba(245,196,0,0.08)" : "transparent",
          textDecoration: "none",
          transition: "all .15s",
        })}
      >
        <Icon size={18} />
        <span>{item.label}</span>
      </NavLink>
    );
  }

  const avatar = profile?.photoURL ? (
    <img
      src={profile.photoURL}
      alt=""
      style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }}
    />
  ) : (
    <div style={{
      width: 32, height: 32, borderRadius: "50%",
      background: "var(--blue)", display: "flex",
      alignItems: "center", justifyContent: "center",
      fontSize: 14, fontWeight: 700, color: "var(--acc)",
    }}>
      {profile?.name?.[0]?.toUpperCase() ?? "?"}
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      {/* Top header — mobile only */}
      <header
        className="flex md:hidden"
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          height: 52,
          background: "var(--bg2)",
          borderBottom: "1px solid var(--blue)",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          zIndex: 40,
        }}
      >
        <div>
          <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.2em", color: "var(--sub)", lineHeight: 1 }}>ACADEMIA</p>
          <p style={{ fontSize: 14, fontWeight: 800, color: "var(--acc)", letterSpacing: "0.05em", lineHeight: 1.2 }}>ESTILO LIVRE</p>
        </div>
        {avatar}
      </header>

      {/* Sidebar — desktop */}
      <aside style={{
        width: 220,
        background: "var(--bg2)",
        borderRight: "1px solid var(--blue)",
        flexDirection: "column",
        padding: "20px 12px",
        position: "fixed",
        top: 0, left: 0, bottom: 0,
        zIndex: 40,
      }}
        className="hidden md:flex"
      >
        {/* Logo */}
        <div style={{ padding: "8px 12px 20px", marginBottom: 8 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: "var(--sub)" }}>ACADEMIA</p>
          <p style={{ fontSize: 18, fontWeight: 800, color: "var(--acc)", letterSpacing: "0.05em" }}>
            ESTILO LIVRE
          </p>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          {items.map((item) => <NavItem key={item.key} item={item} />)}
        </nav>

        {/* Footer */}
        <div style={{
          borderTop: "1px solid var(--blue)",
          paddingTop: 16,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {avatar}
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {profile?.name ?? "…"}
              </p>
              <p style={{ fontSize: 11, color: "var(--sub)" }}>
                {ROLE_LABEL[role] ?? role}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut(auth)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 12px", borderRadius: 8,
              background: "transparent", color: "var(--sub)",
              border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 500,
              transition: "color .15s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--red)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--sub)"}
          >
            <LogOut size={15} />
            Sair
          </button>
          <p style={{ fontSize: 10, color: "var(--sub)", opacity: 0.4, padding: "0 12px" }}>
            v{__APP_VERSION__}
          </p>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1 }}
        className="ml-0 pt-[52px] pb-20 md:ml-[220px] md:pt-0 md:pb-0"
      >
        <Outlet />
      </main>

      {/* Bottom nav — mobile */}
      <nav style={{
        position: "fixed",
        bottom: 0, left: 0, right: 0,
        background: "var(--bg2)",
        borderTop: "1px solid var(--blue)",
        justifyContent: "space-around",
        padding: "8px 0",
        paddingBottom: "calc(8px + env(safe-area-inset-bottom, 0px))",
        zIndex: 40,
      }}
        className="flex md:hidden"
      >
        {items.map((item) => {
          const to = `${base}/${item.key}`;
          const Icon = item.icon;
          const isActive = location.pathname === to;
          return (
            <NavLink
              key={item.key}
              to={to}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                padding: "4px 8px",
                color: isActive ? "var(--acc)" : "var(--sub)",
                textDecoration: "none",
                fontSize: 10,
                fontWeight: isActive ? 600 : 400,
              }}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
