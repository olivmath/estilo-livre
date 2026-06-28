const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { requireAuth, requireAdminOrProf } = require("./helpers");

const db = admin.firestore();

exports.getTemplates = onCall({ region: "us-central1" }, async (request) => {
  requireAuth(request);
  const snap = await db.collection("wk_templates").orderBy("label").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
});

exports.createTemplate = onCall({ region: "us-central1" }, async (request) => {
  const auth = requireAdminOrProf(request);
  const ref = await db.collection("wk_templates").add({
    ...request.data,
    createdBy: auth.uid,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return { id: ref.id };
});

exports.updateTemplate = onCall({ region: "us-central1" }, async (request) => {
  requireAdminOrProf(request);
  const { id, data } = request.data;
  await db.collection("wk_templates").doc(id).update(data);
  return { ok: true };
});

exports.deleteTemplate = onCall({ region: "us-central1" }, async (request) => {
  requireAdminOrProf(request);
  await db.collection("wk_templates").doc(request.data.id).delete();
  return { ok: true };
});

exports.getStudentWorkouts = onCall({ region: "us-central1" }, async (request) => {
  requireAdminOrProf(request);
  const { uid } = request.data;
  const snap = await db.collection("users").doc(uid).collection("workouts").get();
  const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  docs.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  return docs;
});

exports.assignTemplate = onCall({ region: "us-central1" }, async (request) => {
  const auth = requireAdminOrProf(request);
  const { uid, templateId } = request.data;
  const [tmplSnap, countSnap] = await Promise.all([
    db.collection("wk_templates").doc(templateId).get(),
    db.collection("users").doc(uid).collection("workouts").count().get(),
  ]);
  if (!tmplSnap.exists) throw new HttpsError("not-found", "Template not found");
  const tmpl = tmplSnap.data();
  const ref = db.collection("users").doc(uid).collection("workouts").doc();
  await ref.set({
    label: tmpl.label, name: tmpl.name, color: tmpl.color,
    exercises: tmpl.exercises ?? [],
    order: countSnap.data().count,
    assignedAt: admin.firestore.FieldValue.serverTimestamp(),
    assignedBy: auth.uid,
    fromTemplateId: templateId,
  });
  return { id: ref.id };
});

exports.createCustomWorkout = onCall({ region: "us-central1" }, async (request) => {
  const auth = requireAdminOrProf(request);
  const { uid, data } = request.data;
  const countSnap = await db.collection("users").doc(uid).collection("workouts").count().get();
  const ref = await db.collection("users").doc(uid).collection("workouts").add({
    ...data,
    order: countSnap.data().count,
    assignedAt: admin.firestore.FieldValue.serverTimestamp(),
    assignedBy: auth.uid,
    fromTemplateId: null,
  });
  return { id: ref.id };
});

exports.updateStudentWorkout = onCall({ region: "us-central1" }, async (request) => {
  requireAdminOrProf(request);
  const { uid, wkId, data } = request.data;
  await db.collection("users").doc(uid).collection("workouts").doc(wkId).update(data);
  return { ok: true };
});

exports.deleteStudentWorkout = onCall({ region: "us-central1" }, async (request) => {
  requireAdminOrProf(request);
  const { uid, wkId } = request.data;
  await db.collection("users").doc(uid).collection("workouts").doc(wkId).delete();
  return { ok: true };
});

exports.reorderStudentWorkouts = onCall({ region: "us-central1" }, async (request) => {
  requireAdminOrProf(request);
  const { uid, orderedIds } = request.data;
  if (!uid || !Array.isArray(orderedIds)) throw new HttpsError("invalid-argument", "uid and orderedIds required");
  const batch = db.batch();
  orderedIds.forEach((wkId, i) => {
    batch.update(db.collection("users").doc(uid).collection("workouts").doc(wkId), { order: i });
  });
  await batch.commit();
  return { ok: true };
});
