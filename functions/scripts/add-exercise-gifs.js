/**
 * add-exercise-gifs.js
 *
 * Backfills the `gif` field on existing documents in the `exercises` collection,
 * matching by exercise name against exercise-gifs.js. Safe to re-run.
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=... node add-exercise-gifs.js
 */

const admin = require("firebase-admin");
const EXERCISE_GIFS = require("./exercise-gifs");

admin.initializeApp({ credential: admin.credential.applicationDefault(), projectId: "academia-estilo-livre" });
const db = admin.firestore();

async function main() {
  const snap = await db.collection("exercises").get();
  const batch = db.batch();
  let updated = 0;
  let skipped = 0;

  for (const doc of snap.docs) {
    const gif = EXERCISE_GIFS[doc.data().name];
    if (!gif) {
      skipped++;
      continue;
    }
    batch.update(doc.ref, { gif });
    updated++;
  }

  if (updated > 0) await batch.commit();
  console.log(`✓ Updated ${updated} exercise(s) with gif`);
  console.log(`  Skipped ${skipped} exercise(s) with no matching gif`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
