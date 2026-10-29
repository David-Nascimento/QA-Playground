// ========================================
// Mobile - auditoria de tamanho de alvos de toque
// ----------------------------------------
// Ativado em #target-audit. Mede todos os elementos interativos visíveis
// da página e compara com:
//   - WCAG 2.2, critério 2.5.8 (AA): pelo menos 24 × 24 px CSS, ou espaço
//     livre equivalente ao redor. Links dentro de um texto são exceção.
//   - Diretrizes de plataforma: 44 × 44 pt (Apple) e 48 × 48 dp (Material).
// O destaque visual usa uma camada própria, sem alterar os elementos
// da página (automações de terceiros continuam vendo o mesmo DOM).
// ========================================

export type TargetLevel = 'falha' | 'aa' | 'plataforma' | 'excecao';

export const MIN_AA = 24;
export const MIN_PLATFORM = 44;

export function levelFor(width: number, height: number, inlineText: boolean): TargetLevel {
  const min = Math.min(width, height);
  if (min >= MIN_PLATFORM) return 'plataforma';
  if (min >= MIN_AA) return 'aa';
  return inlineText ? 'excecao' : 'falha';
}

const INTERACTIVE =
  'a[href], button, input:not([type="hidden"]), select, textarea, summary, [role="button"], [role="link"], [role="tab"], [tabindex]:not([tabindex="-1"])';

function describe(el: Element): string {
  const tag = el.tagName.toLowerCase();
  const id = el.id ? `#${el.id}` : '';
  const testid = el.getAttribute('data-testid');
  const text = (el.getAttribute('aria-label') || (el as HTMLElement).innerText || (el as HTMLInputElement).value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, 32);
  return `${tag}${id}${testid ? `[data-testid="${testid}"]` : ''}${text ? ` “${text}”` : ''}`;
}

/** Link dentro de uma frase: a exceção "inline" do critério 2.5.8. */
function isInlineTextLink(el: Element): boolean {
  if (el.tagName !== 'A') return false;
  const parent = el.parentElement;
  if (!parent || !['P', 'LI', 'TD', 'SPAN', 'DD'].includes(parent.tagName)) return false;
  return (parent.textContent || '').trim().length > (el.textContent || '').trim().length + 10;
}

const LABEL: Record<TargetLevel, string> = {
  falha: 'Abaixo de 24 px (falha no 2.5.8)',
  aa: 'Passa no AA, abaixo de 44 px',
  plataforma: '44 px ou mais',
  excecao: 'Link em texto (exceção)',
};

export function initTargetAudit(): void {
  const root = document.getElementById('target-audit');
  if (!root) return;

  let overlay: HTMLDivElement | null = null;
  const out = (key: string, text: string) => {
    const el = root.querySelector(`[data-out="${key}"]`);
    if (el) el.textContent = text;
  };

  const clearOverlay = () => {
    overlay?.remove();
    overlay = null;
  };

  const run = () => {
    const scope = root.querySelector<HTMLSelectElement>('[data-lab="scope"]')?.value === 'demo'
      ? root.querySelector('[data-target-demo]')
      : document.querySelector('main');
    if (!scope) return;

    const items = [...scope.querySelectorAll(INTERACTIVE)]
      .filter((el) => !root.querySelector('[data-target-controls]')?.contains(el))
      .map((el) => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        const visible = r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none';
        return { el, r, visible, level: levelFor(r.width, r.height, isInlineTextLink(el)) };
      })
      .filter((i) => i.visible);

    const count = (lv: TargetLevel) => items.filter((i) => i.level === lv).length;
    out('total', String(items.length));
    out('falha', String(count('falha')));
    out('aa', String(count('aa')));
    out('plataforma', String(count('plataforma')));
    out('excecao', String(count('excecao')));

    const worst = items
      .filter((i) => i.level === 'falha' || i.level === 'aa')
      .sort((a, b) => Math.min(a.r.width, a.r.height) - Math.min(b.r.width, b.r.height))
      .slice(0, 8);
    const list = root.querySelector('[data-out="worst"]');
    if (list) {
      list.innerHTML = worst.length
        ? worst
            .map(
              (i) =>
                `<li class="mob-target-${i.level}"><span class="mob-target-size">${Math.round(i.r.width)} × ${Math.round(i.r.height)}</span> <code>${describe(i.el).replace(/</g, '&lt;')}</code> <span class="hint">${LABEL[i.level]}</span></li>`
            )
            .join('')
        : '<li>Nenhum alvo abaixo de 44 px nesta área.</li>';
    }

    clearOverlay();
    if (root.querySelector<HTMLInputElement>('[data-lab="highlight"]')?.checked) {
      overlay = document.createElement('div');
      overlay.className = 'mob-target-overlay';
      overlay.setAttribute('aria-hidden', 'true');
      items.forEach((i) => {
        const box = document.createElement('div');
        box.className = `mob-target-box is-${i.level}`;
        box.style.left = `${i.r.left + window.scrollX}px`;
        box.style.top = `${i.r.top + window.scrollY}px`;
        box.style.width = `${i.r.width}px`;
        box.style.height = `${i.r.height}px`;
        overlay!.appendChild(box);
      });
      document.body.appendChild(overlay);
    }
    out('status', `Análise concluída: ${items.length} alvos medidos em ${window.innerWidth} px de largura.`);
  };

  root.querySelector('[data-lab="run"]')?.addEventListener('click', run);
  root.querySelector('[data-lab="highlight"]')?.addEventListener('change', run);
  root.querySelector('[data-lab="scope"]')?.addEventListener('change', run);
  window.addEventListener('resize', () => {
    if (overlay) run();
  });
}
