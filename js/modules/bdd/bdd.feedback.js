/**
 * BDD Feedback - Feedback educacional
 * Gera sugestões e explicações para melhorar o BDD
 */

const BDDFeedback = (() => {
  'use strict';

  /**
   * Gera feedback baseado nos erros encontrados
   */
  function generate(validationResults, scoreResult) {
    const suggestions = [];
    const explanations = [];

    // Feedback por categoria de erro
    validationResults.errors.forEach(error => {
      const suggestion = getSuggestionForError(error);
      if (suggestion) {
        suggestions.push(suggestion);
      }

      const explanation = getExplanationForError(error);
      if (explanation) {
        explanations.push(explanation);
      }
    });

    // Feedback geral baseado no score
    const generalFeedback = getGeneralFeedback(scoreResult);

    return {
      suggestions: [...new Set(suggestions)], // Remove duplicatas
      explanations: explanations,
      general: generalFeedback
    };
  }

  /**
   * Retorna sugestão específica para um erro
   */
  function getSuggestionForError(error) {
    const suggestionsMap = {
      hasFeature: 'Adicione uma Feature no início do documento descrevendo a funcionalidade',
      hasScenario: 'Adicione pelo menos um Scenario ou Scenario Outline',
      hasThen: 'Todo cenário deve ter pelo menos um Then descrevendo o resultado esperado',
      correctOrder: 'Mantenha a ordem: Given (estado) → When (ação) → Then (resultado)',
      singleWhen: 'Use apenas um When por cenário. Se precisar de múltiplas ações, combine-as ou use And',
      givenIsState: 'Given deve descrever um estado inicial, não uma ação. Ex: "Dado que o usuário está logado"',
      whenIsAction: 'When deve descrever uma ação clara. Ex: "Quando o usuário clica em enviar"',
      thenIsObservable: 'Then deve descrever um resultado observável. Ex: "Então deve aparecer uma mensagem de sucesso"',
      noTechnicalTerms: 'Evite termos técnicos. Use linguagem de negócio. Ex: "sistema" ao invés de "API"',
      noUITerms: 'Evite termos de interface. Foque no comportamento. Ex: "enviar formulário" ao invés de "clicar no botão"',
      backgroundOnlyGiven: 'Background deve conter apenas steps Given para definir o estado inicial',
      scenarioOutlineHasExamples: 'Scenario Outline requer uma seção Examples com dados de teste',
      parametersInExamples: 'Todos os parâmetros <param> usados nos steps devem estar na tabela Examples',
      ruleDescribesBusinessRule: 'Rule deve ter um título descritivo que explique a regra de negócio'
    };

    return suggestionsMap[error.rule] || null;
  }

  /**
   * Retorna explicação educacional para um erro
   */
  function getExplanationForError(error) {
    const explanationsMap = {
      hasFeature: {
        title: 'O que é uma Feature?',
        content: 'A Feature descreve a funcionalidade que está sendo testada. Ela deve estar no topo do documento e explicar o contexto de negócio.'
      },
      hasScenario: {
        title: 'O que é um Scenario?',
        content: 'Um Scenario descreve um caso de teste específico. Ele deve seguir o padrão Given-When-Then para descrever o comportamento esperado.'
      },
      hasThen: {
        title: 'Por que Then é obrigatório?',
        content: 'O Then define o resultado esperado do teste. Sem ele, não há como validar se o comportamento está correto.'
      },
      correctOrder: {
        title: 'Ordem dos Steps',
        content: 'A ordem Given → When → Then reflete o fluxo natural: primeiro o estado inicial, depois a ação, e por fim a validação do resultado.'
      },
      singleWhen: {
        title: 'Por que apenas um When?',
        content: 'Um cenário deve testar uma única ação. Múltiplos When indicam que o cenário está testando mais de uma coisa e deve ser dividido.'
      },
      givenIsState: {
        title: 'Given = Estado',
        content: 'Given estabelece o contexto inicial. Não deve descrever ações, mas sim condições pré-existentes. Ex: "Dado que o usuário está autenticado".'
      },
      whenIsAction: {
        title: 'When = Ação',
        content: 'When descreve a ação que o usuário ou sistema realiza. Deve ser uma ação clara e específica. Ex: "Quando o usuário submete o formulário".'
      },
      thenIsObservable: {
        title: 'Then = Resultado Observável',
        content: 'Then descreve o que deve ser observado após a ação. Deve ser verificável e mensurável. Ex: "Então a mensagem de sucesso é exibida".'
      },
      noTechnicalTerms: {
        title: 'Linguagem de Negócio',
        content: 'BDD deve usar linguagem compreensível por stakeholders não técnicos. Evite termos como API, banco de dados, status code, etc.'
      },
      noUITerms: {
        title: 'Foco no Comportamento',
        content: 'BDD descreve comportamento, não interface. Evite mencionar elementos de UI como botões, campos, telas. Foque no que acontece, não em como interagir.'
      },
      backgroundOnlyGiven: {
        title: 'Background',
        content: 'Background é usado para definir pré-condições comuns a todos os cenários. Por isso, deve conter apenas steps Given.'
      },
      scenarioOutlineHasExamples: {
        title: 'Scenario Outline',
        content: 'Scenario Outline permite testar o mesmo cenário com diferentes dados. A seção Examples fornece esses dados em formato de tabela.'
      },
      parametersInExamples: {
        title: 'Parâmetros em Examples',
        content: 'Todos os parâmetros usados nos steps (ex: <email>) devem ter colunas correspondentes na tabela Examples.'
      },
      ruleDescribesBusinessRule: {
        title: 'Rule',
        content: 'Rule agrupa cenários relacionados a uma mesma regra de negócio. Deve ter um título claro explicando essa regra.'
      }
    };

    return explanationsMap[error.rule] || null;
  }

  /**
   * Retorna feedback geral baseado no score
   */
  function getGeneralFeedback(scoreResult) {
    const { score, level } = scoreResult;

    if (score >= 90) {
      return {
        title: 'Excelente! 🎉',
        content: 'Seu BDD está no nível Especialista! Continue mantendo a qualidade e considere compartilhar conhecimento com a equipe.'
      };
    }

    if (score >= 75) {
      return {
        title: 'Muito bom! 👍',
        content: 'Você está no nível Avançado. Revise as sugestões para alcançar o nível Especialista.'
      };
    }

    if (score >= 60) {
      return {
        title: 'Bom progresso! 📈',
        content: 'Nível Intermediário alcançado. Continue praticando e prestando atenção aos detalhes de semântica e estrutura.'
      };
    }

    if (score >= 40) {
      return {
        title: 'Continue praticando! 💪',
        content: 'Você está no nível Básico. Foque em entender a estrutura Given-When-Then e a ordem correta dos steps.'
      };
    }

    return {
      title: 'Não desista! 🌱',
      content: 'Todo mundo começa como Iniciante. Revise os conceitos básicos de BDD e pratique escrevendo cenários simples.'
    };
  }

  return {
    generate
  };
})();
