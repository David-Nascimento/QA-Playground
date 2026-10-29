// ========================================
// Acessibilidade Web - comportamento das páginas pages/tools/accessibility
// ----------------------------------------
// Cada parte só é ativada se os elementos existirem na página.
// ========================================

const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => [...root.querySelectorAll<T>(sel)];

/** Região "live" compartilhada para anunciar mudanças a leitores de tela. */
function announce(message: string): void {
  let region = document.getElementById('a11y-announcer');
  if (!region) {
    region = document.createElement('div');
    region.id = 'a11y-announcer';
    region.className = 'sr-only';
    region.setAttribute('role', 'status');
    document.body.appendChild(region);
  }
  region.textContent = '';
  window.setTimeout(() => (region!.textContent = message), 50);
}

// ----------------------------------------
// Alternar versão com problema / corrigida
// ----------------------------------------

function initToggles(): void {
  $$<HTMLButtonElement>('.a11y-toggle-btn').forEach((button) => {
    const playground = document.getElementById(`playground-${button.dataset.playground}`);
    const bad = playground ? $('[data-version="bad"]', playground) : null;
    const good = playground ? $('[data-version="good"]', playground) : null;
    const label = $('.toggle-label', button);
    if (!bad || !good) return;

    const render = (showingGood: boolean) => {
      bad.style.display = showingGood ? 'none' : 'block';
      good.style.display = showingGood ? 'block' : 'none';
      const text = showingGood ? 'Mostrar versão com erro' : 'Mostrar versão corrigida';
      if (label) label.textContent = text;
      // O nome acessível precisa conter o texto visível (WCAG 2.5.3)
      button.setAttribute('aria-label', text);
      button.setAttribute('aria-expanded', String(showingGood));
      button.setAttribute('aria-controls', good.id || (good.id = `${playground!.id}-good`));
      button.classList.toggle('active', showingGood);
    };

    let showingGood = false;
    render(showingGood);
    button.addEventListener('click', () => {
      showingGood = !showingGood;
      render(showingGood);
      announce(showingGood ? 'Exibindo a versão corrigida' : 'Exibindo a versão com problema');
    });
  });
}

// ----------------------------------------
// Demonstrações interativas dos playgrounds
// ----------------------------------------

function initDemos(): void {
  // Mensagem de status: a versão ruim só aparece na tela; a boa é anunciada
  $$<HTMLButtonElement>('[data-demo="status-bad"]').forEach((btn) => {
    const msg = btn.parentElement ? $('.demo-toast', btn.parentElement) : null;
    btn.addEventListener('click', () => {
      if (!msg) return;
      msg.hidden = false;
      window.setTimeout(() => (msg.hidden = true), 2500);
    });
  });
  $$<HTMLButtonElement>('[data-demo="status-good"]').forEach((btn) => {
    const msg = btn.parentElement ? $('[role="status"]', btn.parentElement) : null;
    btn.addEventListener('click', () => {
      if (!msg) return;
      msg.textContent = '';
      window.setTimeout(() => (msg.textContent = 'Produto adicionado ao carrinho'), 50);
    });
  });

  // Modal ruim: aparece, mas não recebe foco, não fecha com Esc
  $$<HTMLButtonElement>('[data-demo="modal-bad"]').forEach((btn) => {
    const modal = btn.parentElement ? $('.demo-modal-bad', btn.parentElement) : null;
    if (!modal) return;
    btn.addEventListener('click', () => (modal.hidden = false));
    $$('[data-demo="modal-bad-close"]', modal).forEach((el) => el.addEventListener('click', () => (modal.hidden = true)));
  });

  // Modal bom: <dialog> nativo + devolução do foco
  $$<HTMLButtonElement>('[data-demo="modal-good"]').forEach((btn) => {
    const dialog = btn.parentElement ? $<HTMLDialogElement>('dialog', btn.parentElement) : null;
    if (!dialog || typeof dialog.showModal !== 'function') return;
    btn.addEventListener('click', () => dialog.showModal());
    dialog.addEventListener('close', () => {
      btn.focus();
      announce(dialog.returnValue === 'confirm' ? 'Conta excluída (demonstração)' : 'Exclusão cancelada');
    });
  });
}

