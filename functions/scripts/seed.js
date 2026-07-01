const admin = require("firebase-admin");
const EXERCISE_GIFS = require("./exercise-gifs");

admin.initializeApp({ credential: admin.credential.applicationDefault(), projectId: "academia-estilo-livre" });
const db = admin.firestore();

const EXERCISE_LIB = [
  { group: "Peitoral", exs: [
    { mac: "12", name: "Supino Reto",          sets: 4, reps: 12 },
    { mac: "11", name: "Supino Inclinado",      sets: 4, reps: 12 },
    { mac: "13", name: "Supino Declinado",      sets: 4, reps: 12 },
    { mac: "",   name: "Crucifixo Reto",        sets: 4, reps: 12 },
    { mac: "",   name: "Crucifixo Inclinado",   sets: 4, reps: 12 },
    { mac: "22", name: "Cross Over",            sets: 4, reps: 12 },
    { mac: "09", name: "Peck Deck",             sets: 4, reps: 12 },
    { mac: "14", name: "Supino Máq. Reto",      sets: 4, reps: 12 },
    { mac: "10", name: "Supino Máq. Inclinado", sets: 4, reps: 12 },
    { mac: "",   name: "Pull-over",             sets: 4, reps: 12 },
  ]},
  { group: "Ombro", exs: [
    { mac: "",   name: "Desenvolvimento",  sets: 4, reps: 12 },
    { mac: "18", name: "Desenv. Máquina",  sets: 4, reps: 12 },
    { mac: "",   name: "Desenv. Arnold",   sets: 4, reps: 12 },
    { mac: "",   name: "Elevação Lateral", sets: 4, reps: 12 },
    { mac: "",   name: "Elevação Frontal", sets: 4, reps: 12 },
    { mac: "",   name: "Remada Alta",      sets: 4, reps: 12 },
    { mac: "",   name: "Encolhimento",     sets: 4, reps: 12 },
  ]},
  { group: "Tríceps", exs: [
    { mac: "22", name: "Pulley Tríceps", sets: 4, reps: 12 },
    { mac: "",   name: "Testa Polia",    sets: 4, reps: 12 },
    { mac: "",   name: "Testa Halter",   sets: 4, reps: 12 },
    { mac: "",   name: "Frânces",        sets: 4, reps: 12 },
    { mac: "",   name: "Banco Tríceps",  sets: 4, reps: 12 },
    { mac: "",   name: "Coice",          sets: 4, reps: 12 },
    { mac: "",   name: "Supinado",       sets: 4, reps: 12 },
    { mac: "22", name: "Corda Tríceps",  sets: 4, reps: 12 },
    { mac: "",   name: "Paralela",       sets: 4, reps: 12 },
  ]},
  { group: "Dorsal", exs: [
    { mac: "20", name: "Puxada p/ Trás",     sets: 4, reps: 12 },
    { mac: "20", name: "Puxada p/ Frente",   sets: 4, reps: 12 },
    { mac: "19", name: "Remada Articulada",  sets: 4, reps: 12 },
    { mac: "21", name: "Remada Baixa",       sets: 4, reps: 12 },
    { mac: "",   name: "Remada Curvada",     sets: 4, reps: 12 },
    { mac: "",   name: "Serrote",            sets: 4, reps: 12 },
    { mac: "09", name: "Peck Deck Invertido",sets: 4, reps: 12 },
    { mac: "",   name: "Crucifixo Inverso",  sets: 4, reps: 12 },
    { mac: "",   name: "Barra Fixa",         sets: 4, reps: 12 },
    { mac: "",   name: "Lombar",             sets: 4, reps: 12 },
  ]},
  { group: "Bíceps", exs: [
    { mac: "",   name: "Rosca Direta W",    sets: 4, reps: 12 },
    { mac: "",   name: "Rosca Alternada",   sets: 4, reps: 12 },
    { mac: "",   name: "Rosca Scott Máq.",  sets: 4, reps: 12 },
    { mac: "",   name: "Rosca Concentrada", sets: 4, reps: 12 },
    { mac: "22", name: "Rosca Polia Baixa", sets: 4, reps: 12 },
    { mac: "",   name: "Rosca Martelo",     sets: 4, reps: 12 },
    { mac: "",   name: "Rosca 21",          sets: 4, reps: 12 },
    { mac: "23", name: "Rosca Scott",       sets: 4, reps: 12 },
    { mac: "",   name: "Banco Scott",       sets: 4, reps: 12 },
  ]},
  { group: "Antebraço", exs: [
    { mac: "", name: "Rosca Inversa",     sets: 4, reps: 12 },
    { mac: "", name: "Flexão de Punho",   sets: 4, reps: 12 },
    { mac: "", name: "Extensão de Punho", sets: 4, reps: 12 },
  ]},
  { group: "Coxa", exs: [
    { mac: "15", name: "Agachamento Hack",     sets: 4, reps: 12 },
    { mac: "16", name: "Agachamento Smith",    sets: 4, reps: 12 },
    { mac: "17", name: "Leg Press 45°",        sets: 4, reps: 12 },
    { mac: "01", name: "Leg Press Horizontal", sets: 4, reps: 12 },
    { mac: "",   name: "Avanço",               sets: 4, reps: 12 },
    { mac: "04", name: "Extensor",             sets: 4, reps: 12 },
    { mac: "02", name: "Flexor Mesa",          sets: 4, reps: 12 },
    { mac: "",   name: "Stiff",                sets: 4, reps: 12 },
    { mac: "06", name: "Adutor",               sets: 4, reps: 12 },
    { mac: "07", name: "Abdutor",              sets: 4, reps: 12 },
    { mac: "",   name: "Cadeira Flexora",      sets: 4, reps: 12 },
  ]},
  { group: "Glúteo", exs: [
    { mac: "",   name: "Elevação Pélvica",    sets: 4, reps: 12 },
    { mac: "03", name: "Glúteo Máq. Artic.", sets: 4, reps: 12 },
    { mac: "",   name: "Afundo",              sets: 4, reps: 12 },
    { mac: "",   name: "Afundo com Step",     sets: 4, reps: 12 },
    { mac: "22", name: "Polia Glúteo",        sets: 4, reps: 12 },
  ]},
  { group: "Panturrilha", exs: [
    { mac: "16", name: "Panturrilha Smith",     sets: 4, reps: 15 },
    { mac: "",   name: "Panturrilha Solo",      sets: 4, reps: 15 },
    { mac: "08", name: "Panturrilha Sentada",   sets: 4, reps: 15 },
    { mac: "01", name: "Panturrilha Leg Press", sets: 4, reps: 15 },
  ]},
];

