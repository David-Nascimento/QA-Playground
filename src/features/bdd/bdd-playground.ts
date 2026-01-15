// ========================================
// BDD Playground - Funcionalidade Principal
// ========================================

import type {
  BDDSessionLevel,
  BDDValidation,
  BDDScore,
  BDDFeedback,
  ParsedGherkin,
} from './types.js';

/**
 * Exemplos de cenários Gherkin por nível
 */
const EXAMPLES: Record<BDDSessionLevel, string> = {
  basico: `Feature: Login de usuário
  Como usuário do sistema
  Eu quero fazer login
  Para acessar minha conta

  Scenario: Login com credenciais válidas
    Given que o usuário está na página de login
    When o usuário preenche email e senha corretos
    Then o usuário deve ser redirecionado para o dashboard`,

  intermediario: `Feature: Processamento de pedidos
  Como vendedor
  Eu quero processar pedidos
  Para entregar produtos aos clientes

  Scenario: Pedido aprovado automaticamente
    Given que existe um pedido com valor abaixo de R$ 1000
    And o cliente tem histórico de pagamento em dia
    When o sistema processa o pedido
    Then o pedido deve ser aprovado automaticamente
    And o cliente deve receber uma confirmação por email`,

  avancado: `Feature: Gestão de estoque
  Como gerente de estoque
  Eu quero monitorar níveis de produtos
  Para evitar rupturas

  Background:
    Given que o sistema possui produtos cadastrados
    And os produtos têm níveis de estoque definidos

  Scenario: Alerta de estoque baixo
    Given que um produto tem quantidade menor que o mínimo
    When o sistema verifica o estoque
    Then deve ser gerado um alerta para o gerente
    And o alerta deve conter o nome do produto e quantidade atual

  Scenario Outline: Reabastecimento automático
    Given que o produto "<produto>" está abaixo do mínimo
    When o sistema detecta a necessidade de reabastecimento
    Then deve ser criado um pedido de compra
    And o pedido deve conter a quantidade sugerida

    Examples:
      | produto | quantidade_minima | quantidade_atual |
      | Notebook | 10 | 5 |
      | Mouse | 50 | 20 |`,

  especialista: `Feature: Sistema de pontos de fidelidade
  Como cliente
  Eu quero acumular pontos em compras
  Para trocar por benefícios

  Rule: Acúmulo de pontos
    Scenario: Compra com pontos
      Given que o cliente possui 1000 pontos
      When o cliente realiza uma compra de R$ 50
      Then o cliente deve receber 50 pontos
      And o total de pontos deve ser 1050

    Scenario Outline: Conversão de pontos
      Given que o cliente possui "<pontos_iniciais>" pontos
      When o cliente solicita conversão para desconto
      Then deve ser aplicado desconto de "<desconto>" reais
      And o saldo de pontos deve ser "<pontos_finais>"

      Examples:
        | pontos_iniciais | desconto | pontos_finais |
        | 1000 | 10 | 900 |
        | 2000 | 25 | 1750 |
        | 5000 | 100 | 4000 |

  Rule: Expiração de pontos
    Background:
      Given que o sistema possui regra de expiração de pontos

    Scenario: Pontos não expirados
      Given que o cliente possui pontos válidos
      When o sistema verifica a validade dos pontos
      Then os pontos devem permanecer ativos`,
};

/**
 * Classe para gerenciar o BDD Playground
 */
export class BDDPlayground {
  private gherkinInput: HTMLTextAreaElement | null = null;
  private btnValidate: HTMLButtonElement | null = null;
  private sessionSelect: HTMLSelectElement | null = null;
  private sessionInfo: HTMLElement | null = null;
  private sessionTips: HTMLElement | null = null;
  private resultsContainer: HTMLElement | null = null;
  private loadExample: HTMLButtonElement | null = null;
  private currentSession: BDDSessionLevel = 'basico';

