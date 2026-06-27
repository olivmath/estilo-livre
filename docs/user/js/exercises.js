// ── EXERCISE CRUD ─────────────────────────────────────────────
function openAddEx(){
  editExId=null;
  document.getElementById('sh-ex-title').textContent='Novo Exercício';
  ['ex-mac','ex-nm','ex-sets','ex-reps','ex-wt','ex-obs'].forEach(i=>document.getElementById(i).value='');
  openSheet('sh-ex');
}

function openEditEx(exId){
  const wk=getWks().find(w=>w.id===editWkId);
  const ex=wk?.exercises?.find(e=>e.id===exId); if(!ex)return;
  editExId=exId;
  document.getElementById('sh-ex-title').textContent='Editar Exercício';
  document.getElementById('ex-mac').value=ex.mac||'';
  document.getElementById('ex-nm').value=ex.name;
  document.getElementById('ex-sets').value=ex.sets;
  document.getElementById('ex-reps').value=ex.reps;
  document.getElementById('ex-wt').value=ex.wt||0;
  document.getElementById('ex-obs').value=ex.obs||'';
  openSheet('sh-ex');
}

function saveEx(){
  const name=document.getElementById('ex-nm').value.trim();
  if(!name)return alert('Nome obrigatório.');
  const wks=getWks(); const wk=wks.find(w=>w.id===editWkId); if(!wk)return;
  if(!wk.exercises)wk.exercises=[];
  const existingNum=editExId?wk.exercises.find(e=>e.id===editExId)?.num:null;
  const ex={
    id:editExId||uid(),
    num:existingNum||(wk.label+(wk.exercises.length+1)),
    mac:document.getElementById('ex-mac').value.trim(),
    name,
    sets:parseInt(document.getElementById('ex-sets').value)||4,
    reps:parseInt(document.getElementById('ex-reps').value)||12,
    wt:parseFloat(document.getElementById('ex-wt').value)||0,
    obs:document.getElementById('ex-obs').value.trim().toUpperCase(),
  };
  if(editExId){const i=wk.exercises.findIndex(e=>e.id===editExId);if(i>=0)wk.exercises[i]=ex;}
  else wk.exercises.push(ex);
  setWks(wks); closeSheet('sh-ex'); renderExercises();
  document.getElementById('det-meta').textContent=`${wk.exercises.length} exercícios`;
}

function delEx(exId){
  if(!confirm('Excluir exercício?'))return;
  const wks=getWks(); const wk=wks.find(w=>w.id===editWkId); if(!wk)return;
  wk.exercises=wk.exercises.filter(e=>e.id!==exId);
  setWks(wks); renderExercises();
}
