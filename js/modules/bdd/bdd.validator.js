/**
 * BDD Validator - Validação de cenários BDD
 * Aplica todas as regras de validação
 */

const BDDValidator = (() => {
  'use strict';

  /**
   * Valida um documento Gherkin usando as regras definidas
   */
  function validate(parsed, session = 'basico') {
    const results = {
      valid: true,
      errors: [],
      warnings: [],
      passedRules: [],
      failedRules: []
    };

    // Determinar quais regras aplicar baseado na sessão
    const rulesToApply = getRulesForSession(session);

    // Aplicar regras de estrutura
    if (rulesToApply.structure) {
      Object.values(BDDRules.structureRules).forEach(rule => {
        const result = rule(parsed);
        if (result.valid) {
          results.passedRules.push(result);
        } else {
          results.failedRules.push(result);
          results.errors.push({
            rule: result.id,
            category: result.category,
            message: result.message,
            details: result.details
          });
          results.valid = false;
        }
      });
    }

    // Aplicar regras de semântica
    if (rulesToApply.semantics) {
      Object.values(BDDRules.semanticsRules).forEach(rule => {
        const result = rule(parsed);
        if (result.valid) {
          results.passedRules.push(result);
        } else {
          results.failedRules.push(result);
          results.errors.push({
            rule: result.id,
            category: result.category,
            message: result.message,
            details: result.details
          });
          results.valid = false;
        }
      });
    }

    // Aplicar regras de linguagem
    if (rulesToApply.language) {
      Object.values(BDDRules.languageRules).forEach(rule => {
        const result = rule(parsed);
        if (result.valid) {
          results.passedRules.push(result);
        } else {
          results.failedRules.push(result);
          results.errors.push({
            rule: result.id,
            category: result.category,
            message: result.message,
            details: result.details
          });
          results.valid = false;
        }
      });
    }

    // Aplicar regras avançadas
    if (rulesToApply.advanced) {
      Object.values(BDDRules.advancedRules).forEach(rule => {
        const result = rule(parsed);
        if (result.valid) {
          results.passedRules.push(result);
        } else {
          results.failedRules.push(result);
          results.errors.push({
            rule: result.id,
            category: result.category,
            message: result.message,
            details: result.details
          });
          results.valid = false;
        }
      });
    }

    return results;
  }

  /**
   * Determina quais regras aplicar baseado na sessão
   */
  function getRulesForSession(session) {
    const sessions = {
      basico: {
        structure: true,
        semantics: false,
        language: false,
        advanced: false
      },
      intermediario: {
        structure: true,
        semantics: true,
        language: false,
        advanced: false
      },
      avancado: {
        structure: true,
        semantics: true,
        language: true,
        advanced: false
      },
      especialista: {
        structure: true,
        semantics: true,
        language: true,
        advanced: true
      }
    };

    return sessions[session] || sessions.basico;
  }

  return {
    validate
  };
})();
