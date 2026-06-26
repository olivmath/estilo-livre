document.body.insertAdjacentHTML('beforeend', `
<!-- LOGIN -->
<div id="login-screen">
  <div class="login-box">
    <div class="login-logo">
      <div class="brand">FitTrack Admin</div>
      <div class="sub">Academia Estilo Livre</div>
    </div>
    <div class="fg"><label>Email</label><input type="email" id="admin-email" placeholder="admin@estilo.com"></div>
    <div class="fg"><label>Senha</label><input type="password" id="admin-pw" placeholder="••••••••"></div>
    <button class="btn-primary" onclick="doLogin()">Entrar</button>
    <div class="err-msg" id="login-err">Email ou senha incorretos.</div>
  </div>
</div>
`);
