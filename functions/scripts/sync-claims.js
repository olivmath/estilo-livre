const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: "academia-estilo-livre",
});

const db = admin.firestore();

async function syncClaims() {
  console.log("Starting sync of custom claims...");
  const usersSnap = await db.collection("users").get();
  console.log(`Found ${usersSnap.size} user documents in Firestore.`);

  for (const doc of usersSnap.docs) {
    const uid = doc.id;
    const data = doc.data();
    let role = data.role;
    const email = data.email || "";

    // Normalize "prof" -> "professor"
    if (role === "prof") {
      console.log(`User ${email} (${uid}) has role 'prof'. Normalizing to 'professor'...`);
      role = "professor";
      await doc.ref.update({ role });
    }

    if (!role) {
      console.log(`User ${email} (${uid}) has no role. Skipping.`);
      continue;
    }

    try {
      // Get Auth user to inspect existing claims
      const userRecord = await admin.auth().getUser(uid);
      const currentClaims = userRecord.customClaims || {};
      
      if (currentClaims.role !== role) {
        console.log(`Updating claims for ${email} (${uid}): current: ${JSON.stringify(currentClaims)} -> new: { role: "${role}" }`);
        await admin.auth().setCustomUserClaims(uid, { role });
        console.log(`  ✓ Successfully updated custom claims for ${email}`);
      } else {
        console.log(`User ${email} (${uid}) claims are already correct: { role: "${role}" }`);
      }
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        console.log(`User ${email} (${uid}) in Firestore does not exist in Firebase Auth. Skipping.`);
      } else {
        console.error(`Error processing user ${email} (${uid}):`, err);
      }
    }
  }

  console.log("Finished claims synchronization.");
  process.exit(0);
}

syncClaims().catch((e) => {
  console.error("Fatal error during sync:", e);
  process.exit(1);
});
