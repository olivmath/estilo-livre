// ── AUTH ──────────────────────────────────────────────────────
function toggleAuth(){
  authMode=authMode==='login'?'register':'login';
  const r=authMode==='register';
  document.getElementById('reg-fields').style.display=r?'block':'none';
  document.getElementById('auth-lbl').textContent=r?'Criar conta':'Entrar';
  document.getElementById('toggle-lbl').textContent=r?'Já tem conta? ':'Não tem conta? ';
  document.getElementById('toggle-link').textContent=r?'Entrar':'Criar conta';
}

function authSubmit(){
  const email=document.getElementById('auth-email').value.trim();
  const pw=document.getElementById('auth-pw').value;
  if(!email||!pw)return alert('Preencha todos os campos.');
  const users=DB.get('users',{});
  if(authMode==='register'){
    if(users[email])return alert('Email já cadastrado.');
    const name=document.getElementById('reg-name').value.trim()||'Atleta';
    users[email]={name,email,pw}; DB.set('users',users); doLogin({name,email});
  }else{
    const u=users[email];
    if(!u||u.pw!==pw)return alert('Email ou senha incorretos.');
    doLogin(u);
  }
}

function doLogin(u){
  U=u; DB.set('cu',u);
  syncFromTemplates();
  document.getElementById('nav').classList.remove('hidden');
  nav('home',document.querySelector('[data-s="home"]'));
}

function logout(){
  U=null; DB.set('cu',null);
  location.href='../index.html';
}

function clearAll(){localStorage.clear();location.reload();}
