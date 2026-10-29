// ========================================
// Accessibility Playground - Interatividade
// ========================================

/**
 * Inicializa os playgrounds interativos
 */
function initAccessibilityPlaygrounds() {
  const toggleButtons = document.querySelectorAll('.a11y-toggle-btn');
  
  toggleButtons.forEach(button => {
    const playgroundId = button.dataset.playground;
    const playground = document.getElementById(`playground-${playgroundId}`);
    
    if (!playground) return;
    
    const versionBad = playground.querySelector('[data-version="bad"]');
    const versionGood = playground.querySelector('[data-version="good"]');
    const toggleLabel = button.querySelector('.toggle-label');
    
    if (!versionBad || !versionGood) return;
    
    // Estado inicial: mostrar versão ruim
    let showingBad = true;
    versionBad.style.display = 'block';
    versionGood.style.display = 'none';
    if (toggleLabel) toggleLabel.textContent = 'Mostrar versão corrigida';
    
    // Event listener para toggle
    button.addEventListener('click', () => {
      showingBad = !showingBad;
      
      if (showingBad) {
        versionBad.style.display = 'block';
        versionGood.style.display = 'none';
        if (toggleLabel) toggleLabel.textContent = 'Mostrar versão corrigida';
        button.classList.remove('active');
      } else {
        versionBad.style.display = 'none';
        versionGood.style.display = 'block';
        if (toggleLabel) toggleLabel.textContent = 'Mostrar versão com erro';
        button.classList.add('active');
      }
      
      // Acessibilidade: atualizar aria-label
      const currentState = showingBad ? 'com erro' : 'corrigida';
      button.setAttribute('aria-label', `Alternar para versão ${currentState}`);
    });
    
    // Suporte a teclado
    button.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        button.click();
      }
    });
  });
}

/**
 * Inicializa quando DOM estiver pronto
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAccessibilityPlaygrounds);
} else {
  initAccessibilityPlaygrounds();
}
