document.body.insertAdjacentHTML('beforeend', `
<!-- LOGIN -->
<div id="s-login" class="screen">
  <div style="width:80px;height:80px;border-radius:50%;background:var(--blue);overflow:hidden;margin-bottom:16px;box-shadow:0 0 32px #1B348744"><img src="../../docs/logo.jpeg" alt="Estilo Livre" style="width:100%;height:100%;object-fit:cover"></div>
  <div style="font-size:11px;color:var(--acc);font-weight:700;letter-spacing:3px;margin-bottom:4px">ACADEMIA</div>
  <div style="font-size:26px;font-weight:800;color:var(--t);margin-bottom:4px">Estilo Livre</div>
  <div style="font-size:13px;color:var(--t2);margin-bottom:36px">Seu treino, sua progressão.</div>
  <div style="width:100%">
    <div id="reg-fields" style="display:none">
      <div class="ig"><label class="lbl">Nome</label><input id="reg-name" type="text" placeholder="Seu nome"></div>
    </div>
    <div class="ig"><label class="lbl">Email</label><input id="auth-email" type="email" placeholder="email@exemplo.com"></div>
    <div class="ig"><label class="lbl">Senha</label><input id="auth-pw" type="password" placeholder="••••••••"></div>
    <button class="btn bp" onclick="authSubmit()"><span id="auth-lbl">Entrar</span></button>
    <div style="text-align:center;margin-top:18px;font-size:14px;color:var(--t2)">
      <span id="toggle-lbl">Não tem conta? </span>
      <span style="color:var(--acc);font-weight:600;cursor:pointer" onclick="toggleAuth()"><span id="toggle-link">Criar conta</span></span>
    </div>
  </div>
</div>
`);
