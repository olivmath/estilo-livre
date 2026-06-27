// ── TREINOS ──────────────────────────────────────────────────
function renderTreinos() {
  const templates=DB.get('wk_templates',[]);
  document.getElementById('tmpl-count').textContent=`${templates.length} treino${templates.length!==1?'s':''}`;
  document.getElementById('tmpl-grid').innerHTML=templates.length?templates.map(t=>`
    <div class="tmpl-card" style="border-left-color:${t.color}">
      <div class="tmpl-card-hdr">
        <div class="tmpl-badge" style="background:${t.color}">${t.label}</div>
        <div class="tmpl-actions">
          <button class="btn-sm sec" onclick="openWkModal('${t.id}')">Editar</button>
          <button class="btn-sm danger" onclick="deleteWkTemplate('${t.id}')">Excluir</button>
        </div>
      </div>
      <div class="tmpl-name">${t.name}</div>
      <div class="tmpl-sub">${t.exercises.length} exercício${t.exercises.length!==1?'s':''}</div>
      <div class="tmpl-exs">${t.exercises.slice(0,6).map(e=>`<span class="ex-chip">${e.num} ${e.name}</span>`).join('')}${t.exercises.length>6?`<span class="ex-chip">+${t.exercises.length-6}</span>`:''}</div>
    </div>`).join(''):'<div class="empty" style="grid-column:1/-1">Nenhum treino criado. Clique em "+ Novo Treino" para começar.</div>';
}

function openWkModal(id, studentEmail = null) {
  activeStudentEmail = studentEmail;
  editingWkId = id || null;
  wkSelections = {};
  wkModalColor = PAL[0];

  if (studentEmail) {
    document.getElementById('wk-modal-title').textContent = id ? 'Editar Treino do Aluno' : 'Atribuir Treino Customizado';
    document.getElementById('save-as-template-container').style.display = 'flex';
    document.getElementById('save-as-template-chk').checked = false;
  } else {
    document.getElementById('wk-modal-title').textContent = id ? 'Editar Modelo de Treino' : 'Novo Modelo de Treino';
    document.getElementById('save-as-template-container').style.display = 'none';
  }

  let label = '', name = '';
  if (id) {
    const list = studentEmail ? DB.get(`wk_${studentEmail}`, []) : DB.get('wk_templates', []);
    const t = list.find(w => w.id === id);
    if (t) {
      label = t.label; name = t.name; wkModalColor = t.color;
      t.exercises.forEach(ex => {
        wkSelections[ex.exId] = { exId: ex.exId, name: ex.name, mac: ex.mac, sets: ex.sets, reps: ex.reps, wt: ex.wt || 0, obs: ex.obs || '' };
      });
    }
  }

  document.getElementById('wk-label').value = label;
  document.getElementById('wk-name').value = name;
  renderColorPalModal();

  const exercises = DB.get('exercises', []);
  if (!exercises.length) {
    document.getElementById('ex-lib').innerHTML = '<div class="empty">Nenhum exercício cadastrado. Vá em "Exercícios" para adicionar.</div>';
    document.getElementById('wk-modal').classList.add('active');
    return;
  }

  const grouped = {};
  EX_GROUPS.forEach(g => grouped[g] = []);
  exercises.forEach(ex => { if (grouped[ex.group]) grouped[ex.group].push(ex); });

  document.getElementById('ex-lib').innerHTML = EX_GROUPS.map(group => {
    const exs = grouped[group];
    if (!exs.length) return '';
    return `<div class="ex-group">
      <div class="ex-group-hdr">${group}</div>
      ${exs.map(ex => {
        const key = ex.id; const sel = wkSelections[key];
        return `<div class="ex-row${sel ? ' selected' : ''}" id="row-${key}">
          <label class="ex-chk-label">
            <input type="checkbox" class="ex-chk" ${sel ? 'checked' : ''} onchange="toggleExLib('${key}',this.checked)">
            <span>${ex.mac ? `<span class="mac-tag">${ex.mac}</span> ` : ''}${ex.name}</span>
          </label>
          <div class="ex-controls" id="ctrl-${key}" style="display:${sel ? 'flex' : 'none'}">
            <label class="ex-ctrl-lbl">Séries<input type="number" style="width:50px" value="${sel?.sets ?? ex.defaultSets}" min="1" max="10" onchange="updateSel('${key}','sets',this.value)"></label>
            <label class="ex-ctrl-lbl">Reps<input type="number" style="width:50px" value="${sel?.reps ?? ex.defaultReps}" min="1" max="50" onchange="updateSel('${key}','reps',this.value)"></label>
            <label class="ex-ctrl-lbl">Carga (kg)<input type="number" style="width:60px" value="${sel?.wt ?? 0}" step="2.5" min="0" onchange="updateSel('${key}','wt',this.value)"></label>
            <label class="ex-ctrl-lbl">OBS<input type="text" style="width:100px" value="${sel?.obs ?? ''}" placeholder="Ex: Cadência" onchange="updateSel('${key}','obs',this.value)"></label>
          </div>
        </div>`;
      }).join('')}
    </div>`;
  }).join('');
  document.getElementById('wk-modal').classList.add('active');
}

