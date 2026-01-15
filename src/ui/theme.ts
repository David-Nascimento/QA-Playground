// ========================================
// Theme - Gerenciamento de Tema
// ========================================

import type { Theme } from '../core/types.js';
import { StateManager } from '../core/state.js';

/**
 * Classe para gerenciar interface do tema
 */
export class ThemeUI {
  private toggleButton: HTMLButtonElement | null = null;

  /**
   * Inicializa a UI do tema
   */
  init(): void {
    this.toggleButton = document.getElementById('theme-toggle') as HTMLButtonElement;
    
    if (this.toggleButton) {
      this.updateButton();
      this.toggleButton.addEventListener('click', this.handleToggle.bind(this));
    }

    // Aplica tema inicial
    StateManager.init();
    this.updateButton();
  }

  /**
   * Manipula alternância de tema
   */
  private handleToggle(): void {
    const newTheme = StateManager.toggleTheme();
    this.updateButton(newTheme);
  }

  /**
   * Atualiza o botão de tema
   */
  private updateButton(theme?: Theme): void {
    if (!this.toggleButton) return;

    const currentTheme = theme || StateManager.getTheme();
    const isDark = currentTheme === 'dark';

    // Usa símbolos sem emoji conforme diretriz
    this.toggleButton.textContent = isDark ? '☾' : '☀';
    this.toggleButton.setAttribute(
      'aria-label',
      isDark ? 'Ativar modo claro' : 'Ativar modo escuro'
    );
  }

  /**
   * Obtém o tema atual
   */
  getCurrentTheme(): Theme {
    return StateManager.getTheme();
  }
}
