// ── AUTH ─────────────────────────────────────────────────────
function doLogin() {
  const email = document.getElementById('admin-email').value.trim().toLowerCase();
  const pw    = document.getElementById('admin-pw').value;
  let admins  = DB.get('admins', null);
  if (!admins) {
    admins = { [FALLBACK_EMAIL]: { name:'Administrador', email:FALLBACK_EMAIL, pw:FALLBACK_PW } };
    DB.set('admins', admins);
  }
  const admin = admins[email];
  if (admin && admin.pw === pw) {
    currentAdmin = admin;
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('app').classList.add('visible');
    document.getElementById('sb-admin-name').textContent = admin.name.split(' ')[0];
    document.getElementById('sb-admin-av').textContent   = admin.name[0].toUpperCase();
    ensureMockData();
    renderDashboard();
  } else {
    document.getElementById('login-err').style.display = 'block';
  }
}

function doLogout() {
  currentAdmin = null;
  document.getElementById('app').classList.remove('visible');
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('admin-email').value = '';
  document.getElementById('admin-pw').value    = '';
  document.getElementById('login-err').style.display = 'none';
}

['admin-email','admin-pw'].forEach(id => {
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById(id)?.addEventListener('keydown', e => { if(e.key==='Enter') doLogin(); });
  });
});
