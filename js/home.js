// Filtro de cards por pesquisa (ignora case e acentos)
function normalize(str) {
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

document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;
  
  searchInput.addEventListener('input', function() {
    const query = normalize(this.value);
    const sections = document.querySelectorAll('.section');
    
    sections.forEach(section => {
      const cards = section.querySelectorAll('.card-grid .card');
      let hasVisibleCards = false;
      
      cards.forEach(card => {
        // Busca no título, descrição e texto do card
        const title = card.querySelector('h3')?.textContent || '';
        const description = card.querySelector('p')?.textContent || '';
        const cardText = normalize(title + ' ' + description);
        
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
        if (hasVisibleCards || query === '') {
          section.style.display = '';
        } else {
          section.style.display = 'none';
        }
      }
    });
  });
});
