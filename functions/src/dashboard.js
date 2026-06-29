const { onCall } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { requireAdminOrProf } = require("./helpers");

const db = admin.firestore();

exports.getDashboardStats = onCall({ region: "us-central1" }, async (request) => {
  requireAdminOrProf(request);
  const now = Date.now();
  const msDay = 86400000;

  const [usersSnap, sessionsSnap] = await Promise.all([
    db.collection("users").where("role", "==", "aluno").get(),
    db.collectionGroup("sessions").orderBy("date", "desc").limit(200).get(),
  ]);

  const students = usersSnap.docs.map((d) => ({ uid: d.id, ...d.data() }));
  const sessionDocs = sessionsSnap.docs.map((d) => ({
    id: d.id, uid: d.ref.parent.parent.id, ...d.data(),
  }));

  const toMs = (d) => d?.toMillis?.() ?? (typeof d === "number" ? d : 0);

  const todaySessions = sessionDocs.filter((s) => now - toMs(s.date) < msDay).length;
  const weekSessions  = sessionDocs.filter((s) => now - toMs(s.date) < 7 * msDay).length;

  const lastByUid = {};
  for (const s of sessionDocs) {
    const ms = toMs(s.date);
    if (ms > 0 && (!lastByUid[s.uid] || ms > lastByUid[s.uid])) lastByUid[s.uid] = ms;
  }

  const inactiveCount = students.filter((st) => now - (lastByUid[st.uid] ?? 0) > 30 * msDay).length;
  const alertCount    = students.filter((st) => {
    const diff = now - (lastByUid[st.uid] ?? 0);
    return diff > 7 * msDay && diff <= 30 * msDay;
  }).length;

  const cache = {};
  const recentActivity = await Promise.all(sessionDocs.slice(0, 12).map(async (s) => {
    if (!cache[s.uid]) {
      const u = await db.collection("users").doc(s.uid).get();
      const d = u.exists ? u.data() : {};
      cache[s.uid] = { name: d.name ?? "Unknown", photoURL: d.photoURL ?? null };
    }
    return { ...s, studentName: cache[s.uid].name, studentPhoto: cache[s.uid].photoURL };
  }));

  const weekChart = Array.from({ length: 7 }, (_, i) => {
    const dayStart = now - (6 - i) * msDay;
    const dayEnd   = dayStart + msDay;
    const count    = sessionDocs.filter((s) => {
      const ms = toMs(s.date);
      return ms >= dayStart && ms < dayEnd;
    }).length;
    return { day: new Date(dayStart).toLocaleDateString("pt-BR", { weekday: "short" }), count };
  });

  const alerts = students
    .map((st) => {
      const last = lastByUid[st.uid];
      return { uid: st.uid, name: st.name, daysAgo: last != null ? Math.floor((now - last) / msDay) : null };
    })
    .filter((st) => st.daysAgo === null || st.daysAgo > 7)
    .sort((a, b) => (b.daysAgo ?? Infinity) - (a.daysAgo ?? Infinity));

  return { totalStudents: students.length, todaySessions, weekSessions, inactiveCount, alertCount, recentActivity, weekChart, alerts };
});
