// ========================================
// QA Playground - Entry Point
// Ponto de entrada principal da aplicação
// ========================================

import { NavigationManager, initResponsiveNav } from './ui/navigation.js';
import { ThemeUI } from './ui/theme.js';
import { exposeGlobalHelpers } from './ui/interactions.js';
import { SearchManager } from './features/search.js';
import { BDDPlayground } from './features/bdd/bdd-playground.js';
import { ChallengeCodeReveal } from './features/challenge/challenge.js';
import { FundamentosManager } from './features/fundamentos/fundamentos.js';
import { XPathCSSTester, exposeXPathFunctions } from './features/xpath/xpath-tester.js';

/**
 * Inicializa todas as funcionalidades da aplicação
 */
function initApp(): void {
  try {
    // Navegação
    const navManager = new NavigationManager();
    navManager.init();
    initResponsiveNav();

    // Tema
    const themeUI = new ThemeUI();
    themeUI.init();

    // Busca (se disponível na página)
    const searchManager = new SearchManager();
    searchManager.init();

    // BDD Playground (se disponível)
    const bddPlayground = new BDDPlayground();
    bddPlayground.init();

    // Challenge pages (código revelado)
    const challengeCodeReveal = new ChallengeCodeReveal();
    challengeCodeReveal.init();

    // Fundamentos (busca específica)
    const fundamentosManager = new FundamentosManager();
    fundamentosManager.init();

    // XPath & CSS Tester (se disponível)
    const xpathTester = new XPathCSSTester();
    xpathTester.init();
    exposeXPathFunctions(xpathTester);

    // Helpers globais (compatibilidade)
    exposeGlobalHelpers();

    console.log('QA Playground inicializado');
  } catch (error) {
    console.error('Erro ao inicializar QA Playground:', error);
    if (error instanceof Error) {
      console.error('Mensagem:', error.message);
      console.error('Stack:', error.stack);
    }
  }
}

// Aguarda DOM estar pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
