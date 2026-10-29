// ========================================
// BDD Playground - interface
// ----------------------------------------
// Liga o editor (#gherkin-input) ao motor de regras (gherkin.ts + rules.ts),
// à trilha guiada (missions.ts) e ao gerador de step definitions.
// Mantém os ids e classes originais da página, usados por automações.
// ========================================

import { KEYWORD_LABEL, parseGherkin, type Lang } from './gherkin.js';
import { CATEGORY_LABEL, LEVELS, runRules, type Finding, type Level, type Report } from './rules.js';
import { MISSIONS, type Mission } from './missions.js';
import { generate, type Target } from './stepdefs.js';

const STORAGE_KEY = 'qaplay-bdd-missions';

/** Exemplo por nível, nos dois idiomas. */
const EXAMPLES: Record<Lang, Record<Level, string>> = {
  pt: {
    basico: `# language: pt
Funcionalidade: Login de usuário
  Como cliente da loja
  Quero entrar na minha conta
  Para acompanhar meus pedidos

  Cenário: Login com credenciais válidas
    Dado que tenho uma conta ativa
    Quando faço login com email e senha corretos
    Então devo ver a página "Meus pedidos"`,
    intermediario: `# language: pt
Funcionalidade: Aprovação de pedidos
  Como loja
  Quero aprovar pedidos de baixo risco automaticamente
  Para entregar mais rápido

  Cenário: Pedido de baixo valor aprovado automaticamente
    Dado que existe um pedido de R$ 300
    E o cliente não tem pagamentos em atraso
    Quando o pedido é processado
    Então o pedido deve ficar "Aprovado"
    E o cliente deve receber a confirmação por email`,
    avancado: `# language: pt
Funcionalidade: Cupom de desconto
  Como comprador
  Quero usar cupons
  Para pagar menos nas compras

  Cenário: Cupom válido reduz o total
    Dado que tenho um carrinho de R$ 200
    Quando aplico o cupom "BEMVINDO10"
    Então o total do pedido deve ser R$ 180

  Cenário: Cupom expirado é recusado
    Dado que tenho um carrinho de R$ 200
    E o cupom "NATAL" expirou ontem
    Quando aplico o cupom "NATAL"
    Então devo ver o aviso "Cupom expirado"
    Mas o total do pedido deve continuar R$ 200`,
    especialista: `# language: pt
Funcionalidade: Programa de pontos
  Como cliente fiel
  Quero acumular e trocar pontos
  Para ganhar descontos

  Regra: Cada R$ 1 em compras vale 1 ponto

    Contexto:
      Dado que sou cliente do programa de pontos

    Esquema do Cenário: Acúmulo de pontos por compra
      Dado que tenho <saldo> pontos
      Quando finalizo uma compra de R$ <valor>
      Então meu saldo deve ser de <total> pontos

      Exemplos:
        | saldo | valor | total |
        | 0     | 50    | 50    |
        | 100   | 25    | 125   |

  Regra: Pontos expiram após 12 meses

    Cenário: Pontos antigos expiram
      Dado que tenho 300 pontos ganhos há 13 meses
      Quando o fechamento mensal é executado
      Então meu saldo deve ser de 0 pontos`,
  },
  en: {
    basico: `# language: en
Feature: User login
  As a store customer
  I want to sign in
  So that I can track my orders

  Scenario: Login with valid credentials
    Given I have an active account
    When I log in with the correct email and password
    Then I should see the "My orders" page`,
    intermediario: `# language: en
Feature: Order approval
  As a store
  I want low-risk orders approved automatically
  So that deliveries are faster

  Scenario: Low-value order approved automatically
    Given there is an order of $300
    And the customer has no late payments
    When the order is processed
    Then the order should be "Approved"
    And the customer should receive an email confirmation`,
    avancado: `# language: en
Feature: Discount coupon
  As a shopper
  I want to use coupons
  So that I pay less

  Scenario: Valid coupon reduces the total
    Given my cart total is $200
    When I apply the coupon "WELCOME10"
    Then the order total should be $180

  Scenario: Expired coupon is rejected
    Given my cart total is $200
    And the coupon "XMAS" expired yesterday
    When I apply the coupon "XMAS"
    Then I should see "Coupon expired"
    But the order total should remain $200`,
    especialista: `# language: en
Feature: Loyalty points
  As a loyal customer
  I want to earn and redeem points
  So that I get discounts

  Rule: Each $1 spent earns 1 point

    Background:
      Given I am a loyalty program member

    Scenario Outline: Earning points per purchase
      Given I have <balance> points
      When I complete a purchase of $<amount>
      Then my balance should be <total> points

      Examples:
        | balance | amount | total |
        | 0       | 50     | 50    |
        | 100     | 25     | 125   |

  Rule: Points expire after 12 months

    Scenario: Old points expire
      Given I have 300 points earned 13 months ago
      When the monthly closing runs
      Then my balance should be 0 points`,
  },
};

