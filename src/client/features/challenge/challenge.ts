// ========================================
// Challenge - Gerenciamento de Código Revelado
// ========================================

/**
 * Classe para gerenciar revelação de código com confirmação
 */
export class ChallengeCodeReveal {
  private overlay: HTMLElement | null = null;
  private dialog: HTMLElement | null = null;
  private confirmOk: HTMLButtonElement | null = null;
  private confirmCancel: HTMLButtonElement | null = null;

  /**
   * Inicializa o sistema de revelação de código
   */
  init(): void {
    this.overlay = document.getElementById('confirm-overlay');
    this.dialog = document.getElementById('confirm-dialog');
    this.confirmOk = document.getElementById('confirm-ok') as HTMLButtonElement;
    this.confirmCancel = document.getElementById('confirm-cancel') as HTMLButtonElement;

    if (!this.overlay || !this.dialog) {
      return; // Sistema de confirmação não disponível
    }

    this.setupCodeRevealButtons();
    this.setupConfirmDialog();
    this.setupCodeTabs();
  }

  /**
   * Configura botões de revelar código
   */
  private setupCodeRevealButtons(): void {
    const buttons = document.querySelectorAll<HTMLButtonElement>('.code-reveal-button');

    buttons.forEach((button) => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = button.getAttribute('data-target');
        if (!targetId) return;

        const container = document.getElementById(targetId);
        if (!container) return;

        // Se já está visível, esconde diretamente
        if (container.classList.contains('active')) {
          container.classList.remove('active');
          const svg = button.querySelector('svg');
          if (svg) {
            button.innerHTML = svg.outerHTML + ' Ver Exemplos de Código';
          }
          return;
        }

        // Mostra dialog de confirmação
        if (this.dialog) {
          this.dialog.dataset.targetId = targetId;
          this.showConfirmDialog();
        }
      });
    });
  }

  /**
   * Configura dialog de confirmação
   */
  private setupConfirmDialog(): void {
    if (!this.overlay || !this.dialog) return;

    // Botão OK
    if (this.confirmOk) {
      this.confirmOk.addEventListener('click', () => {
        this.handleConfirmOk();
      });
    }

    // Botão Cancelar
    if (this.confirmCancel) {
      this.confirmCancel.addEventListener('click', () => {
        this.hideConfirmDialog();
      });
    }

    // Fecha ao clicar no overlay
    this.overlay.addEventListener('click', () => {
      this.hideConfirmDialog();
    });
  }

  /**
   * Mostra o dialog de confirmação
   */
  private showConfirmDialog(): void {
    if (this.overlay && this.dialog) {
      this.overlay.classList.add('active');
      this.dialog.classList.add('active');
    }
  }

  /**
   * Esconde o dialog de confirmação
   */
  private hideConfirmDialog(): void {
    if (this.overlay && this.dialog) {
      this.overlay.classList.remove('active');
      this.dialog.classList.remove('active');
    }
  }

  /**
   * Manipula confirmação OK
   */
  private handleConfirmOk(): void {
    if (!this.dialog) return;

    const targetId = this.dialog.dataset.targetId;
    if (!targetId) return;

    const container = document.getElementById(targetId);
    const button = document.querySelector<HTMLButtonElement>(`[data-target="${targetId}"]`);

    if (container) {
      container.classList.add('active');
      if (button) {
        const svg = button.querySelector('svg');
        if (svg) {
          button.innerHTML = svg.outerHTML + ' Esconder Exemplos de Código';
        }
      }
    }

    this.hideConfirmDialog();
  }

  /**
   * Configura tabs de código
   */
  private setupCodeTabs(): void {
    const tabs = document.querySelectorAll<HTMLButtonElement>('.code-tab');

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const targetId = tab.getAttribute('data-target');
        if (!targetId) return;

        const container = tab.closest('.code-tabs-container');
        if (!container) return;

        // Remove active de todas as tabs e contents
        container
          .querySelectorAll('.code-tab')
          .forEach((t) => t.classList.remove('active'));
        container
          .querySelectorAll('.code-content')
          .forEach((c) => c.classList.remove('active'));

        // Adiciona active na tab e content selecionados
        tab.classList.add('active');
        const content = container.querySelector(`#${targetId}`);
        if (content) {
          content.classList.add('active');
        }
      });
    });
  }
}
