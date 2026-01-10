(() => {
  /* =========================================================
   * DROPDOWNS
   * ========================================================= */
  function initDropdowns() {
    const dropdowns = document.querySelectorAll('.nav-dropdown');

    function closeAll(except = null) {
      dropdowns.forEach(dd => {
        if (dd !== except) {
          dd.classList.remove('open');
          const btn = dd.querySelector('.dropdown-toggle');
          btn?.setAttribute('aria-expanded', 'false');
        }
      });
    }

    dropdowns.forEach(dd => {
      const btn = dd.querySelector('.dropdown-toggle');
      const menu = dd.querySelector('.dropdown-menu');
      if (!btn || !menu) return;

      btn.setAttribute('aria-expanded', 'false');

      btn.addEventListener('click', e => {
        e.stopPropagation();
        const isOpen = dd.classList.toggle('open');
        btn.setAttribute('aria-expanded', String(isOpen));
        if (isOpen) {
          closeAll(dd);
          menu.querySelector('a')?.focus();
        }
      });

      btn.addEventListener('keydown', e => {
        if (['Enter', ' '].includes(e.key)) {
          e.preventDefault();
          dd.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
          menu.querySelector('a')?.focus();
        }

        if (e.key === 'Escape') {
          dd.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
          btn.focus();
        }
      });

      menu.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
          dd.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
          btn.focus();
        }
      });
    });

    document.addEventListener('click', () => closeAll());
  }

  /* =========================================================
   * TEMA (LIGHT / DARK)
   * ========================================================= */
  const THEME_KEY = 'qaplay-theme';

  function getTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  function applyTheme(theme) {
    const html = document.documentElement;
    html.setAttribute('data-theme', theme);

    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.textContent = theme === 'dark' ? '🌙' : '🌞';
      btn.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'
      );
    }
  }

  function toggleTheme() {
    const next = getTheme() === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  }

  function initTheme() {
    applyTheme(getTheme());

    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.addEventListener('click', toggleTheme);
    }
  }

  /* =========================================================
   * MENU RESPONSIVO
   * ========================================================= */
  function initResponsiveNav() {
    const navToggle = document.getElementById('nav-toggle');
    const mainNav = document.getElementById('main-nav');

    if (!navToggle || !mainNav) return;

    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('data-tooltip', 'Abrir menu');

    navToggle.addEventListener('click', () => {
      const open = mainNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute(
        'data-tooltip',
        open ? 'Fechar menu' : 'Abrir menu'
      );
    });

    navToggle.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        navToggle.click();
      }
    });
  }

  /* =========================================================
   * HELPERS GLOBAIS (INTENCIONAL)
   * ========================================================= */
  window.showToast = msg => {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
  };

  window.setFieldError = (fieldId, message) => {
    const field = document.getElementById(fieldId);
    const group = field?.closest('.form-group');
    const error = document.getElementById(`${fieldId}-error`);

    group?.classList.add('error');
    if (error) {
      error.textContent = message;
      error.style.display = 'block';
    }
  };

  window.clearFieldError = fieldId => {
    const field = document.getElementById(fieldId);
    const group = field?.closest('.form-group');
    const error = document.getElementById(`${fieldId}-error`);

    group?.classList.remove('error');
    if (error) {
      error.textContent = '';
      error.style.display = 'none';
    }
  };

  window.validateEmail = email =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  /* =========================================================
   * BOOTSTRAP
   * ========================================================= */
  document.addEventListener('DOMContentLoaded', () => {
    initDropdowns();
    initTheme();
    initResponsiveNav();
  });
})();
