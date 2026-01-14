// Gerenciamento de código escondido com confirmação
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.code-reveal-button').forEach(button => {
    button.addEventListener('click', function() {
      const targetId = this.getAttribute('data-target');
      const container = document.getElementById(targetId);
      
      // Se o código já está visível, esconde diretamente
      if (container && container.classList.contains('active')) {
        container.classList.remove('active');
        // Atualiza texto do botão
        const svg = this.querySelector('svg');
        this.innerHTML = svg.outerHTML + ' Ver Exemplos de Código';
        return;
      }
      
      // Se está escondido, mostra dialog de confirmação
      const overlay = document.getElementById('confirm-overlay');
      const dialog = document.getElementById('confirm-dialog');
      
      if (!overlay || !dialog) return;
      
      overlay.classList.add('active');
      dialog.classList.add('active');
      
      // Salva o target para usar após confirmação
      dialog.dataset.targetId = targetId;
    });
  });
  
  // Botão Sim - mostra código
  const confirmOk = document.getElementById('confirm-ok');
  if (confirmOk) {
    confirmOk.addEventListener('click', function() {
      const dialog = document.getElementById('confirm-dialog');
      const targetId = dialog.dataset.targetId;
      const container = document.getElementById(targetId);
      const overlay = document.getElementById('confirm-overlay');
      const button = document.querySelector(`[data-target="${targetId}"]`);
      
      if (container) {
        container.classList.add('active');
        // Atualiza texto do botão
        if (button) {
          const svg = button.querySelector('svg');
          button.innerHTML = svg.outerHTML + ' Esconder Exemplos de Código';
        }
      }
      
      overlay.classList.remove('active');
      dialog.classList.remove('active');
    });
  }
  
  // Botão Não - fecha dialog
  const confirmCancel = document.getElementById('confirm-cancel');
  if (confirmCancel) {
    confirmCancel.addEventListener('click', function() {
      const overlay = document.getElementById('confirm-overlay');
      const dialog = document.getElementById('confirm-dialog');
      
      overlay.classList.remove('active');
      dialog.classList.remove('active');
    });
  }
  
  // Fecha dialog ao clicar no overlay
  const confirmOverlay = document.getElementById('confirm-overlay');
  if (confirmOverlay) {
    confirmOverlay.addEventListener('click', function() {
      this.classList.remove('active');
      const dialog = document.getElementById('confirm-dialog');
      if (dialog) {
        dialog.classList.remove('active');
      }
    });
  }
  
  // Gerenciamento de tabs de código
  document.querySelectorAll('.code-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      const targetId = this.getAttribute('data-target');
      const container = this.closest('.code-tabs-container');
      
      if (!container) return;
      
      // Remove active de todas as tabs e contents
      container.querySelectorAll('.code-tab').forEach(t => t.classList.remove('active'));
      container.querySelectorAll('.code-content').forEach(c => c.classList.remove('active'));
      
      // Adiciona active na tab e content selecionados
      this.classList.add('active');
      const content = container.querySelector('#' + targetId);
      if (content) {
        content.classList.add('active');
      }
    });
  });
});