const escapeHtml = (s: string): string =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

export class BDDPlayground {
  private input: HTMLTextAreaElement | null = null;
  private gutter: HTMLElement | null = null;
  private sessionSelect: HTMLSelectElement | null = null;
  private sessionInfo: HTMLElement | null = null;
  private sessionTips: HTMLElement | null = null;
  private results: HTMLElement | null = null;
  private stepdefsOutput: HTMLElement | null = null;
  private stepdefsCopy: HTMLButtonElement | null = null;

  private level: Level = 'basico';
  private lang: Lang = 'pt';
  private target: Target = 'js';
  private lastReport: Report | null = null;
  private activeMission: Mission | null = null;
  private done = new Set<string>();
  private liveTimer: number | undefined;

  init(): void {
    this.input = document.getElementById('gherkin-input') as HTMLTextAreaElement | null;
    const btnValidate = document.getElementById('btn-validate');
    this.sessionSelect = document.getElementById('session-select') as HTMLSelectElement | null;
    if (!this.input || !btnValidate || !this.sessionSelect) return; // página sem o playground

    this.gutter = document.getElementById('gherkin-gutter');
    this.sessionInfo = document.getElementById('session-info');
    this.sessionTips = document.getElementById('session-tips');
    this.results = document.getElementById('results-container');
    this.stepdefsOutput = document.querySelector('#stepdefs-output code');
    this.stepdefsCopy = document.getElementById('stepdefs-copy') as HTMLButtonElement | null;

    this.level = (this.sessionSelect.value as Level) || 'basico';
    this.loadProgress();

    btnValidate.addEventListener('click', () => this.validate());
    this.sessionSelect.addEventListener('change', () => {
      this.level = this.sessionSelect!.value as Level;
      // Trocar o nível manualmente sai da missão (cada missão tem o seu nível)
      if (this.activeMission && this.activeMission.level !== this.level) this.closeMission();
      this.renderSession();
    });
    document.getElementById('load-example')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.setEditor(EXAMPLES[this.lang][this.level]);
    });

    this.input.addEventListener('input', () => {
      this.renderGutter();
      this.scheduleLiveValidation();
    });
    this.input.addEventListener('scroll', () => {
      if (this.gutter) this.gutter.scrollTop = this.input!.scrollTop;
    });
    this.input.addEventListener('keydown', (e) => this.handleEditorKeys(e));

    document.querySelectorAll<HTMLInputElement>('input[name="bdd-lang"]').forEach((radio) =>
      radio.addEventListener('change', () => {
        if (radio.checked) {
          this.lang = radio.value as Lang;
          this.renderToolbar();
        }
      })
    );

    this.setupStepdefs();
    this.renderToolbar();
    this.renderSession();
    this.renderGutter();
    this.renderMissions();
  }

  // ----------------------------------------
  // Editor
  // ----------------------------------------

  private setEditor(text: string): void {
    if (!this.input) return;
    this.input.value = text;
    this.input.focus();
    this.input.setSelectionRange(text.length, text.length);
    this.renderGutter();
  }

  private renderGutter(findings: Finding[] = this.lastReport?.findings ?? []): void {
    if (!this.gutter || !this.input) return;
    const count = Math.max(1, this.input.value.split('\n').length);
    const marks = new Map<number, 'erro' | 'aviso'>();
    findings.forEach((f) => {
      if (f.line && marks.get(f.line) !== 'erro') marks.set(f.line, f.severity);
    });
    let html = '';
    for (let i = 1; i <= count; i++) {
      const m = marks.get(i);
      html += `<span class="${m ? `gutter-${m}` : ''}">${i}</span>`;
    }
    this.gutter.innerHTML = html;
    this.gutter.scrollTop = this.input.scrollTop;
  }

  /** Seleciona uma linha do editor e rola até ela. */
  private goToLine(line: number): void {
    if (!this.input) return;
    const lines = this.input.value.split('\n');
    const start = lines.slice(0, line - 1).reduce((n, l) => n + l.length + 1, 0);
    const end = start + (lines[line - 1]?.length ?? 0);
    this.input.focus();
    this.input.setSelectionRange(start, end);
    const lineHeight = parseFloat(getComputedStyle(this.input).lineHeight) || 22;
    this.input.scrollTop = Math.max(0, (line - 3) * lineHeight);
  }

  private handleEditorKeys(e: KeyboardEvent): void {
    if (!this.input) return;
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      this.validate();
      return;
    }
    // Tab continua movendo o foco (não prendemos o teclado no editor).
  }

  /** Barra de palavras-chave: insere a palavra no início de uma nova linha, já indentada. */
  private renderToolbar(): void {
    const bar = document.getElementById('bdd-toolbar');
    if (!bar) return;
    const L = KEYWORD_LABEL[this.lang];
    const items: Array<{ label: string; text: string; indent: number; cls: string }> = [
      { label: L.feature, text: `${L.feature}: `, indent: 0, cls: 'kw-feature' },
      { label: L.background, text: `${L.background}:`, indent: 2, cls: 'kw-scenario' },
      { label: L.scenario, text: `${L.scenario}: `, indent: 2, cls: 'kw-scenario' },
      { label: L.given, text: `${L.given} `, indent: 4, cls: 'kw-given' },
      { label: L.when, text: `${L.when} `, indent: 4, cls: 'kw-when' },
      { label: L.then, text: `${L.then} `, indent: 4, cls: 'kw-then' },
      { label: L.and, text: `${L.and} `, indent: 4, cls: 'kw-and' },
    ];
    bar.innerHTML = items
      .map((it, i) => `<button type="button" class="bdd-kw ${it.cls}" data-kw="${i}" tabindex="${i === 0 ? 0 : -1}">+ ${escapeHtml(it.label)}</button>`)
      .join('');
    const buttons = [...bar.querySelectorAll<HTMLButtonElement>('button')];
    buttons.forEach((btn, i) => {
      btn.addEventListener('click', () => this.insertKeyword(items[i].text, items[i].indent));
      // Toolbar: setas navegam entre botões (padrão ARIA)
      btn.addEventListener('keydown', (e) => {
        const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!dir) return;
        e.preventDefault();
        const next = buttons[(i + dir + buttons.length) % buttons.length];
        buttons.forEach((b) => (b.tabIndex = -1));
        next.tabIndex = 0;
        next.focus();
      });
    });
  }

  private insertKeyword(text: string, indent: number): void {
    if (!this.input) return;
    const { value, selectionStart } = this.input;
    const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
    const lineEnd = value.indexOf('\n', selectionStart);
    const currentLine = value.slice(lineStart, lineEnd === -1 ? value.length : lineEnd);
    const prefix = currentLine.trim() ? '\n' : '';
    const insertAt = currentLine.trim() ? (lineEnd === -1 ? value.length : lineEnd) : lineStart;
    const removeTo = currentLine.trim() ? insertAt : lineEnd === -1 ? value.length : lineEnd;
    const piece = `${prefix}${' '.repeat(indent)}${text}`;
    this.input.value = value.slice(0, insertAt) + piece + value.slice(removeTo);
    const caret = insertAt + piece.length;
    this.input.focus();
    this.input.setSelectionRange(caret, caret);
    this.input.dispatchEvent(new Event('input'));
  }

  private scheduleLiveValidation(): void {
    const live = document.getElementById('bdd-live-validate') as HTMLInputElement | null;
    if (!live?.checked) return;
    window.clearTimeout(this.liveTimer);
    this.liveTimer = window.setTimeout(() => this.validate({ quiet: true }), 600);
  }

  // ----------------------------------------
  // Nível
  // ----------------------------------------

  private renderSession(): void {
    const info = LEVELS[this.level];
    if (this.sessionInfo) this.sessionInfo.innerHTML = `<strong>${info.name}</strong><br>${escapeHtml(info.description)}`;
    if (this.sessionTips) {
      this.sessionTips.innerHTML = `<h4>Dicas para este nível:</h4><ul>${info.tips.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ul>`;
    }
  }

  // ----------------------------------------
  // Validação
  // ----------------------------------------

  private validate({ quiet = false }: { quiet?: boolean } = {}): void {
    if (!this.input || !this.results) return;
    const text = this.input.value;
    if (!text.trim()) {
      this.lastReport = null;
      this.renderGutter([]);
      this.results.innerHTML = `<div class="empty-state"><p>Por favor, digite um cenário Gherkin antes de validar.</p></div>`;
      this.renderStepdefs();
      return;
    }

    const doc = parseGherkin(text);
    const report = runRules(doc, this.level);
    this.lastReport = report;
    this.renderGutter(report.findings);
    this.renderResults(report);
    this.renderStepdefs();
    if (this.activeMission) this.checkMission(quiet);
  }

  private renderResults(r: Report): void {
    if (!this.results) return;
    const badge = r.valid
      ? `<span class="valid-badge">✓ Válido</span>`
      : `<span class="invalid-badge">✗ Inválido</span>`;
    const summary = r.valid
      ? r.warnings.length
        ? `Sem erros. ${r.warnings.length} ${r.warnings.length === 1 ? 'sugestão' : 'sugestões'} para deixar o cenário ainda melhor.`
        : 'Sem erros nem sugestões neste nível. Tente o próximo nível.'
      : `${r.errors.length} ${r.errors.length === 1 ? 'erro precisa' : 'erros precisam'} ser corrigido${r.errors.length === 1 ? '' : 's'}.`;

    const breakdown = r.categories
      .map(
        (c) => `<div class="breakdown-item"><strong>${CATEGORY_LABEL[c.category]}</strong><span>${c.percentage}%</span>
          <span class="breakdown-bar" aria-hidden="true"><span style="width:${c.percentage}%"></span></span></div>`
      )
      .join('');

    const item = (f: Finding) => `
      <li class="${f.severity === 'erro' ? 'error-item' : 'suggestion-item'}">
        <div class="finding-head">
          ${f.line ? `<button type="button" class="finding-line" data-line="${f.line}" aria-label="Ir para a linha ${f.line}">Linha ${f.line}</button>` : ''}
          <span class="finding-tag">${f.severity === 'erro' ? 'Erro' : 'Sugestão'} · ${CATEGORY_LABEL[f.category]}</span>
        </div>
        <strong>${escapeHtml(f.message)}</strong>
        <p>${escapeHtml(f.hint)}</p>
        ${f.example ? `<pre class="finding-example">${escapeHtml(f.example)}</pre>` : ''}
      </li>`;

    this.results.innerHTML = `
      <div class="result-summary">
        ${badge}
        <div class="score-display">
          <div>
            <div class="score-value">${r.score}</div>
            <div class="score-level">${r.grade}</div>
          </div>
          <p class="score-summary">${summary}<br><span class="muted">Nível ${r.level.name} · idioma detectado: ${r.doc.lang === 'pt' ? 'português' : 'inglês'}</span></p>
        </div>
      </div>
      <div class="score-breakdown">${breakdown}</div>
      ${r.errors.length ? `<div class="errors-list"><h3>Erros Encontrados:</h3><ul class="finding-list">${r.errors.map(item).join('')}</ul></div>` : ''}
      ${r.warnings.length ? `<div class="suggestions-list"><h3>💡 Sugestões de Melhoria:</h3><ul class="finding-list">${r.warnings.map(item).join('')}</ul></div>` : ''}
      ${!r.findings.length ? `<div class="general-feedback"><h3>Muito bem!</h3><p>O cenário segue todas as regras do nível ${r.level.name}.${this.level !== 'especialista' ? ' Que tal subir de nível no seletor acima?' : ''}</p></div>` : ''}
    `;

    this.results.querySelectorAll<HTMLButtonElement>('.finding-line').forEach((btn) =>
      btn.addEventListener('click', () => this.goToLine(Number(btn.dataset.line)))
    );
  }

  // ----------------------------------------
  // Step definitions
  // ----------------------------------------

  private setupStepdefs(): void {
    const tabs = [...document.querySelectorAll<HTMLButtonElement>('#bdd-stepdefs [role="tab"]')];
    const select = (tab: HTMLButtonElement) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
      });
      document.getElementById('stepdefs-output')?.setAttribute('aria-labelledby', tab.id);
      this.target = tab.dataset.targetLang as Target;
      this.renderStepdefs();
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', (e) => {
        const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!dir) return;
        e.preventDefault();
        const next = tabs[(i + dir + tabs.length) % tabs.length];
        next.focus();
        select(next);
      });
    });

    this.stepdefsCopy?.addEventListener('click', async () => {
      const code = this.stepdefsOutput?.textContent ?? '';
      try {
        await navigator.clipboard.writeText(code);
        this.flash(this.stepdefsCopy!, 'Copiado!');
      } catch {
        this.flash(this.stepdefsCopy!, 'Selecione e copie manualmente');
      }
    });
  }

  private flash(btn: HTMLButtonElement, text: string): void {
    const original = btn.textContent;
    btn.textContent = text;
    window.setTimeout(() => (btn.textContent = original), 1600);
  }

  private renderStepdefs(): void {
    if (!this.stepdefsOutput) return;
    const doc = this.lastReport?.doc;
    const code = doc && doc.scenarios.length ? generate(doc, this.target) : '';
    this.stepdefsOutput.textContent = code || '// Valide um cenário com pelo menos um passo para gerar os step definitions.';
    if (this.stepdefsCopy) this.stepdefsCopy.disabled = !code;
  }

  // ----------------------------------------
  // Trilha guiada
  // ----------------------------------------

  private loadProgress(): void {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (Array.isArray(saved)) saved.forEach((id) => this.done.add(String(id)));
    } catch {
      /* armazenamento indisponível: progresso só nesta visita */
    }
  }

  private saveProgress(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...this.done]));
    } catch {
      /* ignora */
    }
  }

  private renderMissions(): void {
    const list = document.getElementById('bdd-mission-list');
    const progress = document.getElementById('bdd-missions-progress');
    if (!list) return;

    list.innerHTML = MISSIONS.map((m, i) => {
      const done = this.done.has(m.id);
      const active = this.activeMission?.id === m.id;
      return `<li class="bdd-mission${done ? ' is-done' : ''}${active ? ' is-active' : ''}">
        <button type="button" class="bdd-mission-btn" data-mission="${m.id}" aria-pressed="${active}">
          <span class="bdd-mission-num" aria-hidden="true">${done ? '✓' : i + 1}</span>
          <span class="bdd-mission-text">
            <span class="bdd-mission-title">${escapeHtml(m.title)}</span>
            <span class="bdd-mission-concept">${escapeHtml(m.concept)}${done ? ' · concluída' : ''}</span>
          </span>
        </button>
      </li>`;
    }).join('');

    list.querySelectorAll<HTMLButtonElement>('.bdd-mission-btn').forEach((btn) =>
      btn.addEventListener('click', () => this.openMission(btn.dataset.mission!))
    );

    if (progress) {
      const n = this.done.size;
      progress.innerHTML = `<span class="bdd-progress-label">${n} de ${MISSIONS.length} concluídas</span>
        <span class="bdd-progress-bar" aria-hidden="true"><span style="width:${(n / MISSIONS.length) * 100}%"></span></span>`;
    }
  }

  private openMission(id: string): void {
    const mission = MISSIONS.find((m) => m.id === id);
    const panel = document.getElementById('bdd-mission-panel');
    if (!mission || !panel) return;
    this.activeMission = mission;
    this.level = mission.level;
    if (this.sessionSelect) this.sessionSelect.value = mission.level;
    this.renderSession();
    this.renderMissions();

    const index = MISSIONS.indexOf(mission);
    panel.hidden = false;
    panel.innerHTML = `
      <div class="bdd-mission-card">
        <p class="bdd-mission-step">Missão ${index + 1} de ${MISSIONS.length} · validada no nível ${LEVELS[mission.level].name}</p>
        <h3>${escapeHtml(mission.title)}</h3>
        <blockquote class="bdd-story">${escapeHtml(mission.story)}</blockquote>
        <p class="bdd-goal"><strong>Sua tarefa:</strong> ${escapeHtml(mission.goal)}</p>
        <div class="bdd-mission-actions">
          <button type="button" class="btn" data-action="load">Abrir no editor</button>
          <button type="button" class="btn btn-secondary" data-action="hint" aria-expanded="false" aria-controls="bdd-hints">Ver dica</button>
          <button type="button" class="btn btn-secondary" data-action="solution" aria-expanded="false" aria-controls="bdd-solution">Ver uma solução</button>
          <button type="button" class="btn btn-secondary" data-action="close">Sair da trilha</button>
        </div>
        <ol class="bdd-hints" id="bdd-hints" hidden></ol>
        <div id="bdd-solution" hidden>
          <p class="hint">Existem várias soluções corretas. Esta é uma delas:</p>
          <pre class="bdd-solution">${escapeHtml(mission.solution)}</pre>
        </div>
        <div class="bdd-mission-status" id="bdd-mission-status" role="status" aria-live="polite"></div>
      </div>`;

    let hintsShown = 0;
    panel.querySelector('[data-action="load"]')?.addEventListener('click', () => {
      this.setEditor(mission.starter);
      document.getElementById('gherkin-input')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      this.setMissionStatus('Cenário carregado no editor. Corrija e clique em "Validar Cenário".', 'info');
    });
    panel.querySelector('[data-action="hint"]')?.addEventListener('click', (e) => {
      const btn = e.currentTarget as HTMLButtonElement;
      const list = document.getElementById('bdd-hints');
      if (!list) return;
      if (hintsShown < mission.hints.length) {
        list.insertAdjacentHTML('beforeend', `<li>${escapeHtml(mission.hints[hintsShown])}</li>`);
        hintsShown++;
      }
      list.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      if (hintsShown >= mission.hints.length) {
        btn.disabled = true;
        btn.textContent = 'Todas as dicas abertas';
      } else {
        btn.textContent = 'Mais uma dica';
      }
    });
    panel.querySelector('[data-action="solution"]')?.addEventListener('click', (e) => {
      const btn = e.currentTarget as HTMLButtonElement;
      const sol = document.getElementById('bdd-solution');
      if (!sol) return;
      sol.hidden = !sol.hidden;
      btn.setAttribute('aria-expanded', String(!sol.hidden));
      btn.textContent = sol.hidden ? 'Ver uma solução' : 'Esconder solução';
    });
    panel.querySelector('[data-action="close"]')?.addEventListener('click', () => this.closeMission());

    (panel.querySelector('h3') as HTMLElement | null)?.setAttribute('tabindex', '-1');
    (panel.querySelector('h3') as HTMLElement | null)?.focus();
  }

  private closeMission(): void {
    const panel = document.getElementById('bdd-mission-panel');
    this.activeMission = null;
    if (panel) {
      panel.hidden = true;
      panel.innerHTML = '';
    }
    this.renderMissions();
  }

  private setMissionStatus(html: string, kind: 'ok' | 'pending' | 'info'): void {
    const el = document.getElementById('bdd-mission-status');
    if (!el) return;
    el.className = `bdd-mission-status is-${kind}`;
    el.innerHTML = html;
  }

  private checkMission(quiet: boolean): void {
    const mission = this.activeMission;
    if (!mission || !this.lastReport) return;
    const result = mission.check(this.lastReport.doc, this.lastReport);
    if (result.ok) {
      const first = !this.done.has(mission.id);
      this.done.add(mission.id);
      this.saveProgress();
      this.renderMissions();
      const next = MISSIONS[MISSIONS.indexOf(mission) + 1];
      this.setMissionStatus(
        `<strong>Missão concluída!</strong> ${first ? 'Seu progresso foi salvo neste navegador.' : ''}
         ${next ? `<button type="button" class="btn" id="bdd-next-mission">Próxima: ${escapeHtml(next.title)}</button>` : '<br>Você concluiu a trilha. Agora experimente os níveis Avançado e Especialista no seletor.'}`,
        'ok'
      );
      document.getElementById('bdd-next-mission')?.addEventListener('click', () => this.openMission(next!.id));
    } else if (!quiet) {
      this.setMissionStatus(
        `<strong>Ainda não.</strong><ul>${result.missing.map((m) => `<li>${escapeHtml(m)}</li>`).join('')}</ul>`,
        'pending'
      );
    }
  }
}
