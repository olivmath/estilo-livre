document.body.insertAdjacentHTML('beforeend', `
<!-- WORKOUT MODAL -->
<div class="modal-ov" id="wk-modal">
  <div class="modal-box">
    <div class="modal-hdr">
      <h2 id="wk-modal-title">Novo Treino</h2>
      <button class="modal-close" onclick="closeWkModal()">✕</button>
    </div>
    <div class="modal-body">
      <div class="modal-top">
        <div class="fg"><label>Label</label><input type="text" id="wk-label" placeholder="A" maxlength="3" style="text-transform:uppercase"></div>
        <div class="fg"><label>Nome</label><input type="text" id="wk-name" placeholder="Ex: Peitoral / Tríceps"></div>
      </div>
      <div class="fg" style="margin-bottom:24px">
        <label>Cor</label>
        <div class="color-pal" id="wk-color-pal"></div>
      </div>
      <div class="fg">
        <label>Selecione os exercícios:</label>
        <div id="ex-lib" style="margin-top:10px"></div>
      </div>
    </div>
    <div class="modal-footer">
      <div id="save-as-template-container" style="display:none; align-items:center; gap:8px; margin-right:auto">
        <label style="display:flex; align-items:center; gap:8px; font-size:13px; color:var(--t2); cursor:pointer">
          <input type="checkbox" id="save-as-template-chk" style="width:16px; height:16px; margin:0">
          Salvar como modelo reutilizável
        </label>
      </div>
      <button class="btn-sm sec" onclick="closeWkModal()">Cancelar</button>
      <button class="btn-sm prim" onclick="saveWkTemplate()">Salvar Treino</button>
    </div>
  </div>
</div>

<!-- EXERCISE MANAGE MODAL -->
<div class="modal-ov" id="ex-manage-modal">
  <div class="modal-box" style="max-width:480px">
    <div class="modal-hdr">
      <h2 id="ex-modal-title">Novo Exercício</h2>
      <button class="modal-close" onclick="closeExModal()">✕</button>
    </div>
    <div class="modal-body">
      <div class="fg"><label>Nome</label><input type="text" id="ex-name-input" placeholder="Ex: Supino Reto"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div class="fg"><label>Máquina N°</label><input type="text" id="ex-mac-input" placeholder="12"></div>
        <div class="fg"><label>Grupo Muscular</label>
          <select id="ex-group-input">
            <option>Peitoral</option><option>Ombro</option><option>Tríceps</option>
            <option>Dorsal</option><option>Bíceps</option><option>Antebraço</option>
            <option>Coxa</option><option>Glúteo</option><option>Panturrilha</option>
          </select>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div class="fg"><label>Séries padrão</label><input type="number" id="ex-sets-input" value="4" min="1" max="10"></div>
        <div class="fg"><label>Reps padrão</label><input type="number" id="ex-reps-input" value="12" min="1" max="50"></div>
      </div>
      <div class="err-msg" id="ex-modal-err"></div>
    </div>
    <div class="modal-footer">
      <button class="btn-sm sec" onclick="closeExModal()">Cancelar</button>
      <button class="btn-sm prim" onclick="saveExercise()">Salvar</button>
    </div>
  </div>
</div>

<!-- ADMIN MODAL -->
<div class="modal-ov" id="admin-modal">
  <div class="modal-box" style="max-width:440px">
    <div class="modal-hdr">
      <h2>Novo Administrador</h2>
      <button class="modal-close" onclick="closeAdminModal()">✕</button>
    </div>
    <div class="modal-body">
      <div class="fg"><label>Nome completo</label><input type="text" id="new-admin-name" placeholder="Nome do professor"></div>
      <div class="fg"><label>Email</label><input type="email" id="new-admin-email" placeholder="professor@estilo.com"></div>
      <div class="fg"><label>Senha</label><input type="password" id="new-admin-pw" placeholder="Mínimo 6 caracteres"></div>
      <div class="err-msg" id="admin-modal-err" style="display:none"></div>
    </div>
    <div class="modal-footer">
      <button class="btn-sm sec" onclick="closeAdminModal()">Cancelar</button>
      <button class="btn-sm prim" onclick="saveAdmin()">Criar Admin</button>
    </div>
  </div>
</div>

<!-- ASSIGN WORKOUT MODAL -->
<div class="modal-ov" id="assign-wk-modal">
  <div class="modal-box" style="max-width: 600px">
    <div class="modal-hdr">
      <h2>Atribuir Treino ao Aluno</h2>
      <button class="modal-close" onclick="closeAssignWkModal()">✕</button>
    </div>
    <div class="modal-body">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px">
        <span style="font-size: 14px; color: var(--t2)">Selecione um modelo pronto abaixo ou crie um novo customizado:</span>
        <button class="btn-sm prim" onclick="createCustomWkForStudent()">+ Criar Customizado</button>
      </div>
      <div id="assign-templates-list" style="display: flex; flex-direction: column; gap: 10px; max-height: 50vh; overflow-y: auto; padding-right: 4px">
        <!-- Templates will be rendered here -->
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn-sm sec" onclick="closeAssignWkModal()">Fechar</button>
    </div>
  </div>
</div>
`);
