document.body.insertAdjacentHTML('beforeend', `
<!-- SHEET WORKOUT -->
<div class="so" id="ov-wk" onclick="closeSheet('sh-wk')"></div>
<div class="sheet" id="sh-wk">
  <div class="sh-handle"></div>
  <div class="sh-title" id="sh-wk-title">Novo Treino</div>
  <div style="display:flex;gap:12px">
    <div class="ig" style="flex:0 0 72px"><label class="lbl">ID (A,B...)</label><input id="wk-id" maxlength="2" placeholder="A" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="ig" style="flex:1"><label class="lbl">Nome</label><input id="wk-nm" placeholder="Ex: Peito e Tríceps"></div>
  </div>
  <div class="ig"><label class="lbl">Cor</label><div class="pal" id="color-pal"></div></div>
  <button class="btn bp" onclick="saveWk()">Salvar</button>
</div>

<!-- SHEET EXERCISE -->
<div class="so" id="ov-ex" onclick="closeSheet('sh-ex')"></div>
<div class="sheet" id="sh-ex">
  <div class="sh-handle"></div>
  <div class="sh-title" id="sh-ex-title">Novo Exercício</div>
  <div style="display:flex;gap:10px">
    <div class="ig" style="flex:0 0 82px"><label class="lbl">Máquina N°</label><input id="ex-mac" type="number" placeholder="14"></div>
    <div class="ig" style="flex:1"><label class="lbl">Nome</label><input id="ex-nm" placeholder="Supino máq. reto"></div>
  </div>
  <div style="display:flex;gap:10px">
    <div class="ig" style="flex:1"><label class="lbl">Séries</label><input id="ex-sets" type="number" placeholder="4" min="1"></div>
    <div class="ig" style="flex:1"><label class="lbl">Reps</label><input id="ex-reps" type="number" placeholder="12" min="1"></div>
    <div class="ig" style="flex:1"><label class="lbl">Peso kg</label><input id="ex-wt" type="number" placeholder="0" min="0" step="2.5"></div>
  </div>
  <div class="ig"><label class="lbl">OBS / Código</label><input id="ex-obs" placeholder="A2" maxlength="5" oninput="this.value=this.value.toUpperCase()"></div>
  <button class="btn bp" onclick="saveEx()">Salvar exercício</button>
</div>

<!-- Sheet: Set Weight -->
<div class="so" id="ov-wt" onclick="closeSheet('sh-wt')"></div>
<div class="sheet" id="sh-wt">
  <div class="sh-handle"></div>
  <div class="sh-title" id="sh-wt-exname">Definir Carga</div>
  <div style="font-size:13px;color:var(--t2);margin-bottom:20px" id="sh-wt-info"></div>
  <div class="ig">
    <label class="lbl">Peso (kg)</label>
    <div style="display:flex; align-items:center; gap:12px;">
      <button class="btn bs" style="width:50px; height:50px; font-size:24px; padding:0; display:flex; align-items:center; justify-content:center; border-radius:10px; margin:0;" onclick="adjModalW(-2.5)">−</button>
      <input type="number" id="sh-wt-val" step="2.5" min="0" placeholder="0" style="text-align:center; font-size:24px; font-weight:700; flex:1; height:50px; padding:0;">
      <button class="btn bs" style="width:50px; height:50px; font-size:24px; padding:0; display:flex; align-items:center; justify-content:center; border-radius:10px; margin:0;" onclick="adjModalW(2.5)">+</button>
    </div>
  </div>
  <button class="btn bp" style="margin-bottom: 12px" onclick="saveWeight()">Salvar</button>

  <div id="sh-wt-history-section" style="margin-top:24px; border-top:1px solid var(--bg3); padding-top:20px; display:none">
    <div class="ct" style="margin-bottom:12px">Acompanhamento de Carga</div>
    <div id="sh-wt-chart-container"></div>
    <div id="sh-wt-history-list" style="display:flex; flex-direction:column; gap:8px; max-height:220px; overflow-y:auto; padding-right:4px"></div>
  </div>
</div>
`);
