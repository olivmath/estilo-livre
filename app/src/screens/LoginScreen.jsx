import { useState } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import logoImg from "@/assets/logo.jpeg";

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
  </svg>
);

export function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const { notAuthorized, clearNotAuthorized } = useAuth();

  async function handleGoogle() {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      {notAuthorized && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <span style={styles.modalIcon}>🚫</span>
            <h2 style={styles.modalTitle}>Acesso negado</h2>
            <p style={styles.modalBody}>
              Sua conta não está cadastrada na academia. Entre em contato com o administrador.
            </p>
            <button style={styles.modalBtn} onClick={clearNotAuthorized}>
              Voltar ao login
            </button>
          </div>
        </div>
      )}
      <div style={styles.card}>

        {/* Logo */}
        <div style={styles.logoWrap}>
          <img src={logoImg} alt="Estilo Livre" style={styles.logoImg} />
        </div>

        {/* Brand */}
        <p style={styles.brandSub}>ACADEMIA</p>
        <h1 style={styles.brandName}>ESTILO LIVRE</h1>

        {/* Divider */}
        <div style={styles.divider} />

        {/* Error */}
        {error && <p style={styles.error}>{error}</p>}

        {/* Google button */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          style={styles.btnGoogle}
          onMouseEnter={e => e.currentTarget.style.opacity = ".88"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          {loading
            ? <span style={styles.spinner} />
            : <GoogleIcon />
          }
          <span>{loading ? "Entrando…" : "Continuar com Google"}</span>
        </button>

        <p style={styles.footnote}>
          Apenas membros da academia têm acesso.
        </p>

        <p style={{ marginTop: 16, fontSize: 11, color: "var(--sub)", opacity: 0.4 }}>
          v{__APP_VERSION__}
        </p>
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
  logoWrap: {
    width: 88,
    height: 88,
    borderRadius: "50%",
    overflow: "hidden",
    margin: "0 auto 24px",
    border: "2px solid var(--acc)",
    boxShadow: "0 0 32px rgba(245,196,0,0.25)",
  },
  logoImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  brandSub: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.25em",
    color: "var(--sub)",
    marginBottom: 4,
  },
  brandName: {
    fontSize: 30,
    fontWeight: 800,
    letterSpacing: "0.08em",
    color: "var(--acc)",
    marginBottom: 8,
    lineHeight: 1,
  },
  tagline: {
    fontSize: 13,
    color: "var(--sub)",
    marginBottom: 0,
  },
  divider: {
    height: 1,
    background: "linear-gradient(90deg, transparent, var(--blue), transparent)",
    margin: "28px 0",
  },
  error: {
    fontSize: 13,
    color: "var(--red)",
    background: "rgba(244,67,54,0.08)",
    border: "1px solid rgba(244,67,54,0.25)",
    borderRadius: 8,
    padding: "10px 14px",
    marginBottom: 16,
  },
  btnGoogle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    width: "100%",
    padding: "14px 20px",
    background: "#ffffff",
    color: "#1f1f1f",
    border: "none",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    transition: "opacity .15s",
    outline: "none",
  },
  spinner: {
    display: "inline-block",
    width: 18,
    height: 18,
    border: "2px solid #ccc",
    borderTopColor: "#333",
    borderRadius: "50%",
    animation: "spin .7s linear infinite",
    flexShrink: 0,
  },
  footnote: {
    marginTop: 20,
    fontSize: 12,
    color: "var(--sub)",
    opacity: 0.7,
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "24px 16px",
  },
  modal: {
    width: "100%",
    maxWidth: 340,
    background: "var(--bg2)",
    border: "1px solid var(--red)",
    borderRadius: 20,
    padding: "36px 28px 28px",
    textAlign: "center",
    boxShadow: "0 0 40px rgba(244,67,54,0.2)",
  },
  modalIcon: {
    fontSize: 48,
    display: "block",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "var(--text)",
    marginBottom: 12,
  },
  modalBody: {
    fontSize: 14,
    color: "var(--sub)",
    lineHeight: 1.6,
    marginBottom: 24,
  },
  modalBtn: {
    width: "100%",
    padding: "13px 20px",
    background: "var(--red)",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
  },
};
