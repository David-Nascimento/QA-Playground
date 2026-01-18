// ========================================
// NFT Playground - Arquivo Principal
// ========================================

import { LIMITS } from './nft.config.js';
import { createState } from './nft.state.js';
import { loadSessionState, saveSessionState, resetSession, updateSessionDisplay } from './nft.session.js';
import { log, clearLog } from './nft.logger.js';
import { createCooldownOverlay, checkCooldown, hideCooldown, startCooldown } from './nft.cooldown.js';
import { validateParams, canRunTest } from './nft.validation.js';
import { showTestConfig, getTestParams } from './nft.config-ui.js';
import { 
  runPerformanceTest, 
  runLoadTest, 
  runStressTest, 
  runResilienceTest,
  displayMetrics,
  clearResults
} from './nft.tests.js';
import { TEST_TYPES } from './nft.config.js';

(function() {
  'use strict';

  // Estado da Aplicação
  let state = createState();

  // Elementos DOM
  const elements = {
    sessionCount: document.getElementById('session-count'),
    sessionLimit: document.getElementById('session-limit'),
    resetSessionBtn: document.getElementById('reset-session-btn'),
    testTypeBtns: document.querySelectorAll('.test-type-btn'),
    configPanel: document.getElementById('test-config-panel'),
    configTitle: document.getElementById('test-config-title'),
    configContent: document.getElementById('test-config-content'),
    startTestBtn: document.getElementById('start-test-btn'),
    cancelTestBtn: document.getElementById('cancel-test-btn'),
    resultsArea: document.getElementById('test-results-area'),
    visualArea: document.getElementById('test-visual-area'),
    metricsArea: document.getElementById('test-metrics'),
    logArea: document.getElementById('test-log'),
    clearLogBtn: document.getElementById('clear-log-btn'),
    clearResultsBtn: document.getElementById('clear-results-btn'),
    cooldownOverlay: null
  };

  // Wrappers para funções que precisam do contexto
  const logFn = (type, message) => log(type, message, elements.logArea);
  const clearLogFn = () => clearLog(elements.logArea);
  const displayMetricsFn = (metrics) => displayMetrics(metrics, elements.metricsArea);
  const clearResultsFn = () => clearResults(elements);
  const checkCooldownFn = () => checkCooldown(state.cooldownEndTime, elements.cooldownOverlay);

  // Inicialização
  function init() {
    loadSessionState(state);
    updateSessionDisplay(state, elements, LIMITS.SESSION_MAX_TESTS);
    setupEventListeners();
    elements.cooldownOverlay = createCooldownOverlay();
    logFn('info', 'NFT Playground inicializado. Sessão ativa.');
  }

  // Função de reset de sessão
  function handleResetSession() {
    resetSession(state);
    updateSessionDisplay(state, elements, LIMITS.SESSION_MAX_TESTS);
    clearLogFn();
    clearResultsFn();
    logFn('info', 'Sessão NFT encerrada. Contadores reiniciados.');
  }

  // Execução de Testes
  async function runTest() {
    const check = canRunTest(state, LIMITS, checkCooldownFn, logFn);
    if (!check.allowed) {
      alert(check.message);
      return;
    }

    const params = getTestParams(state.currentTest);
    const validation = validateParams(state.currentTest, params);
    
    if (!validation.valid) {
      logFn('error', validation.message);
      alert(validation.message);
      return;
    }

    state.isRunning = true;
    state.sessionCount++;
    saveSessionState(state);
    updateSessionDisplay(state, elements, LIMITS.SESSION_MAX_TESTS);
    startCooldown(LIMITS.COOLDOWN_SECONDS, state, () => saveSessionState(state));

    elements.startTestBtn.disabled = true;
    elements.testTypeBtns.forEach(btn => btn.disabled = true);
    elements.resultsArea.classList.remove('hidden');
    elements.visualArea.innerHTML = '';
    elements.metricsArea.innerHTML = '';

    const startTime = performance.now();
    logFn('info', `Iniciando teste: ${state.currentTest}`);
    logFn('info', `Parâmetros: ${JSON.stringify(params)}`);

    try {
      switch(state.currentTest) {
        case TEST_TYPES.PERFORMANCE:
          await runPerformanceTest(params, elements, logFn, displayMetricsFn);
          break;
        case TEST_TYPES.LOAD:
          await runLoadTest(params, elements, logFn, displayMetricsFn);
          break;
        case TEST_TYPES.STRESS:
          await runStressTest(params, elements, logFn, displayMetricsFn);
          break;
        case TEST_TYPES.RESILIENCE:
          await runResilienceTest(params, elements, logFn, displayMetricsFn);
          break;
      }

      const endTime = performance.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      logFn('success', `Teste concluído com sucesso em ${duration}s`);
      state.lastTestTime = Date.now();
      saveSessionState(state);

    } catch (error) {
      logFn('error', `Falha durante execução: ${error.message}`);
    } finally {
      state.isRunning = false;
      elements.startTestBtn.disabled = false;
      elements.testTypeBtns.forEach(btn => btn.disabled = false);
    }
  }

  // Event Listeners
  function setupEventListeners() {
    // Reset de sessão
    if (elements.resetSessionBtn) {
      elements.resetSessionBtn.addEventListener('click', () => {
        if (confirm('Deseja realmente encerrar a sessão NFT? Todos os contadores serão reiniciados.')) {
          handleResetSession();
        }
      });
    }

    // Seleção de tipo de teste
    elements.testTypeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (state.isRunning) return;
        
        elements.testTypeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        showTestConfig(btn.dataset.test, elements, state);
      });
    });

    // Iniciar teste
    if (elements.startTestBtn) {
      elements.startTestBtn.addEventListener('click', runTest);
    }

    // Cancelar teste
    if (elements.cancelTestBtn) {
      elements.cancelTestBtn.addEventListener('click', () => {
        elements.configPanel.classList.add('hidden');
        elements.testTypeBtns.forEach(btn => btn.classList.remove('active'));
        state.currentTest = null;
      });
    }

    // Limpar log
    if (elements.clearLogBtn) {
      elements.clearLogBtn.addEventListener('click', clearLogFn);
    }

    // Limpar resultados
    if (elements.clearResultsBtn) {
      elements.clearResultsBtn.addEventListener('click', clearResultsFn);
    }
  }

  // Inicializar quando DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Verificar cooldown periodicamente
  setInterval(() => {
    if (state.cooldownEndTime > 0 && state.cooldownEndTime <= Date.now()) {
      hideCooldown(elements.cooldownOverlay);
    }
  }, 1000);
})();
