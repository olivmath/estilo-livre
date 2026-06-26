document.body.insertAdjacentHTML('beforeend', `
<!-- PROFILE -->
<div id="s-profile" class="screen">
  <div class="tb"><h1>Perfil</h1><button class="btn bs bsm" onclick="logout()">Sair</button></div>
  <div class="card" style="display:flex;align-items:center;gap:16px">
    <div style="position:relative;flex-shrink:0" onclick="uploadPhoto()">
      <div id="p-avatar" style="width:64px;height:64px;border-radius:50%;background:var(--blue);display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:700;overflow:hidden;cursor:pointer">?</div>
      <div style="position:absolute;bottom:0;right:0;width:22px;height:22px;border-radius:50%;background:var(--acc);display:flex;align-items:center;justify-content:center;font-size:12px;cursor:pointer">📷</div>
    </div>
    <div>
      <div style="font-size:18px;font-weight:700" id="p-name">—</div>
      <div style="font-size:13px;color:var(--t2)" id="p-email">—</div>
      <div style="font-size:11px;color:var(--t3);margin-top:3px">Toque na foto para alterar</div>
    </div>
  </div>
  <div class="stats">
    <div class="stat"><div class="sv" id="p-total">0</div><div class="sl">Treinos</div></div>
    <div class="stat"><div class="sv" id="p-cycles">0</div><div class="sl">Ciclos</div></div>
  </div>
  <div class="card"><div class="ct">Histórico</div><div id="p-hist"></div></div>
  <div style="padding:16px"><button class="btn bs" style="color:var(--red)" onclick="if(confirm('Apagar tudo?'))clearAll()">Apagar dados</button></div>
</div>
`);
