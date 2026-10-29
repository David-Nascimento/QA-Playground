// ========================================
// NFT Playground - Sistema de Logs
// ========================================

export function log(type, message, logArea) {
  if (!logArea) return;

  const timestamp = new Date().toLocaleTimeString('pt-BR');
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  entry.innerHTML = `<span class="log-timestamp">[${timestamp}]</span>${message}`;
  
  logArea.appendChild(entry);
  logArea.scrollTop = logArea.scrollHeight;

  // Remove mensagem inicial se existir
  const initialMsg = logArea.querySelector('div[style*="color: var(--muted)"]');
  if (initialMsg) {
    initialMsg.remove();
  }
}

export function clearLog(logArea) {
  if (logArea) {
    logArea.innerHTML = '<div style="color: var(--muted); font-style: italic; text-align: center; padding: var(--spacing-xl);">Aguardando execução de testes...</div>';
  }
}
