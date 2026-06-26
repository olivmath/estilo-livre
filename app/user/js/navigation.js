// ── NAV ───────────────────────────────────────────────────────
function nav(sid,btn){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.nb').forEach(b=>b.classList.remove('active'));
  document.getElementById('s-'+sid).classList.add('active');
  if(btn)btn.classList.add('active');
  if(sid==='home')renderHome();
  if(sid==='workouts')renderWorkouts();
  if(sid==='profile')renderProfile();
}