  /**
   * Inicializa o BDD Playground
   */
  init(): void {
    // Obtém elementos do DOM
    this.gherkinInput = document.getElementById('gherkin-input') as HTMLTextAreaElement;
    this.btnValidate = document.getElementById('btn-validate') as HTMLButtonElement;
    this.sessionSelect = document.getElementById('session-select') as HTMLSelectElement;
    this.sessionInfo = document.getElementById('session-info');
    this.sessionTips = document.getElementById('session-tips');
    this.resultsContainer = document.getElementById('results-container');
    this.loadExample = document.getElementById('load-example') as HTMLButtonElement;

    // Verifica se os elementos essenciais existem
    if (!this.gherkinInput || !this.btnValidate || !this.sessionSelect) {
      return; // BDD Playground não disponível nesta página
    }

    this.setupEventListeners();
    this.waitForBDDModules();
  }

  /**
   * Configura os event listeners
   */
  private setupEventListeners(): void {
    // Carregar exemplo
    if (this.loadExample) {
      this.loadExample.addEventListener('click', (e) => {
        e.preventDefault();
        this.loadExampleScenario();
      });
    }

    // Mudança de sessão
    if (this.sessionSelect) {
      this.sessionSelect.addEventListener('change', (e) => {
        const target = e.target as HTMLSelectElement;
        this.currentSession = target.value as BDDSessionLevel;
        this.updateSessionInfo();
      });
    }

    // Validação
    if (this.btnValidate) {
      this.btnValidate.addEventListener('click', () => {
        this.validateScenario();
      });
    }
  }

  /**
   * Aguarda os módulos BDD estarem disponíveis
   */
  private waitForBDDModules(): void {
    if (typeof window.BDDSessions === 'undefined') {
      setTimeout(() => this.waitForBDDModules(), 100);
      return;
    }
    this.updateSessionInfo();
  }

  /**
   * Atualiza as informações da sessão selecionada
   */
  private updateSessionInfo(): void {
    if (!this.sessionInfo || !this.sessionTips || !window.BDDSessions) {
      return;
    }

    try {
      const session = window.BDDSessions.getSession(this.currentSession);
      if (!session) return;

      this.sessionInfo.innerHTML = `<strong>${session.name}</strong><br>${session.description}`;

      let tipsHtml = '<h4>Dicas para este nível:</h4><ul>';
      if (Array.isArray(session.tips)) {
        session.tips.forEach((tip: string) => {
          tipsHtml += `<li>${tip}</li>`;
        });
      }
      tipsHtml += '</ul>';
      this.sessionTips.innerHTML = tipsHtml;
    } catch (error) {
      console.error('Erro ao atualizar informações da sessão:', error);
    }
  }

  /**
   * Carrega exemplo de cenário
   */
  private loadExampleScenario(): void {
    if (!this.gherkinInput) return;

    const example = EXAMPLES[this.currentSession] || EXAMPLES.basico;
    this.gherkinInput.value = example;
    this.gherkinInput.focus();
  }

