document.body.insertAdjacentHTML('beforeend', `
<!-- NAV -->
<nav class="nav hidden" id="nav">
  <button class="nb active" data-s="home" onclick="nav('home',this)">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>Home
  </button>
  <button class="nb" data-s="workouts" onclick="nav('workouts',this)">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>Treinos
  </button>
  <button class="nb" data-s="profile" onclick="nav('profile',this)">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>Perfil
  </button>
</nav>
`);
