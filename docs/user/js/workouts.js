// ── WORKOUT CRUD ──────────────────────────────────────────────
function openAddWk(){
  editWkId=null; editColor=PAL[Math.floor(Math.random()*PAL.length)];
  document.getElementById('sh-wk-title').textContent='Novo Treino';
  document.getElementById('wk-id').value='';
  document.getElementById('wk-nm').value='';
  renderColorPal(); openSheet('sh-wk');
}

function openEditWk(id){
  const wk=getWks().find(w=>w.id===id); if(!wk)return;
  editWkId=id; editColor=wk.color||PAL[0];
  document.getElementById('sh-wk-title').textContent='Editar Treino';
  document.getElementById('wk-id').value=wk.label;
  document.getElementById('wk-nm').value=wk.name;
  renderColorPal(); openSheet('sh-wk');
}

function renderColorPal(){
  document.getElementById('color-pal').innerHTML=PAL.map(c=>
    `<div class="pcdot${c===editColor?' sel':''}" style="background:${c}" onclick="pickColor('${c}')"></div>`
  ).join('');
}

function pickColor(c){editColor=c;renderColorPal();}

function saveWk(){
  const label=document.getElementById('wk-id').value.trim().toUpperCase();
  const name=document.getElementById('wk-nm').value.trim();
  if(!label||!name)return alert('Preencha ID e nome.');
  const wks=getWks();
  if(editWkId){
    const i=wks.findIndex(w=>w.id===editWkId);
    if(i>=0){wks[i].label=label;wks[i].name=name;wks[i].color=editColor;}
  }else{
    wks.push({id:uid(),label,name,color:editColor,exercises:[]});
  }
  setWks(wks); closeSheet('sh-wk'); renderWorkouts();
}

function delWk(id){
  if(!confirm('Excluir treino?'))return;
  setWks(getWks().filter(w=>w.id!==id)); renderWorkouts();
}

function openDetail(id){
  editWkId=id; const wk=getWks().find(w=>w.id===id); if(!wk)return;
  const color=wk.color||'var(--acc)';
  document.getElementById('det-name').textContent=`Treino ${wk.label} — ${wk.name}`;
  document.getElementById('det-meta').textContent=`${wk.exercises?.length||0} exercícios`;
  document.getElementById('det-hdr').style.borderLeftColor=color;
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById('s-detail').classList.add('active');
  renderExercises();
}
