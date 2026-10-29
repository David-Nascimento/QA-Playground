// ========================================
// Storage - Gerenciamento de LocalStorage
// ========================================

/**
 * Classe para gerenciar armazenamento local
 */
export class StorageManager {
  /**
   * Obtém um valor do localStorage
   */
  static get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      return JSON.parse(item) as T;
    } catch {
      return null;
    }
  }

  /**
   * Salva um valor no localStorage
   */
  static set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Erro ao salvar no localStorage: ${error}`);
    }
  }

  /**
   * Remove um valor do localStorage
   */
  static remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Erro ao remover do localStorage: ${error}`);
    }
  }

  /**
   * Obtém um valor string do localStorage
   */
  static getString(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  /**
   * Salva um valor string no localStorage
   */
  static setString(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Erro ao salvar string no localStorage: ${error}`);
    }
  }
}
