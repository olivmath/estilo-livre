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
  await db.collection("invites").doc(email).set({
    email, name, role,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
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
