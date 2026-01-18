// ========================================
// NFT Playground - Validação de Parâmetros
// ========================================

import { LIMITS, TEST_TYPES } from './nft.config.js';

export function validateParams(testType, params) {
  switch(testType) {
    case TEST_TYPES.PERFORMANCE:
      if (params.elements > LIMITS.MAX_ELEMENTS) {
        return { valid: false, message: `Parâmetro excede o limite permitido. Máximo de elementos: ${LIMITS.MAX_ELEMENTS}.` };
      }
      if (params.latency > LIMITS.MAX_LATENCY_MS) {
        return { valid: false, message: `Parâmetro excede o limite permitido. Máxima latência: ${LIMITS.MAX_LATENCY_MS}ms.` };
      }
      break;
    case TEST_TYPES.LOAD:
      if (params.count > LIMITS.MAX_ELEMENTS) {
        return { valid: false, message: `Parâmetro excede o limite permitido. Máximo de elementos: ${LIMITS.MAX_ELEMENTS}.` };
      }
      break;
    case TEST_TYPES.STRESS:
      if (params.iterations > LIMITS.MAX_ACTIONS) {
        return { valid: false, message: `Parâmetro excede o limite permitido. Máximo de ações: ${LIMITS.MAX_ACTIONS}.` };
      }
      break;
    case TEST_TYPES.RESILIENCE:
      if (params.failures > LIMITS.MAX_ACTIONS) {
        return { valid: false, message: `Parâmetro excede o limite permitido. Máximo de falhas simuladas: ${LIMITS.MAX_ACTIONS}.` };
      }
      if (params.latency > LIMITS.MAX_LATENCY_MS) {
        return { valid: false, message: `Parâmetro excede o limite permitido. Máxima latência: ${LIMITS.MAX_LATENCY_MS}ms.` };
      }
      break;
  }
  return { valid: true };
}

export function canRunTest(state, LIMITS, checkCooldownFn, logFn) {
  // Verifica limite de sessão
  if (state.sessionCount >= LIMITS.SESSION_MAX_TESTS) {
    logFn('warning', 'Limite de testes por sessão atingido. Reinicie a sessão para continuar.');
    return { allowed: false, message: 'Limite de testes por sessão atingido. Reinicie a sessão para continuar.' };
  }

  // Verifica se há teste em execução
  if (state.isRunning) {
    logFn('warning', 'Já existe um teste em execução. Aguarde a conclusão.');
    return { allowed: false, message: 'Já existe um teste em execução. Aguarde a conclusão.' };
  }

  // Verifica cooldown
  if (!checkCooldownFn()) {
    const remaining = Math.ceil((state.cooldownEndTime - Date.now()) / 1000);
    logFn('warning', `Cooldown ativo. Aguarde ${remaining} segundo(s) antes de iniciar um novo teste.`);
    return { allowed: false, message: `Cooldown ativo. Aguarde alguns segundos antes de iniciar um novo teste.` };
  }

  return { allowed: true };
}
