// ── EXERCÍCIOS ───────────────────────────────────────────────
function renderExercicios() {
  const exercises = DB.get('exercises', []);
  document.getElementById('ex-lib-count').textContent = `${exercises.length} exercício${exercises.length!==1?'s':''}`;
  const grouped = {};
  EX_GROUPS.forEach(g => grouped[g] = []);
  exercises.forEach(ex => { if(grouped[ex.group]) grouped[ex.group].push(ex); });
  document.getElementById('ex-lib-content').innerHTML = EX_GROUPS.map(group => {
    const exs = grouped[group];
    if (!exs.length) return '';
    return `<div class="card" style="margin-bottom:16px">
      <div class="card-title">${group}</div>
      <table class="tbl">
        <thead><tr><th>Máq.</th><th>Exercício</th><th>Séries</th><th>Reps</th><th></th></tr></thead>
        <tbody>${exs.map(ex=>`<tr>
          <td>${ex.mac?`<span class="mac-tag">${ex.mac}</span>`:'-'}</td>
          <td style="font-weight:500">${ex.name}</td>
          <td>${ex.defaultSets}×</td>
          <td>${ex.defaultReps}</td>
          <td><div style="display:flex;gap:6px">
            <button class="btn-sm sec" onclick="openExModal('${ex.id}')">Editar</button>
            <button class="btn-sm danger" onclick="deleteExercise('${ex.id}')">Excluir</button>
          </div></td>
        </tr>`).join('')}</tbody>
      </table>
    </div>`;
  }).join('');
}

function openExModal(id) {
  editingExId = id || null;
  document.getElementById('ex-modal-title').textContent = id ? 'Editar Exercício' : 'Novo Exercício';
  document.getElementById('ex-modal-err').style.display = 'none';
  if (id) {
    const ex = DB.get('exercises',[]).find(e=>e.id===id);
    if (ex) {
      document.getElementById('ex-name-input').value  = ex.name;
      document.getElementById('ex-mac-input').value   = ex.mac;
      document.getElementById('ex-group-input').value = ex.group;
      document.getElementById('ex-sets-input').value  = ex.defaultSets;
      document.getElementById('ex-reps-input').value  = ex.defaultReps;
    }
  } else {
    document.getElementById('ex-name-input').value  = '';
    document.getElementById('ex-mac-input').value   = '';
    document.getElementById('ex-group-input').value = 'Peitoral';
    document.getElementById('ex-sets-input').value  = '4';
    document.getElementById('ex-reps-input').value  = '12';
  }
  document.getElementById('ex-manage-modal').classList.add('active');
}

function closeExModal() { document.getElementById('ex-manage-modal').classList.remove('active'); }

function saveExercise() {
  const name = document.getElementById('ex-name-input').value.trim();
  if (!name) { const e=document.getElementById('ex-modal-err'); e.textContent='Nome obrigatório.'; e.style.display='block'; return; }
  const mac         = document.getElementById('ex-mac-input').value.trim();
  const group       = document.getElementById('ex-group-input').value;
  const defaultSets = parseInt(document.getElementById('ex-sets-input').value)||4;
  const defaultReps = parseInt(document.getElementById('ex-reps-input').value)||12;
  const exercises   = DB.get('exercises',[]);
  if (editingExId) {
    const i = exercises.findIndex(e=>e.id===editingExId);
    if (i>=0) exercises[i] = { id:editingExId, mac, name, group, defaultSets, defaultReps };
  } else {
    exercises.push({ id:uid(), mac, name, group, defaultSets, defaultReps });
  }
  DB.set('exercises', exercises);
  closeExModal();
  renderExercicios();
}

function deleteExercise(id) {
  if (!confirm('Excluir exercício da biblioteca?')) return;
  DB.set('exercises', DB.get('exercises',[]).filter(e=>e.id!==id));
  renderExercicios();
}
