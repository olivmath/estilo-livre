// Mapeamento nome do exercício → gif animado (baixados de github.com/JahelCuadrado/ExerciseGymGifsDB)
const EXERCISE_GIFS = {
  "Abdominal Solo": "/exercicios/assisted-sit-up.gif",
  "Abdutor": "/exercicios/lever-seated-hip-abduction.gif",
  "Adutor": "/exercicios/lever-seated-hip-adduction.gif",
  "Afundo": "/exercicios/barbell-lunge.gif",
  "Afundo com Step": "/exercicios/walking-lunge.gif",
  "Agachamento Hack": "/exercicios/barbell-hack-squat.gif",
  "Agachamento Smith": "/exercicios/smith-squat.gif",
  "Avanço": "/exercicios/dumbbell-lunge.gif",
  "Banco Scott": "/exercicios/cable-preacher-curl.gif",
  "Banco Tríceps": "/exercicios/bench-dip-knees-bent.gif",
  "Barra Fixa": "/exercicios/wide-grip-pull-up.gif",
  "Cadeira Flexora": "/exercicios/lever-seated-leg-curl.gif",
  "Coice": "/exercicios/cable-standing-hip-extension.gif",
  "Corda Tríceps": "/exercicios/cable-pushdown-with-rope-attachment.gif",
  "Cross Over": "/exercicios/cable-cross-over-variation.gif",
  "Crucifixo Inclinado": "/exercicios/dumbbell-incline-fly.gif",
  "Crucifixo Inverso": "/exercicios/lever-seated-reverse-fly.gif",
  "Crucifixo Reto": "/exercicios/dumbbell-fly.gif",
  "Desenv. Arnold": "/exercicios/dumbbell-arnold-press.gif",
  "Desenv. Máquina": "/exercicios/lever-shoulder-press.gif",
  "Desenvolvimento": "/exercicios/dumbbell-seated-shoulder-press.gif",
  "Elevação Frontal": "/exercicios/barbell-front-raise.gif",
  "Elevação Lateral": "/exercicios/cable-lateral-raise.gif",
  "Elevação Pélvica": "/exercicios/barbell-glute-bridge.gif",
  "Elevação de Pernas": "/exercicios/hanging-leg-raise.gif",
  "Encolhimento": "/exercicios/barbell-shrug.gif",
  "Extensor": "/exercicios/lever-leg-extension.gif",
  "Extensão de Punho": "/exercicios/barbell-reverse-wrist-curl.gif",
  "Flexor Mesa": "/exercicios/lever-lying-leg-curl.gif",
  "Flexão de Punho": "/exercicios/barbell-wrist-curl.gif",
  "Frânces": "/exercicios/ez-bar-standing-french-press.gif",
  "Glúteo Máq. Artic.": "/exercicios/lever-hip-extension-v-2.gif",
  "Leg Press 45°": "/exercicios/sled-45-leg-press.gif",
  "Leg Press Horizontal": "/exercicios/lever-horizontal-one-leg-press.gif",
  "Lombar": "/exercicios/lever-back-extension.gif",
  "Panturrilha Leg Press": "/exercicios/sled-calf-press-on-leg-press.gif",
  "Panturrilha Sentada": "/exercicios/lever-seated-calf-raise.gif",
  "Panturrilha Smith": "/exercicios/smith-reverse-calf-raises.gif",
  "Panturrilha Solo": "/exercicios/bodyweight-standing-calf-raise.gif",
  "Paralela": "/exercicios/chest-dip-on-straight-bar.gif",
  "Peck Deck": "/exercicios/lever-seated-fly.gif",
  "Peck Deck Invertido": "/exercicios/lever-seated-reverse-fly-parallel-grip.gif",
  "Polia Glúteo": "/exercicios/cable-pull-through-with-rope.gif",
  "Prancha Estática": "/exercicios/front-plank-with-twist.gif",
  "Pull-over": "/exercicios/dumbbell-pullover.gif",
  "Pulley Tríceps": "/exercicios/cable-pushdown.gif",
  "Puxada p/ Frente": "/exercicios/lever-front-pulldown.gif",
  "Puxada p/ Trás": "/exercicios/cable-wide-grip-rear-pulldown-behind-neck.gif",
  "Remada Alta": "/exercicios/barbell-upright-row.gif",
  "Remada Articulada": "/exercicios/lever-high-row.gif",
  "Remada Baixa": "/exercicios/cable-seated-row.gif",
  "Remada Curvada": "/exercicios/barbell-bent-over-row.gif",
  "Rosca 21": "/exercicios/barbell-curl.gif",
  "Rosca Alternada": "/exercicios/dumbbell-alternate-biceps-curl.gif",
  "Rosca Concentrada": "/exercicios/barbell-standing-concentration-curl.gif",
  "Rosca Direta W": "/exercicios/ez-barbell-curl.gif",
  "Rosca Inversa": "/exercicios/barbell-reverse-curl.gif",
  "Rosca Martelo": "/exercicios/dumbbell-cross-body-hammer-curl.gif",
  "Rosca Polia Baixa": "/exercicios/cable-curl.gif",
  "Rosca Scott": "/exercicios/barbell-preacher-curl.gif",
  "Rosca Scott Máq.": "/exercicios/lever-preacher-curl.gif",
  "Serrote": "/exercicios/kettlebell-one-arm-row.gif",
  "Stiff": "/exercicios/dumbbell-stiff-leg-deadlift.gif",
  "Supinado": "/exercicios/reverse-grip-machine-lat-pulldown.gif",
  "Supino Declinado": "/exercicios/barbell-decline-bench-press.gif",
  "Supino Inclinado": "/exercicios/barbell-incline-bench-press.gif",
  "Supino Máq. Inclinado": "/exercicios/lever-incline-chest-press.gif",
  "Supino Máq. Reto": "/exercicios/lever-chest-press.gif",
  "Supino Reto": "/exercicios/barbell-bench-press.gif",
  "Testa Halter": "/exercicios/dumbbell-lying-triceps-extension.gif",
  "Testa Polia": "/exercicios/cable-lying-triceps-extension-v-2.gif",
};

function normalize(name) {
  return (name ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const NORMALIZED_GIFS = Object.fromEntries(
  Object.entries(EXERCISE_GIFS).map(([name, url]) => [normalize(name), url])
);

export function getExerciseGif(name) {
  return NORMALIZED_GIFS[normalize(name)] ?? null;
}
