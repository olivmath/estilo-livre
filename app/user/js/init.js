// ── INIT ──────────────────────────────────────────────────────
(function(){
  const u=DB.get('cu',null);
  if(u?.email){U=u;doLogin(u);}
  else document.getElementById('s-login').classList.add('active');
})();
