// ── ALUNOS ───────────────────────────────────────────────────
function renderAlunos() {
  const users=allUsers();const q=(document.getElementById('search-input')?.value||'').toLowerCase();
  let stats=users.map(u=>({...userStats(u.email),name:u.name}));
  if(q) stats=stats.filter(s=>s.name.toLowerCase().includes(q)||s.email.includes(q));
  if(currentFilter==='active')   stats=stats.filter(s=>s.status==='active');
  if(currentFilter==='warning')  stats=stats.filter(s=>s.status==='warning');
  if(currentFilter==='inactive') stats=stats.filter(s=>s.status==='inactive');
  if(currentFilter==='blocked')  stats=stats.filter(s=>s.blocked);
  stats.sort((a,b)=>(a.daysLast||999)-(b.daysLast||999));
  document.getElementById('alunos-sub').textContent=`${stats.length} aluno${stats.length!==1?'s':''} encontrado${stats.length!==1?'s':''}`;
  document.getElementById('alunos-tbody').innerHTML=stats.length?stats.map(s=>`
    <tr>
      <td onclick="openDetail('${s.email}')" style="cursor:pointer">
        <div class="name-cell">
          <div class="av lg" style="background:${avColor(s.email)}">${initials(s.name)}</div>
          <div class="nc-info"><div class="nc-name">${s.name}</div><div class="nc-sub">${s.email}</div></div>
        </div>
      </td>
      <td>${s.last?fmtDate(s.last.date)+' <span style="color:var(--t2);font-size:12px">('+timeAgo(s.last.date)+')</span>':'<span style="color:var(--t3)">—</span>'}</td>
      <td>${s.wkSess}×</td>
      <td style="color:${rpeColor(parseFloat(s.avgRPE))};font-weight:600">${s.avgRPE}</td>
      <td>${s.cycles}</td>
      <td>${badgeHtml(s.status)}</td>
      <td><button class="btn-sm ${s.blocked?'prim':'danger'}" onclick="toggleAccess('${s.email}')">${s.blocked?'Ativar':'Bloquear'}</button></td>
      <td style="color:var(--t3);cursor:pointer" onclick="openDetail('${s.email}')">→</td>
    </tr>`).join(''):'<tr><td colspan="8"><div class="empty">Nenhum aluno encontrado.</div></td></tr>';
}

function toggleAccess(email) {
  const users=DB.get('users',{});if(!users[email])return;
  users[email].active=users[email].active===false?true:false;
  DB.set('users',users);renderAlunos();
}

