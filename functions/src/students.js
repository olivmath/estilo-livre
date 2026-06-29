const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { requireAdminOrProf, requireAdmin } = require("./helpers");

const db = admin.firestore();
const msDay = 86400000;

exports.getStudents = onCall({ region: "us-central1" }, async (request) => {
  requireAdminOrProf(request);
  const snap = await db.collection("users")
    .where("role", "==", "aluno")
    .orderBy("name")
    .get();
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
});

exports.getStudent = onCall({ region: "us-central1" }, async (request) => {
  requireAdminOrProf(request);
  const { uid } = request.data;
  const snap = await db.collection("users").doc(uid).get();
  if (!snap.exists) throw new HttpsError("not-found", "Student not found");
  return { uid: snap.id, ...snap.data() };
});

exports.createStudent = onCall({ region: "us-central1" }, async (request) => {
  requireAdminOrProf(request);
  const { email, name } = request.data;
  if (!email) throw new HttpsError("invalid-argument", "email required");
  await db.collection("users").add({
    email,
    name: name ?? "",
    photoURL: "",
    role: "aluno",
    active: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    lastWorkout: null,
  });
  await db.collection("mail").add({
    to: email,
    message: {
      subject: "Você foi adicionado ao Estilo Livre! 💪",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
          <h2 style="color:#F5C400">Estilo Livre</h2>
          <p>Olá! Seu personal te adicionou à plataforma.</p>
          <p>Crie sua conta com este email (<strong>${email}</strong>) para acessar seus treinos:</p>
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

exports.updateStudent = onCall({ region: "us-central1" }, async (request) => {
  requireAdmin(request);
  const { uid, data } = request.data;
  if (!uid) throw new HttpsError("invalid-argument", "uid required");
  await db.collection("users").doc(uid).update(data);
  return { ok: true };
});

exports.deleteStudent = onCall({ region: "us-central1" }, async (request) => {
  requireAdmin(request);
  const { uid } = request.data;
  if (!uid) throw new HttpsError("invalid-argument", "uid required");
  await db.recursiveDelete(db.collection("users").doc(uid));
  return { ok: true };
});

exports.toggleBlock = onCall({ region: "us-central1" }, async (request) => {
  requireAdminOrProf(request);
  const { uid } = request.data;
  const snap = await db.collection("users").doc(uid).get();
  if (!snap.exists) throw new HttpsError("not-found", "Student not found");
  const next = !snap.data().active;
  await snap.ref.update({ active: next });
  return { active: next };
});

exports.getStudentStats = onCall({ region: "us-central1" }, async (request) => {
  requireAdminOrProf(request);
  const { uid } = request.data;
  const studentSnap = await db.collection("users").doc(uid).get();
  if (!studentSnap.exists) throw new HttpsError("not-found", "Student not found");

  if (!studentSnap.data().active)
    return { totalSessions: 0, weekSessions: 0, monthSessions: 0, daysLastWorkout: null, avgRpe: null, totalVolume: 0, cycles: 0, status: "blocked" };

  const snap = await db.collection("users").doc(uid).collection("sessions")
    .orderBy("date", "desc").get();
  const sessions = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  const toMs = (d) => d?.toMillis?.() ?? (typeof d === "number" ? d : 0);

  const now = Date.now();
  const totalSessions  = sessions.length;
  const weekSessions   = sessions.filter((s) => now - toMs(s.date) <= 7 * msDay).length;
  const monthSessions  = sessions.filter((s) => now - toMs(s.date) <= 30 * msDay).length;
  const daysLastWorkout = totalSessions > 0 && sessions[0].date
    ? Math.floor((now - toMs(sessions[0].date)) / msDay)
    : null;

  let rpeSum = 0, rpeCount = 0, totalVolume = 0;
  for (const s of sessions)
    for (const ex of (s.exs ?? s.exercises ?? [])) {
      const rpe = Number(ex.rpe);
      if (!isNaN(rpe) && rpe > 0) { rpeSum += rpe; rpeCount++; }
      totalVolume += (Number(ex.sets) || 0) * (Number(ex.reps) || 0) * (Number(ex.wt) || 0);
    }

  const avgRpe = rpeCount > 0 ? rpeSum / rpeCount : null;

  const wkSnap = await db.collection("users").doc(uid).collection("workouts").get();
  const workoutIds = new Set(wkSnap.docs.map((d) => d.id));
  let cycles = 0;
  if (workoutIds.size > 0) {
    const seen = new Set();
    for (const s of [...sessions].reverse()) {
      if (s.wkId && workoutIds.has(s.wkId)) {
        seen.add(s.wkId);
        if (seen.size === workoutIds.size) { cycles++; seen.clear(); }
      }
    }
  }

  const status = daysLastWorkout === null || daysLastWorkout > 30 ? "inactive"
    : daysLastWorkout > 7 ? "warning" : "active";

  return { totalSessions, weekSessions, monthSessions, daysLastWorkout, avgRpe, totalVolume, cycles, status };
});