// ----------------------------------------
// Checklist com progresso salvo
// ----------------------------------------

const CHECKLIST_KEY = 'qaplay-a11y-checklist';

function initChecklist(): void {
  const boxes = $$<HTMLInputElement>('.a11y-checklist input[type="checkbox"]');
  const text = document.getElementById('checklist-progress-text');
  if (!boxes.length || !text) return;
  const bar = document.getElementById('checklist-progress-bar');
  const pendingBtn = document.getElementById('checklist-pending') as HTMLButtonElement | null;
  const copyBtn = document.getElementById('checklist-copy') as HTMLButtonElement | null;
  const resetBtn = document.getElementById('checklist-reset') as HTMLButtonElement | null;
  const categories = $$('.a11y-checklist-category');

  let saved: string[] = [];
  try {
    saved = JSON.parse(localStorage.getItem(CHECKLIST_KEY) || '[]');
  } catch {
    saved = [];
  }
  boxes.forEach((b) => (b.checked = saved.includes(b.id)));

  // Contador por categoria
  categories.forEach((cat) => {
    const h3 = $('h3', cat);
    if (h3 && !$('.a11y-cat-count', h3)) h3.insertAdjacentHTML('beforeend', ' <span class="a11y-cat-count"></span>');
  });

  const update = () => {
    const done = boxes.filter((b) => b.checked);
    text.textContent = `${done.length} de ${boxes.length} itens verificados`;
    if (bar) bar.style.width = `${(done.length / boxes.length) * 100}%`;
    categories.forEach((cat) => {
      const items = $$<HTMLInputElement>('input[type="checkbox"]', cat);
      const count = $('.a11y-cat-count', cat);
      if (count) count.textContent = `${items.filter((i) => i.checked).length}/${items.length}`;
    });
    try {
      localStorage.setItem(CHECKLIST_KEY, JSON.stringify(done.map((b) => b.id)));
    } catch {
      /* sem armazenamento: progresso só nesta visita */
    }
  };

  boxes.forEach((b) => b.addEventListener('change', update));

  pendingBtn?.addEventListener('click', () => {
    const on = pendingBtn.getAttribute('aria-pressed') !== 'true';
    pendingBtn.setAttribute('aria-pressed', String(on));
    document.querySelector('.a11y-checklist-container')?.classList.toggle('only-pending', on);
    announce(on ? 'Mostrando só os itens pendentes' : 'Mostrando todos os itens');
  });

  resetBtn?.addEventListener('click', () => {
    boxes.forEach((b) => (b.checked = false));
    update();
    announce('Marcações apagadas');
  });

  copyBtn?.addEventListener('click', async () => {
    const lines = ['## Checklist de acessibilidade (WCAG 2.2 AA)', ''];
    categories.forEach((cat) => {
      const title = $('h3', cat)?.firstChild?.textContent?.trim() ?? '';
      lines.push(`### ${title}`);
      $$<HTMLInputElement>('input[type="checkbox"]', cat).forEach((b) => {
        const label = document.querySelector(`label[for="${b.id}"]`)?.textContent?.replace(/\s+/g, ' ').trim() ?? b.id;
        lines.push(`- [${b.checked ? 'x' : ' '}] ${label}`);
      });
      lines.push('');
    });
    const report = lines.join('\n');
    try {
      await navigator.clipboard.writeText(report);
      announce('Relatório copiado');
      copyBtn.textContent = 'Copiado!';
    } catch {
      copyBtn.textContent = 'Não foi possível copiar';
    }
    window.setTimeout(() => (copyBtn.textContent = 'Copiar relatório'), 1800);
  });

  update();
}

// ----------------------------------------
// Verificador de contraste
// ----------------------------------------

