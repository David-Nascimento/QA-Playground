// ========================================
// NFT Playground - Sistema de Cooldown
// ========================================

export function createCooldownOverlay() {
  const overlay = document.createElement('div');
  overlay.className = 'cooldown-overlay';
  overlay.id = 'cooldown-overlay';
  overlay.innerHTML = `
    <div class="cooldown-message">
      <h4>Cooldown Ativo</h4>
      <div class="cooldown-timer" id="cooldown-timer">3</div>
      <p>Aguarde alguns segundos antes de iniciar um novo teste.</p>
    </div>
  `;
  document.body.appendChild(overlay);
  return overlay;
}

export function checkCooldown(cooldownEndTime, overlay) {
  const now = Date.now();
  if (cooldownEndTime > now) {
    const remaining = Math.ceil((cooldownEndTime - now) / 1000);
    showCooldown(remaining, overlay, cooldownEndTime);
    return false;
  }
  hideCooldown(overlay);
  return true;
}

function showCooldown(seconds, overlay, cooldownEndTime) {
  if (!overlay) return;
  overlay.classList.add('show');
  const timer = document.getElementById('cooldown-timer');
  if (timer) timer.textContent = seconds;
  
  if (seconds > 0) {
    setTimeout(() => {
      const remaining = Math.ceil((cooldownEndTime - Date.now()) / 1000);
      if (remaining > 0) {
        showCooldown(remaining, overlay, cooldownEndTime);
      } else {
        hideCooldown(overlay);
      }
    }, 1000);
  }
}

export function hideCooldown(overlay) {
  if (overlay) {
    overlay.classList.remove('show');
  }
}

export function startCooldown(seconds, state, saveCallback) {
  state.cooldownEndTime = Date.now() + (seconds * 1000);
  if (saveCallback) {
    saveCallback();
  }
}
