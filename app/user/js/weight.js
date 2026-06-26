// ── EXERCISE WEIGHT AND HISTORY TRACKING ─────────────────────
let weightEditExId = null;
let weightEditIsActive = false;

function getExerciseHistory(exName) {
  const sessions = getSess();
  const history = [];
  sessions.forEach(sess => {
    const exEntry = sess.exs?.find(e => e.name.toLowerCase() === exName.toLowerCase());
    if (exEntry) {
      history.push({
        date: sess.date,
        wt: exEntry.wt || 0,
        diff: exEntry.diff,
        sets: exEntry.sets,
        reps: exEntry.reps,
        wkLabel: sess.wkLabel
      });
    }
  });
  return history.sort((a, b) => a.date - b.date);
}

function renderExerciseChart(history) {
  if (history.length < 2) return '';
  const data = history.slice(-8);
  const W = 350, H = 100, PAD_X = 25, PAD_Y = 20;
  const weights = data.map(d => d.wt);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const range = maxW - minW;

  const points = data.map((d, i) => {
    const x = PAD_X + (data.length === 1 ? (W - 2 * PAD_X) / 2 : (i / (data.length - 1)) * (W - 2 * PAD_X));
    const y = range === 0 ? H / 2 : H - PAD_Y - ((d.wt - minW) / range) * (H - 2 * PAD_Y);
    return { x, y, wt: d.wt, date: new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) };
  });

  const polyline = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area = `${points[0].x.toFixed(1)},${H} ` + points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ` ${points[points.length-1].x.toFixed(1)},${H}`;

  return `
    <div style="position:relative; margin-bottom:15px; background:var(--bg3); padding:10px 10px 22px; border-radius:8px">
      <svg width="100%" height="${H}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="display:block">
        <defs>
          <linearGradient id="wtGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--acc)" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="var(--acc)" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <polygon points="${area}" fill="url(#wtGrad)"/>
        <polyline points="${polyline}" fill="none" stroke="var(--acc)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        ${points.map(p => `
          <g>
            <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4" fill="var(--acc)"/>
            <text x="${p.x.toFixed(1)}" y="${(p.y - 8).toFixed(1)}" font-size="9" fill="var(--t)" font-weight="700" text-anchor="middle">${p.wt}k</text>
            <text x="${p.x.toFixed(1)}" y="${H - 4}" font-size="8" fill="var(--t3)" text-anchor="middle">${p.date}</text>
          </g>
        `).join('')}
      </svg>
    </div>
  `;
}

function openSetWeight(exId, isFromActive = false) {
  weightEditExId = exId;
  weightEditIsActive = isFromActive;

  let ex = null;
  if (isFromActive) {
    ex = A.exs.find(e => e.id === exId);
  } else {
    const wk = getWks().find(w => w.id === editWkId);
    ex = wk?.exercises?.find(e => e.id === exId);
  }
  if (!ex) return;

  document.getElementById('sh-wt-exname').textContent = ex.name;

  let info = '';
  if (ex.num) info += `<span class="nbadge" style="background:var(--acc); color:#06091a; margin-right:6px">${ex.num}</span>`;
  if (ex.mac) info += `<span class="mb" style="margin-right:6px">Máq. ${ex.mac}</span>`;
  if (ex.obs) info += `<span class="mb">${ex.obs}</span>`;
  document.getElementById('sh-wt-info').innerHTML = info || 'Ajuste a carga para este exercício.';

  const currentWt = isFromActive ? A.weight : (ex.wt || 0);
  document.getElementById('sh-wt-val').value = currentWt;

  // Load and render history
  const history = getExerciseHistory(ex.name);
  const histSection = document.getElementById('sh-wt-history-section');
  const chartContainer = document.getElementById('sh-wt-chart-container');
  const listContainer = document.getElementById('sh-wt-history-list');

  if (history.length > 0) {
    histSection.style.display = 'block';
    // Render chart (needs at least 2 points)
    chartContainer.innerHTML = renderExerciseChart(history);
    // Render list (newest first)
    const reversedHist = [...history].reverse();
    listContainer.innerHTML = reversedHist.map(h => {
      const dc = diffColor(h.diff);
      return `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 12px; background:var(--bg3); border-radius:8px; font-size:13px">
          <div>
            <div style="font-weight:600; color:var(--t)">${h.wt} kg</div>
            <div style="font-size:11px; color:var(--t2); margin-top:2px">${new Date(h.date).toLocaleDateString('pt-BR', {day:'2-digit', month:'short'})} · ${h.sets}×${h.reps}</div>
          </div>
          <div style="display:flex; align-items:center; gap:6px">
            <span style="font-size:11px; color:var(--t2)">RPE</span>
            <span style="background:${dc}22; color:${dc}; font-weight:700; padding:2px 6px; border-radius:4px; font-size:12px">${h.diff}/10</span>
          </div>
        </div>
      `;
    }).join('');
  } else {
    histSection.style.display = 'none';
    chartContainer.innerHTML = '';
    listContainer.innerHTML = '';
  }

  openSheet('sh-wt');
}

function adjModalW(d) {
  const el = document.getElementById('sh-wt-val');
  let v = parseFloat(el.value) || 0;
  v = Math.max(0, parseFloat((v + d).toFixed(1)));
  el.value = v;
}

function saveWeight() {
  const val = parseFloat(document.getElementById('sh-wt-val').value) || 0;
  if (weightEditIsActive) {
    A.weight = val;
    document.getElementById('a-weight').textContent = val;
    // Save to the user's workout template for future workouts too
    const wks = getWks();
    const wk = wks.find(w => w.id === A.wkId);
    if (wk) {
      const ex = wk.exercises?.find(e => e.id === weightEditExId);
      if (ex) ex.wt = val;
      setWks(wks);
    }
  } else {
    const wks = getWks();
    const wk = wks.find(w => w.id === editWkId);
    if (wk) {
      const ex = wk.exercises?.find(e => e.id === weightEditExId);
      if (ex) ex.wt = val;
      setWks(wks);
    }
    renderExercises();
  }
  closeSheet('sh-wt');
}

function openActiveExHistory() {
  const ex = A.exs[A.exIdx];
  if (ex) {
    openSetWeight(ex.id, true);
  }
}
