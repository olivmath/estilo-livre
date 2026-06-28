/**
 * assign-workouts.js
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=... node assign-workouts.js --email <email>
 *   node assign-workouts.js --email olivmath97@gmail.com
 *   node assign-workouts.js --email ellyrsilveira@gmail.com
 *   node assign-workouts.js --email all   (runs both)
 *
 * Writes directly to Firestore: users/{uid}/workouts
 */

const admin = require("firebase-admin");

admin.initializeApp({ credential: admin.credential.applicationDefault(), projectId: "academia-estilo-livre" });
const db    = admin.firestore();
const auth  = admin.auth();

const mkEx = (num, mac, name, sets, reps) => ({ num, mac: mac || null, name, sets, reps });

// ─── Workout definitions ───────────────────────────────────────────────────────

const WORKOUTS = {
  "olivmath97@gmail.com": [
    {
      label: "A", name: "Peitoral / Ombro / Tríceps", color: "#1B3487",
      exercises: [
        mkEx("A1", "10", "Supino Máq. Inclinado", 4, 12),
        mkEx("A2", "14", "Supino Máq. Reto",      4, 12),
        mkEx("A3", "09", "Peck Deck",              4, 12),
        mkEx("A4", "",   "Desenvolvimento",        4, 12),
        mkEx("A5", "",   "Elevação Lateral",       4, 12),
        mkEx("A6", "",   "Elevação Frontal",       4, 12),
        mkEx("A7", "22", "Pulley Tríceps",         4, 12),
        mkEx("A8", "22", "Corda Tríceps",          4, 12),
        mkEx("A9", "",   "Supinado",               4, 12),
      ],
    },
    {
      label: "B", name: "Dorsal / Bíceps", color: "#9C27B0",
      exercises: [
        mkEx("B1", "20", "Puxada p/ Frente",   4, 12),
        mkEx("B2", "21", "Remada Baixa",        4, 12),
        mkEx("B3", "19", "Remada Articulada",   4, 12),
        mkEx("B4", "",   "Rosca Direta W",      4, 12),
        mkEx("B5", "",   "Rosca Martelo",       4, 12),
        mkEx("B6", "",   "Banco Scott",         4, 12),
      ],
    },
    {
      label: "C", name: "Pernas (Quad / Adutor)", color: "#4CAF50",
      exercises: [
        mkEx("C1", "04", "Extensor",      4, 12),
        mkEx("C2", "17", "Leg Press 45°", 4, 12),
        mkEx("C3", "06", "Adutor",        4, 12),
      ],
    },
    {
      label: "D", name: "Pernas (Posterior / Glúteos / Panturrilha)", color: "#FF9800",
      exercises: [
        mkEx("D1", "",   "Cadeira Flexora",  4, 12),
        mkEx("D2", "02", "Flexor Mesa",      4, 12),
        mkEx("D3", "07", "Abdutor",          4, 12),
        mkEx("D4", "",   "Afundo",           4, 12),
        mkEx("D5", "",   "Elevação Pélvica", 4, 12),
        mkEx("D6", "",   "Panturrilha Solo", 4, 15),
      ],
    },
    {
      label: "E", name: "Mix (Peito / Ombro / Costas / Bíceps / Coxa)", color: "#00BCD4",
      exercises: [
        mkEx("E1", "",   "Crucifixo Reto",      4, 12),
        mkEx("E2", "22", "Cross Over",           4, 12),
        mkEx("E3", "18", "Desenv. Máquina",      4, 12),
        mkEx("E4", "",   "Testa Polia",          4, 12),
        mkEx("E5", "09", "Peck Deck Invertido",  4, 12),
        mkEx("E6", "",   "Crucifixo Inverso",    4, 12),
        mkEx("E7", "22", "Rosca Polia Baixa",    4, 12),
        mkEx("E8", "16", "Agachamento Smith",    4, 12),
        mkEx("E9", "",   "Stiff",                4, 12),
      ],
    },
  ],

  "ellyrsilveira@gmail.com": [
    {
      label: "A", name: "Peitoral / Tríceps (Iniciante)", color: "#1B3487",
      exercises: [
        mkEx("A1", "14", "Supino Máq. Reto",  3, 10),
        mkEx("A2", "09", "Peck Deck",          3, 10),
        mkEx("A3", "22", "Pulley Tríceps",     3, 10),
        mkEx("A4", "",   "Elevação Lateral",   3, 10),
      ],
    },
    {
      label: "B", name: "Costas / Bíceps (Iniciante)", color: "#9C27B0",
      exercises: [
        mkEx("B1", "20", "Puxada p/ Frente", 3, 10),
        mkEx("B2", "21", "Remada Baixa",     3, 10),
        mkEx("B3", "",   "Rosca Direta W",   3, 10),
        mkEx("B4", "",   "Rosca Martelo",    3, 10),
      ],
    },
    {
      label: "C", name: "Pernas / Glúteos (Iniciante)", color: "#4CAF50",
      exercises: [
        mkEx("C1", "04", "Extensor",          3, 10),
        mkEx("C2", "17", "Leg Press 45°",     3, 10),
        mkEx("C3", "02", "Flexor Mesa",       3, 10),
        mkEx("C4", "",   "Panturrilha Solo",  3, 12),
      ],
    },
    {
      label: "D", name: "Ombros / Trapézio (Iniciante)", color: "#FF9800",
      exercises: [
        mkEx("D1", "18", "Desenv. Máquina",  3, 10),
        mkEx("D2", "",   "Elevação Lateral", 3, 10),
        mkEx("D3", "",   "Encolhimento",     3, 12),
      ],
    },
    {
      label: "E", name: "Cardio / Core (Iniciante)", color: "#00BCD4",
      exercises: [
        mkEx("E1", "", "Abdominal Solo",    3, 15),
        mkEx("E2", "", "Prancha Estática",  3, 30),
      ],
    },
  ],
};

// ─── Main ─────────────────────────────────────────────────────────────────────

async function assignForEmail(email) {
  console.log(`\n→ Processing ${email}...`);

  const workouts = WORKOUTS[email];
  if (!workouts) {
    console.error(`  ✗ No workout definition found for ${email}`);
    return;
  }

  let userRecord;
  try {
    userRecord = await auth.getUserByEmail(email);
  } catch (e) {
    console.error(`  ✗ User not found in Firebase Auth: ${email}`);
    return;
  }

  const uid = userRecord.uid;
  console.log(`  uid: ${uid}`);

  // Delete existing workouts to avoid duplicates
  const existing = await db.collection("users").doc(uid).collection("workouts").get();
  if (!existing.empty) {
    const batch = db.batch();
    existing.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    console.log(`  ✓ Cleared ${existing.size} existing workout(s)`);
  }

  // Write new workouts
  const batch = db.batch();
  for (const wk of workouts) {
    const ref = db.collection("users").doc(uid).collection("workouts").doc();
    batch.set(ref, {
      ...wk,
      assignedAt: admin.firestore.FieldValue.serverTimestamp(),
      assignedBy: "script:assign-workouts",
      fromTemplateId: null,
    });
  }
  await batch.commit();
  console.log(`  ✓ Assigned ${workouts.length} workout(s): ${workouts.map((w) => w.label).join(", ")}`);
}

async function main() {
  const flag = process.argv.indexOf("--email");
  const email = flag !== -1 ? process.argv[flag + 1] : null;

  if (!email) {
    console.error("Usage: node assign-workouts.js --email <email|all>");
    process.exit(1);
  }

  const targets = email === "all" ? Object.keys(WORKOUTS) : [email];
  for (const e of targets) await assignForEmail(e);

  console.log("\nDone.");
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
