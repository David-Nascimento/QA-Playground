// Busca por texto
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
  const contentSections = document.querySelectorAll('.content-section[data-searchable]');
  const noResults = document.getElementById('noResults');

  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const query = normalize(this.value.trim());
      let visibleCount = 0;

      if (query === '') {
        contentSections.forEach(section => {
          section.classList.remove('hidden');
        });
        if (noResults) {
          noResults.classList.remove('show');
        }
        return;
      }

      contentSections.forEach(section => {
        const text = normalize(section.textContent);
        if (text.includes(query)) {
          section.classList.remove('hidden');
          visibleCount++;
          
          // Destacar texto encontrado (opcional)
          const highlights = section.querySelectorAll('.highlight-text');
          highlights.forEach(h => h.classList.remove('highlight-text'));
        } else {
          section.classList.add('hidden');
        }
      });

      if (noResults) {
        if (visibleCount === 0) {
          noResults.classList.add('show');
        } else {
          noResults.classList.remove('show');
        }
      }
    });
  }

  // Smooth scroll para links do índice
  document.querySelectorAll('.toc a').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        const offsetPosition = targetElement.offsetTop - 100;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
});
