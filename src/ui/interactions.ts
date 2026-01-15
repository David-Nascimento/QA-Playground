// ========================================
// Interactions - Utilidades de Interação
// ========================================

/**
 * Classe para gerenciar toast notifications
 */
export class ToastManager {
  private container: HTMLElement | null = null;
  private readonly duration: number = 2800;

  /**
   * Cria ou obtém container de toast
   */
  private getContainer(): HTMLElement {
    if (!this.container) {
      this.container = document.querySelector('.toast');
      
      if (!this.container) {
        this.container = document.createElement('div');
        this.container.className = 'toast';
        document.body.appendChild(this.container);
      }
    }

    return this.container;
  }

  /**
   * Exibe uma mensagem toast
   */
  show(message: string, duration?: number): void {
    const container = this.getContainer();
    container.textContent = message;
    container.classList.add('show');

    setTimeout(() => {
      container.classList.remove('show');
    }, duration || this.duration);
  }

  /**
   * Remove o toast
   */
  hide(): void {
    const container = this.getContainer();
    container.classList.remove('show');
  }
}

/**
 * Classe para gerenciar erros de formulário
 */
export class FormErrorManager {
  /**
   * Define erro em um campo
   */
  static setError(fieldId: string, message: string): void {
    const field = document.getElementById(fieldId);
    const group = field?.closest('.form-group');
    const errorElement = document.getElementById(`${fieldId}-error`);

    if (group) {
      group.classList.add('error');
    }

    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  }

  /**
   * Remove erro de um campo
   */
  static clearError(fieldId: string): void {
    const field = document.getElementById(fieldId);
    const group = field?.closest('.form-group');
    const errorElement = document.getElementById(`${fieldId}-error`);

    if (group) {
      group.classList.remove('error');
    }

    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
  }
}

/**
 * Validações de formulário
 */
export class FormValidator {
  /**
   * Valida formato de email
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida se campo está preenchido
   */
  static isRequired(value: string): boolean {
    return value.trim().length > 0;
  }

  /**
   * Valida tamanho mínimo
   */
  static minLength(value: string, min: number): boolean {
    return value.length >= min;
  }

  /**
   * Valida tamanho máximo
   */
  static maxLength(value: string, max: number): boolean {
    return value.length <= max;
  }
}

/**
 * Interface global para utilidades (mantida para compatibilidade)
 */
declare global {
  interface Window {
    showToast: (msg: string) => void;
    setFieldError: (fieldId: string, message: string) => void;
    clearFieldError: (fieldId: string) => void;
    validateEmail: (email: string) => boolean;
  }
}

/**
 * Expõe funções globais (compatibilidade com código legado)
 */
export function exposeGlobalHelpers(): void {
  const toast = new ToastManager();

  window.showToast = (msg: string) => toast.show(msg);
  window.setFieldError = FormErrorManager.setError;
  window.clearFieldError = FormErrorManager.clearError;
  window.validateEmail = FormValidator.validateEmail;
}
