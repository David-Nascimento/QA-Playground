// Dropdown menus para Fundamentos e Avançado
document.addEventListener('DOMContentLoaded', function(){
  document.querySelectorAll('.nav-dropdown').forEach(function(dd){
    var btn = dd.querySelector('.dropdown-toggle');
    var menu = dd.querySelector('.dropdown-menu');
    if(!btn || !menu) return;
    function close(){
      dd.classList.remove('open');
      btn.setAttribute('aria-expanded','false');
    }
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      var open = dd.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if(open) menu.querySelector('a')?.focus();
    });
    btn.addEventListener('keydown', function(e){
      if(e.key==='ArrowDown'||e.key==='Enter'||e.key===' '){
        e.preventDefault();
        dd.classList.add('open');
        btn.setAttribute('aria-expanded','true');
        menu.querySelector('a')?.focus();
      }
      if(e.key==='Escape'){close();btn.focus();}
    });
    menu.addEventListener('keydown', function(e){
      if(e.key==='Escape'){close();btn.focus();}
    });
    document.addEventListener('click', function(e){
      if(!dd.contains(e.target)) close();
    });
  });
});
// Tema: alterna light/dark e persiste em localStorage
(() => {
  const themeKey = 'qaplay-theme';

  function applyTheme(t){
    const html = document.documentElement;
    html.setAttribute('data-theme', t);
    
    // Atualiza variáveis CSS diretamente
    if(t === 'dark'){
      html.style.setProperty('--bg', '#0f1112');
      html.style.setProperty('--surface', '#111416');
      html.style.setProperty('--text', '#e6e6e6');
      html.style.setProperty('--muted', '#9a9a9a');
      html.style.setProperty('--accent', '#6fb56f');
      html.style.setProperty('--accent-2', '#cfa16a');
      html.style.setProperty('--shadow-sm', '0 1px 2px rgba(0, 0, 0, 0.2)');
      html.style.setProperty('--shadow-md', '0 4px 8px rgba(0, 0, 0, 0.3)');
      html.style.setProperty('--shadow-lg', '0 12px 24px rgba(0, 0, 0, 0.4)');
    } else {
      html.style.setProperty('--bg', '#fbf9f6');
      html.style.setProperty('--surface', '#ffffff');
      html.style.setProperty('--text', '#2b2b2b');
      html.style.setProperty('--muted', '#6b6b6b');
      html.style.setProperty('--accent', '#7aa874');
      html.style.setProperty('--accent-2', '#d6a35f');
      html.style.setProperty('--shadow-sm', '0 1px 2px rgba(0, 0, 0, 0.04)');
      html.style.setProperty('--shadow-md', '0 4px 8px rgba(0, 0, 0, 0.08)');
      html.style.setProperty('--shadow-lg', '0 12px 24px rgba(0, 0, 0, 0.12)');
    }
    
    // Atualiza ícone do botão
    const btn = document.getElementById('theme-toggle');
    if(btn) {
      btn.textContent = t === 'dark' ? '🌙' : '🌞';
    }
  }

  function getCurrentTheme(){
    const saved = localStorage.getItem(themeKey);
    if(saved) return saved;
    // Se não houver preferência salva, usa a preferência do sistema
    if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches){
      return 'dark';
    }
    return 'light';
  }

  function toggleTheme(){
    const current = getCurrentTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(themeKey, next);
    applyTheme(next);
  }

  // Aplica tema ao carregar
  const initialTheme = getCurrentTheme();
  applyTheme(initialTheme);

  // Adiciona event listener ao botão quando o DOM estiver pronto
  document.addEventListener('DOMContentLoaded', function(){
    const btn = document.getElementById('theme-toggle');
    if(btn){
      btn.addEventListener('click', toggleTheme);
    }
  });

  // Também adiciona listener imediatamente caso o botão já exista
  const btn = document.getElementById('theme-toggle');
  if(btn && !btn.hasAttribute('data-theme-listener')){
    btn.setAttribute('data-theme-listener', 'true');
    btn.addEventListener('click', toggleTheme);
  }

  // Responsive nav toggle
  if(navToggle && mainNav){
    // initialize tooltip text
    if(!navToggle.hasAttribute('data-tooltip')) navToggle.setAttribute('data-tooltip','Abrir menu');

    navToggle.addEventListener('click', ()=>{
      const open = mainNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      navToggle.setAttribute('data-tooltip', open ? 'Fechar menu' : 'Abrir menu');
    });
    // keyboard: toggle on Enter/Space
    navToggle.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); navToggle.click(); }
    });
  }

  // Inicializa tema
  applyTheme(currentTheme());

  // Demo: toast para ações (ex.: enviar formulário)
  window.showToast = (msg) => {
    let t = document.querySelector('.toast');
    if(!t){ t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t);}    
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(()=>t.classList.remove('show'), 2800);
  };
  
  // Helpers para validação de campos (utilitários simples para uso nas páginas)
  window.setFieldError = (fieldId, message) => {
    const el = document.getElementById(fieldId);
    const grp = el ? el.closest('.form-group') : null;
    if(grp) grp.classList.add('error');
    const err = document.getElementById(fieldId + '-error');
    if(err){ err.style.display = 'block'; err.textContent = message; }
  };

  window.clearFieldError = (fieldId) => {
    const el = document.getElementById(fieldId);
    const grp = el ? el.closest('.form-group') : null;
    if(grp) grp.classList.remove('error');
    const err = document.getElementById(fieldId + '-error');
    if(err){ err.style.display = 'none'; err.textContent = ''; }
  };

  window.validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
})();
