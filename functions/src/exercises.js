const { onCall } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { requireAuth, requireAdminOrProf } = require("./helpers");

const db = admin.firestore();

exports.getExercises = onCall({ region: "us-central1" }, async (request) => {
  requireAuth(request);
  const snap = await db.collection("exercises").orderBy("group").orderBy("name").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
});

exports.createExercise = onCall({ region: "us-central1" }, async (request) => {
  const auth = requireAdminOrProf(request);
  const ref = await db.collection("exercises").add({
    ...request.data,
    createdBy: auth.uid,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return { id: ref.id };
});

exports.updateExercise = onCall({ region: "us-central1" }, async (request) => {
  requireAdminOrProf(request);
  const { id, data } = request.data;
  await db.collection("exercises").doc(id).update(data);
  return { ok: true };
});

exports.deleteExercise = onCall({ region: "us-central1" }, async (request) => {
  requireAdminOrProf(request);
  await db.collection("exercises").doc(request.data.id).delete();
  return { ok: true };
});
