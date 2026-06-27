const { onCall, HttpsError } = require("firebase-functions/v2/https");
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

// Roles pré-definidos por email (seed). Qualquer outro email recebe "aluno".
const SEEDED_ROLES = {
  "olivmath97@gmail.com": "admin",
};

// Auth trigger (v1) — v2 auth triggers not yet available
exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
  const role = SEEDED_ROLES[user.email] ?? "aluno";

  await db.collection("users").doc(user.uid).set({
    email: user.email,
    name: user.displayName ?? "",
    photoURL: user.photoURL ?? "",
    role,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Custom claim permite que security rules leiam role sem round-trip extra
  await admin.auth().setCustomUserClaims(user.uid, { role });
});

/**
 * Callable: retorna o role do usuário autenticado.
 * O cliente usa isso após login para saber para qual app redirecionar.
 */
exports.getMyRole = onCall({ region: "us-central1" }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Login required");
  }

  const snap = await db.collection("users").doc(request.auth.uid).get();
  if (!snap.exists) {
    throw new HttpsError("not-found", "User profile not found");
  }

  return { role: snap.data().role, name: snap.data().name };
});

/**
 * Callable: admin altera role de outro usuário.
 * Só pode ser chamada por quem tem claim role === "admin".
 */
exports.setUserRole = onCall({ region: "us-central1" }, async (request) => {
  const callerRole = request.auth?.token?.role;
  if (callerRole !== "admin") {
    throw new HttpsError("permission-denied", "Admin only");
  }

  const { targetUid, newRole } = request.data;
  const validRoles = ["aluno", "prof", "admin"];
  if (!validRoles.includes(newRole)) {
    throw new HttpsError("invalid-argument", "Invalid role");
  }

  await db.collection("users").doc(targetUid).update({ role: newRole });
  await admin.auth().setCustomUserClaims(targetUid, { role: newRole });

  return { ok: true };
});
