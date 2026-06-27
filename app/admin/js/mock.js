// ── EXERCISE LIBRARY ────────────────────────────────────────
const EXERCISE_LIB = [
  { group:'Peitoral', exs:[
    {mac:'12',name:'Supino Reto',sets:4,reps:12},{mac:'11',name:'Supino Inclinado',sets:4,reps:12},
    {mac:'13',name:'Supino Declinado',sets:4,reps:12},{mac:'',name:'Crucifixo Reto',sets:4,reps:12},
    {mac:'',name:'Crucifixo Inclinado',sets:4,reps:12},{mac:'22',name:'Cross Over',sets:4,reps:12},
    {mac:'09',name:'Peck Deck',sets:4,reps:12},{mac:'14',name:'Supino Máq. Reto',sets:4,reps:12},
    {mac:'10',name:'Supino Máq. Inclinado',sets:4,reps:12},{mac:'',name:'Pull-over',sets:4,reps:12},
  ]},
  { group:'Ombro', exs:[
    {mac:'',name:'Desenvolvimento',sets:4,reps:12},{mac:'18',name:'Desenv. Máquina',sets:4,reps:12},
    {mac:'',name:'Desenv. Arnold',sets:4,reps:12},{mac:'',name:'Elevação Lateral',sets:4,reps:12},
    {mac:'',name:'Elevação Frontal',sets:4,reps:12},{mac:'',name:'Remada Alta',sets:4,reps:12},
    {mac:'',name:'Encolhimento',sets:4,reps:12},
  ]},
  { group:'Tríceps', exs:[
    {mac:'22',name:'Pulley Tríceps',sets:4,reps:12},{mac:'',name:'Testa Polia',sets:4,reps:12},
    {mac:'',name:'Testa Halter',sets:4,reps:12},{mac:'',name:'Frânces',sets:4,reps:12},
    {mac:'',name:'Banco Tríceps',sets:4,reps:12},{mac:'',name:'Coice',sets:4,reps:12},
    {mac:'',name:'Supinado',sets:4,reps:12},{mac:'22',name:'Corda Tríceps',sets:4,reps:12},
    {mac:'',name:'Paralela',sets:4,reps:12},
  ]},
  { group:'Dorsal', exs:[
    {mac:'20',name:'Puxada p/ Trás',sets:4,reps:12},{mac:'20',name:'Puxada p/ Frente',sets:4,reps:12},
    {mac:'19',name:'Remada Articulada',sets:4,reps:12},{mac:'21',name:'Remada Baixa',sets:4,reps:12},
    {mac:'',name:'Remada Curvada',sets:4,reps:12},{mac:'',name:'Serrote',sets:4,reps:12},
    {mac:'09',name:'Peck Deck Invertido',sets:4,reps:12},{mac:'',name:'Crucifixo Inverso',sets:4,reps:12},
    {mac:'',name:'Barra Fixa',sets:4,reps:12},{mac:'',name:'Lombar',sets:4,reps:12},
  ]},
  { group:'Bíceps', exs:[
    {mac:'',name:'Rosca Direta W',sets:4,reps:12},{mac:'',name:'Rosca Alternada',sets:4,reps:12},
    {mac:'',name:'Rosca Scott Máq.',sets:4,reps:12},{mac:'',name:'Rosca Concentrada',sets:4,reps:12},
    {mac:'22',name:'Rosca Polia Baixa',sets:4,reps:12},{mac:'',name:'Rosca Martelo',sets:4,reps:12},
    {mac:'',name:'Rosca 21',sets:4,reps:12},{mac:'23',name:'Rosca Scott',sets:4,reps:12},
    {mac:'',name:'Banco Scott',sets:4,reps:12},
  ]},
  { group:'Antebraço', exs:[
    {mac:'',name:'Rosca Inversa',sets:4,reps:12},{mac:'',name:'Flexão de Punho',sets:4,reps:12},
    {mac:'',name:'Extensão de Punho',sets:4,reps:12},
  ]},
  { group:'Coxa', exs:[
    {mac:'15',name:'Agachamento Hack',sets:4,reps:12},{mac:'16',name:'Agachamento Smith',sets:4,reps:12},
    {mac:'17',name:'Leg Press 45°',sets:4,reps:12},{mac:'01',name:'Leg Press Horizontal',sets:4,reps:12},
    {mac:'',name:'Avanço',sets:4,reps:12},{mac:'04',name:'Extensor',sets:4,reps:12},
    {mac:'02',name:'Flexor Mesa',sets:4,reps:12},{mac:'',name:'Stiff',sets:4,reps:12},
    {mac:'06',name:'Adutor',sets:4,reps:12},{mac:'07',name:'Abdutor',sets:4,reps:12},
    {mac:'',name:'Cadeira Flexora',sets:4,reps:12},
  ]},
  { group:'Glúteo', exs:[
    {mac:'',name:'Elevação Pélvica',sets:4,reps:12},{mac:'03',name:'Glúteo Máq. Artic.',sets:4,reps:12},
    {mac:'',name:'Afundo',sets:4,reps:12},{mac:'',name:'Afundo com Step',sets:4,reps:12},
    {mac:'22',name:'Polia Glúteo',sets:4,reps:12},
  ]},
  { group:'Panturrilha', exs:[
    {mac:'16',name:'Panturrilha Smith',sets:4,reps:15},{mac:'',name:'Panturrilha Solo',sets:4,reps:15},
    {mac:'08',name:'Panturrilha Sentada',sets:4,reps:15},{mac:'01',name:'Panturrilha Leg Press',sets:4,reps:15},
  ]},
];

