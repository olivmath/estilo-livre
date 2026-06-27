// ── INIT ──────────────────────────────────────────────────────
(function(){
  const u=DB.get('cu',null);
  if(u?.email){U=u;doLogin(u);}
  else location.href='../index.html';
})();
