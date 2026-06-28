import { useEffect, useState, useCallback } from "react";
import { collection, getDocs, setDoc, deleteDoc, doc, serverTimestamp, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, X } from "lucide-react";

const ROLE_LABELS = { admin: "Administrador", professor: "Professor" };
const ROLE_COLORS = {
  admin:     { bg: "rgba(245,196,0,0.12)",  text: "var(--acc)" },
  professor: { bg: "rgba(35,82,200,0.15)",  text: "var(--blue2)" },
};

function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
      <div className="w-8 h-8 rounded-full border-[3px] animate-spin"
        style={{ borderColor: "var(--bg3)", borderTopColor: "var(--acc)" }} />
    </div>
  );
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      display: "flex", alignItems: "flex-end",
      background: "rgba(0,0,0,0.6)",
    }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%", maxWidth: 480, margin: "0 auto",
          background: "var(--bg2)", borderTopLeftRadius: 20, borderTopRightRadius: 20,
          border: "1px solid var(--blue)", borderBottom: "none",
          padding: "24px 20px 32px", maxHeight: "90vh", overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--sub)" }}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "10px 12px", background: "var(--bg3)",
  border: "1px solid var(--blue)", borderRadius: 8, color: "var(--text)",
  fontSize: 14, outline: "none",
};

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 12, color: "var(--sub)", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

async function getStaffUsers() {
  const q = query(collection(db, "users"), where("role", "in", ["admin", "professor"]));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
}

async function createStaffUser(data) {
  const ref = doc(collection(db, "users"));
  await setDoc(ref, {
    name: data.name,
    email: data.email,
    role: data.role,
    invitePending: true,
    photoURL: "",
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

async function deleteStaffUser(uid) {
  await deleteDoc(doc(db, "users", uid));
}

function NovoContaModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({ name: "", email: "", role: "professor" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function set(k, v) { setForm((p) => ({ ...p, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await createStaffUser(form);
      setForm({ name: "", email: "", role: "professor" });
      onCreated();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nova Conta">
      <form onSubmit={submit}>
        {error && <p style={{ color: "var(--red)", fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <div style={{
          background: "var(--bg3)", borderRadius: 8, padding: "10px 12px", marginBottom: 16,
          fontSize: 12, color: "var(--sub)", lineHeight: 1.5,
        }}>
          O usuário receberá acesso ao fazer login com o Google usando este e-mail.
        </div>
        <Field label="Nome">
          <input style={inputStyle} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Nome completo" required />
        </Field>
        <Field label="Email">
          <input type="email" style={inputStyle} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="email@dominio.com" required />
        </Field>
        <Field label="Papel">
          <select style={inputStyle} value={form.role} onChange={(e) => set("role", e.target.value)}>
            <option value="professor">Professor</option>
            <option value="admin">Administrador</option>
          </select>
        </Field>
        <Button type="submit" disabled={loading} style={{ width: "100%", height: 40 }}>
          {loading ? "Criando…" : "Criar Conta"}
        </Button>
      </form>
    </Modal>
  );
}

export function ContasPage() {
  const { user, profile } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [novoOpen, setNovoOpen] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    getStaffUsers()
      .then(setUsers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(uid) {
    if (!confirm("Remover esta conta?")) return;
    await deleteStaffUser(uid);
    load();
  }

  if (loading) return <Spinner />;
  if (error) return <div style={{ padding: 24, color: "var(--red)", fontSize: 13 }}>{error}</div>;

  return (
    <div style={{ padding: "24px 20px", maxWidth: 700 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)" }}>Contas</h1>
        <Button size="sm" onClick={() => setNovoOpen(true)}>
          <Plus size={15} /> Nova Conta
        </Button>
      </div>

      {users.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--sub)" }}>Nenhuma conta encontrada</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {users.map((u) => {
            const isMe = u.uid === user?.uid;
            const roleC = ROLE_COLORS[u.role] ?? ROLE_COLORS.professor;
            return (
              <div key={u.uid} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "14px 16px", background: "var(--bg2)",
                border: `1px solid ${isMe ? "var(--acc)" : "var(--blue)"}`,
                borderRadius: 12,
              }}>
                {/* Avatar */}
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: u.photoURL ? "transparent" : "var(--blue)",
                  overflow: "hidden", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, fontWeight: 800, color: "var(--acc)",
                }}>
                  {u.photoURL
                    ? <img src={u.photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : (u.name?.[0]?.toUpperCase() ?? "?")}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{u.name}</p>
                    {isMe && (
                      <span style={{
                        fontSize: 10, padding: "1px 6px", borderRadius: 10,
                        background: "rgba(245,196,0,0.15)", color: "var(--acc)", fontWeight: 700,
                      }}>
                        Você
                      </span>
                    )}
                    {u.invitePending && (
                      <span style={{
                        fontSize: 10, padding: "1px 6px", borderRadius: 10,
                        background: "rgba(121,134,203,0.15)", color: "var(--sub)",
                      }}>
                        Pendente
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 11, color: "var(--sub)" }}>{u.email}</p>
                </div>

                <span style={{
                  fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                  background: roleC.bg, color: roleC.text, flexShrink: 0,
                }}>
                  {ROLE_LABELS[u.role] ?? u.role}
                </span>

                {!isMe && (
                  <button
                    onClick={() => handleDelete(u.uid)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--red)", padding: 6 }}
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <NovoContaModal open={novoOpen} onClose={() => setNovoOpen(false)} onCreated={load} />
    </div>
  );
}