// ── DETALHE ──────────────────────────────────────────────────
function openDetail(email) {
  activeStudentEmail = email;
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.sni').forEach(b=>b.classList.remove('active'));
  document.getElementById('s-detail').classList.add('active');
  document.getElementById('nav-alunos').classList.add('active');
  const user=DB.get('users',{})[email];const s=userStats(email);if(!user)return;
  const progMap={};
  [...s.sessions].sort((a,b)=>a.date-b.date).forEach(sess=>{
    sess.exs.forEach(ex=>{
      if(!progMap[ex.name])progMap[ex.name]={first:ex.wt,last:ex.wt,name:ex.name};
      else progMap[ex.name].last=ex.wt;
    });
  });
  const progItems=Object.values(progMap).filter(p=>p.last>p.first);
  const maxGain=Math.max(...progItems.map(p=>p.last-p.first),1);
  const last15=[...s.sessions].slice(0,15).reverse();
  const rpeSeq=last15.map(sess=>sess.exs.reduce((a,e)=>a+e.diff,0)/sess.exs.length);
  const isDash = activeDetailTab === 'dash';
  const isFicha = activeDetailTab === 'ficha';
  document.getElementById('detail-content').innerHTML=`
    <div class="det-hdr">
      <div class="av xl" style="background:${avColor(email)}">${initials(user.name)}</div>
      <div>
        <div class="det-name">${user.name}</div>
        <div class="det-email">${email}</div>
        <div style="margin-top:8px;display:flex;gap:8px;align-items:center">
          ${badgeHtml(s.status)}
          <button class="btn-sm ${s.blocked?'prim':'danger'}" onclick="toggleAccess('${email}');openDetail('${email}')">${s.blocked?'Ativar acesso':'Bloquear acesso'}</button>
        </div>
      </div>
    </div>

    <!-- TABS NAVEGAÇÃO DO ALUNO -->
    <div class="tab-btns" style="margin-bottom:24px">
      <button class="tab-btn ${isDash ? 'active' : ''}" id="det-tab-dash" onclick="switchDetailTab('dash')">Painel e Métricas</button>
      <button class="tab-btn ${isFicha ? 'active' : ''}" id="det-tab-ficha" onclick="switchDetailTab('ficha')">Ficha de Treinos</button>
    </div>

    <!-- CONTEÚDO TAB: PAINEL/MÉTRICAS -->
    <div id="det-sec-dash" style="display: ${isDash ? 'block' : 'none'}">
      <div class="g4" style="margin-bottom:24px">
        <div class="mstat"><div class="val">${s.sessions.length}</div><div class="lbl">Sessões totais</div></div>
        <div class="mstat"><div class="val">${s.moSess}</div><div class="lbl">Treinos este mês</div></div>
        <div class="mstat"><div class="val" style="color:${rpeColor(parseFloat(s.avgRPE))}">${s.avgRPE}</div><div class="lbl">RPE médio</div></div>
        <div class="mstat"><div class="val">${fmtVol(s.totalVol)}</div><div class="lbl">Volume total</div></div>
      </div>
      <div class="g2b">
        <div class="card">
          <div class="card-title">Últimas sessões</div>
          <table class="htbl"><thead><tr><th>Data</th><th>Treino</th><th>Duração</th><th>Volume</th><th>RPE</th></tr></thead>
          <tbody>${s.sessions.slice(0,10).map(sess=>{
            const vol=sess.exs.reduce((a,e)=>a+(e.wt||0)*e.sets*e.reps,0);
            const ar=(sess.exs.reduce((a,e)=>a+e.diff,0)/sess.exs.length).toFixed(1);
            return`<tr><td>${fmtDateFull(sess.date)}</td><td><span class="wk-badge" style="background:${sess.wkColor}">${sess.wkLabel}</span></td><td>${fmtDur(sess.dur)}</td><td>${fmtVol(vol)}</td><td style="color:${rpeColor(parseFloat(ar))};font-weight:600">${ar}</td></tr>`;
          }).join('')}</tbody></table>
        </div>
        <div style="display:flex;flex-direction:column;gap:20px">
          <div class="card"><div class="card-title">Tendência RPE</div>${svgRPE(rpeSeq)}</div>
          <div class="card"><div class="card-title">Progressão de carga</div>
            ${progItems.length?progItems.map(p=>{
              const gain=p.last-p.first;const pct=Math.min(100,(gain/maxGain)*100);
              return`<div class="prog-row"><div class="prog-label" title="${p.name}">${p.name}</div><div class="prog-bar-wrap"><div class="prog-fill" style="width:${pct}%"></div></div><div class="prog-val">+${gain}kg</div></div>`;
            }).join(''):'<div style="font-size:13px;color:var(--t2)">Dados insuficientes.</div>'}
          </div>
        </div>
      </div>
    </div>

    <!-- CONTEÚDO TAB: FICHA DE TREINOS -->
    <div id="det-sec-ficha" style="display: ${isFicha ? 'block' : 'none'}">
      <div class="card" style="margin-bottom:24px">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px">
          <div class="card-title" style="margin-bottom:0">Planilha de Treinos (Ficha do Aluno)</div>
          <button class="btn-sm prim" onclick="openAssignWkModal('${email}')">+ Atribuir Treino</button>
        </div>
        <div id="student-wks-container">
          ${renderStudentWorkoutsPlan(email)}
        </div>
      </div>
    </div>`;
}

function switchDetailTab(tab) {
  activeDetailTab = tab;
  if (activeStudentEmail) {
    openDetail(activeStudentEmail);
  }
}

