// ── ADMINS ───────────────────────────────────────────────────
function renderAdmins() {
  const admins=DB.get('admins',{});const list=Object.values(admins);
  document.getElementById('admin-count').textContent=`${list.length} administrador${list.length!==1?'es':''}`;
  document.getElementById('admins-list').innerHTML=list.map(a=>`
    <div class="admin-card">
      <div class="admin-av" style="width:44px;height:44px;font-size:18px;flex-shrink:0">${a.name[0].toUpperCase()}</div>
      <div class="admin-card-info">
        <div class="admin-card-name">${a.name}${a.email===currentAdmin?.email?'<span class="you-tag">Você</span>':''}</div>
        <div class="admin-card-email">${a.email}</div>
      </div>
      ${a.email!==currentAdmin?.email?`<button class="btn-sm danger" onclick="deleteAdmin('${a.email}')">Remover</button>`:''}
    </div>`).join('');
}

function openAdminModal() {
  ['new-admin-name','new-admin-email','new-admin-pw'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('admin-modal-err').style.display='none';
  document.getElementById('admin-modal').classList.add('active');
}

function closeAdminModal() { document.getElementById('admin-modal').classList.remove('active'); }

function saveAdmin() {
  const name=document.getElementById('new-admin-name').value.trim();
  const email=document.getElementById('new-admin-email').value.trim().toLowerCase();
  const pw=document.getElementById('new-admin-pw').value;
  const errEl=document.getElementById('admin-modal-err');
  if(!name||!email||!pw){errEl.textContent='Preencha todos os campos.';errEl.style.display='block';return;}
  if(pw.length<6){errEl.textContent='Senha deve ter ao menos 6 caracteres.';errEl.style.display='block';return;}
  const admins=DB.get('admins',{});
  if(admins[email]){errEl.textContent='Este email já está cadastrado.';errEl.style.display='block';return;}
  admins[email]={name,email,pw};DB.set('admins',admins);closeAdminModal();renderAdmins();
}

function deleteAdmin(email) {
  if(!confirm(`Remover ${email} como administrador?`)) return;
  const admins=DB.get('admins',{});delete admins[email];DB.set('admins',admins);renderAdmins();
}
