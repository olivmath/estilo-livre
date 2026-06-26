document.body.insertAdjacentHTML('beforeend', `
<!-- WORKOUTS -->
<div id="s-workouts" class="screen">
  <div class="tb"><h1>Treinos</h1></div>
  <div class="card" style="padding:12px 16px">
    <div class="ct" style="margin-bottom:8px">Ciclo</div>
    <div class="dots" id="w-dots" style="justify-content:flex-start;gap:6px"></div>
  </div>
  <div id="wk-list"></div>
</div>

<!-- DETAIL -->
<div id="s-detail" class="screen">
  <div class="tb">
    <button class="back" onclick="nav('workouts')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><path d="M19 12H5M12 19l-7-7 7-7"/></svg> Treinos
    </button>
    <div></div>
  </div>
  <div id="det-hdr" style="padding:0 16px 16px;border-left:4px solid var(--acc);margin-left:16px;padding-left:12px">
    <h2 id="det-name" style="font-size:20px;font-weight:700"></h2>
    <p id="det-meta" style="font-size:13px;color:var(--t2);margin-top:3px"></p>
  </div>
  <div id="ex-list"></div>
</div>
`);
