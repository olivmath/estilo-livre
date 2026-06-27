document.body.insertAdjacentHTML('beforeend', `
<!-- APP -->
<div id="app">
  <nav class="sidebar">
    <div class="sb-logo"><div class="brand">FitTrack</div><div class="sub">Painel Admin</div></div>
    <div class="sb-nav">
      <div class="sni active" id="nav-dashboard" onclick="navTo('dashboard',this)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        Dashboard
      </div>
      <div class="sni" id="nav-alunos" onclick="navTo('alunos',this)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        Alunos
      </div>
      <div class="sni" id="nav-exercicios" onclick="navTo('exercicios',this)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6.5 6.5h11M6.5 17.5h11M3 9l1.5 1.5L6 9M3 15l1.5 1.5L6 15M18 9l1.5 1.5L21 9M18 15l1.5 1.5L21 15"/></svg>
        Exercícios
      </div>
      <div class="sni" id="nav-treinos" onclick="navTo('treinos',this)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6.5 6.5h11M6.5 17.5h11M3 9l1.5 1.5L6 9M3 15l1.5 1.5L6 15M18 9l1.5 1.5L21 9M18 15l1.5 1.5L21 15"/></svg>
        Treinos
      </div>
      <div class="sni" id="nav-admins" onclick="navTo('admins',this)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
        Admins
      </div>
      <div class="sni" id="nav-ranking" onclick="navTo('ranking',this)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
        Ranking
      </div>
    </div>
    <div class="sb-footer">
      <div class="admin-tag">
        <div class="admin-av" id="sb-admin-av">A</div>
        <div class="admin-info">
          <div class="aname" id="sb-admin-name">Administrador</div>
          <div class="arole">Professor</div>
        </div>
      </div>
      <button class="btn-logout" onclick="doLogout()">Sair da conta</button>
    </div>
  </nav>

  <main class="main">

    <!-- DASHBOARD -->
    <div class="section active" id="s-dashboard">
      <div class="page-hdr"><h1>Dashboard</h1><p id="dash-date"></p></div>
      <div class="kpi-grid" id="kpi-grid"></div>
      <div class="g2">
        <div class="card"><div class="card-title">Atividade Recente</div><div id="activity-feed"></div></div>
        <div style="display:flex;flex-direction:column;gap:20px">
          <div class="card"><div class="card-title">Treinos nos últimos 7 dias</div><div id="week-chart"></div></div>
          <div class="card"><div class="card-title" style="color:var(--red)">&#9888; Alunos sem treinar</div><div id="inactive-list"></div></div>
        </div>
      </div>
    </div>

    <!-- ALUNOS -->
    <div class="section" id="s-alunos">
      <div class="page-hdr"><h1>Alunos</h1><p id="alunos-sub"></p></div>
      <div class="toolbar">
        <input type="text" id="search-input" placeholder="Buscar por nome ou email…" oninput="renderAlunos()">
        <div class="fbtns">
          <button class="fbtn active" onclick="setFilter('all',this)">Todos</button>
          <button class="fbtn" onclick="setFilter('active',this)">Ativos</button>
          <button class="fbtn" onclick="setFilter('warning',this)">Atenção</button>
          <button class="fbtn" onclick="setFilter('inactive',this)">Inativos</button>
          <button class="fbtn" onclick="setFilter('blocked',this)">Bloqueados</button>
        </div>
        <button class="btn-sm prim" onclick="openAlunoModal()">+ Novo Aluno</button>
      </div>
      <div class="card" style="padding:0;overflow:hidden">
        <table class="tbl">
          <thead><tr>
            <th>Aluno</th><th>Último treino</th><th>Freq/sem</th><th>RPE médio</th><th>Ciclos</th><th>Status</th><th>Acesso</th><th></th>
          </tr></thead>
          <tbody id="alunos-tbody"></tbody>
        </table>
      </div>
    </div>

    <!-- DETALHE ALUNO -->
    <div class="section" id="s-detail">
      <button class="btn-back" onclick="navTo('alunos',document.getElementById('nav-alunos'))">← Voltar para Alunos</button>
      <div id="detail-content"></div>
    </div>

    <!-- EXERCÍCIOS -->
    <div class="section" id="s-exercicios">
      <div class="page-hdr"><h1>Exercícios</h1><p>Biblioteca de exercícios da academia</p></div>
      <div class="section-hdr">
        <span id="ex-lib-count" style="color:var(--t2);font-size:14px"></span>
        <button class="btn-sm prim" onclick="openExModal(null)">+ Novo Exercício</button>
      </div>
      <div id="ex-lib-content"></div>
    </div>

    <!-- TREINOS -->
    <div class="section" id="s-treinos">
      <div class="page-hdr"><h1>Treinos</h1><p>Templates disponíveis para os alunos</p></div>
      <div class="section-hdr">
        <span id="tmpl-count" style="color:var(--t2);font-size:14px"></span>
        <div style="display:flex; gap:8px">
          <button class="btn-sm sec" onclick="resetDefaultTemplates()">Restaurar Modelos Padrão</button>
          <button class="btn-sm prim" onclick="openWkModal(null)">+ Novo Treino</button>
        </div>
      </div>
      <div class="tmpl-grid" id="tmpl-grid"></div>
    </div>

    <!-- ADMINS -->
    <div class="section" id="s-admins">
      <div class="page-hdr"><h1>Administradores</h1><p>Contas com acesso ao painel</p></div>
      <div class="section-hdr">
        <span id="admin-count" style="color:var(--t2);font-size:14px"></span>
        <button class="btn-sm prim" onclick="openAdminModal()">+ Novo Admin</button>
      </div>
      <div id="admins-list"></div>
    </div>

    <!-- RANKING -->
    <div class="section" id="s-ranking">
      <div class="page-hdr"><h1>Ranking</h1><p>Últimos 30 dias</p></div>
      <div class="tab-btns">
        <button class="tab-btn active" onclick="setRankTab('freq',this)">Frequência</button>
        <button class="tab-btn" onclick="setRankTab('volume',this)">Volume</button>
        <button class="tab-btn" onclick="setRankTab('melhoria',this)">Melhoria</button>
      </div>
      <div id="ranking-content"></div>
    </div>

  </main>
</div>
`);
