// ========================================
// Fundamentos - Busca e Navegação
// ========================================

import { normalizeString } from '../search.js';

/**
 * Classe para gerenciar funcionalidades da página de fundamentos
 */
export class FundamentosManager {
  private searchInput: HTMLInputElement | null = null;
  private moduleSearchInput: HTMLInputElement | null = null;
  private contentSections: NodeListOf<HTMLElement> | null = null;
  private modules: NodeListOf<HTMLElement> | null = null;
  private noResults: HTMLElement | null = null;
  private searchResults: HTMLElement | null = null;

  /**
   * Inicializa o gerenciador de fundamentos
   */
  init(): void {
    // Busca padrão para páginas individuais
    this.searchInput = document.getElementById('searchInput') as HTMLInputElement;
    this.contentSections = document.querySelectorAll<HTMLElement>(
      '.content-section[data-searchable]'
    );
    this.noResults = document.getElementById('noResults');

    // Busca de módulos para página index
    this.moduleSearchInput = document.getElementById('module-search') as HTMLInputElement;
    this.searchResults = document.getElementById('search-results');
    
    // Busca por todos os módulos em ambos os containers (módulos teóricos + processo QA)
    this.modules = document.querySelectorAll<HTMLElement>('.fundamentos-module');

    // Configura busca padrão se disponível
    if (this.searchInput && this.contentSections.length > 0) {
      this.setupSearch();
    }

    // Configura busca de módulos se disponível
    if (this.moduleSearchInput) {
      if (this.modules.length > 0) {
        this.setupModuleSearch();
      } else {
        console.warn('FundamentosManager: Nenhum módulo encontrado com seletor .fundamentos-module');
      }
    }

    this.setupSmoothScroll();
  }

  /**
   * Configura sistema de busca
   */
  private setupSearch(): void {
    if (!this.searchInput || !this.contentSections) return;

    this.searchInput.addEventListener('input', () => {
      const query = normalizeString(this.searchInput!.value.trim());
      let visibleCount = 0;

      if (query === '') {
        this.contentSections!.forEach((section) => {
          section.classList.remove('hidden');
        });
        if (this.noResults) {
          this.noResults.classList.remove('show');
        }
        return;
      }

      this.contentSections!.forEach((section) => {
        const text = normalizeString(section.textContent || '');
        if (text.includes(query)) {
          section.classList.remove('hidden');
          visibleCount++;

          // Remove highlights anteriores
          const highlights = section.querySelectorAll('.highlight-text');
          highlights.forEach((h) => h.classList.remove('highlight-text'));
        } else {
          section.classList.add('hidden');
        }
      });

      // Mostra/oculta mensagem de sem resultados
      if (this.noResults) {
        if (visibleCount === 0) {
          this.noResults.classList.add('show');
        } else {
          this.noResults.classList.remove('show');
        }
      }
    });
  }

  /**
   * Configura busca de módulos na página index
   */
  private setupModuleSearch(): void {
    if (!this.moduleSearchInput || !this.modules) {
      console.warn('FundamentosManager: Busca de módulos não configurada - elementos não encontrados');
      return;
    }

    console.log(`FundamentosManager: Configurando busca para ${this.modules.length} módulos`);

    this.moduleSearchInput.addEventListener('input', () => {
      const query = normalizeString(this.moduleSearchInput!.value.trim());
      let visibleCount = 0;
      const totalModules = this.modules!.length;

      if (query === '') {
        this.modules!.forEach((module) => {
          module.style.display = '';
        });
        if (this.searchResults) {
          this.searchResults.style.display = 'none';
        }
        return;
      }

      this.modules!.forEach((module) => {
        // Busca no título
        const title = module.querySelector('h3')?.textContent || '';
        // Busca na descrição
        const description = module.querySelector('.module-description')?.textContent || '';
        // Busca nos tópicos
        const topics = Array.from(module.querySelectorAll('.module-topics li'))
          .map((li) => li.textContent || '')
          .join(' ');
        
        const moduleText = normalizeString(`${title} ${description} ${topics}`);

        if (moduleText.includes(query)) {
          module.style.display = '';
          visibleCount++;
        } else {
          module.style.display = 'none';
        }
      });

      // Atualiza contador de resultados
      if (this.searchResults) {
        if (visibleCount === 0) {
          this.searchResults.textContent = 'Nenhum módulo encontrado';
          this.searchResults.style.display = 'block';
        } else if (visibleCount < totalModules) {
          this.searchResults.textContent = `${visibleCount} de ${totalModules} módulos encontrados`;
          this.searchResults.style.display = 'block';
        } else {
          this.searchResults.style.display = 'none';
        }
      }

      // Atualiza estilo do campo de pesquisa
      if (this.moduleSearchInput) {
        if (query) {
          this.moduleSearchInput.style.borderColor = visibleCount > 0 ? 'var(--accent)' : 'var(--error, #e74c3c)';
        } else {
          this.moduleSearchInput.style.borderColor = 'var(--border)';
        }
      }
    });
  }

  /**
   * Configura scroll suave para links do índice
   */
  private setupSmoothScroll(): void {
    const tocLinks = document.querySelectorAll<HTMLAnchorElement>('.toc a');

    tocLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (!href || !href.startsWith('#')) return;

        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          const offsetPosition = targetElement.offsetTop - 100;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          });
        }
      });
    });
  }
}
