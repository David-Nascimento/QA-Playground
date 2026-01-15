// ========================================
// Search - Funcionalidade de Busca
// ========================================

/**
 * Normaliza string removendo acentos e convertendo para minúsculas
 */
export function normalizeString(str: string): string {
  if (!str) return '';
  
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacríticos (acentos)
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[ñ]/g, 'n')
    .trim();
}

/**
 * Classe para gerenciar busca em cards
 */
export class SearchManager {
  private searchInput: HTMLInputElement | null = null;
  private sections: NodeListOf<HTMLElement> | null = null;

  /**
   * Inicializa o sistema de busca
   */
  init(): void {
    this.searchInput = document.getElementById('searchInput') as HTMLInputElement;
    
    if (!this.searchInput) {
      return; // Busca não disponível nesta página
    }

    this.sections = document.querySelectorAll<HTMLElement>('.section');
    this.searchInput.addEventListener('input', this.handleSearch.bind(this));
  }

  /**
   * Manipula evento de busca
   */
  private handleSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    const query = normalizeString(input.value);

    if (!this.sections) return;

    this.sections.forEach((section) => {
      const cards = section.querySelectorAll<HTMLElement>('.card-grid .card');
      let hasVisibleCards = false;

      cards.forEach((card) => {
        const title = card.querySelector('h3')?.textContent || '';
        const description = card.querySelector('p')?.textContent || '';
        const cardText = normalizeString(title + ' ' + description);

        if (query === '' || cardText.includes(query)) {
          card.style.display = '';
          hasVisibleCards = true;
        } else {
          card.style.display = 'none';
        }
      });

      // Mostra/oculta a seção inteira baseado em cards visíveis
      const cardGrid = section.querySelector('.card-grid');
      if (cardGrid) {
        section.style.display = hasVisibleCards || query === '' ? '' : 'none';
      }
    });
  }
}
