// ── TREND CHART ───────────────────────────────────────────────
function trendChart(sessions){
  const W=300,H=70,PAD=4;
  const pts=sessions.map(s=>{
    const exs=s.exs||[];
    return exs.length?exs.reduce((a,r)=>a+(r.diff||5),0)/exs.length:5;
  });
  const svgPts=pts.map((v,i)=>{
    const x=PAD+(pts.length===1?W/2:(i/(pts.length-1))*(W-PAD*2));
    const y=PAD+(1-(v/10))*(H-PAD*2);
    return{x,y,v};
  });
  const polyline=svgPts.map(p=>`${p.x},${p.y}`).join(' ');
  const area=`${svgPts[0].x},${H} `+svgPts.map(p=>`${p.x},${p.y}`).join(' ')+` ${svgPts[svgPts.length-1].x},${H}`;
  // color based on trend: if last < first → improving (green), else red
  const trend=pts[pts.length-1]-pts[0];
  const trendColor=trend<-0.5?'var(--green)':trend>0.5?'var(--red)':'var(--yellow)';
  const trendLabel=trend<-0.5?'↓ Melhorando':'↑ Ficando difícil';
  const wkLabels=sessions.map(s=>s.wkLabel||'?');
  return`
    <div style="position:relative">
      <svg width="100%" height="${H}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="display:block">
        <defs>
          <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${trendColor}" stop-opacity=".25"/>
            <stop offset="100%" stop-color="${trendColor}" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <polygon points="${area}" fill="url(#tg)"/>
        <polyline points="${polyline}" fill="none" stroke="${trendColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        ${svgPts.map(p=>`<circle cx="${p.x}" cy="${p.y}" r="3.5" fill="${trendColor}"/>`).join('')}
      </svg>
      <div style="position:absolute;top:4px;right:0;font-size:12px;color:${trendColor};font-weight:600">${trendLabel}</div>
    </div>
    <div style="display:flex;justify-content:space-between;overflow:hidden;margin-top:4px">
      ${wkLabels.map(l=>`<span style="font-size:10px;color:var(--t3);flex:1;text-align:center">${l}</span>`).join('')}
    </div>`;
}

// ── SUGGESTIONS ───────────────────────────────────────────────
function getSuggestions(){
  const wks=getWks(),sess=getSess(),out=[];
  wks.forEach(wk=>{
    const recent=sess.filter(s=>s.wkId===wk.id).slice(-3);
    if(recent.length<2)return;
    wk.exercises?.forEach(ex=>{
      const rows=recent.flatMap(s=>s.exs.filter(e=>e.exId===ex.id));
      if(rows.length<2)return;
      const avg=rows.reduce((a,b)=>a+b.diff,0)/rows.length;
      const last=rows[rows.length-1]?.wt??ex.wt;
      if(avg<=4)out.push({name:ex.name,num:ex.num,cur:last,sug:+(last+2.5).toFixed(1)});
    });
  });
  return out;
}