function parseColor(value: string): [number, number, number] | null {
  const v = value.trim().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(v)) return [0, 1, 2].map((i) => parseInt(v[i] + v[i], 16)) as [number, number, number];
  if (/^[0-9a-f]{6}$/i.test(v)) return [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16)) as [number, number, number];
  const rgb = value.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
  return rgb ? [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])] : null;
}

const luminance = ([r, g, b]: [number, number, number]) => {
  const f = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};

export function contrastRatio(a: [number, number, number], b: [number, number, number]): number {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

const toHex = (c: [number, number, number]) => `#${c.map((x) => x.toString(16).padStart(2, '0')).join('')}`;

function initContrastChecker(): void {
  const root = document.getElementById('contrast-checker');
  if (!root) return;
  const fg = $<HTMLInputElement>('#contrast-fg', root)!;
  const bg = $<HTMLInputElement>('#contrast-bg', root)!;
  const fgPicker = $<HTMLInputElement>('#contrast-fg-picker', root)!;
  const bgPicker = $<HTMLInputElement>('#contrast-bg-picker', root)!;
  const preview = $('#contrast-preview', root)!;
  const ratioEl = $('#contrast-ratio', root)!;
  const checks = $('#contrast-checks', root)!;

  const update = () => {
    const a = parseColor(fg.value);
    const b = parseColor(bg.value);
    fg.setAttribute('aria-invalid', String(!a));
    bg.setAttribute('aria-invalid', String(!b));
    if (!a || !b) {
      ratioEl.textContent = 'cor inválida (use #rrggbb)';
      checks.innerHTML = '';
      return;
    }
    fgPicker.value = toHex(a);
    bgPicker.value = toHex(b);
    preview.style.color = toHex(a);
    preview.style.background = toHex(b);
    const ratio = contrastRatio(a, b);
    ratioEl.textContent = `${ratio.toFixed(2)}:1`;
    const rows: Array<[string, number]> = [
      ['Texto normal, nível AA (1.4.3)', 4.5],
      ['Texto grande, nível AA (1.4.3)', 3],
      ['Componentes e ícones, nível AA (1.4.11)', 3],
      ['Texto normal, nível AAA (1.4.6)', 7],
      ['Texto grande, nível AAA (1.4.6)', 4.5],
    ];
    checks.innerHTML = rows
      .map(([label, min]) => {
        const ok = ratio >= min;
        return `<li class="${ok ? 'is-pass' : 'is-fail'}"><span class="a11y-check-mark" aria-hidden="true">${ok ? '✓' : '✕'}</span>
          <span>${label}<span class="sr-only">: ${ok ? 'passa' : 'reprova'}</span> <span class="a11y-check-min">mínimo ${min}:1</span></span></li>`;
      })
      .join('');
  };

  fg.addEventListener('input', update);
  bg.addEventListener('input', update);
  fgPicker.addEventListener('input', () => {
    fg.value = fgPicker.value;
    update();
  });
  bgPicker.addEventListener('input', () => {
    bg.value = bgPicker.value;
    update();
  });
  $('#contrast-swap', root)?.addEventListener('click', () => {
    [fg.value, bg.value] = [bg.value, fg.value];
    update();
  });
  update();
}

// ----------------------------------------
// Abas (padrão ARIA tabs)
// ----------------------------------------

export function initTabsWidget(root: ParentNode = document): void {
  $$('[data-tabs]', root).forEach((widget) => {
    const tabs = $$<HTMLButtonElement>('[role="tab"]', widget);
    const select = (tab: HTMLButtonElement) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls') || '');
        if (panel) panel.hidden = !on;
      });
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', (e) => {
        const map: Record<string, number> = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
        if (!(e.key in map)) return;
        e.preventDefault();
        const next = tabs[(map[e.key] + tabs.length) % tabs.length];
        next.focus();
        select(next);
      });
    });
  });
}

export function initAccessibility(): void {
  initToggles();
  initDemos();
  initChecklist();
  initContrastChecker();
  initTabsWidget();
}