  /**
   * Valida o cenário Gherkin
   */
  private validateScenario(): void {
    if (!this.gherkinInput || !this.resultsContainer) return;

    const gherkinText = this.gherkinInput.value.trim();

    // Validação básica
    if (!gherkinText) {
      this.resultsContainer.innerHTML = `
        <div class="empty-state">
          <p>Por favor, digite um cenário Gherkin antes de validar.</p>
        </div>
      `;
      return;
    }

    // Verifica se os módulos BDD estão disponíveis
    if (
      typeof window.BDDParser === 'undefined' ||
      typeof window.BDDValidator === 'undefined' ||
      typeof window.BDDScore === 'undefined' ||
      typeof window.BDDFeedback === 'undefined'
    ) {
      this.resultsContainer.innerHTML = `
        <div class="error-item">
          <strong>Erro:</strong>
          <p>Módulos BDD não carregados. Recarregue a página.</p>
        </div>
      `;
      return;
    }

    try {
      // 1. Parse
      const parsed: ParsedGherkin = window.BDDParser.parse(gherkinText);

      // 2. Validação
      const validation: BDDValidation = window.BDDValidator.validate(
        parsed,
        this.currentSession
      );

      // 3. Score
      const score: BDDScore = window.BDDScore.calculate(validation, this.currentSession);

      // 4. Feedback
      const feedback: BDDFeedback = window.BDDFeedback.generate(validation, score);

      // 5. Renderização
      this.renderResults(validation, score, feedback);
    } catch (error) {
      console.error('Erro ao processar cenário Gherkin:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido. Verifique a sintaxe do seu cenário Gherkin.';
      this.resultsContainer.innerHTML = `
        <div class="error-item">
          <strong>Erro ao processar:</strong>
          <p>${errorMessage}</p>
        </div>
      `;
    }
  }

  /**
   * Renderiza os resultados da validação
   */
  private renderResults(
    validation: BDDValidation,
    score: BDDScore,
    feedback: BDDFeedback
  ): void {
    if (!this.resultsContainer) return;

    let html = '';

    // Badge
    if (validation?.valid) {
      html += '<span class="valid-badge">✓ Válido</span>';
    } else {
      html += '<span class="invalid-badge">✗ Inválido</span>';
    }

    // Score
    if (score) {
      html += `
        <div class="score-display">
          <div>
            <div class="score-value">${score.score ?? 0}</div>
            <div class="score-level">${score.level ?? 'N/A'}</div>
          </div>
        </div>
      `;

      // Breakdown
      if (score.breakdown && typeof score.breakdown === 'object') {
        html += '<div class="score-breakdown">';
        Object.entries(score.breakdown).forEach(([key, value]) => {
          if (value?.total > 0) {
            html += `
              <div class="breakdown-item">
                <strong>${key.charAt(0).toUpperCase() + key.slice(1)}</strong>
                <span>${value.score ?? 0}/${value.total} (${value.percentage ?? 0}%)</span>
              </div>
            `;
          }
        });
        html += '</div>';
      }
    }

    // Erros
    if (validation?.errors?.length > 0) {
      html += '<div class="errors-list"><h3>Erros Encontrados:</h3>';
      validation.errors.forEach((error) => {
        html += `
          <div class="error-item">
            <strong>${error.rule ?? 'Regra não especificada'}</strong>
            <p>${error.message ?? 'Mensagem não disponível'}</p>
          </div>
        `;
      });
      html += '</div>';
    }

    // Sugestões
    if (feedback?.suggestions && feedback.suggestions.length > 0) {
      html += '<div class="suggestions-list"><h3>💡 Sugestões de Melhoria:</h3>';
      feedback.suggestions.forEach((suggestion) => {
        html += `<div class="suggestion-item">${suggestion}</div>`;
      });
      html += '</div>';
    }

    // Explicações
    if (feedback?.explanations && feedback.explanations.length > 0) {
      html += '<div class="explanations-list"><h3>📖 Explicações:</h3>';
      feedback.explanations.forEach((explanation) => {
        html += `
          <div class="explanation-item">
            <h4>${explanation.title ?? 'Conceito'}</h4>
            <p>${explanation.content ?? 'Explicação não disponível'}</p>
          </div>
        `;
      });
      html += '</div>';
    }

    // Feedback geral
    if (feedback?.general) {
      html += `
        <div class="general-feedback">
          <h3>${feedback.general.title ?? 'Feedback'}</h3>
          <p>${feedback.general.content ?? 'Feedback não disponível'}</p>
        </div>
      `;
    }

    // Mensagem padrão se vazio
    if (html === '') {
      html = '<div class="empty-state"><p>Nenhum resultado disponível.</p></div>';
    }

    this.resultsContainer.innerHTML = html;
  }
}
