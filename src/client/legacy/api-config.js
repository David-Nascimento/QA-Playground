/**
 * Configuração da URL da API baseada no ambiente
 * Detecta automaticamente se está em desenvolvimento ou produção
 */

(function() {
  'use strict';
  
  function getApiBaseUrl() {
    // Se estiver em localhost, usa a API local
    if (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === ''
    ) {
      return 'http://localhost:3001/api';
    }
    
    // Em produção, usa o mesmo domínio (serverless functions)
    return '/api';
  }
  
  // Disponibiliza globalmente
  window.getApiBaseUrl = getApiBaseUrl;
  window.API_BASE_URL = getApiBaseUrl();
})();