const mkEx = (num, mac, name, sets, reps) => ({ num, mac, name, sets, reps });

const WK_TEMPLATES = [
  { label:"A", name:"Peitoral / Tríceps (Iniciante)",     color:"#1B3487", exercises:[mkEx("A1","14","Supino Máq. Reto",3,10),mkEx("A2","09","Peck Deck",3,10),mkEx("A3","22","Pulley Tríceps",3,10),mkEx("A4","","Elevação Lateral",3,10)]},
  { label:"A", name:"Peitoral / Tríceps (Intermediário)", color:"#1B3487", exercises:[mkEx("A1","10","Supino Máq. Inclinado",4,12),mkEx("A2","14","Supino Máq. Reto",4,12),mkEx("A3","09","Peck Deck",4,12),mkEx("A4","22","Pulley Tríceps",4,12),mkEx("A5","22","Corda Tríceps",4,12),mkEx("A6","","Elevação Lateral",4,12)]},
  { label:"A", name:"Peitoral / Tríceps (Avançado)",      color:"#1B3487", exercises:[mkEx("A1","10","Supino Máq. Inclinado",4,12),mkEx("A2","14","Supino Máq. Reto",4,12),mkEx("A3","09","Peck Deck",4,12),mkEx("A4","22","Cross Over",4,12),mkEx("A5","22","Pulley Tríceps",4,12),mkEx("A6","22","Corda Tríceps",4,12),mkEx("A7","","Paralela",4,10),mkEx("A8","","Elevação Lateral",4,12),mkEx("A9","","Elevação Frontal",4,12)]},
  { label:"B", name:"Costas / Bíceps (Iniciante)",        color:"#9C27B0", exercises:[mkEx("B1","20","Puxada p/ Frente",3,10),mkEx("B2","21","Remada Baixa",3,10),mkEx("B3","","Rosca Direta W",3,10),mkEx("B4","","Rosca Martelo",3,10)]},
  { label:"B", name:"Costas / Bíceps (Intermediário)",    color:"#9C27B0", exercises:[mkEx("B1","20","Puxada p/ Frente",4,12),mkEx("B2","21","Remada Baixa",4,12),mkEx("B3","19","Remada Articulada",4,12),mkEx("B4","","Rosca Direta W",4,12),mkEx("B5","","Rosca Martelo",4,12),mkEx("B6","","Banco Scott",4,12)]},
  { label:"B", name:"Costas / Bíceps (Avançado)",         color:"#9C27B0", exercises:[mkEx("B1","","Barra Fixa",4,8),mkEx("B2","20","Puxada p/ Frente",4,12),mkEx("B3","21","Remada Baixa",4,12),mkEx("B4","19","Remada Articulada",4,12),mkEx("B5","","Serrote",4,12),mkEx("B6","","Rosca Direta W",4,12),mkEx("B7","","Rosca Scott Máq.",4,12),mkEx("B8","","Rosca Martelo",4,12)]},
  { label:"C", name:"Pernas / Glúteos (Iniciante)",       color:"#4CAF50", exercises:[mkEx("C1","04","Extensor",3,10),mkEx("C2","17","Leg Press 45°",3,10),mkEx("C3","02","Flexor Mesa",3,10),mkEx("C4","","Panturrilha Solo",3,12)]},
  { label:"C", name:"Pernas / Glúteos (Intermediário)",   color:"#4CAF50", exercises:[mkEx("C1","04","Extensor",4,12),mkEx("C2","17","Leg Press 45°",4,12),mkEx("C3","06","Adutor",4,12),mkEx("C4","02","Flexor Mesa",4,12),mkEx("C5","","Elevação Pélvica",4,12),mkEx("C6","","Panturrilha Solo",4,15)]},
  { label:"C", name:"Pernas / Glúteos (Avançado)",        color:"#4CAF50", exercises:[mkEx("C1","16","Agachamento Smith",4,12),mkEx("C2","17","Leg Press 45°",4,12),mkEx("C3","04","Extensor",4,12),mkEx("C4","02","Flexor Mesa",4,12),mkEx("C5","","Cadeira Flexora",4,12),mkEx("C6","","Stiff",4,12),mkEx("C7","06","Adutor",4,12),mkEx("C8","","Elevação Pélvica",4,12),mkEx("C9","","Panturrilha Sentada",4,15)]},
  { label:"D", name:"Ombros / Trapézio (Iniciante)",      color:"#FF9800", exercises:[mkEx("D1","18","Desenv. Máquina",3,10),mkEx("D2","","Elevação Lateral",3,10),mkEx("D3","","Encolhimento",3,12)]},
  { label:"D", name:"Ombros / Trapézio (Intermediário)",  color:"#FF9800", exercises:[mkEx("D1","18","Desenv. Máquina",4,12),mkEx("D2","","Elevação Lateral",4,12),mkEx("D3","","Elevação Frontal",4,12),mkEx("D4","","Encolhimento",4,12)]},
  { label:"D", name:"Ombros / Trapézio (Avançado)",       color:"#FF9800", exercises:[mkEx("D1","18","Desenv. Máquina",4,12),mkEx("D2","","Desenv. Arnold",4,12),mkEx("D3","","Elevação Lateral",4,12),mkEx("D4","22","Crucifixo Inverso",4,12),mkEx("D5","","Remada Alta",4,12),mkEx("D6","","Encolhimento",4,15)]},
  { label:"E", name:"Cardio / Core (Iniciante)",          color:"#00BCD4", exercises:[mkEx("E1","","Abdominal Solo",3,15),mkEx("E2","","Prancha Estática",3,30)]},
  { label:"E", name:"Cardio / Core (Intermediário)",      color:"#00BCD4", exercises:[mkEx("E1","","Abdominal Solo",4,15),mkEx("E2","","Elevação de Pernas",4,15),mkEx("E3","","Prancha Estática",4,45)]},
  { label:"E", name:"Cardio / Core (Avançado)",           color:"#00BCD4", exercises:[mkEx("E1","","Abdominal Solo",4,20),mkEx("E2","","Elevação de Pernas",4,20),mkEx("E3","","Prancha Estática",4,60),mkEx("E4","","Lombar",4,15)]},
  { label:"F", name:"Full Body (Iniciante)",              color:"#4CAF50", exercises:[mkEx("F1","17","Leg Press 45°",3,10),mkEx("F2","20","Puxada p/ Frente",3,10),mkEx("F3","14","Supino Máq. Reto",3,10),mkEx("F4","","Abdominal Solo",3,15)]},
  { label:"F", name:"Full Body (Intermediário)",          color:"#4CAF50", exercises:[mkEx("F1","17","Leg Press 45°",4,12),mkEx("F2","20","Puxada p/ Frente",4,12),mkEx("F3","14","Supino Máq. Reto",4,12),mkEx("F4","","Elevação Lateral",4,12),mkEx("F5","","Rosca Direta W",4,12),mkEx("F6","22","Pulley Tríceps",4,12)]},
  { label:"F", name:"Full Body (Avançado)",               color:"#4CAF50", exercises:[mkEx("F1","16","Agachamento Smith",4,10),mkEx("F2","17","Leg Press 45°",4,12),mkEx("F3","20","Puxada p/ Frente",4,12),mkEx("F4","14","Supino Máq. Reto",4,12),mkEx("F5","","Elevação Lateral",4,12),mkEx("F6","","Rosca Direta W",4,12),mkEx("F7","22","Pulley Tríceps",4,12),mkEx("F8","","Abdominal Solo",4,20)]},
];

async function seed() {
  console.log("Seeding exercises...");
  const exBatch = db.batch();
  for (const group of EXERCISE_LIB)
    for (const ex of group.exs)
      exBatch.set(db.collection("exercises").doc(), {
        name: ex.name, machine: ex.mac || null, group: group.group,
        defaultSets: ex.sets, defaultReps: ex.reps,
        gif: EXERCISE_GIFS[ex.name] || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
  await exBatch.commit();
  console.log(`  ✓ ${EXERCISE_LIB.reduce((a, g) => a + g.exs.length, 0)} exercises`);

  console.log("Seeding workout templates...");
  const tmplBatch = db.batch();
  for (const tmpl of WK_TEMPLATES)
    tmplBatch.set(db.collection("wk_templates").doc(), {
      ...tmpl, createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  await tmplBatch.commit();
  console.log(`  ✓ ${WK_TEMPLATES.length} templates`);

  console.log("Done.");
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
