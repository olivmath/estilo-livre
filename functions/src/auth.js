const { onCall, HttpsError } = require("firebase-functions/v2/https");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { requireAuth, requireAdmin } = require("./helpers");

const db = admin.firestore();

const SEEDED_ROLES = {
  "olivmath97@gmail.com": "admin",
  "maiquiniqueBA@gmail.com": "prof",
};

exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
  const inviteSnap = await db.collection("invites").doc(user.email).get();
  let role = SEEDED_ROLES[user.email] ?? "pendente";
  let extra = {};

  if (inviteSnap.exists) {
    role = inviteSnap.data().role;
    extra.inviteAccepted = true;
    await inviteSnap.ref.delete();
  }

  await db.collection("users").doc(user.uid).set({
    email: user.email,
    name: user.displayName ?? "",
    photoURL: user.photoURL ?? "",
    role,
    active: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    lastWorkout: null,
    ...extra,
  });

  await admin.auth().setCustomUserClaims(user.uid, { role });
});

exports.getMyRole = onCall({ region: "us-central1" }, async (request) => {
  const auth = requireAuth(request);
  const snap = await db.collection("users").doc(auth.uid).get();
  if (!snap.exists) throw new HttpsError("not-found", "User profile not found");
  return { role: snap.data().role, name: snap.data().name };
});

exports.setUserRole = onCall({ region: "us-central1" }, async (request) => {
  requireAdmin(request);
  const { targetUid, newRole } = request.data;
  const validRoles = ["pendente", "aluno", "professor", "admin"];
  if (!validRoles.includes(newRole))
    throw new HttpsError("invalid-argument", "Invalid role");
  await db.collection("users").doc(targetUid).update({ role: newRole });
  await admin.auth().setCustomUserClaims(targetUid, { role: newRole });
  return { ok: true };
});
