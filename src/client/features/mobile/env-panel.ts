// ========================================
// Mobile - painel do ambiente (viewport, unidades e media features)
// ----------------------------------------
// Ativado em #mobile-env. Mostra em tempo real o que muda entre
// dispositivos e que a emulação do DevTools nem sempre reproduz:
// layout viewport x visual viewport (zoom e teclado virtual), as unidades
// vh/svh/lvh/dvh, as áreas seguras (notch) e as media features de entrada.
// ========================================

const px = (n: number) => `${Math.round(n)} px`;

/** Media features que o painel acompanha. */
export const MEDIA_FEATURES: { query: string; meaning: string }[] = [
  { query: '(pointer: coarse)', meaning: 'Ponteiro principal impreciso (dedo)' },
  { query: '(pointer: fine)', meaning: 'Ponteiro principal preciso (mouse, caneta)' },
  { query: '(hover: hover)', meaning: 'O ponteiro principal consegue passar o mouse por cima' },
  { query: '(any-pointer: coarse)', meaning: 'Existe algum ponteiro impreciso (touch) disponível' },
  { query: '(orientation: portrait)', meaning: 'Altura maior que a largura' },
  { query: '(prefers-reduced-motion: reduce)', meaning: 'Usuário pediu menos animação' },
  { query: '(prefers-color-scheme: dark)', meaning: 'Sistema em tema escuro' },
  { query: '(display-mode: standalone)', meaning: 'Aberto como app instalado (PWA)' },
];

function probeHeight(root: HTMLElement, unit: string): number | null {
  const el = root.querySelector<HTMLElement>(`[data-probe="${unit}"]`);
  if (!el) return null;
  const h = el.getBoundingClientRect().height;
  return h > 0 ? h : null; // 0 = unidade não suportada pelo navegador
}

function safeArea(root: HTMLElement): string {
  const el = root.querySelector<HTMLElement>('[data-probe="safe"]');
  if (!el) return '—';
  const cs = getComputedStyle(el);
  const v = [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].map((s) => Math.round(parseFloat(s) || 0));
  return v.every((n) => n === 0) ? '0 (sem notch ou fora do modo tela cheia)' : `topo ${v[0]} · direita ${v[1]} · base ${v[2]} · esquerda ${v[3]}`;
}

export function initEnvPanel(): void {
  const root = document.getElementById('mobile-env');
  if (!root) return;

  const set = (key: string, text: string) => {
    const el = root.querySelector(`[data-out="${key}"]`);
    if (el) el.textContent = text;
  };

  const list = root.querySelector<HTMLElement>('[data-out="media"]');
  const mqls = MEDIA_FEATURES.map((f) => ({ ...f, mql: window.matchMedia(f.query) }));

  const render = () => {
    const vv = window.visualViewport;
    set('layout', `${px(window.innerWidth)} × ${px(window.innerHeight)}`);
    set('visual', vv ? `${px(vv.width)} × ${px(vv.height)}` : 'não suportado');
    set('scale', vv ? `${vv.scale.toFixed(2).replace('.', ',')}×` : '—');
    set('screen', `${px(screen.width)} × ${px(screen.height)}`);
    set('dpr', `${window.devicePixelRatio.toFixed(2).replace('.', ',')}`);

    (['vh', 'svh', 'lvh', 'dvh'] as const).forEach((u) => {
      const h = probeHeight(root, u);
      set(u, h === null ? 'não suportado' : px(h));
    });
    set('safe', safeArea(root));

    // Teclado virtual ou zoom: o visual viewport fica menor que o layout viewport
    if (vv) {
      const hidden = window.innerHeight - vv.height - vv.offsetTop;
      set(
        'keyboard',
        vv.scale > 1.01
          ? 'Zoom ativo: parte da página está fora da área visível'
          : hidden > 80
            ? `Algo cobre ${px(hidden)} da tela (provavelmente o teclado virtual)`
            : 'Nada cobrindo a tela'
      );
    }

    if (list) {
      list.innerHTML = mqls
        .map(
          ({ query, meaning, mql }) =>
            `<li class="mob-mq ${mql.matches ? 'is-on' : 'is-off'}" data-mq="${query}">` +
            `<span class="mob-mq-state">${mql.matches ? 'Sim' : 'Não'}</span>` +
            `<code>${query}</code><span class="mob-mq-meaning">${meaning}</span></li>`
        )
        .join('');
    }
  };

  let frame = 0;
  const schedule = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(render);
  };

  window.addEventListener('resize', schedule);
  window.addEventListener('orientationchange', schedule);
  window.visualViewport?.addEventListener('resize', schedule);
  window.visualViewport?.addEventListener('scroll', schedule);
  mqls.forEach(({ mql }) => mql.addEventListener?.('change', schedule));
  render();
}
