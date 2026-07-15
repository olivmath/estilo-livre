const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { requireAdminOrProf, requireAuth } = require("./helpers");

const db = admin.firestore();

exports.getStudentSessions = onCall({ region: "us-central1" }, async (request) => {
  requireAdminOrProf(request);
  const { uid, limitCount = 50 } = request.data;
  const snap = await db.collection("users").doc(uid).collection("sessions")
    .orderBy("date", "desc").limit(limitCount).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
});

exports.getRecentActivity = onCall({ region: "us-central1" }, async (request) => {
  requireAdminOrProf(request);
  const { limitCount = 20 } = request.data ?? {};
  const snap = await db.collectionGroup("sessions")
    .orderBy("date", "desc").limit(limitCount).get();

  const cache = {};
  return Promise.all(snap.docs.map(async (d) => {
    const uid = d.ref.parent.parent.id;
    if (!cache[uid]) {
      const u = await db.collection("users").doc(uid).get();
      cache[uid] = u.exists ? u.data().name : "Unknown";
    }
    return { id: d.id, uid, studentName: cache[uid], ...d.data() };
  }));
});

exports.updateStudentSession = onCall({ region: "us-central1" }, async (request) => {
  const auth = requireAuth(request);
  const { uid, sessionId, exs } = request.data;
  if (!uid || !sessionId || !Array.isArray(exs)) {
    throw new HttpsError("invalid-argument", "uid, sessionId, and exs array required");
  }
  if (uid !== auth.uid) {
    throw new HttpsError("permission-denied", "Cannot edit another user's session");
  }
  await db.collection("users").doc(uid).collection("sessions").doc(sessionId).update({ exs });
  return { ok: true };
});
