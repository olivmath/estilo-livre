// ── AUTH ─────────────────────────────────────────────────────
function loginSession(admin) {
  currentAdmin = admin;
  DB.set('ca', admin);
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('app').classList.add('visible');
  document.getElementById('sb-admin-name').textContent = admin.name.split(' ')[0];
  document.getElementById('sb-admin-av').textContent   = admin.name[0].toUpperCase();

  const roleEl = document.querySelector('.sb-footer .arole');
  if (roleEl) {
    roleEl.textContent = admin.role === 'admin' ? 'Administrador' : 'Professor';
  }

  const navAdmins = document.getElementById('nav-admins');
  if (navAdmins) {
    if (admin.role === 'professor') {
      navAdmins.style.display = 'none';
    } else {
      navAdmins.style.display = 'flex';
    }
  }

  ensureMockData();
  renderDashboard();
}

function doLogin() {
  const email = document.getElementById('admin-email').value.trim().toLowerCase();
  const pw    = document.getElementById('admin-pw').value;
  let admins  = DB.get('admins', null);
  if (!admins) {
    admins = { [FALLBACK_EMAIL]: { name:'Administrador', email:FALLBACK_EMAIL, pw:FALLBACK_PW, role: 'admin' } };
    DB.set('admins', admins);
  }
  const admin = admins[email];
  if (admin && admin.pw === pw) {
    if (!admin.role) {
      admin.role = (admin.email === FALLBACK_EMAIL) ? 'admin' : 'professor';
      admins[email] = admin;
      DB.set('admins', admins);
    }
    loginSession(admin);
  } else {
    document.getElementById('login-err').style.display = 'block';
  }
}

function doLogout() {
  currentAdmin = null;
  DB.set('ca', null);
  location.href = '../index.html';
}

document.addEventListener('DOMContentLoaded', () => {
  const ca = DB.get('ca', null);
  if (ca && ca.email) {
    loginSession(ca);
  } else {
    location.href = '../index.html';
  }
});
