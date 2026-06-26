document.body.insertAdjacentHTML('beforeend', `
<!-- ACTIVE -->
<div id="s-active" class="screen">
  <div class="atb">
    <div>
      <div style="font-size:13px;color:var(--t2)" id="a-wk-lbl">Treino</div>
      <div style="font-size:15px;font-weight:700" id="a-ex-ctr">Exercício 1 de 1</div>
    </div>
    <button class="ibtn red" onclick="confirmStop()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M18 6L6 18M6 6l12 12"/></svg>
    </button>
  </div>
  <div class="timer"><div class="tv" id="a-timer">00:00</div><div class="tl">tempo de treino</div></div>
  <div class="exc">
    <div id="a-badges" style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px"></div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <div style="font-size:17px;font-weight:700" id="a-ex-name">—</div>
      <button class="btn bs bsm" style="padding:4px 8px;font-size:11px;width:auto;border-radius:6px;margin:0" onclick="openActiveExHistory()">📊 Histórico</button>
    </div>
    <div class="w-row">
      <div class="w-box">
        <div class="w-val" id="a-weight" style="color:var(--acc)">0</div>
        <div class="w-lbl">kg · peso</div>
        <div class="w-adj">
          <button onclick="adjW(-2.5)">−</button>
          <button onclick="adjW(2.5)">+</button>
        </div>
      </div>
      <div class="w-box" style="background:var(--bg2)">
        <div class="w-val" id="a-reps" style="color:var(--t)">12</div>
        <div class="w-lbl">repetições</div>
      </div>
    </div>
    <div style="font-size:13px;color:var(--t2);text-align:center;margin-bottom:8px" id="a-set-lbl">Série 1 de 4</div>
    <div class="sdots" id="a-sdots"></div>
  </div>
  <div style="padding:16px 16px"><button class="btn bp pulse" onclick="nextSet()">Série concluída →</button></div>
  <div style="padding:0 16px" id="a-next-prev"></div>
</div>
`);
