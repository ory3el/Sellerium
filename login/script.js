// Variáveis globais de controle para garantir que cada botão seja desenhado APENAS UMA VEZ
let googleLoginRendered = false;
let googleRegRendered = false;

// ── TAB SWITCH ─────────────────────────────────────────────
function showTab(tab){
  const isLogin = tab === 'login';
  document.getElementById('tabLogin').classList.toggle('on', isLogin);
  document.getElementById('tabReg').classList.toggle('on', !isLogin);
  document.getElementById('formLogin').classList.toggle('hidden', !isLogin);
  document.getElementById('formReg').classList.toggle('hidden', isLogin);
  if(isLogin) toggleForgot(false);

  // Sempre que mudar de aba, tentamos renderizar o botão da nova aba caso ele ainda não exista
  verificarERenderizarBotoes();
}

// Função especial executada automaticamente pelo script do Google assim que ele termina de baixar
window.onGoogleLibraryLoad = function () {
  inicializarEConfigurarGoogle();
};

// ── CONFIGURAÇÃO CENTRALIZADA E SEGURA DO GOOGLE ────────────
function inicializarEConfigurarGoogle() {
  if (typeof google !== 'undefined' && google.accounts) {
    
    // Inicializa as credenciais uma única vez de forma limpa e centralizada
    google.accounts.id.initialize({
      client_id: "713059185567-mf4f30n7qrmgt474gjhon9ltc2s895rb.apps.googleusercontent.com",
      callback: handleCredentialResponse,
      auto_prompt: false,
      context: "signin"
    });

    // Dispara a checagem de renderização dos botões
    verificarERenderizarBotoes();
  }
}

function verificarERenderizarBotoes() {
  if (typeof google === 'undefined' || !google.accounts) return;

  // Configurações visuais padronizadas do botão oficial
  const opcoesEstilo = {
    type: "standard",
    size: "large",
    theme: "outline", 
    text: "signin", 
    shape: "rectangular",
    logo_alignment: "left",
    width: "210" // Encaixe perfeito ao lado do botão do Facebook
  };

  // 1. Renderiza o botão de Login (Apenas se o formulário de login estiver visível E o botão nunca tiver sido criado)
  const elLogin = document.getElementById('google-btn-login');
  const formLoginEscondido = document.getElementById('formLogin').classList.contains('hidden');
  
  if (elLogin && !formLoginEscondido && !googleLoginRendered) {
    google.accounts.id.renderButton(elLogin, opcoesEstilo);
    googleLoginRendered = true; // Trava o botão para nunca mais ser re-renderizado por cima
  }

  // 2. Renderiza o botão de Cadastro (Apenas se o formulário de cadastro estiver visível E o botão nunca tiver sido criado)
  const elReg = document.getElementById('google-btn-reg');
  const formRegEscondido = document.getElementById('formReg').classList.contains('hidden');
  
  if (elReg && !formRegEscondido && !googleRegRendered) {
    google.accounts.id.renderButton(elReg, opcoesEstilo);
    googleRegRendered = true; // Trava o botão para nunca mais ser re-renderizado por cima
  }
}

// Inicializador de segurança para o carregamento padrão da página
window.addEventListener('load', () => {
  inicializarEConfigurarGoogle();
});

// Recebe o retorno de sucesso do Google com o Token JWT do usuário autenticado
function handleCredentialResponse(response) {
  const tokenJWT = response.credential;
  console.log("Token do Google recebido com sucesso:", tokenJWT);
  toast('Login com Google efetuado! Autenticando...');

  // Envie o 'tokenJWT' para o seu back-end aqui quando estiver pronto:
  /*
  fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: tokenJWT })
  })
  .then(res => res.json())
  .then(data => {
      if(data.success) window.location.href = '../';
  })
  .catch(err => console.error("Erro no envio do token:", err));
  */
}

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

// ── SOCIAL LOGIN ───────────────────────────────────────────
function socialLogin(prov){
  toast(`Conectando com ${prov}...`);

// ── INICIALIZAÇÃO ASSÍNCRONA DO SDK DO FACEBOOK ─────────────
(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "https://connect.facebook.net/pt_BR/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

window.fbAsyncInit = function() {
  FB.init({
    appId      : 'SEU_APP_ID_AQUI', // ⚠️ Substitua pelo App ID gerado no painel Meta for Developers
    cookie     : true,
    xfbml      : true,
    version    : 'v18.0'
  });
};

// ── PROCESSAMENTO DO CLIQUE SOCIAL ───────────────────────────
function socialLogin(prov){
  if (prov === 'Facebook') {
    // Valida se o script do Facebook já terminou de baixar da Meta
    if (typeof FB === 'undefined') {
      toast('O serviço do Facebook está carregando. Aguarde um instante.', 'err');
      return;
    }
    
    toast('Conectando com Facebook...');
    
    // Dispara o pop-up de login oficial
    FB.login(function(response) {
      if (response.authResponse) {
        // Token gerado com sucesso pelo Facebook
        const accessToken = response.authResponse.accessToken;
        console.log("Token do Facebook recebido com sucesso:", accessToken);
        
        toast('Login com Facebook efetuado! Autenticando...');
        
        // Redireciona o usuário (Fluxo idêntico ao do Google)
        setTimeout(() => window.location.href = '../', 1200);
      } else {
        toast('Autenticação cancelada ou recusada.', 'err');
      }
    }, { scope: 'public_profile,email' }); // Pede permissão ao e-mail e perfil público do usuário
  }
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
