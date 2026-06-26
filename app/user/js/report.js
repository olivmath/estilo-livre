// ── REPORT ────────────────────────────────────────────────────
function showReport(sess,isPending){
  const color=sess.wkColor||'var(--acc)';
  const vol=sess.exs.reduce((a,r)=>a+((r.wt||0)*(r.sets||4)*(r.reps||12)),0);
  const avg=sess.exs.length?(sess.exs.reduce((a,r)=>a+r.diff,0)/sess.exs.length).toFixed(1):'—';
  const m=String(Math.floor(sess.dur/60)).padStart(2,'0');
  const s=String(sess.dur%60).padStart(2,'0');
  const dateStr=new Date(sess.date).toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long'});

  let html=`
    <div class="rep-hdr" style="background:linear-gradient(160deg,${color}33,transparent);border-bottom:3px solid ${color}">
      ${!isPending?`<button class="rep-close" onclick="closeReport()">✕</button>`:''}
      <div class="rep-badge" style="color:${color}">TREINO</div>
      <div class="rep-label" style="color:${color}">${sess.wkLabel}</div>
      <div class="rep-name">${sess.wkName}</div>
      <div class="rep-date">${dateStr}</div>
    </div>
    <div class="rep-stats">
      <div class="rep-stat"><div class="rep-sv" style="color:${color}">${m}:${s}</div><div class="rep-sl">Duração</div></div>
      <div class="rep-stat"><div class="rep-sv" style="color:${color}">${vol>=1000?(vol/1000).toFixed(1)+'t':vol+'kg'}</div><div class="rep-sl">Volume</div></div>
      <div class="rep-stat"><div class="rep-sv" style="color:${diffColor(parseFloat(avg))}">${avg}/10</div><div class="rep-sl">Dif. média</div></div>
    </div>
    ${sess.exs.map(r=>{
      const dc=diffColor(r.diff);
      const t=r.time||0;
      const em=String(Math.floor(t/60)).padStart(2,'0');
      const es=String(t%60).padStart(2,'0');
      return`<div class="rep-ex">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          ${r.num?`<span class="nbadge" style="background:${color}">${r.num}</span>`:''}
          <div class="rep-ex-nm">${r.name}</div>
        </div>
        <div class="rep-ex-sub">${r.sets} séries &times; ${r.reps} reps &nbsp;·&nbsp; <strong style="color:var(--t)">${r.wt}kg</strong></div>
        <div class="dbar"><div class="dfill" style="width:${r.diff*10}%;background:${dc}"></div></div>
        <div class="dlbl"><span>Dificuldade</span><span style="color:${dc};font-weight:700">${r.diff}/10</span></div>
        <div style="font-size:12px;color:var(--t3);margin-top:8px">⏱ ${em}:${es} no exercício</div>
      </div>`;
    }).join('')}
    <div style="padding:16px;display:flex;gap:10px">
      ${isPending
        ?`<button class="btn bs" style="flex:1" onclick="discardWk()">Descartar</button>
          <button class="btn bp" style="flex:2" onclick="saveAndFinish()">Salvar ✓</button>`
        :`<button class="btn bs" onclick="closeReport()">Fechar</button>`}
    </div>`;

  document.getElementById('rep-content').innerHTML=html;
  const ov=document.getElementById('rep-ov');
  ov.scrollTop=0;
  ov.classList.add('active');
}

function saveAndFinish(){
  if(!_pendingSess)return;
  const sessions=getSess(); sessions.push(_pendingSess); setSess(sessions);
  const wks=getWks(); const wk=wks.find(w=>w.id===_pendingSess.wkId);
  if(wk){_pendingSess.exs.forEach(r=>{const e=wk.exercises?.find(e=>e.id===r.exId);if(e)e.wt=r.wt;});setWks(wks);}
  _pendingSess=null;
  document.getElementById('rep-ov').classList.remove('active');
  document.getElementById('nav').classList.remove('hidden');
  nav('home',document.querySelector('[data-s="home"]'));
}

function discardWk(){
  if(!confirm('Descartar treino sem salvar?'))return;
  _pendingSess=null;
  document.getElementById('rep-ov').classList.remove('active');
  document.getElementById('nav').classList.remove('hidden');
  nav('home',document.querySelector('[data-s="home"]'));
}

function closeReport(){
  document.getElementById('rep-ov').classList.remove('active');
}

function openSessById(id){
  const sess=getSess().find(s=>s.id===id); if(!sess)return;
  if(!sess.wkLabel||!sess.wkName){
    const wk=getWks().find(w=>w.id===sess.wkId);
    if(wk){sess.wkLabel=wk.label;sess.wkName=wk.name;sess.wkColor=wk.color||'var(--acc)';}
  }
  showReport(sess,false);
}
