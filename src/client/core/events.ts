// ========================================
// Events - Sistema de Eventos Customizados
// ========================================

import type { CustomEventMap } from './types.js';

/**
 * Classe para gerenciar eventos customizados
 */
export class EventManager {
  /**
   * Dispara um evento customizado
   */
  static dispatch<K extends keyof CustomEventMap>(
    eventName: K,
    detail: CustomEventMap[K]['detail']
  ): void {
    const event = new CustomEvent(eventName, {
      detail,
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(event);
  }

  /**
   * Escuta um evento customizado
   */
  static on<K extends keyof CustomEventMap>(
    eventName: K,
    callback: (event: CustomEventMap[K]) => void
  ): () => void {
    const handler = (event: Event) => {
      callback(event as CustomEventMap[K]);
    };

    document.addEventListener(eventName, handler);

    // Retorna função para remover listener
    return () => {
      document.removeEventListener(eventName, handler);
    };
  }
}