function svgRPE(points) {
  if(!points.length) return'<div class="empty" style="padding:20px">Sem dados</div>';
  const W=280,H=90,P=12;
  const toX=i=>P+(points.length>1?i*(W-P*2)/(points.length-1):(W-P*2)/2);
  const toY=v=>H-P-(v/10)*(H-P*2);
  const path=points.map((v,i)=>`${i===0?'M':'L'}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(' ');
  const fill=path+` L${toX(points.length-1).toFixed(1)},${H-P} L${toX(0).toFixed(1)},${H-P} Z`;
  const trend=points.length>1?points[points.length-1]-points[0]:0;
  const col=trend<=-0.5?'var(--green)':trend>=0.5?'var(--red)':'var(--yellow)';
  const lbl=trend<=-0.5?'↓ Ficando mais fácil':trend>=0.5?'↑ Ficando mais difícil':'→ Estável';
  return`<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:90px;display:block">
    <path d="${fill}" fill="${col}" opacity=".12"/>
    <path d="${path}" fill="none" stroke="${col}" stroke-width="2" stroke-linejoin="round"/>
    ${points.map((v,i)=>`<circle cx="${toX(i).toFixed(1)}" cy="${toY(v).toFixed(1)}" r="3" fill="${col}"/>`).join('')}
  </svg><div style="font-size:12px;color:var(--t2);margin-top:6px">Tendência: <span style="color:${col};font-weight:700">${lbl}</span></div>`;
}

// ── STUDENT WORKOUT PLAN ─────────────────────────────────────
let assignStudentEmail = null;

function renderStudentWorkoutsPlan(email) {
  const studentWks = DB.get(`wk_${email}`, []);
  if (!studentWks.length) {
    return `<div class="empty" style="padding:20px 0">Nenhum treino atribuído a este aluno. Clique em "+ Atribuir Treino" para começar!</div>`;
  }
  return studentWks.map(wk => `
    <div style="border:1px solid var(--bg3); border-radius:12px; padding:16px; margin-bottom:16px; background:rgba(255,255,255,0.01)">
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--bg3); padding-bottom:12px; margin-bottom:12px">
        <div style="display:flex; align-items:center; gap:10px">
          <div class="tmpl-badge" style="background:${wk.color || 'var(--acc)'}; margin:0">${wk.label}</div>
          <div style="font-weight:700; font-size:16px">${wk.name}</div>
        </div>
        <div style="display:flex; gap:8px">
          <button class="btn-sm sec" onclick="openWkModal('${wk.id}', '${email}')">Editar Ficha</button>
          <button class="btn-sm danger" onclick="removeStudentWk('${email}', '${wk.id}')">Remover</button>
        </div>
      </div>
      <table class="tbl" style="margin:0">
        <thead>
          <tr>
            <th style="width:60px">Ordem</th>
            <th style="width:60px">Máq.</th>
            <th>Exercício</th>
            <th style="width:80px">Séries</th>
            <th style="width:80px">Reps</th>
            <th style="width:80px">Carga</th>
            <th>Observação</th>
          </tr>
        </thead>
        <tbody>
          ${wk.exercises.map(ex => `
            <tr>
              <td><span class="ex-chip" style="margin:0">${ex.num}</span></td>
              <td>${ex.mac ? `<span class="mac-tag">${ex.mac}</span>` : '-'}</td>
              <td style="font-weight:500">${ex.name}</td>
              <td>${ex.sets}×</td>
              <td>${ex.reps}</td>
              <td><strong style="color:var(--acc)">${ex.wt || 0} kg</strong></td>
              <td><span style="color:var(--t2); font-size:12px">${ex.obs || '—'}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `).join('');
}

function removeStudentWk(email, wkId) {
  if (confirm('Deseja remover este treino da ficha do aluno?')) {
    const wks = DB.get(`wk_${email}`, []);
    DB.set(`wk_${email}`, wks.filter(w => w.id !== wkId));
    openDetail(email);
  }
}

function openAssignWkModal(email) {
  assignStudentEmail = email;
  const templates = DB.get('wk_templates', []);
  const listEl = document.getElementById('assign-templates-list');

  listEl.innerHTML = templates.length ? templates.map(t => `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border: 1px solid var(--bg3); border-radius: 8px; background: rgba(255,255,255,0.01)">
      <div style="display: flex; align-items: center; gap: 10px">
        <div class="tmpl-badge" style="background: ${t.color}">${t.label}</div>
        <div>
          <div style="font-weight: 600; color: var(--t)">${t.name}</div>
          <div style="font-size: 12px; color: var(--t2); margin-top: 2px">${t.exercises.length} exercícios</div>
        </div>
      </div>
      <button class="btn-sm prim" onclick="assignTemplateToStudent('${t.id}')">Atribuir</button>
    </div>
  `).join('') : '<div class="empty">Nenhum modelo de treino cadastrado.</div>';

  document.getElementById('assign-wk-modal').classList.add('active');
}

function closeAssignWkModal() {
  document.getElementById('assign-wk-modal').classList.remove('active');
}

function assignTemplateToStudent(templateId) {
  const templates = DB.get('wk_templates', []);
  const tmpl = templates.find(t => t.id === templateId);
  if (!tmpl) return;

  const studentWks = DB.get(`wk_${assignStudentEmail}`, []);

  // Clone exercises with new ids
  const clonedExercises = tmpl.exercises.map(ex => ({
    id: uid(),
    exId: ex.exId || ex.id,
    num: ex.num,
    mac: ex.mac || '',
    name: ex.name,
    sets: ex.sets,
    reps: ex.reps,
    wt: ex.wt || 0,
    obs: ex.obs || ''
  }));

  studentWks.push({
    id: uid(),
    label: tmpl.label,
    name: tmpl.name,
    color: tmpl.color,
    exercises: clonedExercises
  });

  DB.set(`wk_${assignStudentEmail}`, studentWks);
  closeAssignWkModal();
  openDetail(assignStudentEmail);
  alert('Treino atribuído com sucesso!');
}

function createCustomWkForStudent() {
  closeAssignWkModal();
  openWkModal(null, assignStudentEmail);
}
