// ========================================
// State - Gerenciamento de Estado
// ========================================

import type { Theme } from './types.js';
import { StorageManager } from './storage.js';
import { EventManager } from './events.js';

/**
 * Configurações do sistema
 */
const SYSTEM_CONFIG = {
  themeKey: 'qaplay-theme',
  defaultTheme: 'light' as Theme,
} as const;

/**
 * Classe para gerenciar estado da aplicação
 */
export class StateManager {
  private static currentTheme: Theme = SYSTEM_CONFIG.defaultTheme;

  /**
   * Obtém o tema atual
   */
  static getTheme(): Theme {
    const saved = StorageManager.getString(SYSTEM_CONFIG.themeKey);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }

    // Verifica preferência do sistema
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return SYSTEM_CONFIG.defaultTheme;
  }

  /**
   * Aplica um tema
   */
  static applyTheme(theme: Theme): void {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    StorageManager.setString(SYSTEM_CONFIG.themeKey, theme);
    EventManager.dispatch('theme:change', { theme });
  }

  /**
   * Alterna entre temas
   */
  static toggleTheme(): Theme {
    const nextTheme: Theme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(nextTheme);
    return nextTheme;
  }

  /**
   * Inicializa o estado da aplicação
   */
  static init(): void {
    const theme = this.getTheme();
    this.applyTheme(theme);
  }
}
