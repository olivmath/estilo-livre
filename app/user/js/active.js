// ── ACTIVE WORKOUT ────────────────────────────────────────────
function startWorkout(wkId){
  const wk=getWks().find(w=>w.id===wkId);
  if(!wk?.exercises?.length)return alert('Adicione exercícios primeiro!');
  Object.assign(A,{wkId,exs:[...wk.exercises],exIdx:0,set:0,start:Date.now(),results:[],weight:wk.exercises[0]?.wt||0,exStart:Date.now()});
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById('s-active').classList.add('active');
  document.getElementById('nav').classList.add('hidden');
  renderActiveEx(); startTimer();
}

function renderActiveEx(){
  const ex=A.exs[A.exIdx]; if(!ex)return;
  const wk=getWks().find(w=>w.id===A.wkId);
  const color=wk?.color||'var(--acc)';
  document.getElementById('a-wk-lbl').textContent=`Treino ${wk?.label||''}`;
  document.getElementById('a-ex-ctr').textContent=`Exercício ${A.exIdx+1} de ${A.exs.length}`;
  const b=[];
  if(ex.num)b.push(`<span class="nbadge" style="background:${color}">${ex.num}</span>`);
  if(ex.mac)b.push(`<span class="mb">Máq. ${ex.mac}</span>`);
  if(ex.obs)b.push(`<span class="mb">${ex.obs}</span>`);
  document.getElementById('a-badges').innerHTML=b.join('');
  document.getElementById('a-ex-name').textContent=ex.name;
  document.getElementById('a-weight').textContent=A.weight;
  document.getElementById('a-reps').textContent=ex.reps;
  document.getElementById('a-set-lbl').textContent=`Série ${A.set+1} de ${ex.sets}`;
  document.getElementById('a-sdots').innerHTML=Array.from({length:ex.sets},(_,i)=>
    `<div class="sd ${i<A.set?'done':i===A.set?'cur':''}"></div>`).join('');
  const next=A.exs[A.exIdx+1];
  document.getElementById('a-next-prev').innerHTML=next
    ?`<div style="font-size:12px;color:var(--t2);text-align:center;padding:6px 0">Próximo: ${next.num?next.num+' · ':''}${next.name} · ${next.wt}kg</div>`
    :`<div style="font-size:12px;color:var(--green);text-align:center;padding:6px 0">✓ Último exercício</div>`;
}

function adjW(d){
  A.weight=Math.max(0,parseFloat((A.weight+d).toFixed(1)));
  document.getElementById('a-weight').textContent=A.weight;
}

function nextSet(){
  A.set++;
  const ex=A.exs[A.exIdx];
  if(A.set>=ex.sets){showDiff(ex);}
  else{renderActiveEx();startRest(30);}
}

function startRest(secs){
  document.getElementById('rest-ov').classList.add('active');
  document.getElementById('rest-n').textContent=secs;
  clearInterval(A.restInt);
  A.restInt=setInterval(()=>{
    secs--;
    document.getElementById('rest-n').textContent=secs;
    if(secs<=0){clearInterval(A.restInt);document.getElementById('rest-ov').classList.remove('active');beep();}
  },1000);
}

function skipRest(){clearInterval(A.restInt);document.getElementById('rest-ov').classList.remove('active');}

function beep(){
  try{
    const ctx=new(window.AudioContext||window.webkitAudioContext)();
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.connect(g);g.connect(ctx.destination);
    o.frequency.value=880;o.type='sine';
    g.gain.setValueAtTime(0.3,ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.5);
    o.start();o.stop(ctx.currentTime+0.5);
  }catch(e){}
}

function showDiff(ex){
  pendingDiff=5;
  document.getElementById('diff-range').value=5;
  diffMove(5);
  document.getElementById('diff-ex-nm').textContent=`"${ex.num?ex.num+' — ':''}${ex.name}"`;
  document.getElementById('diff-ov').classList.add('active');
}

function diffMove(v){
  pendingDiff=parseInt(v);
  document.getElementById('diff-num').textContent=v;
  document.getElementById('diff-num').style.color=diffColor(pendingDiff);
}

function confirmDiff(){
  const ex=A.exs[A.exIdx];
  const t=Math.floor((Date.now()-A.exStart)/1000);
  A.results.push({exId:ex.id,num:ex.num||'',name:ex.name,wt:A.weight,diff:pendingDiff,sets:ex.sets,reps:ex.reps,time:t});
  document.getElementById('diff-ov').classList.remove('active');
  A.exIdx++;A.set=0;A.exStart=Date.now();
  if(A.exIdx>=A.exs.length){buildAndShowSummary();}
  else{A.weight=A.exs[A.exIdx].wt||0;renderActiveEx();startRest(45);}
}

function diffColor(v){
  if(v<=3)return'var(--green)';
  if(v<=6)return'var(--yellow)';
  return'var(--red)';
}

function buildAndShowSummary(){
  clearInterval(A.timerInt);
  const sec=Math.floor((Date.now()-A.start)/1000);
  const wk=getWks().find(w=>w.id===A.wkId);
  _pendingSess={id:uid(),wkId:A.wkId,wkLabel:wk?.label||'?',wkName:wk?.name||'',wkColor:wk?.color||'var(--acc)',date:Date.now(),dur:sec,exs:A.results};
  showReport(_pendingSess,true);
}

function confirmStop(){
  if(!confirm('Encerrar treino agora?'))return;
  clearInterval(A.timerInt);clearInterval(A.restInt);
  ['rest-ov','diff-ov','rep-ov'].forEach(id=>document.getElementById(id).classList.remove('active'));
  _pendingSess=null;
  document.getElementById('nav').classList.remove('hidden');
  nav('home',document.querySelector('[data-s="home"]'));
}

function startTimer(){
  const el=document.getElementById('a-timer');
  A.timerInt=setInterval(()=>{
    const e=Math.floor((Date.now()-A.start)/1000);
    el.textContent=`${String(Math.floor(e/60)).padStart(2,'0')}:${String(e%60).padStart(2,'0')}`;
  },1000);
}
