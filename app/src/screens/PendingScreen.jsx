import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export function PendingScreen() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 390,
        background: "var(--bg2)",
        border: "1px solid var(--blue)",
        borderRadius: 20,
        padding: "40px 32px 32px",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>⏳</div>
        <h2 style={{ color: "var(--acc)", fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
          Acesso Pendente
        </h2>
        <p style={{ color: "var(--sub)", fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
          Sua conta está aguardando aprovação da academia.
          Assim que o professor liberar seu acesso, você poderá entrar.
        </p>
        <button
          onClick={() => signOut(auth)}
          style={{
            width: "100%",
            padding: "12px 20px",
            background: "var(--bg3)",
            color: "var(--text)",
            border: "1px solid var(--blue)",
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Sair
        </button>
      </div>
    </div>
  );
}
