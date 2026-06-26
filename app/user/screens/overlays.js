document.body.insertAdjacentHTML('beforeend', `
<!-- REST -->
<div class="rest-ov" id="rest-ov">
  <div style="font-size:13px;color:var(--t2);letter-spacing:2px;margin-bottom:8px">DESCANSO</div>
  <div class="rn" id="rest-n">30</div>
  <div style="font-size:16px;color:var(--t2);margin-top:4px">segundos</div>
  <button class="btn bs" style="margin-top:32px;width:160px" onclick="skipRest()">Pular</button>
</div>

<!-- DIFFICULTY -->
<div class="diff-ov" id="diff-ov">
  <div style="font-size:15px;font-weight:700;text-align:center;margin-bottom:4px" id="diff-ex-nm">Como foi o exercício?</div>
  <div style="font-size:13px;color:var(--t2);text-align:center;margin-bottom:24px">Intensidade percebida (RPE 0–10)</div>
  <div class="diff-num" id="diff-num">5</div>
  <div style="width:100%;padding:0 4px;margin:20px 0 8px">
    <input type="range" id="diff-range" min="0" max="10" value="5" oninput="diffMove(this.value)">
  </div>
  <div style="display:flex;justify-content:space-between;width:100%;font-size:12px;color:var(--t3);padding:0 4px;margin-bottom:28px">
    <span>0 · sem esforço</span><span>10 · máximo</span>
  </div>
  <button class="btn bp" style="width:100%" onclick="confirmDiff()">Confirmar</button>
</div>

<!-- REPORT -->
<div class="rep-ov" id="rep-ov">
  <div id="rep-content" style="flex:1;width:100%;padding-bottom:40px"></div>
</div>
`);
