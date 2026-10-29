/**
 * BDD Sessions - Sistema de sessões e níveis
 * Gerencia as diferentes sessões de aprendizado
 */

const BDDSessions = (() => {
  'use strict';

  const SESSIONS = {
    basico: {
      id: 'basico',
      name: 'Básico',
      description: 'Foco em estrutura básica: Feature, Scenario e ordem Given-When-Then',
      icon: '📚',
      rules: {
        structure: true,
        semantics: false,
        language: false,
        advanced: false
      },
      tips: [
        'Comece sempre com Feature: descrevendo a funcionalidade',
        'Todo cenário precisa de pelo menos um Given, um When e um Then',
        'Mantenha a ordem: Given (estado) → When (ação) → Then (resultado)',
        'Use apenas um When por cenário'
      ]
    },
    intermediario: {
      id: 'intermediario',
      name: 'Intermediário',
      description: 'Estrutura + Semântica: validação de significado dos steps',
      icon: '📖',
      rules: {
        structure: true,
        semantics: true,
        language: false,
        advanced: false
      },
      tips: [
        'Given deve descrever um estado, não uma ação',
        'When deve descrever uma ação clara e específica',
        'Then deve descrever um resultado observável e verificável',
        'Evite misturar ações em Given ou resultados em When'
      ]
    },
    avancado: {
      id: 'avancado',
      name: 'Avançado',
      description: 'Estrutura + Semântica + Linguagem: uso correto da linguagem de negócio',
      icon: '🎓',
      rules: {
        structure: true,
        semantics: true,
        language: true,
        advanced: false
      },
      tips: [
        'Use linguagem de negócio, não termos técnicos',
        'Evite mencionar elementos de interface (botões, campos, telas)',
        'Foque no comportamento, não na implementação',
        'Escreva para que stakeholders não técnicos entendam'
      ]
    },
    especialista: {
      id: 'especialista',
      name: 'Especialista',
      description: 'Todas as validações: estrutura, semântica, linguagem e modelagem avançada',
      icon: '🏆',
      rules: {
        structure: true,
        semantics: true,
        language: true,
        advanced: true
      },
      tips: [
        'Use Background para pré-condições comuns (apenas Given)',
        'Scenario Outline para testar múltiplos dados com Examples',
        'Rule para agrupar cenários de uma mesma regra de negócio',
        'Garanta que todos os parâmetros <param> estejam nos Examples'
      ]
    }
  };

  /**
   * Retorna informações de uma sessão
   */
  function getSession(sessionId) {
    return SESSIONS[sessionId] || SESSIONS.basico;
  }

  /**
   * Retorna todas as sessões
   */
  function getAllSessions() {
    return Object.values(SESSIONS);
  }

  /**
   * Retorna a sessão padrão
   */
  function getDefaultSession() {
    return SESSIONS.basico;
  }

  /**
   * Verifica se uma sessão existe
   */
  function sessionExists(sessionId) {
    return !!SESSIONS[sessionId];
  }

  /**
   * Retorna a próxima sessão após a atual
   */
  function getNextSession(currentSessionId) {
    const order = ['basico', 'intermediario', 'avancado', 'especialista'];
    const currentIndex = order.indexOf(currentSessionId);
    if (currentIndex === -1 || currentIndex === order.length - 1) {
      return null;
    }
    return SESSIONS[order[currentIndex + 1]];
  }

  /**
   * Retorna a sessão anterior à atual
   */
  function getPreviousSession(currentSessionId) {
    const order = ['basico', 'intermediario', 'avancado', 'especialista'];
    const currentIndex = order.indexOf(currentSessionId);
    if (currentIndex <= 0) {
      return null;
    }
    return SESSIONS[order[currentIndex - 1]];
  }

  return {
    getSession,
    getAllSessions,
    getDefaultSession,
    sessionExists,
    getNextSession,
    getPreviousSession
  };
})();
