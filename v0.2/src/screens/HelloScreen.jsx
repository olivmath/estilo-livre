import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const ROLE_META = {
  admin:    { label: "Admin",      bg: "#F5C400", color: "#000",     path: "/app/admin/", desc: "painel administrativo" },
  prof:     { label: "Professor",  bg: "#2352c8", color: "#fff",     path: "/app/prof/",  desc: "área do professor"     },
  aluno:    { label: "Aluno",      bg: "#00c853", color: "#000",     path: "/app/user/",  desc: "app de treinos"        },
  pendente: { label: "Pendente",   bg: "#162040", color: "#7986cb",  path: null,          desc: null                    },
};

export function HelloScreen({ user, role }) {
  const meta  = ROLE_META[role] ?? ROLE_META.pendente;
  const first = user?.displayName?.split(" ")[0] ?? "";

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* Avatar */}
        {user?.photoURL ? (
          <img src={user.photoURL} alt={user.displayName} style={styles.avatar} />
        ) : (
          <div style={{ ...styles.avatar, ...styles.avatarFallback }}>
            {first[0]?.toUpperCase() ?? "?"}
          </div>
        )}

        {/* Greeting */}
        <p style={styles.greeting}>Bem vindo,</p>
        <h1 style={styles.name}>{first}</h1>

        {/* Badge */}
        <span style={{ ...styles.badge, background: meta.bg, color: meta.color }}>
          {meta.label}
        </span>

        {/* Divider */}
        <div style={styles.divider} />

        {/* CTA */}
        {meta.path ? (
          <>
            <p style={styles.desc}>Acesse o {meta.desc}.</p>
            <button
              style={styles.btnEnter}
              onClick={() => { window.location.href = meta.path; }}
              onMouseEnter={e => e.currentTarget.style.opacity = ".88"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              Entrar no app →
            </button>
          </>
        ) : (
          <div style={styles.pendingBox}>
            <span style={styles.pendingIcon}>⏳</span>
            <p style={styles.pendingText}>
              Seu acesso ainda não foi liberado.<br />
              Fale com o administrador.
            </p>
          </div>
        )}

        <button style={styles.btnLogout} onClick={() => signOut(auth)}>
          Sair da conta
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "var(--bg)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 16px",
  },
  card: {
    width: "100%",
    maxWidth: 390,
    background: "var(--bg2)",
    border: "1px solid var(--blue)",
    borderRadius: 20,
    padding: "40px 32px 32px",
    textAlign: "center",
    boxShadow: "0 0 60px rgba(27,52,135,0.35), 0 24px 48px rgba(0,0,0,0.4)",
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid var(--acc)",
    boxShadow: "0 0 24px rgba(245,196,0,0.3)",
    display: "block",
    margin: "0 auto 20px",
  },
  avatarFallback: {
    background: "var(--bg3)",
    color: "var(--text)",
    fontSize: 36,
    fontWeight: 700,
    lineHeight: "90px",
    textAlign: "center",
  },
  greeting: {
    fontSize: 13,
    color: "var(--sub)",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  name: {
    fontSize: 32,
    fontWeight: 800,
    color: "var(--text)",
    marginBottom: 16,
    lineHeight: 1.1,
  },
  badge: {
    display: "inline-block",
    padding: "4px 16px",
    borderRadius: 99,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  },
  divider: {
    height: 1,
    background: "linear-gradient(90deg, transparent, var(--blue), transparent)",
    margin: "28px 0",
  },
  desc: {
    fontSize: 14,
    color: "var(--sub)",
    marginBottom: 20,
  },
  btnEnter: {
    width: "100%",
    padding: "15px 20px",
    background: "var(--acc)",
    color: "#000",
    border: "none",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    transition: "opacity .15s",
    outline: "none",
    letterSpacing: "0.02em",
  },
  pendingBox: {
    background: "var(--bg3)",
    border: "1px solid var(--blue)",
    borderRadius: 12,
    padding: "20px 16px",
  },
  pendingIcon: {
    fontSize: 28,
    display: "block",
    marginBottom: 10,
  },
  pendingText: {
    fontSize: 13,
    color: "var(--sub)",
    lineHeight: 1.6,
  },
  btnLogout: {
    marginTop: 20,
    background: "none",
    border: "none",
    color: "var(--sub)",
    fontSize: 13,
    cursor: "pointer",
    textDecoration: "underline",
    opacity: 0.7,
    outline: "none",
  },
};