const EX_GROUPS = ['Peitoral','Ombro','Tríceps','Dorsal','Bíceps','Antebraço','Coxa','Glúteo','Panturrilha'];

// ── MOCK DATA ────────────────────────────────────────────────
function ensureMockData() {
  if (Object.keys(DB.get('users',{})).length > 0) return;
  const MOCK=[
    {name:'Ana Clara Souza', email:'ana@estilo.com',   freq:4.5,days:80,base:1.0, stop:0 },
    {name:'Bruno Ferreira',  email:'bruno@estilo.com', freq:3,  days:90,base:1.4, stop:0 },
    {name:'Carla Mendes',    email:'carla@estilo.com', freq:5,  days:60,base:0.9, stop:0 },
    {name:'Diego Oliveira',  email:'diego@estilo.com', freq:2,  days:90,base:1.6, stop:0 },
    {name:'Fernanda Lima',   email:'fer@estilo.com',   freq:3,  days:45,base:0.85,stop:0 },
    {name:'Gabriel Costa',   email:'gabs@estilo.com',  freq:1.5,days:90,base:1.2, stop:9 },
    {name:'Helena Rocha',    email:'helena@estilo.com',freq:4,  days:70,base:0.95,stop:0 },
    {name:'Igor Santos',     email:'igor@estilo.com',  freq:3,  days:90,base:1.3, stop:32},
    {name:'Juliana Pires',   email:'ju@estilo.com',    freq:2.5,days:50,base:0.8, stop:0 },
    {name:'Rafael Andrade',  email:'rafael@estilo.com',freq:3.5,days:85,base:1.5, stop:0 },
    {name:'Lucas Oliveira',  email:'lucas@estilo.com', freq:4,  days:0,  base:1.0, stop:0 },
  ];
  const WKS=[
    {label:'A',name:'Treino Completo',color:'#1B3487',exs:[
      {mac:'12',name:'Supino Reto',sets:4,reps:12,wt:40},{mac:'20',name:'Puxada p/ Frente',sets:4,reps:12,wt:40},
      {mac:'17',name:'Leg Press 45°',sets:4,reps:12,wt:100},{mac:'22',name:'Pulley Tríceps',sets:4,reps:12,wt:25},
      {mac:'',name:'Rosca Direta W',sets:4,reps:12,wt:20},
    ]},
  ];
  const newUsers={};
  MOCK.forEach(u=>{newUsers[u.email]={name:u.name,email:u.email,pw:'123',active:true};});
  DB.set('users',newUsers);
  MOCK.forEach(u=>{
    const wks=WKS.map(t=>({
      id:uid(),label:t.label,name:t.name,color:t.color,
      exercises:t.exs.map((ex,i)=>({id:uid(),num:t.label+(i+1),mac:ex.mac,name:ex.name,sets:ex.sets,reps:ex.reps,wt:Math.round(ex.wt*u.base*2)/2,obs:''}))
    }));
    DB.set(`wk_${u.email}`,wks);
    const sessions=[];const now=Date.now();const end=now-u.stop*DAY;
    let date=now-u.days*DAY;const dpS=(7/u.freq)*DAY;let wkIdx=0;
    while(date<end){
      const wk=wks[wkIdx%wks.length];const sN=sessions.filter(s=>s.wkId===wk.id).length;
      const prog=Math.floor(sN/3);const pos=sN%3;
      const exs=wk.exercises.map(ex=>{
        const wt=Math.round((ex.wt+prog*2.5)*2)/2;
        const rpe=pos===0&&sN>0?8:7-pos;
        const diff=Math.max(4,Math.min(9,rpe+(Math.random()>.7?1:0)-(Math.random()>.8?1:0)));
        return{exId:ex.id,num:ex.num,name:ex.name,wt,diff:Math.round(diff),sets:ex.sets,reps:ex.reps,time:280+Math.floor(Math.random()*240)};
      });
      sessions.push({id:uid(),wkId:wk.id,wkLabel:wk.label,wkName:wk.name,wkColor:wk.color,date:date+Math.floor(Math.random()*DAY*.7),dur:2700+Math.floor(Math.random()*2700),exs});
      wkIdx++;date+=dpS*(.75+Math.random()*.5);
    }
    DB.set(`sess_${u.email}`,sessions);
  });
  // Ficha real do Lucas (A/B/C/D/E da ficha-treino.md)
  const mkL=(num,mac,name,sets,reps)=>({id:uid(),num,mac,name,sets,reps,wt:0,obs:''});
  DB.set('wk_lucas@estilo.com',[
    {id:uid(),label:'A',name:'Peitoral / Ombro / Tríceps',color:'#1B3487',exercises:[
      mkL('A1','10','Supino Máq. Inclinado',4,12),mkL('A2','14','Supino Máq. Reto',4,12),
      mkL('A3','09','Peck Deck',4,12),mkL('A4','','Desenvolvimento',4,12),
      mkL('A5','','Elevação Lateral',4,12),mkL('A6','','Elevação Frontal',4,12),
      mkL('A7','22','Pulley Tríceps',4,12),mkL('A8','22','Corda Tríceps',4,12),
      mkL('A9','','Supinado',4,12),
    ]},
    {id:uid(),label:'B',name:'Costas / Bíceps',color:'#9C27B0',exercises:[
      mkL('B1','20','Puxada p/ Frente',4,12),mkL('B2','21','Remada Baixa',4,12),
      mkL('B3','19','Remada Articulada',4,12),mkL('B4','','Rosca Direta W',4,12),
      mkL('B5','','Rosca Martelo',4,12),mkL('B6','','Banco Scott',4,12),
    ]},
    {id:uid(),label:'C',name:'Coxa / Glúteo I',color:'#4CAF50',exercises:[
      mkL('C1','04','Extensor',4,12),mkL('C2','17','Leg Press 45°',4,12),
      mkL('C3','06','Adutor',4,12),
    ]},
    {id:uid(),label:'D',name:'Coxa / Glúteo II',color:'#FF9800',exercises:[
      mkL('D1','','Cadeira Flexora',4,12),mkL('D2','02','Flexor Mesa',4,12),
      mkL('D3','07','Abdutor',4,12),mkL('D4','','Afundo',4,12),
      mkL('D5','','Elevação Pélvica',4,12),mkL('D6','','Panturrilha Solo',4,15),
    ]},
    {id:uid(),label:'E',name:'Variados',color:'#00BCD4',exercises:[
      mkL('E1','','Crucifixo Reto',4,12),mkL('E2','22','Cross Over',4,12),
      mkL('E3','18','Desenv. Máquina',4,12),mkL('E4','','Testa Polia',4,12),
      mkL('E5','09','Peck Deck Invertido',4,12),mkL('E6','','Crucifixo Inverso',4,12),
      mkL('E7','22','Rosca Polia Baixa',4,12),mkL('E8','16','Agachamento Smith',4,12),
      mkL('E9','','Stiff',4,12),
    ]},
  ]);
  // Seed exercise library
  if (!DB.get('exercises', null)) {
    const exercises = [];
    EXERCISE_LIB.forEach(group => {
      group.exs.forEach(ex => {
        exercises.push({ id: uid(), mac: ex.mac, name: ex.name, group: group.group, defaultSets: ex.sets, defaultReps: ex.reps });
      });
    });
    DB.set('exercises', exercises);
  }
  // Seed default workout templates from ficha
  if (!DB.get('wk_templates',null)) {
    const mkEx = (num,mac,name,sets,reps) => ({ exId:uid(), num, mac, name, sets, reps });
    DB.set('wk_templates',[
      // TREINOS A (Peitoral / Tríceps)
      {id:uid(),label:'A',name:'Peitoral / Tríceps (Iniciante)',color:'#1B3487',exercises:[
        mkEx('A1','14','Supino Máq. Reto',3,10),
        mkEx('A2','09','Peck Deck',3,10),
        mkEx('A3','22','Pulley Tríceps',3,10),
        mkEx('A4','','Elevação Lateral',3,10),
      ]},
      {id:uid(),label:'A',name:'Peitoral / Tríceps (Intermediário)',color:'#1B3487',exercises:[
        mkEx('A1','10','Supino Máq. Inclinado',4,12),
        mkEx('A2','14','Supino Máq. Reto',4,12),
        mkEx('A3','09','Peck Deck',4,12),
        mkEx('A4','22','Pulley Tríceps',4,12),
        mkEx('A5','22','Corda Tríceps',4,12),
        mkEx('A6','','Elevação Lateral',4,12),
      ]},
      {id:uid(),label:'A',name:'Peitoral / Tríceps (Avançado)',color:'#1B3487',exercises:[
        mkEx('A1','10','Supino Máq. Inclinado',4,12),
        mkEx('A2','14','Supino Máq. Reto',4,12),
        mkEx('A3','09','Peck Deck',4,12),
        mkEx('A4','22','Cross Over',4,12),
        mkEx('A5','22','Pulley Tríceps',4,12),
        mkEx('A6','22','Corda Tríceps',4,12),
        mkEx('A7','','Paralela',4,10),
        mkEx('A8','','Elevação Lateral',4,12),
        mkEx('A9','','Elevação Frontal',4,12),
      ]},
      // TREINOS B (Costas / Bíceps)
      {id:uid(),label:'B',name:'Costas / Bíceps (Iniciante)',color:'#9C27B0',exercises:[
        mkEx('B1','20','Puxada p/ Frente',3,10),
        mkEx('B2','21','Remada Baixa',3,10),
        mkEx('B3','','Rosca Direta W',3,10),
        mkEx('B4','','Rosca Martelo',3,10),
      ]},
      {id:uid(),label:'B',name:'Costas / Bíceps (Intermediário)',color:'#9C27B0',exercises:[
        mkEx('B1','20','Puxada p/ Frente',4,12),
        mkEx('B2','21','Remada Baixa',4,12),
        mkEx('B3','19','Remada Articulada',4,12),
        mkEx('B4','','Rosca Direta W',4,12),
        mkEx('B5','','Rosca Martelo',4,12),
        mkEx('B6','','Banco Scott',4,12),
      ]},
      {id:uid(),label:'B',name:'Costas / Bíceps (Avançado)',color:'#9C27B0',exercises:[
        mkEx('B1','','Barra Fixa',4,8),
        mkEx('B2','20','Puxada p/ Frente',4,12),
        mkEx('B3','21','Remada Baixa',4,12),
        mkEx('B4','19','Remada Articulada',4,12),
        mkEx('B5','','Serrote',4,12),
        mkEx('B6','','Rosca Direta W',4,12),
        mkEx('B7','','Rosca Scott Máq.',4,12),
        mkEx('B8','','Rosca Martelo',4,12),
      ]},
      // TREINOS C (Pernas / Glúteos)
      {id:uid(),label:'C',name:'Pernas / Glúteos (Iniciante)',color:'#4CAF50',exercises:[
        mkEx('C1','04','Extensor',3,10),
        mkEx('C2','17','Leg Press 45°',3,10),
        mkEx('C3','02','Flexor Mesa',3,10),
        mkEx('C4','','Panturrilha Solo',3,12),
      ]},
      {id:uid(),label:'C',name:'Pernas / Glúteos (Intermediário)',color:'#4CAF50',exercises:[
        mkEx('C1','04','Extensor',4,12),
        mkEx('C2','17','Leg Press 45°',4,12),
        mkEx('C3','06','Adutor',4,12),
        mkEx('C4','02','Flexor Mesa',4,12),
        mkEx('C5','','Elevação Pélvica',4,12),
        mkEx('C6','','Panturrilha Solo',4,15),
      ]},
      {id:uid(),label:'C',name:'Pernas / Glúteos (Avançado)',color:'#4CAF50',exercises:[
        mkEx('C1','16','Agachamento Smith',4,12),
        mkEx('C2','17','Leg Press 45°',4,12),
        mkEx('C3','04','Extensor',4,12),
        mkEx('C4','02','Flexor Mesa',4,12),
        mkEx('C5','','Cadeira Flexora',4,12),
        mkEx('C6','','Stiff',4,12),
        mkEx('C7','06','Adutor',4,12),
        mkEx('C8','','Elevação Pélvica',4,12),
        mkEx('C9','','Panturrilha Sentada',4,15),
      ]},
      // TREINOS D (Ombros / Trapézio)
      {id:uid(),label:'D',name:'Ombros / Trapézio (Iniciante)',color:'#FF9800',exercises:[
        mkEx('D1','18','Desenv. Máquina',3,10),
        mkEx('D2','','Elevação Lateral',3,10),
        mkEx('D3','','Encolhimento',3,12),
      ]},
      {id:uid(),label:'D',name:'Ombros / Trapézio (Intermediário)',color:'#FF9800',exercises:[
        mkEx('D1','18','Desenv. Máquina',4,12),
        mkEx('D2','','Elevação Lateral',4,12),
        mkEx('D3','','Elevação Frontal',4,12),
        mkEx('D4','','Encolhimento',4,12),
      ]},
      {id:uid(),label:'D',name:'Ombros / Trapézio (Avançado)',color:'#FF9800',exercises:[
        mkEx('D1','18','Desenv. Máquina',4,12),
        mkEx('D2','','Desenv. Arnold',4,12),
        mkEx('D3','','Elevação Lateral',4,12),
        mkEx('D4','22','Crucifixo Inverso',4,12),
        mkEx('D5','','Remada Alta',4,12),
        mkEx('D6','','Encolhimento',4,15),
      ]},
      // TREINOS E (Cardio / Core)
      {id:uid(),label:'E',name:'Cardio / Core (Iniciante)',color:'#00BCD4',exercises:[
        mkEx('E1','','Abdominal Solo',3,15),
        mkEx('E2','','Prancha Estática',3,30),
      ]},
      {id:uid(),label:'E',name:'Cardio / Core (Intermediário)',color:'#00BCD4',exercises:[
        mkEx('E1','','Abdominal Solo',4,15),
        mkEx('E2','','Elevação de Pernas',4,15),
        mkEx('E3','','Prancha Estática',4,45),
      ]},
      {id:uid(),label:'E',name:'Cardio / Core (Avançado)',color:'#00BCD4',exercises:[
        mkEx('E1','','Abdominal Solo',4,20),
        mkEx('E2','','Elevação de Pernas',4,20),
        mkEx('E3','','Prancha Estática',4,60),
        mkEx('E4','','Lombar',4,15),
      ]},
      // TREINOS F (Full Body)
      {id:uid(),label:'F',name:'Full Body (Iniciante)',color:'#4CAF50',exercises:[
        mkEx('F1','17','Leg Press 45°',3,10),
        mkEx('F2','20','Puxada p/ Frente',3,10),
        mkEx('F3','14','Supino Máq. Reto',3,10),
        mkEx('F4','','Abdominal Solo',3,15),
      ]},
      {id:uid(),label:'F',name:'Full Body (Intermediário)',color:'#4CAF50',exercises:[
        mkEx('F1','17','Leg Press 45°',4,12),
        mkEx('F2','20','Puxada p/ Frente',4,12),
        mkEx('F3','14','Supino Máq. Reto',4,12),
        mkEx('F4','','Elevação Lateral',4,12),
        mkEx('F5','','Rosca Direta W',4,12),
        mkEx('F6','22','Pulley Tríceps',4,12),
      ]},
      {id:uid(),label:'F',name:'Full Body (Avançado)',color:'#4CAF50',exercises:[
        mkEx('F1','16','Agachamento Smith',4,10),
        mkEx('F2','17','Leg Press 45°',4,12),
        mkEx('F3','20','Puxada p/ Frente',4,12),
        mkEx('F4','14','Supino Máq. Reto',4,12),
        mkEx('F5','','Elevação Lateral',4,12),
        mkEx('F6','','Rosca Direta W',4,12),
        mkEx('F7','22','Pulley Tríceps',4,12),
        mkEx('F8','','Abdominal Solo',4,20),
      ]},
    ]);
  }
}
