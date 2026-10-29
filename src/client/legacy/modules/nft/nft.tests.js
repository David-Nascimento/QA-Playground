// ========================================
// NFT Playground - Implementação dos Testes
// ========================================

import { TEST_TYPES } from './nft.config.js';

export async function runPerformanceTest(params, elements, logFn, displayMetricsFn) {
  const { elements: count, latency } = params;
  
  logFn('info', `Renderizando ${count} elementos com latência de ${latency}ms...`);
  
  const renderStartTime = performance.now();
  await simulateLatency(latency);
  
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'test-element';
    el.textContent = `Elemento ${i + 1}`;
    elements.visualArea.appendChild(el);
    
    if (i % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  const renderEndTime = performance.now();
  const renderDuration = ((renderEndTime - renderStartTime) / 1000).toFixed(2);
  displayMetricsFn([
    { label: 'Elementos Renderizados', value: count },
    { label: 'Latência Simulada', value: latency + 'ms' },
    { label: 'Tempo de Renderização', value: renderDuration + 's' }
  ]);
}

export async function runLoadTest(params, elements, logFn, displayMetricsFn) {
  const { count, size } = params;
  const sizeMap = { small: '8px', medium: '12px', large: '16px' };
  
  logFn('info', `Carregando ${count} elementos de tamanho ${size}...`);
  
  elements.visualArea.style.fontSize = sizeMap[size];
  
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'test-element';
    el.textContent = `#${i + 1}`;
    elements.visualArea.appendChild(el);
    
    if (i % 20 === 0) {
      await new Promise(resolve => setTimeout(resolve, 5));
    }
  }

  displayMetricsFn([
    { label: 'Total de Elementos', value: count },
    { label: 'Tamanho', value: size },
    { label: 'Memória Aproximada', value: (count * 0.5).toFixed(0) + ' KB' }
  ]);
}

export async function runStressTest(params, elements, logFn, displayMetricsFn) {
  const { iterations, actions } = params;
  
  logFn('info', `Executando ${iterations} iterações com ${actions} ações cada...`);
  
  let totalActions = 0;
  
  for (let i = 0; i < iterations; i++) {
    logFn('info', `Iteração ${i + 1}/${iterations}`);
    
    for (let j = 0; j < actions; j++) {
      const el = document.createElement('div');
      el.className = 'test-element';
      el.textContent = `Ação ${totalActions + 1}`;
      elements.visualArea.appendChild(el);
      totalActions++;
      
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    // Limpa parcialmente a cada 5 iterações
    if ((i + 1) % 5 === 0) {
      const children = elements.visualArea.children;
      const toRemove = Math.floor(children.length / 2);
      for (let k = 0; k < toRemove; k++) {
        if (children[0]) children[0].remove();
      }
    }
  }

  displayMetricsFn([
    { label: 'Iterações', value: iterations },
    { label: 'Ações Totais', value: totalActions },
    { label: 'Ações por Iteração', value: actions }
  ]);
}

export async function runResilienceTest(params, elements, logFn, displayMetricsFn) {
  const { latency, failures, attempts } = params;
  
  logFn('info', `Testando resiliência com ${latency}ms de latência e ${failures}% de falhas...`);
  
  let successCount = 0;
  let failureCount = 0;
  
  for (let i = 0; i < attempts; i++) {
    logFn('info', `Tentativa ${i + 1}/${attempts}...`);
    
    await simulateLatency(latency);
    
    const shouldFail = Math.random() * 100 < failures;
    
    if (shouldFail) {
      failureCount++;
      logFn('warning', `Falha simulada na tentativa ${i + 1}`);
      
      const el = document.createElement('div');
      el.className = 'test-element';
      el.style.background = '#dc3545';
      el.textContent = `Falha ${failureCount}`;
      elements.visualArea.appendChild(el);
    } else {
      successCount++;
      
      const el = document.createElement('div');
      el.className = 'test-element';
      el.style.background = '#28a745';
      el.textContent = `Sucesso ${successCount}`;
      elements.visualArea.appendChild(el);
    }
    
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  const successRate = ((successCount / attempts) * 100).toFixed(1);
  
  displayMetricsFn([
    { label: 'Tentativas', value: attempts },
    { label: 'Sucessos', value: successCount },
    { label: 'Falhas', value: failureCount },
    { label: 'Taxa de Sucesso', value: successRate + '%' }
  ]);
}

function simulateLatency(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function displayMetrics(metrics, metricsArea) {
  metricsArea.innerHTML = metrics.map(m => `
    <div class="metric-card">
      <div class="metric-label">${m.label}</div>
      <div class="metric-value">${m.value}</div>
    </div>
  `).join('');
}

export function clearResults(elements) {
  elements.visualArea.innerHTML = '';
  elements.metricsArea.innerHTML = '';
  elements.resultsArea.classList.add('hidden');
}
