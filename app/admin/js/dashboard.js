// ── DASHBOARD ────────────────────────────────────────────────
function renderDashboard() {
  const now=Date.now();const users=allUsers();
  const stats=users.map(u=>({...userStats(u.email),name:u.name}));
  document.getElementById('dash-date').textContent=new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});
  const allSess=stats.flatMap(s=>s.sessions.map(sess=>({...sess,uName:s.name,uEmail:s.email})));
  const today=allSess.filter(s=>(now-s.date)<DAY).length;
  const week=allSess.filter(s=>(now-s.date)<7*DAY).length;
  const inactive=stats.filter(s=>s.status==='inactive').length;
  const warning=stats.filter(s=>s.status==='warning').length;
  document.getElementById('kpi-grid').innerHTML=`
    <div class="kpi-card"><div class="kpi-label">Total de alunos</div><div class="kpi-value c-acc">${users.length}</div><div class="kpi-sub">${stats.filter(s=>s.status==='active').length} ativos esta semana</div></div>
    <div class="kpi-card"><div class="kpi-label">Treinos hoje</div><div class="kpi-value c-green">${today}</div><div class="kpi-sub">sessões registradas</div></div>
    <div class="kpi-card"><div class="kpi-label">Treinos na semana</div><div class="kpi-value c-yellow">${week}</div><div class="kpi-sub">últimos 7 dias</div></div>
    <div class="kpi-card"><div class="kpi-label">Inativos (&gt;14 dias)</div><div class="kpi-value c-red">${inactive}</div><div class="kpi-sub">${warning} em atenção (7–14d)</div></div>`;
  const recent=allSess.sort((a,b)=>b.date-a.date).slice(0,12);
  document.getElementById('activity-feed').innerHTML=recent.length?recent.map(s=>`
    <div class="act-item">
      <div class="av" style="background:${avColor(s.uEmail)}">${initials(s.uName)}</div>
      <div class="act-info"><div class="act-name">${s.uName}</div><div class="act-sub">Treino ${s.wkLabel} — ${s.wkName} · ${fmtDur(s.dur)}</div></div>
      <div class="act-time">${timeAgo(s.date)}</div>
    </div>`).join(''):'<div class="empty">Nenhuma sessão.</div>';
  const days=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  const counts=Array(7).fill(0);
  allSess.forEach(s=>{const d=Math.floor((now-s.date)/DAY);if(d<7)counts[6-d]++;});
  const maxC=Math.max(...counts,1);
  const labels=Array.from({length:7},(_,i)=>{const d=new Date(now-(6-i)*DAY);return days[d.getDay()];});
  document.getElementById('week-chart').innerHTML=`<div class="wbars">${counts.map((c,i)=>`
    <div class="wb-wrap"><div class="wb-cnt">${c||''}</div><div class="wb-col"><div class="wb${i===6?' today':''}" style="height:${Math.max(6,(c/maxC)*50)}px"></div></div><div class="wb-day">${labels[i]}</div></div>`).join('')}</div>`;
  const alertUsers=stats.filter(s=>s.daysLast>7&&!s.blocked).sort((a,b)=>b.daysLast-a.daysLast);
  document.getElementById('inactive-list').innerHTML=alertUsers.length?alertUsers.map(s=>`
    <div class="alert-item" onclick="openDetail('${s.email}')">
      <div style="display:flex;align-items:center;gap:10px">
        <div class="av" style="background:${avColor(s.email)};width:30px;height:30px;font-size:11px">${initials(s.name)}</div>
        <div style="font-size:14px;font-weight:600">${s.name}</div>
      </div>
      <span class="alert-days ${s.daysLast>14?'red':'yel'}">${s.daysLast===999?'Nunca':s.daysLast+'d'}</span>
    </div>`).join(''):'<div style="font-size:13px;color:var(--green);padding:8px 0">Todos ativos ✓</div>';
}
