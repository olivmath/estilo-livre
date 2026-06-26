// ── RANKING ──────────────────────────────────────────────────
function renderRanking() {
  const users=allUsers();const now=Date.now();const moAgo=now-30*DAY;
  let ranked;
  if(currentRankTab==='freq'){
    ranked=users.map(u=>{const n=DB.get(`sess_${u.email}`,[]).filter(s=>s.date>moAgo).length;return{name:u.name,email:u.email,val:n,display:`${n}`,sub:'treinos no mês'};}).sort((a,b)=>b.val-a.val);
  }else if(currentRankTab==='volume'){
    ranked=users.map(u=>{const vol=DB.get(`sess_${u.email}`,[]).filter(s=>s.date>moAgo).reduce((a,s)=>a+s.exs.reduce((b,e)=>b+(e.wt||0)*e.sets*e.reps,0),0);return{name:u.name,email:u.email,val:vol,display:fmtVol(vol),sub:'volume no mês'};}).sort((a,b)=>b.val-a.val);
  }else{
    ranked=users.map(u=>{
      const sess=DB.get(`sess_${u.email}`,[]).filter(s=>s.date>moAgo).sort((a,b)=>a.date-b.date);
      if(sess.length<4)return{name:u.name,email:u.email,val:0,display:'—',sub:'dados insuficientes'};
      const first=sess.slice(0,2).flatMap(s=>s.exs.map(e=>e.diff));
      const last=sess.slice(-2).flatMap(s=>s.exs.map(e=>e.diff));
      const drop=(first.reduce((a,b)=>a+b,0)/first.length)-(last.reduce((a,b)=>a+b,0)/last.length);
      return{name:u.name,email:u.email,val:drop,display:drop>0?'-'+drop.toFixed(1)+' RPE':'—',sub:'melhoria RPE'};
    }).sort((a,b)=>b.val-a.val);
  }
  const top3=ranked.slice(0,3);const rest=ranked.slice(3);
  const medals=['🥇','🥈','🥉'];const barH=[110,70,50];const barC=['var(--acc)','var(--t3)','#795548'];
  const podOrd=[top3[1],top3[0],top3[2]].filter(Boolean);const podIdx=podOrd.length===3?[1,0,2]:[1,0];
  document.getElementById('ranking-content').innerHTML=`
    <div class="card" style="margin-bottom:24px">
      <div class="podium">${podOrd.map((item,vi)=>{const ri=podIdx[vi];return`
        <div class="pod-item">
          <div style="font-size:28px">${medals[ri]}</div>
          <div class="av lg" style="background:${avColor(item.email)};width:52px;height:52px;font-size:20px">${initials(item.name)}</div>
          <div class="pod-name">${item.name.split(' ')[0]}</div>
          <div class="pod-val">${item.display}</div>
          <div class="pod-bar" style="background:${barC[ri]};height:${barH[ri]}px;margin-top:8px"></div>
        </div>`;}).join('')}
      </div>
    </div>
    ${rest.length?`<div class="card">${rest.map((item,i)=>`
      <div class="rank-item">
        <div class="rank-pos">${i+4}</div>
        <div class="av" style="background:${avColor(item.email)}">${initials(item.name)}</div>
        <div class="rank-info"><div class="rank-name">${item.name}</div><div class="rank-sub">${item.sub}</div></div>
        <div class="rank-val">${item.display}</div>
      </div>`).join('')}</div>`:''}`;
}
