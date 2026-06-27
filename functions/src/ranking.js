const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { requireAdminOrProf } = require("./helpers");

const db = admin.firestore();

function avgRpe(sessions) {
  let sum = 0, count = 0;
  for (const s of sessions)
    for (const ex of s.exercises ?? []) {
      const rpe = Number(ex.rpe);
      if (!isNaN(rpe) && rpe > 0) { sum += rpe; count++; }
    }
  return count > 0 ? sum / count : null;
}

exports.getRanking = onCall({ region: "us-central1" }, async (request) => {
  requireAdminOrProf(request);
  const { tab } = request.data;

  const studentsSnap = await db.collection("users").where("role", "in", ["aluno", "pendente"]).get();
  const studentMap = {};
  studentsSnap.docs.forEach((d) => { studentMap[d.id] = { name: d.data().name, photoURL: d.data().photoURL ?? null }; });

  if (tab === "freq" || tab === "volume") {
    const cutoff = new Date(Date.now() - 30 * 86400000);
    const snap = await db.collectionGroup("sessions").orderBy("date", "desc").get();
    const recent = snap.docs
      .map((d) => ({ uid: d.ref.parent.parent.id, ...d.data() }))
      .filter((s) => s.date?.toDate?.() >= cutoff);

    if (tab === "freq") {
      const counts = {};
      for (const s of recent) counts[s.uid] = (counts[s.uid] ?? 0) + 1;
      return Object.entries(counts)
        .filter(([uid]) => studentMap[uid])
        .map(([uid, value]) => ({ uid, ...studentMap[uid], value, unit: "sessões" }))
        .sort((a, b) => b.value - a.value);
    }

    const totals = {};
    for (const s of recent) {
      let vol = 0;
      for (const ex of s.exercises ?? []) vol += (ex.sets ?? 0) * (ex.reps ?? 0) * (ex.wt ?? 0);
      totals[s.uid] = (totals[s.uid] ?? 0) + vol;
    }
    return Object.entries(totals)
      .filter(([uid]) => studentMap[uid])
      .map(([uid, total]) => ({ uid, ...studentMap[uid], value: Math.round(total), unit: "kg" }))
      .sort((a, b) => b.value - a.value);
  }

  if (tab === "improvement") {
    const snap = await db.collectionGroup("sessions").orderBy("date", "asc").get();
    const byUid = {};
    for (const d of snap.docs) {
      const uid = d.ref.parent.parent.id;
      if (!byUid[uid]) byUid[uid] = [];
      byUid[uid].push(d.data());
    }
    return Object.entries(byUid)
      .filter(([uid, sessions]) => studentMap[uid] && sessions.length >= 4)
      .map(([uid, sessions]) => {
        const delta = avgRpe(sessions.slice(0, 2)) - avgRpe(sessions.slice(-2));
        return { uid, ...studentMap[uid], value: delta !== null ? Math.round(delta * 10) / 10 : 0, unit: "RPE" };
      })
      .filter((r) => r.value !== null)
      .sort((a, b) => b.value - a.value);
  }

  throw new HttpsError("invalid-argument", `Unknown tab: ${tab}`);
});
