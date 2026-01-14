/**
 * BDD Score - Cálculo de score e níveis
 * Calcula a pontuação baseada nas validações
 */

const BDDScore = (() => {
  'use strict';

  // Pesos para cada categoria
  const WEIGHTS = {
    estrutura: 0.30,    // 30%
    semântica: 0.30,    // 30%
    linguagem: 0.20,    // 20%
    avançado: 0.20      // 20%
  };

  /**
   * Calcula o score baseado nos resultados da validação
   */
  function calculate(validationResults, session = 'basico') {
    const scores = {
      estrutura: 0,
      semântica: 0,
      linguagem: 0,
      avançado: 0
    };

    const totals = {
      estrutura: 0,
      semântica: 0,
      linguagem: 0,
      avançado: 0
    };

    // Contar regras por categoria
    [...validationResults.passedRules, ...validationResults.failedRules].forEach(rule => {
      const category = rule.category;
      if (category === 'estrutura') {
        totals.estrutura++;
        if (rule.valid) scores.estrutura++;
      } else if (category === 'semântica') {
        totals.semântica++;
        if (rule.valid) scores.semântica++;
      } else if (category === 'linguagem') {
        totals.linguagem++;
        if (rule.valid) scores.linguagem++;
      } else if (category === 'avançado') {
        totals.avançado++;
        if (rule.valid) scores.avançado++;
      }
    });

    // Calcular percentuais por categoria
    const percentages = {
      estrutura: totals.estrutura > 0 ? (scores.estrutura / totals.estrutura) * 100 : 100,
      semântica: totals.semântica > 0 ? (scores.semântica / totals.semântica) * 100 : 100,
      linguagem: totals.linguagem > 0 ? (scores.linguagem / totals.linguagem) * 100 : 100,
      avançado: totals.avançado > 0 ? (scores.avançado / totals.avançado) * 100 : 100
    };

    // Ajustar pesos baseado na sessão
    const adjustedWeights = getAdjustedWeights(session);

    // Calcular score final ponderado
    let finalScore = 0;
    finalScore += percentages.estrutura * adjustedWeights.estrutura;
    finalScore += percentages.semântica * adjustedWeights.semântica;
    finalScore += percentages.linguagem * adjustedWeights.linguagem;
    finalScore += percentages.avançado * adjustedWeights.avançado;

    finalScore = Math.round(finalScore);

    // Determinar nível
    const level = getLevel(finalScore);

    return {
      score: finalScore,
      level: level,
      breakdown: {
        estrutura: {
          score: scores.estrutura,
          total: totals.estrutura,
          percentage: Math.round(percentages.estrutura)
        },
        semântica: {
          score: scores.semântica,
          total: totals.semântica,
          percentage: Math.round(percentages.semântica)
        },
        linguagem: {
          score: scores.linguagem,
          total: totals.linguagem,
          percentage: Math.round(percentages.linguagem)
        },
        avançado: {
          score: scores.avançado,
          total: totals.avançado,
          percentage: Math.round(percentages.avançado)
        }
      }
    };
  }

  /**
   * Ajusta os pesos baseado na sessão
   */
  function getAdjustedWeights(session) {
    const sessions = {
      basico: {
        estrutura: 1.0,
        semântica: 0.0,
        linguagem: 0.0,
        avançado: 0.0
      },
      intermediario: {
        estrutura: 0.5,
        semântica: 0.5,
        linguagem: 0.0,
        avançado: 0.0
      },
      avancado: {
        estrutura: 0.3,
        semântica: 0.3,
        linguagem: 0.4,
        avançado: 0.0
      },
      especialista: {
        estrutura: WEIGHTS.estrutura,
        semântica: WEIGHTS.semântica,
        linguagem: WEIGHTS.linguagem,
        avançado: WEIGHTS.avançado
      }
    };

    return sessions[session] || sessions.basico;
  }

  /**
   * Determina o nível baseado no score
   */
  function getLevel(score) {
    if (score >= 90) return 'Especialista';
    if (score >= 75) return 'Avançado';
    if (score >= 60) return 'Intermediário';
    if (score >= 40) return 'Básico';
    return 'Iniciante';
  }

  return {
    calculate
  };
})();
