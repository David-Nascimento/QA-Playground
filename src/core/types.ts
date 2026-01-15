// ========================================
// Types - Definições de Tipos
// ========================================

/**
 * Temas disponíveis no sistema
 */
export type Theme = 'light' | 'dark';


/**
 * Eventos customizados do sistema
 */
export interface CustomEventMap {
  'theme:change': CustomEvent<{ theme: Theme }>;
  'dropdown:toggle': CustomEvent<{ state: 'open' | 'closed' }>;
}

/**
 * Configurações do sistema
 */
export interface SystemConfig {
  themeKey: string;
  defaultTheme: Theme;
}

/**
 * Elementos do DOM com tipos específicos
 */
export interface DropdownElements {
  container: HTMLElement;
  button: HTMLButtonElement;
  menu: HTMLElement;
}

/**
 * Callback para eventos
 */
export type EventCallback<T = unknown> = (data: T) => void;
