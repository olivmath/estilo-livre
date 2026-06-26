// ── HELPERS ──────────────────────────────────────────────────
function allUsers()    { return Object.values(DB.get('users',{})); }
function avColor(em)   { return AV_COLORS[em.charCodeAt(0)%AV_COLORS.length]; }
function initials(n)   { return n.split(' ').slice(0,2).map(x=>x[0]).join('').toUpperCase(); }
function fmtDate(ts)   { return new Date(ts).toLocaleDateString('pt-BR',{day:'2-digit',month:'short'}); }
function fmtDateFull(ts){return new Date(ts).toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'short'}); }
function fmtDur(s)     { return Math.floor(s/60)+'min'; }
function fmtVol(kg)    { return kg>=1000?(kg/1000).toFixed(1)+'t':kg.toFixed(0)+'kg'; }
function timeAgo(ts)   { const d=Math.floor((Date.now()-ts)/DAY); if(d===0)return'Hoje';if(d===1)return'Ontem';return d+'d atrás'; }
function rpeColor(v)   { if(v<=4)return'var(--green)';if(v<=6)return'var(--yellow)';return'var(--red)'; }
function badgeHtml(status) {
  if(status==='blocked') return'<span class="badge bg-gray">Bloqueado</span>';
  if(status==='active')  return'<span class="badge bg-green">Ativo</span>';
  if(status==='warning') return'<span class="badge bg-yellow">Atenção</span>';
  return'<span class="badge bg-red">Inativo</span>';
}

function userStats(email) {
  const u        = DB.get('users',{})[email]||{};
  const sessions = DB.get(`sess_${email}`,[]).sort((a,b)=>b.date-a.date);
  const wks      = DB.get(`wk_${email}`,[]);
  const now      = Date.now();
  const last     = sessions[0]||null;
  const daysLast = last?Math.floor((now-last.date)/DAY):999;
  const wkSess   = sessions.filter(s=>s.date>(now-7*DAY)).length;
  const moSess   = sessions.filter(s=>s.date>(now-30*DAY)).length;
  const allRPE   = sessions.flatMap(s=>s.exs.map(e=>e.diff));
  const avgRPE   = allRPE.length?(allRPE.reduce((a,b)=>a+b,0)/allRPE.length).toFixed(1):'—';
  const totalVol = sessions.reduce((a,s)=>a+s.exs.reduce((b,e)=>b+(e.wt||0)*e.sets*e.reps,0),0);
  let done=[],cycles=0;const ids=wks.map(w=>w.id);
  for(const s of [...sessions].sort((a,b)=>a.date-b.date)){
    if(!ids.includes(s.wkId))continue;done.push(s.wkId);
    if(ids.every(id=>done.includes(id))){cycles++;done=[];}
  }
  const blocked = u.active===false;
  const status  = blocked?'blocked':daysLast>14?'inactive':daysLast>7?'warning':'active';
  return{email,sessions,wks,last,daysLast,wkSess,moSess,avgRPE,totalVol,cycles,status,blocked};
}
