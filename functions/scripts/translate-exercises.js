const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

const GROUPS = {
  "Antebraço": { en: "Forearm", es: "Antebrazo" },
  "Bíceps":    { en: "Biceps",  es: "Bíceps" },
  "Coxa":      { en: "Legs",    es: "Piernas" },
  "Dorsal":    { en: "Back",    es: "Espalda" },
  "Glúteo":    { en: "Glutes",  es: "Glúteos" },
  "Ombro":     { en: "Shoulders", es: "Hombros" },
  "Panturrilha": { en: "Calves", es: "Pantorrillas" },
  "Peitoral":  { en: "Chest",   es: "Pecho" },
  "Tríceps":   { en: "Triceps", es: "Tríceps" },
};

const NAMES = {
  "Extensão de Punho":     { en: "Wrist Extension",         es: "Extensión de Muñeca" },
  "Flexão de Punho":       { en: "Wrist Curl",              es: "Flexión de Muñeca" },
  "Rosca Inversa":         { en: "Reverse Curl",            es: "Curl Inverso" },
  "Rosca Scott Máq.":      { en: "Machine Preacher Curl",   es: "Curl Scott Máquina" },
  "Rosca Concentrada":     { en: "Concentration Curl",      es: "Curl Concentrado" },
  "Rosca 21":              { en: "21s Curl",                es: "Curl 21" },
  "Rosca Unilateral":      { en: "Single-Arm Curl",         es: "Curl Unilateral" },
  "Rosca Scott":           { en: "Preacher Curl",           es: "Curl Scott" },
  "Rosca Martelo":         { en: "Hammer Curl",             es: "Curl Martillo" },
  "Banco Scott":           { en: "Scott Bench Curl",        es: "Banco Scott" },
  "Rosca Alternada":       { en: "Alternating Curl",        es: "Curl Alternado" },
  "Rosca Polia Baixa":     { en: "Low Pulley Curl",         es: "Curl Polea Baja" },
  "Rosca Direta W":        { en: "EZ Bar Curl",             es: "Curl Barra W" },
  "Extensor":              { en: "Leg Extension",           es: "Extensión de Piernas" },
  "Leg Press Horizontal":  { en: "Horizontal Leg Press",    es: "Prensa Horizontal" },
  "Leg 180º Smith":        { en: "Smith 180° Leg Press",    es: "Leg 180º Smith" },
  "Adutor":                { en: "Adductor",                es: "Aductor" },
  "Flexão Quadril":        { en: "Hip Flexion",             es: "Flexión de Cadera" },
  "Cadeira Flexora":       { en: "Seated Leg Curl",         es: "Curl Femoral Sentado" },
  "Avanço":                { en: "Walking Lunge",           es: "Zancada" },
  "Stiff":                 { en: "Stiff-Leg Deadlift",      es: "Peso Muerto Rígido" },
  "Agachamento Smith":     { en: "Smith Machine Squat",     es: "Sentadilla Smith" },
  "Abdutor":               { en: "Abductor",                es: "Abductor" },
  "Flexor Mesa":           { en: "Lying Leg Curl",          es: "Curl Femoral Tumbado" },
  "Leg Press 45°":         { en: "45° Leg Press",           es: "Prensa 45°" },
  "Agachamento Hack":      { en: "Hack Squat",              es: "Sentadilla Hack" },
  "Agachamentos":          { en: "Squats",                  es: "Sentadillas" },
  "Puxador Polia":         { en: "Lat Pulldown",            es: "Jalón Polea" },
  "Crucifixo Inverso":     { en: "Reverse Fly",             es: "Aperturas Inversas" },
  "Remada Baixa":          { en: "Seated Row",              es: "Remo Bajo" },
  "Serrote":               { en: "One-Arm Row",             es: "Remo Serrucho" },
  "Remada Articulada":     { en: "Machine Row",             es: "Remo Articulado" },
  "Puxada p/ Trás":        { en: "Behind-Neck Pulldown",    es: "Jalón Tras Nuca" },
  "Barra Fixa":            { en: "Pull-Up",                 es: "Dominadas" },
  "Remada Curvada":        { en: "Bent-Over Row",           es: "Remo Inclinado" },
  "Puxada p/ Frente":      { en: "Front Pulldown",          es: "Jalón al Frente" },
  "Peck Deck Invertido":   { en: "Reverse Pec Deck",        es: "Pec Deck Inverso" },
  "Lombar":                { en: "Back Extension",          es: "Extensión Lumbar" },
  "Polia Flexionado":      { en: "Cable Kickback (bent)",   es: "Patada Polea Flexionado" },
  "Afundo Caneleira":      { en: "Ankle Weight Lunge",      es: "Zancada con Tobillera" },
  "Apoio Estendido":       { en: "Extended Kickback",       es: "Patada Extendida" },
  "Afundo com Step":       { en: "Step Lunge",              es: "Zancada con Step" },
  "Afundo":                { en: "Lunge",                   es: "Zancada" },
  "Glúteo Máq. Artic.":    { en: "Glute Machine",           es: "Glúteo Máquina" },
  "Elevação Pélvica":      { en: "Hip Thrust",              es: "Elevación Pélvica" },
  "Apoio Cruzado":         { en: "Cross Kickback",          es: "Patada Cruzada" },
  "Apoio Flexionado":      { en: "Bent Kickback",           es: "Patada Flexionada" },
  "Polia Estendido":       { en: "Cable Kickback (ext)",    es: "Patada Polea Extendido" },
  "Polia Glúteo":          { en: "Cable Glute Kickback",    es: "Patada Glúteo Polea" },
  "Desenvolvimento":       { en: "Shoulder Press",          es: "Press Militar" },
  "Manguito Polia":        { en: "Cable Rotator Cuff",      es: "Manguito Rotador Polea" },
  "Encolhimento":          { en: "Shrug",                   es: "Encogimiento" },
  "Desenv. Arnold":        { en: "Arnold Press",            es: "Press Arnold" },
  "Elevação Frontal":      { en: "Front Raise",             es: "Elevación Frontal" },
  "Remada Alta":           { en: "Upright Row",             es: "Remo al Mentón" },
  "Elevação Lateral":      { en: "Lateral Raise",           es: "Elevación Lateral" },
  "Desenv. Máquina":       { en: "Machine Shoulder Press",  es: "Press Militar Máquina" },
  "Desenv. Frontal":       { en: "Front Press",             es: "Press Frontal" },
  "Leg 45º":               { en: "45° Calf Press",          es: "Prensa Pantorrilla 45°" },
  "Panturrilha Smith":     { en: "Smith Calf Raise",        es: "Pantorrilla Smith" },
  "Panturrilha Solo":      { en: "Standing Calf Raise",     es: "Pantorrilla de Pie" },
  "Panturrilha Sentada":   { en: "Seated Calf Raise",       es: "Pantorrilla Sentada" },
  "Panturrilha Leg Press": { en: "Leg Press Calf Raise",    es: "Pantorrilla en Prensa" },
  "Supino Reto":           { en: "Flat Bench Press",        es: "Press Banca Plano" },
  "Supino Inclinado":      { en: "Incline Bench Press",     es: "Press Banca Inclinado" },
  "Supino Declinado":      { en: "Decline Bench Press",     es: "Press Banca Declinado" },
  "Crucifixo Reto":        { en: "Flat Dumbbell Fly",       es: "Aperturas Planas" },
  "Crucifixo Declinado":   { en: "Decline Dumbbell Fly",    es: "Aperturas Declinadas" },
  "Supino Máq. Reto":      { en: "Flat Machine Press",      es: "Press Máquina Plano" },
  "Supino Máq. Inclinado": { en: "Incline Machine Press",   es: "Press Máquina Inclinado" },
  "Crucifixo Inclinado":   { en: "Incline Dumbbell Fly",    es: "Aperturas Inclinadas" },
  "Peck Deck":             { en: "Pec Deck",                es: "Pec Deck" },
  "Cross Over":            { en: "Cable Crossover",         es: "Cruce de Poleas" },
  "Pull-over":             { en: "Pullover",                es: "Pullover" },
  "Testa Halter":          { en: "Dumbbell Skull Crusher",  es: "Francés con Mancuerna" },
  "Pulley Tríceps":        { en: "Tricep Pushdown",         es: "Jalón Tríceps" },
  "Coice":                 { en: "Tricep Kickback",         es: "Patada de Tríceps" },
  "Supinado":              { en: "Underhand Pushdown",      es: "Jalón Supino" },
  "Corda Tríceps":         { en: "Rope Pushdown",           es: "Jalón Cuerda" },
  "Paralela":              { en: "Dips",                    es: "Fondos" },
  "Banco Tríceps":         { en: "Bench Dips",              es: "Fondos en Banco" },
  "Testa Polia":           { en: "Cable Skull Crusher",     es: "Francés en Polea" },
  "Frânces":               { en: "French Press",            es: "Press Francés" },
};

async function main() {
  const snap = await db.collection("exercises").get();
  const batch = db.batch();
  let updated = 0;
  let skipped = 0;

  for (const doc of snap.docs) {
    const data = doc.data();
    const nameT = NAMES[data.name];
    const groupT = GROUPS[data.group];
    const fields = {};

    if (nameT) {
      fields.name_en = nameT.en;
      fields.name_es = nameT.es;
    } else {
      console.log(`⚠ No translation for exercise: "${data.name}"`);
      skipped++;
    }

    if (groupT) {
      fields.group_en = groupT.en;
      fields.group_es = groupT.es;
    } else {
      console.log(`⚠ No translation for group: "${data.group}"`);
    }

    if (Object.keys(fields).length > 0) {
      batch.update(doc.ref, fields);
      updated++;
    }
  }

  await batch.commit();
  console.log(`\n✅ Updated ${updated} exercises, skipped ${skipped}`);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
