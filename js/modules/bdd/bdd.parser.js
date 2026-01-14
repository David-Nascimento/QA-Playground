/**
 * BDD Parser - Parser de sintaxe Gherkin
 * Extrai e estrutura elementos de um documento Gherkin
 */

const BDDParser = (() => {
  'use strict';

  /**
   * Remove comentários e linhas vazias
   */
  function cleanLines(text) {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'));
  }

  /**
   * Identifica o tipo de linha Gherkin
   */
  function getLineType(line) {
    const upper = line.toUpperCase();
    if (upper.startsWith('FEATURE:')) return 'feature';
    if (upper.startsWith('FEATURE')) return 'feature';
    if (upper.startsWith('BACKGROUND:')) return 'background';
    if (upper.startsWith('BACKGROUND')) return 'background';
    if (upper.startsWith('SCENARIO OUTLINE:')) return 'scenario_outline';
    if (upper.startsWith('SCENARIO OUTLINE')) return 'scenario_outline';
    if (upper.startsWith('SCENARIO:')) return 'scenario';
    if (upper.startsWith('SCENARIO')) return 'scenario';
    if (upper.startsWith('RULE:')) return 'rule';
    if (upper.startsWith('RULE')) return 'rule';
    if (upper.startsWith('EXAMPLES:')) return 'examples';
    if (upper.startsWith('EXAMPLES')) return 'examples';
    if (upper.startsWith('GIVEN')) return 'given';
    if (upper.startsWith('WHEN')) return 'when';
    if (upper.startsWith('THEN')) return 'then';
    if (upper.startsWith('AND')) return 'and';
    if (upper.startsWith('BUT')) return 'but';
    return 'text';
  }

  /**
   * Extrai o texto após a keyword
   */
  function extractText(line, keyword) {
    const index = line.toUpperCase().indexOf(keyword.toUpperCase());
    if (index === -1) return line;
    return line.substring(index + keyword.length).trim();
  }

  /**
   * Extrai parâmetros <param> de uma linha
   */
  function extractParameters(line) {
    const matches = line.match(/<[^>]+>/g);
    return matches || [];
  }

  /**
   * Parse principal
   */
  function parse(gherkinText) {
    const lines = cleanLines(gherkinText);
    const result = {
      feature: null,
      background: null,
      rules: [],
      scenarios: [],
      errors: []
    };

    let currentFeature = null;
    let currentBackground = null;
    let currentRule = null;
    let currentScenario = null;
    let currentExamples = null;
    let inExamples = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const type = getLineType(line);

      try {
        switch (type) {
          case 'feature':
            currentFeature = {
              title: extractText(line, 'Feature:') || extractText(line, 'Feature'),
              description: []
            };
            result.feature = currentFeature;
            break;

          case 'background':
            currentBackground = {
              steps: []
            };
            result.background = currentBackground;
            break;

          case 'rule':
            currentRule = {
              title: extractText(line, 'Rule:') || extractText(line, 'Rule'),
              scenarios: []
            };
            result.rules.push(currentRule);
            currentScenario = null;
            break;

          case 'scenario':
          case 'scenario_outline':
            currentScenario = {
              type: type === 'scenario_outline' ? 'outline' : 'scenario',
              title: extractText(line, 'Scenario:') || 
                     extractText(line, 'Scenario') ||
                     extractText(line, 'Scenario Outline:') ||
                     extractText(line, 'Scenario Outline'),
              steps: [],
              examples: null
            };
            inExamples = false;
            
            if (currentRule) {
              currentRule.scenarios.push(currentScenario);
            } else {
              result.scenarios.push(currentScenario);
            }
            break;

          case 'examples':
            if (currentScenario && currentScenario.type === 'outline') {
              currentExamples = {
                headers: [],
                rows: []
              };
              currentScenario.examples = currentExamples;
              inExamples = true;
            } else if (currentScenario) {
              // Examples sem Scenario Outline - tratar como erro ou ignorar
              result.errors.push({
                line: i + 1,
                message: 'Examples encontrado sem Scenario Outline'
              });
            }
            break;

          case 'given':
          case 'when':
          case 'then':
          case 'and':
          case 'but':
            // Se estamos em Examples, não processar como step
            if (inExamples && currentExamples) {
              // Se a linha contém |, é uma linha de tabela
              if (line.includes('|')) {
                if (currentExamples.headers.length === 0) {
                  currentExamples.headers = line.split('|').map(h => h.trim()).filter(h => h);
                } else {
                  const row = line.split('|').map(c => c.trim()).filter(c => c);
                  if (row.length > 0) {
                    currentExamples.rows.push(row);
                  }
                }
              }
              break;
            }

            // Step normal
            let lastKeyword = 'given';
            if (currentBackground && currentBackground.steps.length > 0) {
              lastKeyword = currentBackground.steps[currentBackground.steps.length - 1].keyword;
            } else if (currentScenario && currentScenario.steps.length > 0) {
              lastKeyword = currentScenario.steps[currentScenario.steps.length - 1].keyword;
            }

            const step = {
              keyword: type === 'and' || type === 'but' ? lastKeyword : type,
              text: extractText(line, type === 'and' || type === 'but' ? 
                (line.toUpperCase().startsWith('AND') ? 'And' : 'But') : 
                (type.charAt(0).toUpperCase() + type.slice(1))),
              parameters: extractParameters(line)
            };

            if (currentBackground) {
              currentBackground.steps.push(step);
            } else if (currentScenario) {
              currentScenario.steps.push(step);
            }
            break;

          case 'text':
            if (inExamples && currentExamples) {
              // Linha de tabela de exemplos
              if (line.includes('|')) {
                if (currentExamples.headers.length === 0) {
                  currentExamples.headers = line.split('|').map(h => h.trim()).filter(h => h);
                } else {
                  const row = line.split('|').map(c => c.trim()).filter(c => c);
                  if (row.length > 0) {
                    currentExamples.rows.push(row);
                  }
                }
              } else if (line.trim().length === 0) {
                // Linha vazia pode encerrar Examples
                inExamples = false;
              }
            } else if (currentFeature && !currentScenario && !currentBackground && !currentRule) {
              // Descrição da feature
              currentFeature.description.push(line);
            } else if (currentScenario && !inExamples) {
              // Descrição do cenário (não suportado oficialmente, mas pode existir)
            }
            break;
        }
      } catch (error) {
        result.errors.push({
          line: i + 1,
          message: `Erro ao processar linha: ${error.message}`
        });
      }
    }

    return result;
  }

  return {
    parse
  };
})();
