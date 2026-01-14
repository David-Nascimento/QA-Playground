/**
 * BDD Playground - Lógica de Validação de Cenários Gherkin
 * 
 * Este módulo gerencia a interface do BDD Playground, incluindo:
 * - Carregamento de exemplos por nível
 * - Validação de cenários Gherkin
 * - Exibição de resultados e feedback
 */

(() => {
  'use strict';

  // Elementos do DOM
  const gherkinInput = document.getElementById('gherkin-input');
  const btnValidate = document.getElementById('btn-validate');
  const sessionSelect = document.getElementById('session-select');
  const sessionInfo = document.getElementById('session-info');
  const sessionTips = document.getElementById('session-tips');
  const resultsContainer = document.getElementById('results-container');
  const loadExample = document.getElementById('load-example');

  // Verifica se os elementos essenciais existem
  if (!gherkinInput || !btnValidate || !sessionSelect) return;

  // Nível de validação atual (padrão: básico)
  let currentSession = 'basico';

  // Exemplos de cenários
  const examples = {
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
      Then os pontos devem permanecer ativos`
  };

  /**
   * Atualiza as informações da sessão selecionada
   * Exibe nome, descrição e dicas do nível atual
   */
  function updateSessionInfo() {
    if (!sessionInfo || !sessionTips || typeof BDDSessions === 'undefined') {
      return;
    }
    
    try {
      const session = BDDSessions.getSession(currentSession);
      if (!session) return;
      
      sessionInfo.innerHTML = `<strong>${session.name}</strong><br>${session.description}`;
      
      let tipsHtml = '<h4>Dicas para este nível:</h4><ul>';
      if (Array.isArray(session.tips)) {
        session.tips.forEach(tip => {
          tipsHtml += `<li>${tip}</li>`;
        });
      }
      tipsHtml += '</ul>';
      sessionTips.innerHTML = tipsHtml;
    } catch (error) {
      console.error('Erro ao atualizar informações da sessão:', error);
    }
  }

  /**
   * Carrega exemplo de cenário baseado no nível selecionado
   * Útil para entender a estrutura esperada em cada nível
   */
  if (loadExample) {
    loadExample.addEventListener('click', (e) => {
      e.preventDefault();
      const example = examples[currentSession] || examples.basico;
      gherkinInput.value = example;
      // Foca no textarea após carregar
      gherkinInput.focus();
    });
  }

  /**
   * Handler para mudança de nível de validação
   * Atualiza as informações e dicas exibidas
   */
  sessionSelect.addEventListener('change', (e) => {
    currentSession = e.target.value;
    updateSessionInfo();
  });

  /**
   * Handler para validação do cenário Gherkin
   * Processa o texto, valida e exibe resultados
   */
  btnValidate.addEventListener('click', () => {
    const gherkinText = gherkinInput.value.trim();
    
    // Validação básica: verifica se há conteúdo
    if (!gherkinText) {
      resultsContainer.innerHTML = `
        <div class="empty-state">
          <p>Por favor, digite um cenário Gherkin antes de validar.</p>
        </div>
      `;
      return;
    }

    // Verifica se os módulos BDD estão disponíveis
    if (typeof BDDParser === 'undefined' || 
        typeof BDDValidator === 'undefined' || 
        typeof BDDScore === 'undefined' || 
        typeof BDDFeedback === 'undefined') {
      resultsContainer.innerHTML = `
        <div class="error-item">
          <strong>Erro:</strong>
          <p>Módulos BDD não carregados. Recarregue a página.</p>
        </div>
      `;
      return;
    }

    try {
      // 1. Parse: Converte texto Gherkin em estrutura de dados
      const parsed = BDDParser.parse(gherkinText);
      
      // 2. Validação: Verifica regras conforme o nível selecionado
      const validation = BDDValidator.validate(parsed, currentSession);
      
      // 3. Score: Calcula pontuação baseada nas validações
      const score = BDDScore.calculate(validation, currentSession);
      
      // 4. Feedback: Gera sugestões e explicações educacionais
      const feedback = BDDFeedback.generate(validation, score);

      // 5. Renderização: Exibe resultados na interface
      renderResults(validation, score, feedback);
    } catch (error) {
      console.error('Erro ao processar cenário Gherkin:', error);
      resultsContainer.innerHTML = `
        <div class="error-item">
          <strong>Erro ao processar:</strong>
          <p>${error.message || 'Erro desconhecido. Verifique a sintaxe do seu cenário Gherkin.'}</p>
        </div>
      `;
    }
  });

  /**
   * Renderiza os resultados da validação na interface
   * Exibe badge, score, breakdown, erros, sugestões e explicações
   * 
   * @param {Object} validation - Resultado da validação
   * @param {Object} score - Pontuação calculada
   * @param {Object} feedback - Feedback educacional gerado
   */
  function renderResults(validation, score, feedback) {
    if (!resultsContainer) return;
    
    let html = '';

    // Badge de validação (indica se o cenário está válido)
    if (validation?.valid) {
      html += '<span class="valid-badge">✓ Válido</span>';
    } else {
      html += '<span class="invalid-badge">✗ Inválido</span>';
    }

    // Score: Exibe pontuação e nível alcançado
    if (score) {
      html += `
        <div class="score-display">
          <div>
            <div class="score-value">${score.score ?? 0}</div>
            <div class="score-level">${score.level ?? 'N/A'}</div>
          </div>
        </div>
      `;

      // Breakdown: Detalhamento da pontuação por categoria
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

    // Erros: Lista problemas encontrados na validação
    if (validation?.errors?.length > 0) {
      html += '<div class="errors-list"><h3>Erros Encontrados:</h3>';
      validation.errors.forEach(error => {
        html += `
          <div class="error-item">
            <strong>${error.rule ?? 'Regra não especificada'}</strong>
            <p>${error.message ?? 'Mensagem não disponível'}</p>
          </div>
        `;
      });
      html += '</div>';
    }

    // Sugestões: Recomendações para melhorar o cenário
    if (feedback?.suggestions?.length > 0) {
      html += '<div class="suggestions-list"><h3>💡 Sugestões de Melhoria:</h3>';
      feedback.suggestions.forEach(suggestion => {
        html += `<div class="suggestion-item">${suggestion}</div>`;
      });
      html += '</div>';
    }

    // Explicações: Contexto educacional sobre conceitos BDD
    if (feedback?.explanations?.length > 0) {
      html += '<div class="explanations-list"><h3>📖 Explicações:</h3>';
      feedback.explanations.forEach(explanation => {
        html += `
          <div class="explanation-item">
            <h4>${explanation.title ?? 'Conceito'}</h4>
            <p>${explanation.content ?? 'Explicação não disponível'}</p>
          </div>
        `;
      });
      html += '</div>';
    }

    // Feedback geral: Resumo e orientações finais
    if (feedback?.general) {
      html += `
        <div class="general-feedback">
          <h3>${feedback.general.title ?? 'Feedback'}</h3>
          <p>${feedback.general.content ?? 'Feedback não disponível'}</p>
        </div>
      `;
    }

    // Se não houver conteúdo, exibe mensagem padrão
    if (html === '') {
      html = '<div class="empty-state"><p>Nenhum resultado disponível.</p></div>';
    }

    resultsContainer.innerHTML = html;
  }

  /**
   * Inicialização do módulo
   * Aguarda o DOM estar pronto e os módulos BDD carregados
   */
  function init() {
    // Aguarda os módulos BDD estarem disponíveis
    if (typeof BDDSessions === 'undefined') {
      setTimeout(init, 100);
      return;
    }
    
    // Atualiza informações da sessão inicial
    updateSessionInfo();
  }

  // Inicializa quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // DOM já está pronto
    init();
  }
})();
