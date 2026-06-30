import { useEffect, useState, useCallback } from "react";
import { collection, getDocs, deleteDoc, doc, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { createAccount, setUserRole } from "@/services/accounts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Spinner, UserAvatar, Field } from "@/components/shared";
import { Plus, Trash2 } from "lucide-react";

const ROLE_LABELS = { admin: "Administrador", professor: "Professor" };
const ROLE_COLORS = {
  admin:     { bg: "rgba(245,196,0,0.12)",  text: "var(--acc)" },
  professor: { bg: "rgba(35,82,200,0.15)",  text: "var(--blue2)" },
};

async function getStaffUsers() {
  const q = query(collection(db, "users"), where("role", "in", ["admin", "professor"]));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
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
      await createAccount(form);
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
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent style={{ background: "var(--bg2)", border: "1px solid var(--blue)", borderRadius: 16, color: "var(--text)" }}>
        <DialogHeader>
          <DialogTitle style={{ color: "var(--text)" }}>Nova Conta</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit}>
          {error && <p style={{ color: "var(--red)", fontSize: 13, marginBottom: 12 }}>{error}</p>}
          <div style={{
            background: "var(--bg3)", borderRadius: 8, padding: "10px 12px", marginBottom: 16,
            fontSize: 12, color: "var(--sub)", lineHeight: 1.5,
          }}>
            O usuário receberá acesso ao fazer login com o Google usando este e-mail.
          </div>
          <Field label="Nome" htmlFor="conta-nome">
            <Input
              id="conta-nome"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Nome completo"
              required
              style={{ background: "var(--bg3)", border: "1px solid var(--blue)", color: "var(--text)" }}
            />
          </Field>
          <Field label="Email" htmlFor="conta-email">
            <Input
              id="conta-email"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="email@dominio.com"
              required
              style={{ background: "var(--bg3)", border: "1px solid var(--blue)", color: "var(--text)" }}
            />
          </Field>
          <Field label="Papel" htmlFor="conta-papel">
            <Select value={form.role} onValueChange={(v) => set("role", v)}>
              <SelectTrigger id="conta-papel" style={{ background: "var(--bg3)", border: "1px solid var(--blue)", color: "var(--text)" }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{ background: "var(--bg2)", border: "1px solid var(--blue)" }}>
                <SelectItem value="professor">Professor</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Button type="submit" disabled={loading} style={{ width: "100%", height: 40 }}>
            {loading ? "Criando…" : "Criar Conta"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ContasPage() {
  const { user, role: myRole } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [novoOpen, setNovoOpen] = useState(false);
  const [changingRole, setChangingRole] = useState(null);

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

  async function handleRoleChange(uid, newRole) {
    setChangingRole(uid);
    try {
      await setUserRole(uid, newRole);
      load();
    } finally {
      setChangingRole(null);
    }
  }

  if (loading) return <Spinner />;
  if (error) return <div style={{ padding: 24, color: "var(--red)", fontSize: 13 }}>{error}</div>;

  return (
    <div style={{ padding: "20px 16px", maxWidth: 700, margin: "0 auto" }}>
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
                <UserAvatar name={u.name} photoURL={u.photoURL} size={40} />

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

                {myRole === "admin" && !isMe ? (
                  <Select
                    value={u.role}
                    disabled={changingRole === u.uid}
                    onValueChange={(v) => handleRoleChange(u.uid, v)}
                  >
                    <SelectTrigger style={{
                      fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                      background: roleC.bg, color: roleC.text, border: "none",
                      width: "auto", height: "auto",
                      opacity: changingRole === u.uid ? 0.5 : 1,
                    }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent style={{ background: "var(--bg2)", border: "1px solid var(--blue)" }}>
                      <SelectItem value="professor">Professor</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                    background: roleC.bg, color: roleC.text, flexShrink: 0,
                  }}>
                    {ROLE_LABELS[u.role] ?? u.role}
                  </span>
                )}

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
