// ── TAB SWITCH ─────────────────────────────────────────────
function showTab(tab){
  const isLogin = tab === 'login';
  document.getElementById('tabLogin').classList.toggle('on', isLogin);
  document.getElementById('tabReg').classList.toggle('on', !isLogin);
  document.getElementById('formLogin').classList.toggle('hidden', !isLogin);
  document.getElementById('formReg').classList.toggle('hidden', isLogin);
  if(isLogin) toggleForgot(false);

  // Força o Google a renderizar novamente no contêiner correto quando mudar de aba
  renderizarBotoesGoogle();
}

// ── CONFIGURAÇÃO COMPLETA DO GOOGLE ────────────────────────
function renderizarBotoesGoogle() {
  if (typeof google !== 'undefined' && google.accounts) {
    // 1. Inicializa as credenciais (Apenas uma vez na página)
    google.accounts.id.initialize({
      client_id: "713059185567-mf4f30n7qrmgt474gjhon9ltc2s895rb.apps.googleusercontent.com",
      callback: handleCredentialResponse
    });

    // Opções de estilo para combinar com o design elegante da Sellerium
    const opcoesEstilo = {
      type: "standard",
      size: "large",
      theme: "outline",       // Pode ser "outline", "filled_blue" ou "filled_black"
      text: "sign_in_with",   // Texto "Entrar com o Google"
      shape: "rectangular",   // Formato combinando com seus inputs
      logo_alignment: "left",
      width: "210"            // Largura ideal para ficar lado a lado com o Facebook
    };

    // 2. Renderiza no botão da aba de Login se ele estiver visível na tela
    const elLogin = document.getElementById('google-btn-login');
    if (elLogin && elLogin.offsetWidth > 0) {
      google.accounts.id.renderButton(elLogin, opcoesEstilo);
    }

    // 3. Renderiza no botão da aba de Cadastro se ele estiver visível na tela
    const elReg = document.getElementById('google-btn-reg');
    if (elReg && elReg.offsetWidth > 0) {
      google.accounts.id.renderButton(elReg, opcoesEstilo);
    }
  }
}

// Inicializa tudo quando a página carrega pela primeira vez
window.addEventListener('load', () => {
  renderizarBotoesGoogle();
});

// Garante que se o usuário mudar de aba do navegador e voltar, os botões continuem ativos
window.addEventListener('focus', () => {
  renderizarBotoesGoogle();
});

// ── FORGOT PASSWORD ────────────────────────────────────────
function toggleForgot(show){
  document.getElementById('forgotPanel').classList.toggle('on', show);
  document.getElementById('loginMain').style.display = show ? 'none' : 'block';
}
function sendForgot(){
  const v = document.getElementById('forgotEmail').value.trim();
  if(!v || !v.includes('@')){ toast('Digite um e-mail válido','err'); return; }
  simulateLoad('btnLogin', () => {
    toast('Link enviado para ' + v + ' ✉️');
    toggleForgot(false);
  });
}

// ── TOGGLE PASSWORD ────────────────────────────────────────
function togglePwd(id, btn){
  const inp = document.getElementById(id);
  const show = inp.type === 'password';
  inp.type = show ? 'text' : 'password';
  btn.textContent = show ? '🙈' : '👁';
}

// ── FIELD VALIDATION ───────────────────────────────────────
function showFieldErr(inp, msgId){
  inp.classList.add('err');
  const el = document.getElementById(msgId);
  if(el){ el.style.display = 'block'; }
}
function clearFieldErr(inp){
  inp.classList.remove('err');
  const siblings = inp.parentElement.querySelectorAll('.field-err');
  siblings.forEach(s => s.style.display = 'none');
  if(inp.value.length > 0) inp.classList.add('ok'); else inp.classList.remove('ok');
}
function validateEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

// ── MASKS ──────────────────────────────────────────────────
function maskCPF(inp){
  let v = inp.value.replace(/\D/g,'').slice(0,11);
  if(v.length > 9) v = v.slice(0,3)+'.'+v.slice(3,6)+'.'+v.slice(6,9)+'-'+v.slice(9);
  else if(v.length > 6) v = v.slice(0,3)+'.'+v.slice(3,6)+'.'+v.slice(6);
  else if(v.length > 3) v = v.slice(0,3)+'.'+v.slice(3);
  inp.value = v;
}
function maskPhone(inp){
  let v = inp.value.replace(/\D/g,'').slice(0,11);
  if(v.length > 6) v = '('+v.slice(0,2)+') '+v.slice(2,7)+'-'+v.slice(7);
  else if(v.length > 2) v = '('+v.slice(0,2)+') '+v.slice(2);
  inp.value = v;
}

