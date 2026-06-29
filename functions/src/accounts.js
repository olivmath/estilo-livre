const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { requireAdmin } = require("./helpers");

const db = admin.firestore();

exports.getAccounts = onCall({ region: "us-central1" }, async (request) => {
  requireAdmin(request);
  const snap = await db.collection("users").where("role", "in", ["admin", "professor"]).get();
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
});

exports.createAccount = onCall({ region: "us-central1" }, async (request) => {
  requireAdmin(request);
  const { email, name, role } = request.data;
  if (!["professor", "admin"].includes(role))
    throw new HttpsError("invalid-argument", "Role must be professor or admin");

  const existingAuth = await admin.auth().getUserByEmail(email).catch(() => null);
  if (existingAuth) {
    const snap = await db.collection("users").doc(existingAuth.uid).get();
    if (snap.exists) throw new HttpsError("already-exists", "Usuário já cadastrado");
    await db.collection("users").doc(existingAuth.uid).set({
      email, name, role,
      photoURL: existingAuth.photoURL ?? "",
      active: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastWorkout: null,
    });
    await admin.auth().setCustomUserClaims(existingAuth.uid, { role });
  } else {
    await db.collection("invites").doc(email).set({
      email, name, role,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  const roleLabel = role === "admin" ? "Administrador" : "Professor";
  await db.collection("mail").add({
    to: email,
    message: {
      subject: "Você foi adicionado ao Estilo Livre! 💪",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
          <h2 style="color:#F5C400">Estilo Livre</h2>
          <p>Olá, ${name}! Você foi adicionado à plataforma como <strong>${roleLabel}</strong>.</p>
          <p>Acesse com este e-mail (<strong>${email}</strong>) pelo Google:</p>
          <a href="https://academia-estilo-livre.web.app"
             style="display:inline-block;background:#F5C400;color:#06091a;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">
            Acessar plataforma
          </a>
          <p style="color:#888;font-size:12px">Se você não esperava este email, pode ignorá-lo.</p>
        </div>
      `,
    },
  });

  return { ok: true };
});

exports.deleteAccount = onCall({ region: "us-central1" }, async (request) => {
  requireAdmin(request);
  const { uid } = request.data;
  if (uid === request.auth.uid)
    throw new HttpsError("failed-precondition", "Cannot delete yourself");
  const snap = await db.collection("users").doc(uid).get();
  if (!snap.exists) throw new HttpsError("not-found", "User not found");
  await admin.auth().deleteUser(uid);
  await db.collection("users").doc(uid).delete();
  return { ok: true };
});