// ── RENDER HOME ───────────────────────────────────────────────
function renderHome(){
  if(!U)return;
  const wks=getWks(),sess=getSess();
  const{done,next,pct,cycles}=cycleInfo();
  document.getElementById('d-name').textContent=`Bom treino, ${U.name.split(' ')[0]} 👋`;
  const photo=DB.get(`photo_${U.email}`,null);
  const av=document.getElementById('d-avatar');
  av.innerHTML=photo?`<img src="${photo}" style="width:100%;height:100%;object-fit:cover">`:`<span>${U.name[0].toUpperCase()}</span>`;

  const nWk=wks.find(w=>w.id===next)||wks[0];
  document.getElementById('d-banner').innerHTML=nWk?`
    <div class="banner" style="background:linear-gradient(135deg,${nWk.color}dd,${nWk.color}99)" onclick="startWorkout('${nWk.id}')">
      <div>
        <div style="font-size:11px;opacity:.75;letter-spacing:1px;margin-bottom:4px">PRÓXIMO TREINO</div>
        <h3 style="font-size:20px;font-weight:700">Treino ${nWk.label} - ${nWk.name}</h3>
        <p style="font-size:13px;opacity:.85;margin-top:3px">${nWk.exercises?.length||0} exercícios</p>
      </div>
      <div class="pcirc"><svg viewBox="0 0 24 24" fill="white" width="22" height="22"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>
    </div>`:'';

  document.getElementById('d-dots').innerHTML=wks.map(w=>`
    <div class="dot ${done.has(w.id)?'done':''}" style="${done.has(w.id)?'':'background:'+w.id===next?w.color:'var(--bg3)'};${w.id===next&&!done.has(w.id)?`background:${w.color};color:#fff;box-shadow:0 0 14px ${w.color}66`:''}">${done.has(w.id)?'✓':w.label}</div>`).join('');
  document.getElementById('d-pbar').style.cssText=`width:${pct}%;background:var(--acc)`;
  document.getElementById('d-cycle-lbl').textContent=pct===100?'🎉 Ciclo completo!':pct?`${Math.round(pct)}% concluído`:'Inicie o ciclo!';

  // Trend chart
  const allSess=[...sess].sort((a,b)=>a.date-b.date).slice(-12);
  document.getElementById('d-trend').innerHTML=allSess.length>=2?`
    <div class="card">
      <div class="ct">Tendência de dificuldade</div>
      ${trendChart(allSess)}
      <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:11px;color:var(--t3)">
        <span>${new Date(allSess[0].date).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})}</span>
        <span style="color:var(--t2)">↓ mais fácil = progredindo</span>
        <span>${new Date(allSess[allSess.length-1].date).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})}</span>
      </div>
    </div>`:'';

  const sugs=getSuggestions();
  document.getElementById('d-sugs').innerHTML=sugs.length?`
    <div class="sug-card">
      <div class="sug-title">💡 Sugestões de progressão</div>
      ${sugs.map(s=>`<div class="sug-row"><span>${s.num?`<b>${s.num}</b> — `:''}${s.name}</span><span>${s.cur}kg → <span style="color:var(--green);font-weight:600">${s.sug}kg</span></span></div>`).join('')}
    </div>`:'';
}

// ── RENDER WORKOUTS ───────────────────────────────────────────
function renderWorkouts(){
  const wks=getWks(); const{done,next}=cycleInfo();
  document.getElementById('w-dots').innerHTML=wks.map(w=>`
    <div class="dot ${done.has(w.id)?'done':''}" style="width:36px;height:36px;font-size:12px;${done.has(w.id)?'':'background:'+(w.id===next?w.color:'var(--bg3)')};${w.id===next&&!done.has(w.id)?`color:#fff;box-shadow:0 0 12px ${w.color}55`:''}">${done.has(w.id)?'✓':w.label}</div>`).join('');
  document.getElementById('wk-list').innerHTML=wks.length?wks.map(w=>{
    const isDone=done.has(w.id),isNext=w.id===next;
    return`<div class="wki" onclick="openDetail('${w.id}')">
      <div class="wkb" style="background:${isDone?'var(--green)':w.color}">${isDone?'✓':w.label}</div>
      <div class="wki-info">
        <div class="wki-name">Treino ${w.label} — ${w.name}</div>
        <div class="wki-meta">${w.exercises?.length||0} exercícios${isNext?' · próximo':''}${isDone?' · feito':''}</div>
      </div>
      <div style="display:flex;gap:6px" onclick="event.stopPropagation()">
        <button class="ibtn" onclick="startWorkout('${w.id}')"><svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><polygon points="5 3 19 12 5 21 5 3"/></svg></button>
      </div>
    </div>`;
  }).join(''):`<div class="empty">Nenhum treino cadastrado pelo professor.</div>`;
}

// ── RENDER EXERCISES ──────────────────────────────────────────
function renderExercises(){
  const wk=getWks().find(w=>w.id===editWkId); const color=wk?.color||'var(--acc)';
  document.getElementById('ex-list').innerHTML=wk?.exercises?.length?wk.exercises.map(ex=>{
    const hist=getExerciseHistory(ex.name);
    const histStr=hist.length?`<div style="font-size:11px;color:var(--t3);margin-top:4px">Progresso: ${hist.slice(-3).map(h=>`<b>${h.wt}</b>kg`).join(' → ')}</div>`:'';
    return `
    <div class="exi" style="cursor:pointer" onclick="openSetWeight('${ex.id}')">
      <div class="exi-info">
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:5px">
          ${ex.num?`<span class="nbadge" style="background:${color}">${ex.num}</span>`:''}
          ${ex.mac?`<span class="mb">Máq. ${ex.mac}</span>`:''}
        </div>
        <div class="exi-nm">${ex.name}</div>
        <div class="exi-meta">${ex.sets}×${ex.reps}</div>
        ${histStr}
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;min-width:52px">
        <div style="font-size:20px;font-weight:700;color:var(--acc)">${ex.wt||0}</div>
        <div style="font-size:11px;color:var(--t2)">kg</div>
      </div>
    </div>`;
  }).join(''):`<div class="empty">Nenhum exercício cadastrado pelo professor.</div>`;
}

// ── RENDER HISTORY ────────────────────────────────────────────
function renderHistory(){
  if(!U)return;
  const wks=getWks(),sess=getSess();
  const rows=[...sess].sort((a,b)=>b.date-a.date);
  document.getElementById('h-list').innerHTML=rows.length?rows.map(s=>{
    const w=wks.find(x=>x.id===s.wkId); const color=s.wkColor||w?.color||'var(--acc)';
    const d=new Date(s.date).toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'2-digit'});
    const avg=s.exs?.length?(s.exs.reduce((a,r)=>a+r.diff,0)/s.exs.length).toFixed(1):'—';
    const dc=diffColor(parseFloat(avg));
    return`<div class="card" style="cursor:pointer;border-left:3px solid ${color}" onclick="openSessById('${s.id}')">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-weight:600">Treino ${s.wkLabel||w?.label||'?'} — ${s.wkName||w?.name||''}</div>
          <div style="font-size:12px;color:var(--t2);margin-top:2px">${d} · ${Math.floor(s.dur/60)}min</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:20px;font-weight:700;color:${dc}">${avg}</div>
          <div style="font-size:11px;color:var(--t3)">dif. média</div>
        </div>
      </div>
    </div>`;
  }).join(''):`<div class="empty">Nenhum treino ainda.<br>Toque em Play para começar!</div>`;
}