// ── PASSWORD STRENGTH ──────────────────────────────────────
function checkPwd(v){
  const wrap = document.getElementById('pwdStrength');
  wrap.style.display = v ? 'block' : 'none';
  const r1 = v.length >= 8;
  const r2 = /[A-Z]/.test(v);
  const r3 = /[0-9]/.test(v);
  const r4 = /[^A-Za-z0-9]/.test(v);
  document.getElementById('r1').classList.toggle('ok', r1);
  document.getElementById('r2').classList.toggle('ok', r2);
  document.getElementById('r3').classList.toggle('ok', r3);
  document.getElementById('r4').classList.toggle('ok', r4);
  const score = [r1,r2,r3,r4].filter(Boolean).length;
  const bars = ['pb1','pb2','pb3','pb4'];
  const cls = ['s1','s2','s3','s4'];
  const lbls = ['Muito fraca','Fraca','Moderada','Forte'];
  bars.forEach((id,i) => {
    const b = document.getElementById(id);
    b.className = 'pwd-bar ' + (i < score ? cls[score-1] : '');
  });
  const lbl = document.getElementById('pwdLbl');
  lbl.textContent = score ? lbls[score-1] : 'Muito fraca';
  lbl.className = 'pwd-label ' + (score ? cls[score-1] : 's1');
}

// ── SIMULATE LOADING ───────────────────────────────────────
function simulateLoad(btnId, cb, delay=1400){
  const btn = document.getElementById(btnId);
  btn.classList.add('loading');
  setTimeout(() => { btn.classList.remove('loading'); cb(); }, delay);
}

// ── LOGIN ──────────────────────────────────────────────────
function doLogin(){
  let valid = true;
  const email = document.getElementById('loginEmail');
  const pwd   = document.getElementById('loginPwd');
  if(!validateEmail(email.value.trim())){
    showFieldErr(email,'loginEmailErr'); valid = false;
  }
  if(!pwd.value){
    showFieldErr(pwd,'loginPwdErr'); valid = false;
  }
  if(!valid){ toast('Preencha os campos obrigatórios','err'); return; }

  simulateLoad('btnLogin', () => {
    toast('Login realizado! Redirecionando... 🎉');
    setTimeout(() => window.location.href = '../', 1200);
  });
}

// ── REGISTER ───────────────────────────────────────────────
function doRegister(){
  let valid = true;
  const name  = document.getElementById('regName');
  const email = document.getElementById('regEmail');
  const phone = document.getElementById('regPhone');
  const pwd   = document.getElementById('regPwd');
  
  const termsAge = document.getElementById('acceptAge');
  const termsDoc = document.getElementById('acceptTerms');

  if(!name.value.trim()){ showFieldErr(name,'regNameErr'); valid = false; }
  if(!validateEmail(email.value.trim())){ showFieldErr(email,'regEmailErr'); valid = false; }
  
  const phoneValue = phone.value.replace(/\D/g, '');
  if(phoneValue.length < 11){ 
      showFieldErr(phone, 'regPhoneErr'); 
      valid = false; 
  }
  
  if(pwd.value.length < 8){ showFieldErr(pwd,'regPwdErr'); valid = false; }
  
  if(termsAge && !termsAge.checked){ toast('Você precisa ter 18 anos ou mais','err'); valid = false; return; }
  if(termsDoc && !termsDoc.checked){ toast('Aceite os termos para continuar','err'); valid = false; return; }
  
  if(!valid) return;

  simulateLoad('btnReg', () => {
    toast('Conta criada com sucesso! Bem-vindo ao Sellerium 🚀');
    setTimeout(() => window.location.href = '../', 1400);
  });
}

// ─────────────────────────────────────────────
function onGoogleClick() {
  toast('Conectando com Google...');
}

// ── SOCIAL LOGIN ───────────────────────────────────────────
function socialLogin(prov){
  toast(`Conectando com ${prov}...`);
  
  if (prov === 'Facebook') {
     // Lógica do Facebook no futuro...
  }
}

// ── TOAST ──────────────────────────────────────────────────
function toast(msg, type='ok'){
  const t  = document.getElementById('toast1');
  const ic = document.getElementById('toastIco');
  const tx = document.getElementById('toastMsg');
  if(!t || !ic || !tx) return;
  tx.textContent = msg;
  ic.className = 'toast-ico ' + type;
  ic.textContent = type === 'ok' ? '✓' : '!';
  t.classList.add('on');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('on'), 3000);
}

// ── KEYBOARD SUBMIT ────────────────────────────────────────
document.addEventListener('keydown', e => {
  if(e.key !== 'Enter') return;
  const active = document.activeElement;
  if(document.getElementById('formLogin').classList.contains('hidden')) doRegister();
  else doLogin();
});
