// ── NAV ──────────────────────────────────────────────────────
function navTo(sec, btn) {
  if (sec === 'admins' && currentAdmin?.role === 'professor') {
    navTo('dashboard', document.getElementById('nav-dashboard'));
    return;
  }
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.sni').forEach(b=>b.classList.remove('active'));
  document.getElementById('s-'+sec).classList.add('active');
  if (btn) btn.classList.add('active');
  if (sec==='dashboard')  renderDashboard();
  if (sec==='alunos')     renderAlunos();
  if (sec==='exercicios') renderExercicios();
  if (sec==='treinos')    renderTreinos();
  if (sec==='admins')     renderAdmins();
  if (sec==='ranking')    renderRanking();
}

function setFilter(f,btn) {
  currentFilter=f;
  document.querySelectorAll('.fbtn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active'); renderAlunos();
}

function setRankTab(tab,btn) {
  currentRankTab=tab;
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active'); renderRanking();
}