// ── RENDER PROFILE ────────────────────────────────────────────
function renderProfile(){
  if(!U)return;
  const sess=getSess(),wks=getWks();
  document.getElementById('p-name').textContent=U.name;
  document.getElementById('p-email').textContent=U.email;
  document.getElementById('p-total').textContent=sess.length;
  document.getElementById('p-cycles').textContent=cycleInfo().cycles;
  const photo=DB.get(`photo_${U.email}`,null);
  const pav=document.getElementById('p-avatar');
  pav.innerHTML=photo?`<img src="${photo}" style="width:100%;height:100%;object-fit:cover">`:`<span>${U.name[0].toUpperCase()}</span>`;
  const rows=[...sess].sort((a,b)=>b.date-a.date).slice(0,30);
  document.getElementById('p-hist').innerHTML=rows.length?rows.map(s=>{
    const w=wks.find(x=>x.id===s.wkId); const color=s.wkColor||w?.color||'var(--acc)';
    const d=new Date(s.date).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',year:'2-digit'});
    return`<div class="sess-row" onclick="openSessById('${s.id}')">
      <div style="display:flex;align-items:center;gap:10px">
        <div style="width:10px;height:10px;border-radius:50%;background:${color};flex-shrink:0"></div>
        <span>Treino ${s.wkLabel||w?.label||'?'} — ${s.wkName||w?.name||''}</span>
      </div>
      <div style="text-align:right;font-size:12px;color:var(--t2)">${d}<br>${Math.floor(s.dur/60)}min</div>
    </div>`;
  }).join(''):`<div style="font-size:13px;color:var(--t2)">Sem histórico.</div>`;
}

// ── PHOTO UPLOAD ─────────────────────────────────────────────
function uploadPhoto(){
  const input=document.createElement('input');
  input.type='file'; input.accept='image/*';
  input.onchange=e=>{
    const file=e.target.files[0]; if(!file)return;
    const reader=new FileReader();
    reader.onload=ev=>{
      const img=new Image();
      img.onload=()=>{
        const canvas=document.createElement('canvas');
        canvas.width=200; canvas.height=200;
        const ctx=canvas.getContext('2d');
        const s=Math.min(img.width,img.height);
        ctx.drawImage(img,(img.width-s)/2,(img.height-s)/2,s,s,0,0,200,200);
        DB.set(`photo_${U.email}`,canvas.toDataURL('image/jpeg',0.85));
        renderProfile();
        // refresh home avatar if visible
        const av=document.getElementById('d-avatar');
        if(av)av.innerHTML=`<img src="${DB.get(`photo_${U.email}`,null)}" style="width:100%;height:100%;object-fit:cover">`;
      };
      img.src=ev.target.result;
    };
    reader.readAsDataURL(file);
  };
  input.click();
}
