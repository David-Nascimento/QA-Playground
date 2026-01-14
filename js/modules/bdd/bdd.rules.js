/**
 * BDD Rules - Definição de regras de validação
 * Centraliza todas as regras de validação do BDD
 */

const BDDRules = (() => {
  'use strict';

  // Termos técnicos proibidos
  const TECHNICAL_TERMS = [
    'api', 'banco', 'database', 'db', 'status', 'método', 'função', 'function',
    'endpoint', 'request', 'response', 'json', 'xml', 'http', 'https', 'rest',
    'sql', 'query', 'select', 'insert', 'update', 'delete', 'truncate',
    'variable', 'variável', 'array', 'object', 'class', 'classe'
  ];

  // Termos de UI proibidos
  const UI_TERMS = [
    'botão', 'button', 'tela', 'screen', 'página', 'page', 'campo', 'field',
    'input', 'textarea', 'select', 'checkbox', 'radio', 'link', 'menu',
    'dropdown', 'modal', 'dialog', 'popup', 'formulário', 'form'
  ];

  /**
   * Verifica se um texto contém termos proibidos
   */
  function containsForbiddenTerms(text, terms) {
    const lowerText = text.toLowerCase();
    return terms.some(term => lowerText.includes(term));
  }

  /**
   * Verifica se Given descreve um estado (não ação)
   */
  function isGivenState(text) {
    const lower = text.toLowerCase();
    const actionIndicators = [
      'clicar', 'click', 'preencher', 'fill', 'selecionar', 'select',
      'enviar', 'send', 'submeter', 'submit', 'navegar', 'navigate',
      'abrir', 'open', 'fechar', 'close', 'inserir', 'insert'
    ];
    return !actionIndicators.some(action => lower.includes(action));
  }

  /**
   * Verifica se When descreve uma ação
   */
  function isWhenAction(text) {
    const lower = text.toLowerCase();
    const actionIndicators = [
      'clicar', 'click', 'preencher', 'fill', 'selecionar', 'select',
      'enviar', 'send', 'submeter', 'submit', 'navegar', 'navigate',
      'abrir', 'open', 'fechar', 'close', 'inserir', 'insert',
      'realizar', 'perform', 'executar', 'execute', 'fazer', 'do'
    ];
    return actionIndicators.some(action => lower.includes(action));
  }

  /**
   * Verifica se Then descreve um resultado observável
   */
  function isThenObservable(text) {
    const lower = text.toLowerCase();
    const observableIndicators = [
      'deve', 'should', 'deveria', 'aparecer', 'appear', 'ser exibido',
      'ser mostrado', 'ser visível', 'visible', 'conter', 'contain',
      'mostrar', 'show', 'exibir', 'display', 'ver', 'see', 'visualizar',
      'estar presente', 'present', 'existir', 'exist'
    ];
    return observableIndicators.some(indicator => lower.includes(indicator));
  }

  /**
   * Regras de estrutura
   */
  const structureRules = {
    hasFeature: (parsed) => {
      return {
        id: 'hasFeature',
        valid: !!parsed.feature,
        message: parsed.feature ? null : 'Deve existir uma Feature',
        category: 'estrutura'
      };
    },

    hasScenario: (parsed) => {
      const hasScenario = parsed.scenarios.length > 0 || 
                         parsed.rules.some(r => r.scenarios.length > 0);
      return {
        id: 'hasScenario',
        valid: hasScenario,
        message: hasScenario ? null : 'Deve existir pelo menos um Scenario ou Scenario Outline',
        category: 'estrutura'
      };
    },

    hasThen: (parsed) => {
      const allScenarios = [
        ...parsed.scenarios,
        ...parsed.rules.flatMap(r => r.scenarios)
      ];
      
      const scenariosWithoutThen = allScenarios.filter(scenario => {
        return !scenario.steps.some(step => step.keyword === 'then');
      });

      if (scenariosWithoutThen.length === 0) {
        return {
          id: 'hasThen',
          valid: true,
          message: null,
          category: 'estrutura'
        };
      }

      return {
        id: 'hasThen',
        valid: false,
        message: `Cenário(s) sem Then: ${scenariosWithoutThen.map(s => s.title || 'Sem título').join(', ')}`,
        category: 'estrutura'
      };
    },

    correctOrder: (parsed) => {
      const allScenarios = [
        ...parsed.scenarios,
        ...parsed.rules.flatMap(r => r.scenarios)
      ];

      const errors = [];
      allScenarios.forEach((scenario, idx) => {
        let lastKeyword = null;
        scenario.steps.forEach((step, stepIdx) => {
          const keyword = step.keyword;
          if (lastKeyword === 'then' && (keyword === 'given' || keyword === 'when')) {
            errors.push({
              scenario: scenario.title || `Cenário ${idx + 1}`,
              step: stepIdx + 1,
              message: 'Ordem incorreta: Then não pode vir antes de Given/When'
            });
          }
          if (lastKeyword === 'when' && keyword === 'given') {
            errors.push({
              scenario: scenario.title || `Cenário ${idx + 1}`,
              step: stepIdx + 1,
              message: 'Ordem incorreta: When não pode vir antes de Given'
            });
          }
          lastKeyword = keyword;
        });
      });

      return {
        id: 'correctOrder',
        valid: errors.length === 0,
        message: errors.length > 0 ? 
          errors.map(e => `${e.scenario}: ${e.message}`).join('; ') : null,
        category: 'estrutura',
        details: errors
      };
    },

    singleWhen: (parsed) => {
      const allScenarios = [
        ...parsed.scenarios,
        ...parsed.rules.flatMap(r => r.scenarios)
      ];

      const errors = [];
      allScenarios.forEach((scenario, idx) => {
        const whenCount = scenario.steps.filter(s => s.keyword === 'when').length;
        if (whenCount > 1) {
          errors.push({
            scenario: scenario.title || `Cenário ${idx + 1}`,
            count: whenCount,
            message: `Apenas 1 When por cenário (encontrado: ${whenCount})`
          });
        }
      });

      return {
        id: 'singleWhen',
        valid: errors.length === 0,
        message: errors.length > 0 ? 
          errors.map(e => `${e.scenario}: ${e.message}`).join('; ') : null,
        category: 'estrutura',
        details: errors
      };
    }
  };

  /**
   * Regras de semântica
   */
  const semanticsRules = {
    givenIsState: (parsed) => {
      const allScenarios = [
        ...parsed.scenarios,
        ...parsed.rules.flatMap(r => r.scenarios)
      ];

      const errors = [];
      allScenarios.forEach((scenario, idx) => {
        scenario.steps.forEach((step, stepIdx) => {
          if (step.keyword === 'given' && !isGivenState(step.text)) {
            errors.push({
              scenario: scenario.title || `Cenário ${idx + 1}`,
              step: stepIdx + 1,
              text: step.text,
              message: 'Given descreve ação ao invés de estado'
            });
          }
        });
      });

      if (parsed.background) {
        parsed.background.steps.forEach((step, stepIdx) => {
          if (step.keyword === 'given' && !isGivenState(step.text)) {
            errors.push({
              scenario: 'Background',
              step: stepIdx + 1,
              text: step.text,
              message: 'Given descreve ação ao invés de estado'
            });
          }
        });
      }

      return {
        id: 'givenIsState',
        valid: errors.length === 0,
        message: errors.length > 0 ? 
          errors.map(e => `${e.scenario} (step ${e.step}): ${e.message}`).join('; ') : null,
        category: 'semântica',
        details: errors
      };
    },

    whenIsAction: (parsed) => {
      const allScenarios = [
        ...parsed.scenarios,
        ...parsed.rules.flatMap(r => r.scenarios)
      ];

      const errors = [];
      allScenarios.forEach((scenario, idx) => {
        scenario.steps.forEach((step, stepIdx) => {
          if (step.keyword === 'when' && !isWhenAction(step.text)) {
            errors.push({
              scenario: scenario.title || `Cenário ${idx + 1}`,
              step: stepIdx + 1,
              text: step.text,
              message: 'When não descreve uma ação clara'
            });
          }
        });
      });

      return {
        id: 'whenIsAction',
        valid: errors.length === 0,
        message: errors.length > 0 ? 
          errors.map(e => `${e.scenario} (step ${e.step}): ${e.message}`).join('; ') : null,
        category: 'semântica',
        details: errors
      };
    },

    thenIsObservable: (parsed) => {
      const allScenarios = [
        ...parsed.scenarios,
        ...parsed.rules.flatMap(r => r.scenarios)
      ];

      const errors = [];
      allScenarios.forEach((scenario, idx) => {
        scenario.steps.forEach((step, stepIdx) => {
          if (step.keyword === 'then' && !isThenObservable(step.text)) {
            errors.push({
              scenario: scenario.title || `Cenário ${idx + 1}`,
              step: stepIdx + 1,
              text: step.text,
              message: 'Then não descreve um resultado observável'
            });
          }
        });
      });

      return {
        id: 'thenIsObservable',
        valid: errors.length === 0,
        message: errors.length > 0 ? 
          errors.map(e => `${e.scenario} (step ${e.step}): ${e.message}`).join('; ') : null,
        category: 'semântica',
        details: errors
      };
    }
  };

  /**
   * Regras de linguagem
   */
  const languageRules = {
    noTechnicalTerms: (parsed) => {
      const allScenarios = [
        ...parsed.scenarios,
        ...parsed.rules.flatMap(r => r.scenarios)
      ];

      const errors = [];
      const checkText = (text, context) => {
        if (containsForbiddenTerms(text, TECHNICAL_TERMS)) {
          const found = TECHNICAL_TERMS.find(term => text.toLowerCase().includes(term));
          errors.push({
            context,
            text,
            term: found,
            message: `Termo técnico proibido: "${found}"`
          });
        }
      };

      if (parsed.feature) {
        checkText(parsed.feature.title, 'Feature');
        parsed.feature.description.forEach(desc => checkText(desc, 'Feature'));
      }

      allScenarios.forEach((scenario, idx) => {
        checkText(scenario.title, `Cenário: ${scenario.title || idx + 1}`);
        scenario.steps.forEach(step => {
          checkText(step.text, `Step: ${step.text}`);
        });
      });

      if (parsed.background) {
        parsed.background.steps.forEach(step => {
          checkText(step.text, `Background: ${step.text}`);
        });
      }

      return {
        id: 'noTechnicalTerms',
        valid: errors.length === 0,
        message: errors.length > 0 ? 
          errors.map(e => `${e.context}: ${e.message}`).join('; ') : null,
        category: 'linguagem',
        details: errors
      };
    },

    noUITerms: (parsed) => {
      const allScenarios = [
        ...parsed.scenarios,
        ...parsed.rules.flatMap(r => r.scenarios)
      ];

      const errors = [];
      const checkText = (text, context) => {
        if (containsForbiddenTerms(text, UI_TERMS)) {
          const found = UI_TERMS.find(term => text.toLowerCase().includes(term));
          errors.push({
            context,
            text,
            term: found,
            message: `Termo de UI proibido: "${found}"`
          });
        }
      };

      if (parsed.feature) {
        checkText(parsed.feature.title, 'Feature');
        parsed.feature.description.forEach(desc => checkText(desc, 'Feature'));
      }

      allScenarios.forEach((scenario, idx) => {
        checkText(scenario.title, `Cenário: ${scenario.title || idx + 1}`);
        scenario.steps.forEach(step => {
          checkText(step.text, `Step: ${step.text}`);
        });
      });

      if (parsed.background) {
        parsed.background.steps.forEach(step => {
          checkText(step.text, `Background: ${step.text}`);
        });
      }

      return {
        id: 'noUITerms',
        valid: errors.length === 0,
        message: errors.length > 0 ? 
          errors.map(e => `${e.context}: ${e.message}`).join('; ') : null,
        category: 'linguagem',
        details: errors
      };
    }
  };

  /**
   * Regras avançadas
   */
  const advancedRules = {
    backgroundOnlyGiven: (parsed) => {
      if (!parsed.background) {
        return {
          id: 'backgroundOnlyGiven',
          valid: true,
          message: null,
          category: 'avançado'
        };
      }

      const hasNonGiven = parsed.background.steps.some(step => step.keyword !== 'given');
      return {
        id: 'backgroundOnlyGiven',
        valid: !hasNonGiven,
        message: hasNonGiven ? 'Background deve conter apenas Given' : null,
        category: 'avançado'
      };
    },

    scenarioOutlineHasExamples: (parsed) => {
      const allScenarios = [
        ...parsed.scenarios,
        ...parsed.rules.flatMap(r => r.scenarios)
      ];

      const outlines = allScenarios.filter(s => s.type === 'outline');
      const errors = [];

      outlines.forEach((outline, idx) => {
        if (!outline.examples || !outline.examples.headers || outline.examples.headers.length === 0) {
          errors.push({
            scenario: outline.title || `Scenario Outline ${idx + 1}`,
            message: 'Scenario Outline deve ter Examples'
          });
        }
      });

      return {
        id: 'scenarioOutlineHasExamples',
        valid: errors.length === 0,
        message: errors.length > 0 ? 
          errors.map(e => `${e.scenario}: ${e.message}`).join('; ') : null,
        category: 'avançado',
        details: errors
      };
    },

    parametersInExamples: (parsed) => {
      const allScenarios = [
        ...parsed.scenarios,
        ...parsed.rules.flatMap(r => r.scenarios)
      ];

      const outlines = allScenarios.filter(s => s.type === 'outline');
      const errors = [];

      outlines.forEach((outline, idx) => {
        if (!outline.examples) return;

        // Coletar todos os parâmetros usados nos steps
        const usedParams = new Set();
        outline.steps.forEach(step => {
          step.parameters.forEach(param => usedParams.add(param));
        });

        // Verificar se todos os parâmetros estão nos headers dos exemplos
        const exampleHeaders = outline.examples.headers.map(h => `<${h}>`);
        const missingParams = Array.from(usedParams).filter(param => 
          !exampleHeaders.some(header => header.toLowerCase() === param.toLowerCase())
        );

        if (missingParams.length > 0) {
          errors.push({
            scenario: outline.title || `Scenario Outline ${idx + 1}`,
            params: missingParams,
            message: `Parâmetros não encontrados nos Examples: ${missingParams.join(', ')}`
          });
        }
      });

      return {
        id: 'parametersInExamples',
        valid: errors.length === 0,
        message: errors.length > 0 ? 
          errors.map(e => `${e.scenario}: ${e.message}`).join('; ') : null,
        category: 'avançado',
        details: errors
      };
    },

    ruleDescribesBusinessRule: (parsed) => {
      if (parsed.rules.length === 0) {
        return {
          id: 'ruleDescribesBusinessRule',
          valid: true,
          message: null,
          category: 'avançado'
        };
      }

      // Verifica se Rule tem título descritivo (não vazio)
      const emptyRules = parsed.rules.filter(r => !r.title || r.title.trim().length === 0);
      
      return {
        id: 'ruleDescribesBusinessRule',
        valid: emptyRules.length === 0,
        message: emptyRules.length > 0 ? 
          'Rule deve ter um título que descreva a regra de negócio' : null,
        category: 'avançado'
      };
    }
  };

  return {
    structureRules,
    semanticsRules,
    languageRules,
    advancedRules,
    TECHNICAL_TERMS,
    UI_TERMS
  };
})();
