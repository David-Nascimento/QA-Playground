// ========================================
// Navigation - Componente de Navegação
// ========================================

import type { DropdownElements } from '../core/types.js';
import { EventManager } from '../core/events.js';

/**
 * Classe para gerenciar dropdowns de navegação
 */
export class NavigationDropdown {
  private elements: DropdownElements;
  private isOpen: boolean = false;
  private manager?: NavigationManager;

  constructor(container: HTMLElement, manager?: NavigationManager) {
    const button = container.querySelector<HTMLButtonElement>('.dropdown-toggle');
    const menu = container.querySelector<HTMLElement>('.dropdown-menu');

    if (!button || !menu) {
      throw new Error('Elementos do dropdown não encontrados');
    }

    this.elements = { container, button, menu };
    this.manager = manager;
    this.init();
  }

  /**
   * Inicializa o dropdown
   */
  private init(): void {
    const { button, menu } = this.elements;

    // Configura estado inicial
    button.setAttribute('aria-expanded', 'false');

    // Event listeners
    button.addEventListener('click', this.handleButtonClick.bind(this));
    button.addEventListener('keydown', this.handleButtonKeydown.bind(this));
    menu.addEventListener('keydown', this.handleMenuKeydown.bind(this));
  }

  /**
   * Manipula clique no botão
   */
  private handleButtonClick(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    this.toggle();
  }

  /**
   * Manipula teclado no botão
   */
  private handleButtonKeydown(event: KeyboardEvent): void {
    if (['Enter', ' '].includes(event.key)) {
      event.preventDefault();
      this.open();
      this.elements.menu.querySelector('a')?.focus();
    }

    if (event.key === 'Escape') {
      this.close();
      this.elements.button.focus();
    }
  }

  /**
   * Manipula teclado no menu
   */
  private handleMenuKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.close();
      this.elements.button.focus();
    }
  }


  /**
   * Abre o dropdown
   */
  open(): void {
    if (this.isOpen) return;

    // Fecha outros dropdowns antes de abrir
    if (this.manager) {
      this.manager.closeAll(this);
    }

    this.isOpen = true;
    this.elements.container.classList.add('open');
    this.elements.button.setAttribute('aria-expanded', 'true');
    
    // Força reflow para garantir que a classe seja aplicada
    void this.elements.container.offsetHeight;
    
    EventManager.dispatch('dropdown:toggle', { state: 'open' });
  }

  /**
   * Fecha o dropdown
   */
  close(): void {
    if (!this.isOpen) return;

    this.isOpen = false;
    this.elements.container.classList.remove('open');
    this.elements.button.setAttribute('aria-expanded', 'false');
    EventManager.dispatch('dropdown:toggle', { state: 'closed' });
  }

  /**
   * Alterna estado do dropdown
   */
  toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
      this.elements.menu.querySelector('a')?.focus();
    }
  }

  /**
   * Verifica se está aberto
   */
  getIsOpen(): boolean {
    return this.isOpen;
  }
}

/**
 * Classe para gerenciar todos os dropdowns
 */
export class NavigationManager {
  private dropdowns: NavigationDropdown[] = [];
  private currentOpenDropdown: NavigationDropdown | null = null;

  /**
   * Inicializa todos os dropdowns
   */
  init(): void {
    const dropdownContainers = document.querySelectorAll<HTMLElement>('.nav-dropdown');
    
    dropdownContainers.forEach((container) => {
      try {
        const dropdown = new NavigationDropdown(container, this);
        this.dropdowns.push(dropdown);
      } catch (error) {
        console.error('Erro ao inicializar dropdown:', error);
      }
    });

    // Escuta eventos de toggle para gerenciar estado
    EventManager.on('dropdown:toggle', (event) => {
      if (event.detail.state === 'open') {
        // Encontra qual dropdown foi aberto
        const openDropdown = this.dropdowns.find(d => d.getIsOpen());
        if (openDropdown && openDropdown !== this.currentOpenDropdown) {
          // Fecha o dropdown anterior se houver
          if (this.currentOpenDropdown) {
            this.currentOpenDropdown.close();
          }
          this.currentOpenDropdown = openDropdown;
        }
      } else {
        // Se fechou e era o atual, limpa referência
        if (this.currentOpenDropdown && !this.currentOpenDropdown.getIsOpen()) {
          this.currentOpenDropdown = null;
        }
      }
    });

    // Fecha dropdowns ao clicar fora (listener único para todos)
    document.addEventListener('click', (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Verifica se o clique foi em um botão de dropdown
      const clickedButton = target.closest('.dropdown-toggle');
      // Se clicou no botão, não faz nada - o handler do botão já tratou
      if (clickedButton) {
        return;
      }
      
      // Verifica se o clique foi dentro de algum dropdown (mas não no botão)
      const clickedDropdown = target.closest('.nav-dropdown');
      // Se clicou dentro do dropdown (ex: em um link), não fecha
      if (clickedDropdown) {
        return;
      }
      
      // Se chegou aqui, o clique foi FORA de qualquer dropdown
      // Usa setTimeout para garantir que o handler do botão seja processado primeiro
      setTimeout(() => {
        // Fecha o dropdown aberto, se houver
        if (this.currentOpenDropdown && this.currentOpenDropdown.getIsOpen()) {
          this.currentOpenDropdown.close();
        }
      }, 0);
    }, false); // Bubble phase (padrão)
  }

  /**
   * Fecha todos os dropdowns
   */
  closeAll(except?: NavigationDropdown): void {
    this.dropdowns.forEach((dropdown) => {
      if (dropdown !== except) {
        dropdown.close();
      }
    });
    if (!except) {
      this.currentOpenDropdown = null;
    }
  }
}

/**
 * Inicializa menu responsivo (se necessário)
 */
export function initResponsiveNav(): void {
  const navToggle = document.getElementById('nav-toggle');
  const mainNav = document.getElementById('main-nav');

  if (!navToggle || !mainNav) return;

  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('data-tooltip', 'Abrir menu');

  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute(
      'data-tooltip',
      isOpen ? 'Fechar menu' : 'Abrir menu'
    );
  });

  navToggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navToggle.click();
    }
  });
}
