// ========================================
// NFT Playground - Interface de Configuração
// ========================================

import { LIMITS, TEST_TYPES } from './nft.config.js';

export function showTestConfig(testType, elements, state) {
  elements.configPanel.classList.remove('hidden');
  elements.configContent.innerHTML = '';

  let configHTML = '';

  switch(testType) {
    case TEST_TYPES.PERFORMANCE:
      elements.configTitle.textContent = 'Teste de Performance Percebida';
      configHTML = `
        <div class="config-input-group">
          <label>
            Número de Elementos:
            <input type="number" id="perf-elements" min="1" max="${LIMITS.MAX_ELEMENTS}" value="100">
            <span class="input-value" id="perf-elements-value">100</span>
          </label>
        </div>
        <div class="config-input-group">
          <label>
            Latência Simulada (ms):
            <input type="range" id="perf-latency" min="0" max="${LIMITS.MAX_LATENCY_MS}" step="100" value="500">
            <span class="input-value" id="perf-latency-value">500ms</span>
          </label>
        </div>
      `;
      break;
    case TEST_TYPES.LOAD:
      elements.configTitle.textContent = 'Teste de Carga de UI';
      configHTML = `
        <div class="config-input-group">
          <label>
            Quantidade de Elementos:
            <input type="number" id="load-count" min="1" max="${LIMITS.MAX_ELEMENTS}" value="50">
            <span class="input-value" id="load-count-value">50</span>
          </label>
        </div>
        <div class="config-input-group">
          <label>
            Tamanho dos Elementos:
            <select id="load-size">
              <option value="small">Pequeno</option>
              <option value="medium" selected>Médio</option>
              <option value="large">Grande</option>
            </select>
          </label>
        </div>
      `;
      break;
    case TEST_TYPES.STRESS:
      elements.configTitle.textContent = 'Teste de Stress de Interface';
      configHTML = `
        <div class="config-input-group">
          <label>
            Iterações:
            <input type="number" id="stress-iterations" min="1" max="${LIMITS.MAX_ACTIONS}" value="10">
            <span class="input-value" id="stress-iterations-value">10</span>
          </label>
        </div>
        <div class="config-input-group">
          <label>
            Ações por Iteração:
            <input type="number" id="stress-actions" min="1" max="20" value="5">
            <span class="input-value" id="stress-actions-value">5</span>
          </label>
        </div>
      `;
      break;
    case TEST_TYPES.RESILIENCE:
      elements.configTitle.textContent = 'Teste de Resiliência Front-end';
      configHTML = `
        <div class="config-input-group">
          <label>
            Latência Simulada (ms):
            <input type="range" id="res-latency" min="0" max="${LIMITS.MAX_LATENCY_MS}" step="100" value="1000">
            <span class="input-value" id="res-latency-value">1000ms</span>
          </label>
        </div>
        <div class="config-input-group">
          <label>
            Taxa de Falha Simulada (%):
            <input type="range" id="res-failures" min="0" max="50" step="5" value="10">
            <span class="input-value" id="res-failures-value">10%</span>
          </label>
        </div>
        <div class="config-input-group">
          <label>
            Tentativas:
            <input type="number" id="res-attempts" min="1" max="20" value="5">
            <span class="input-value" id="res-attempts-value">5</span>
          </label>
        </div>
      `;
      break;
  }

  elements.configContent.innerHTML = configHTML;
  
  // Adiciona listeners para atualizar valores em tempo real
  elements.configContent.querySelectorAll('input[type="range"]').forEach(input => {
    const valueSpan = document.getElementById(input.id + '-value');
    input.addEventListener('input', () => {
      if (input.id.includes('latency') || input.id.includes('res-latency')) {
        valueSpan.textContent = input.value + 'ms';
      } else if (input.id.includes('failures')) {
        valueSpan.textContent = input.value + '%';
      } else {
        valueSpan.textContent = input.value;
      }
    });
  });

  elements.configContent.querySelectorAll('input[type="number"]').forEach(input => {
    const valueSpan = document.getElementById(input.id + '-value');
    if (valueSpan) {
      input.addEventListener('input', () => {
        valueSpan.textContent = input.value;
      });
    }
  });

  state.currentTest = testType;
}

export function getTestParams(testType) {
  switch(testType) {
    case TEST_TYPES.PERFORMANCE:
      return {
        elements: Number.parseInt(document.getElementById('perf-elements').value, 10) || 100,
        latency: Number.parseInt(document.getElementById('perf-latency').value, 10) || 500
      };
    case TEST_TYPES.LOAD:
      return {
        count: Number.parseInt(document.getElementById('load-count').value, 10) || 50,
        size: document.getElementById('load-size').value || 'medium'
      };
    case TEST_TYPES.STRESS:
      return {
        iterations: Number.parseInt(document.getElementById('stress-iterations').value, 10) || 10,
        actions: Number.parseInt(document.getElementById('stress-actions').value, 10) || 5
      };
    case TEST_TYPES.RESILIENCE:
      return {
        latency: Number.parseInt(document.getElementById('res-latency').value, 10) || 1000,
        failures: Number.parseInt(document.getElementById('res-failures').value, 10) || 10,
        attempts: Number.parseInt(document.getElementById('res-attempts').value, 10) || 5
      };
    default:
      return {};
  }
}
