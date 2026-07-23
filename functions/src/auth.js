const { onCall, HttpsError } = require("firebase-functions/v2/https");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { requireAuth, requireAdmin, requireAdminOrProf } = require("./helpers");

const db = admin.firestore();

function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

async function createInviteCodeForProfessor(uid, name) {
  const code = generateCode();
  await db.collection("invite_codes").doc(code).set({
    professorUid: uid,
    professorName: name ?? "",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return code;
}

const SEEDED_ROLES = {
  "olivmath97@gmail.com": "admin",
  "maiquiniqueBA@gmail.com": "professor",
};

async function migrateUserSubcollections(oldUid, newUid) {
  const oldRef = db.collection("users").doc(oldUid);
  const newRef = db.collection("users").doc(newUid);

  const [workoutsSnap, sessionsSnap] = await Promise.all([
    oldRef.collection("workouts").get(),
    oldRef.collection("sessions").get()
  ]);

  const promises = [];

  workoutsSnap.docs.forEach((doc) => {
    promises.push(newRef.collection("workouts").doc(doc.id).set(doc.data()));
    promises.push(doc.ref.delete());
  });

  sessionsSnap.docs.forEach((doc) => {
    promises.push(newRef.collection("sessions").doc(doc.id).set(doc.data()));
    promises.push(doc.ref.delete());
  });

  await Promise.all(promises);
}

exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
  const email = user.email;
  const inviteSnap = await db.collection("invites").doc(email).get();
  let role = SEEDED_ROLES[email] ?? "pendente";
  let extra = {};

  if (inviteSnap.exists) {
    role = inviteSnap.data().role;
    extra.inviteAccepted = true;
    await inviteSnap.ref.delete();
  } else {
    // Check for pre-created student profile (random ID)
    const existingSnap = await db.collection("users").where("email", "==", email).get();
    if (!existingSnap.empty) {
      const preCreatedDoc = existingSnap.docs.find(d => d.id !== user.uid && d.data().role === "aluno");
      if (preCreatedDoc) {
        role = "aluno";
        extra = { ...preCreatedDoc.data() };
        await migrateUserSubcollections(preCreatedDoc.id, user.uid);
        await preCreatedDoc.ref.delete();
      }
    }
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

  if (role === "professor" || role === "admin") {
    await createInviteCodeForProfessor(user.uid, user.displayName ?? "");
  }
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

exports.redeemInviteCode = onCall({ region: "us-central1" }, async (request) => {
  const auth = requireAuth(request);
  const { code } = request.data;
  if (!code || typeof code !== "string" || !code.trim())
    throw new HttpsError("invalid-argument", "Code is required");

  const snap = await db.collection("invite_codes").doc(code.trim().toUpperCase()).get();
  if (!snap.exists) throw new HttpsError("not-found", "Invalid invite code");

  const { professorUid, professorName } = snap.data();
  await db.collection("users").doc(auth.uid).update({
    role: "aluno",
    professorId: professorUid,
  });
  await admin.auth().setCustomUserClaims(auth.uid, { role: "aluno" });
  return { success: true, professorName };
});

exports.getMyInviteCode = onCall({ region: "us-central1" }, async (request) => {
  const auth = requireAdminOrProf(request);
  const snap = await db.collection("invite_codes").where("professorUid", "==", auth.uid).limit(1).get();
  if (snap.empty) return { code: null };
  return { code: snap.docs[0].id };
});

exports.generateInviteCode = onCall({ region: "us-central1" }, async (request) => {
  const auth = requireAdminOrProf(request);
  const existing = await db.collection("invite_codes").where("professorUid", "==", auth.uid).get();
  const batch = db.batch();
  existing.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  const code = await createInviteCodeForProfessor(auth.uid, auth.token?.name ?? "");
  return { code };
});
