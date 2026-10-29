// ========================================
// NFT Playground - Gerenciamento de Sessão
// ========================================

const SESSION_STORAGE_KEY = 'nft-playground-session';

export function loadSessionState(state) {
  const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (saved) {
    try {
      const data = JSON.parse(saved);
      state.sessionCount = data.sessionCount || 0;
      state.lastTestTime = data.lastTestTime || 0;
      state.cooldownEndTime = data.cooldownEndTime || 0;
    } catch (e) {
      console.error('Erro ao carregar estado da sessão:', e);
    }
  }
}

export function saveSessionState(state) {
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
    sessionCount: state.sessionCount,
    lastTestTime: state.lastTestTime,
    cooldownEndTime: state.cooldownEndTime
  }));
}

export function resetSession(state) {
  state.sessionCount = 0;
  state.lastTestTime = 0;
  state.cooldownEndTime = 0;
  state.currentTest = null;
  state.isRunning = false;
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
}

export function updateSessionDisplay(state, elements, maxTests) {
  if (elements.sessionCount) {
    elements.sessionCount.textContent = state.sessionCount;
  }
  if (elements.sessionLimit) {
    elements.sessionLimit.textContent = maxTests || 10;
  }
}