function closeWkModal() { document.getElementById('wk-modal').classList.remove('active'); }

function renderColorPalModal() {
  document.getElementById('wk-color-pal').innerHTML=PAL.map(c=>
    `<div class="color-dot${c===wkModalColor?' sel':''}" style="background:${c}" onclick="pickWkColor('${c}')"></div>`
  ).join('');
}

function pickWkColor(c) { wkModalColor=c; renderColorPalModal(); }

function toggleExLib(key, checked) {
  const exercises = DB.get('exercises', []);
  const ex = exercises.find(e => e.id === key);
  if (!ex) return;
  if (checked) {
    wkSelections[key] = { exId: ex.id, name: ex.name, mac: ex.mac, sets: ex.defaultSets, reps: ex.defaultReps, wt: 0, obs: '' };
    document.getElementById(`ctrl-${key}`).style.display = 'flex';
    document.getElementById(`row-${key}`).classList.add('selected');
  } else {
    delete wkSelections[key];
    document.getElementById(`ctrl-${key}`).style.display = 'none';
    document.getElementById(`row-${key}`).classList.remove('selected');
  }
}

function updateSel(key, field, val) {
  if (wkSelections[key]) {
    if (field === 'obs') {
      wkSelections[key][field] = val.trim();
    } else {
      wkSelections[key][field] = parseFloat(val) || 0;
    }
  }
}

function saveWkTemplate() {
  const label=document.getElementById('wk-label').value.trim().toUpperCase();
  const name=document.getElementById('wk-name').value.trim();
  if(!label||!name) return alert('Preencha Label e Nome.');
  const keys=Object.keys(wkSelections);
  if(!keys.length) return alert('Selecione ao menos um exercício.');

  const exercises=keys.map((key,idx)=>{
    const s=wkSelections[key];
    return {
      id:uid(),
      exId:key,
      num:label+(idx+1),
      mac:s.mac,
      name:s.name,
      sets:s.sets,
      reps:s.reps,
      wt:s.wt||0,
      obs:s.obs||''
    };
  });

  if (activeStudentEmail) {
    const studentWks = DB.get(`wk_${activeStudentEmail}`, []);
    if (editingWkId) {
      const i = studentWks.findIndex(w => w.id === editingWkId);
      if (i >= 0) studentWks[i] = { id: editingWkId, label, name, color: wkModalColor, exercises };
    } else {
      studentWks.push({ id: uid(), label, name, color: wkModalColor, exercises });
    }
    DB.set(`wk_${activeStudentEmail}`, studentWks);

    // Check if we should also save this custom workout as a reusable template
    if (document.getElementById('save-as-template-chk').checked) {
      const templates = DB.get('wk_templates', []);
      templates.push({
        id: uid(),
        label,
        name,
        color: wkModalColor,
        exercises: exercises.map(ex => ({...ex, id: uid()})) // clone with new ids for template
      });
      DB.set('wk_templates', templates);
    }

    closeWkModal();
    openDetail(activeStudentEmail);
  } else {
    const templates=DB.get('wk_templates',[]);
    if(editingWkId){
      const i=templates.findIndex(t=>t.id===editingWkId);
      if(i>=0) templates[i]={id:editingWkId,label,name,color:wkModalColor,exercises};
    }else{
      templates.push({id:uid(),label,name,color:wkModalColor,exercises});
    }
    DB.set('wk_templates',templates);
    closeWkModal();
    renderTreinos();
  }
}

function deleteWkTemplate(id) {
  if(!confirm('Excluir este treino?')) return;
  DB.set('wk_templates',DB.get('wk_templates',[]).filter(t=>t.id!==id));renderTreinos();
}

function resetDefaultTemplates() {
  if (confirm('Deseja restaurar todos os modelos padrão (A, B, C, D, E, F - Iniciante/Intermediário/Avançado)? Isso não apagará os treinos customizados que você já criou.')) {
    localStorage.removeItem('wk_templates');
    ensureMockData();
    renderTreinos();
    alert('Modelos restaurados!');
  }
}
