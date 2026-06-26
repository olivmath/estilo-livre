document.body.insertAdjacentHTML('beforeend', `
<!-- HOME -->
<div id="s-home" class="screen">
  <div class="tb" style="padding-top:48px">
    <div>
      <div style="font-size:10px;color:var(--acc);font-weight:700;letter-spacing:2px">ACADEMIA ESTILO LIVRE</div>
      <div style="font-size:18px;font-weight:700;margin-top:2px" id="d-name">—</div>
    </div>
    <div id="d-avatar" onclick="nav('profile',document.querySelector('[data-s=profile]'))" style="width:42px;height:42px;border-radius:10px;background:var(--blue);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;cursor:pointer;overflow:hidden;flex-shrink:0"></div>
  </div>
  <div id="d-banner"></div>
  <div class="card">
    <div class="ct">Ciclo atual</div>
    <div class="dots" id="d-dots"></div>
    <div class="pbar"><div class="pf" id="d-pbar" style="width:0%;background:var(--acc)"></div></div>
    <div style="font-size:12px;color:var(--t2);margin-top:8px;text-align:center" id="d-cycle-lbl">—</div>
  </div>
  <div id="d-trend"></div>
  <div class="sh"><span class="sh-t">Histórico</span></div>
  <div id="d-recent"></div>
  <div id="d-sugs"></div>
</div>
`);
