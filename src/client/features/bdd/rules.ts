// ========================================
// BDD - Regras de validação, níveis e pontuação
// ----------------------------------------
// Cada regra devolve "achados" com linha, gravidade e uma explicação
// escrita para quem está começando (o que está errado, por quê, e um
// exemplo de como corrigir).
// ========================================

import {
  KEYWORD_LABEL,
  backgroundFor,
  type GherkinDocument,
  type Lang,
  type Scenario,
  type Step,
} from './gherkin.js';

export type Level = 'basico' | 'intermediario' | 'avancado' | 'especialista';
export type Category = 'estrutura' | 'semantica' | 'linguagem' | 'modelagem';
export type Severity = 'erro' | 'aviso';

export interface Finding {
  rule: string;
  category: Category;
  severity: Severity;
  line: number | null;
  /** o que está errado, em uma frase */
  message: string;
  /** por que importa / como corrigir */
  hint: string;
  /** exemplo de como fica corrigido */
  example?: string;
}

export interface LevelInfo {
  id: Level;
  name: string;
  description: string;
  categories: Category[];
  tips: string[];
}

export const LEVELS: Record<Level, LevelInfo> = {
  basico: {
    id: 'basico',
    name: 'Básico',
    description: 'Estrutura: Funcionalidade, Cenário e a ordem Dado → Quando → Então.',
    categories: ['estrutura'],
    tips: [
      'Comece com "Funcionalidade:" e um título curto',
      'Cada "Cenário:" precisa de pelo menos um Quando e um Então',
      'A ordem é sempre: Dado (contexto) → Quando (ação) → Então (resultado)',
      'Use "E" para continuar o passo anterior',
    ],
  },
  intermediario: {
    id: 'intermediario',
    name: 'Intermediário',
    description: 'Estrutura + significado: cada passo faz o seu papel.',
    categories: ['estrutura', 'semantica'],
    tips: [
      'Dado descreve um estado que já existe ("que tenho R$ 100 na conta")',
      'Quando descreve uma única ação ("saco R$ 30")',
      'Então descreve algo que dá para verificar ("meu saldo é R$ 70")',
      'Um cenário testa um comportamento só',
    ],
  },
  avancado: {
    id: 'avancado',
    name: 'Avançado',
    description: 'Estrutura + significado + linguagem de negócio.',
    categories: ['estrutura', 'semantica', 'linguagem'],
    tips: [
      'Escreva o que a pessoa quer fazer, não onde ela clica',
      'Evite termos técnicos (API, banco, JSON) e de tela (botão, campo)',
      'Seja concreto: troque "corretamente" pelo resultado esperado',
      'Mantenha a mesma pessoa verbal em todo o cenário',
    ],
  },
  especialista: {
    id: 'especialista',
    name: 'Especialista',
    description: 'Tudo acima + modelagem: Contexto, Esquema do Cenário e Regra.',
    categories: ['estrutura', 'semantica', 'linguagem', 'modelagem'],
    tips: [
      'Contexto só contém passos "Dado" compartilhados por todos os cenários',
      'Esquema do Cenário precisa de Exemplos com todas as <variáveis>',
      'Use Regra para agrupar cenários da mesma regra de negócio',
      'Cenários curtos: até 6–8 passos',
    ],
  },
};

export const CATEGORY_LABEL: Record<Category, string> = {
  estrutura: 'Estrutura',
  semantica: 'Significado',
  linguagem: 'Linguagem',
  modelagem: 'Modelagem',
};

// ----------------------------------------
// Vocabulário (comparação sem acentos e por palavra inteira)
// ----------------------------------------

const norm = (s: string): string =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const words = (s: string): string[] => norm(s).split(/[^a-z0-9<>]+/).filter(Boolean);

function findTerm(text: string, terms: string[]): string | null {
  const t = ` ${words(text).join(' ')} `;
  for (const term of terms) {
    if (t.includes(` ${norm(term)} `)) return term;
  }
  return null;
}

/** Verbos que indicam uma ação do usuário (radicais em PT e EN). */
const ACTION_STEMS = [
  'clic', 'click', 'toc', 'tap', 'preench', 'digit', 'escrev', 'insir', 'inser', 'inform',
  'seleciona', 'escolh', 'marc', 'desmarc', 'envi', 'submet', 'confirm', 'cancel', 'acess',
  'naveg', 'abr', 'fech', 'arrast', 'press', 'apert', 'compr', 'pag', 'sac', 'transfer',
  'deposit', 'cadastr', 'registr', 'exclu', 'remov', 'adicion', 'busc', 'pesquis', 'filtr',
  'orden', 'salv', 'edit', 'alter', 'atualiz', 'fa', 'faz', 'realiz', 'execut', 'solicit',
  'tent', 'login', 'logo', 'entr', 'sai', 'upload', 'baix', 'ocorr', 'receb', 'expir', 'cheg', 'aplic', 'utiliz', 'us', 'reserv', 'agend', 'avali', 'compartilh', 'convid', 'aceit', 'recus', 'aprov', 'rejeit', 'export', 'import', 'imprim', 'assin', 'renov', 'troc', 'devolv', 'encerr', 'inici', 'conclu', 'finaliz', 'limp', 'bloque', 'desbloque', 'ative', 'ativ', 'desativ',
  'fill', 'type', 'enter', 'select', 'choose', 'check', 'send', 'submit', 'open', 'close',
  'navigate', 'visit', 'press', 'drag', 'buy', 'pay', 'withdraw', 'add', 'remove',
  'delete', 'search', 'save', 'edit', 'update', 'request', 'try', 'log', 'sign', 'apply', 'use', 'book', 'cancel', 'confirm', 'place', 'order', 'upload', 'download', 'share', 'invite', 'accept', 'reject', 'approve', 'export', 'import', 'print', 'start', 'finish', 'complete', 'reset', 'transfer', 'deposit', 'register', 'login',
];

/** Indicadores de verificação no Então. */
const OUTCOME_TERMS = [
  'deve', 'devem', 'deveria', 'vejo', 've', 'veja', 'ver', 'visualizo', 'exibe', 'exibido',
  'exibida', 'exibidos', 'exibidas', 'mostra', 'mostrado', 'mostrada', 'aparece', 'aparecem',
  'recebo', 'recebe', 'recebem', 'fica', 'ficam', 'e', 'sao', 'esta', 'estao', 'tem', 'tenho',
  'possui', 'contem', 'permanece', 'continua', 'nao', 'sou', 'somos', 'passa', 'passo',
  'should', 'must', 'see', 'sees', 'is', 'are', 'has', 'have', 'receive', 'receives',
  'displayed', 'shown', 'contains', 'remains', 'becomes', 'get', 'gets',
];

const UI_TERMS = [
  'botao', 'botoes', 'clico', 'clica', 'clicar', 'clicando', 'campo', 'campos', 'checkbox',
  'dropdown', 'combobox', 'radio', 'input', 'textarea', 'modal', 'popup', 'pop-up', 'link',
  'icone', 'aba', 'menu', 'xpath', 'css', 'seletor', 'id', 'div', 'span', 'scroll', 'rolo',
  'button', 'click', 'clicks', 'field', 'textbox', 'tab', 'selector', 'element',
];

const TECH_TERMS = [
  'api', 'endpoint', 'json', 'xml', 'http', 'https', 'request', 'response', 'requisicao',
  'payload', 'banco de dados', 'database', 'db', 'sql', 'query', 'status code', 'statuscode',
  'token', 'jwt', 'cookie', 'localstorage', 'cache', 'servidor', 'backend', 'frontend',
  'mock', 'stub', 'null', 'variavel', 'funcao', 'metodo', 'classe', 'html', 'dom', 'javascript',
];

const VAGUE_TERMS = [
  'corretamente', 'correto', 'normalmente', 'adequadamente', 'devidamente', 'funciona',
  'funcionar', 'etc', 'algo', 'alguma coisa', 'certo', 'ok', 'tudo', 'qualquer',
  'correctly', 'properly', 'works', 'something', 'fine',
];

const FIRST_PERSON = ['eu', 'meu', 'minha', 'estou', 'tenho', 'vejo', 'recebo', 'clico', 'acesso', 'informo', 'i', 'my', 'am'];

function isAction(text: string): boolean {
  return words(text).some((raw) => {
    // "reativo", "desbloqueio", "reenvio": ignora prefixos comuns
    const w = raw.replace(/^(re|des)(?=[a-z]{4,})/, '');
    return [raw, w].some((x) => ACTION_STEMS.some((stem) => x.startsWith(stem) && x.length <= stem.length + 6));
  });
}

function isObservable(text: string): boolean {
  return words(text).some((w) => OUTCOME_TERMS.includes(w));
}

/** "Dado que eu clico…" é ação; "Dado que estou logado" é estado. */
function looksLikeActionInGiven(text: string): boolean {
  const w = words(text).filter((x) => x !== 'que' && x !== 'eu' && x !== 'o' && x !== 'a' && x !== 'usuario' && x !== 'cliente' && x !== 'i' && x !== 'the' && x !== 'user');
  const first = w[0] ?? '';
  const stateStarts = ['estou', 'esta', 'estao', 'tenho', 'tem', 'possuo', 'possui', 'existe', 'existem', 'ha', 'sou', 'e', 'fui', 'foi', 'am', 'is', 'are', 'have', 'has', 'there', 'logado', 'cadastrado'];
  if (stateStarts.includes(first)) return false;
  const actionVerb = ['clico', 'clica', 'clicar', 'preencho', 'preenche', 'digito', 'digita', 'seleciono', 'seleciona', 'envio', 'envia', 'acesso', 'acessa', 'abro', 'abre', 'navego', 'navega', 'informo', 'informa', 'faco', 'faz', 'click', 'clicks', 'fill', 'fills', 'type', 'types', 'enter', 'enters', 'select', 'selects', 'open', 'opens', 'navigate', 'navigates', 'visit', 'visits'];
  return actionVerb.includes(first);
}

// ----------------------------------------
// Regras
// ----------------------------------------

type RuleFn = (doc: GherkinDocument, ctx: { lang: Lang }) => Finding[];

const scenarioName = (s: Scenario, i: number): string => (s.title ? `"${s.title}"` : `sem título (cenário ${i + 1})`);

const STRUCTURE: Record<string, RuleFn> = {
  unknownLines: (doc, { lang }) =>
    doc.unknown.map((u) => ({
      rule: 'unknownLines',
      category: 'estrutura',
      severity: 'erro',
      line: u.line,
      message: u.suggestion
        ? `Palavra-chave desconhecida. Você quis dizer "${u.suggestion}"?`
        : 'Esta linha não começa com nenhuma palavra-chave do Gherkin.',
      hint: u.suggestion
        ? 'O Gherkin só reconhece as palavras-chave exatas. Corrija a digitação.'
        : `Todo passo começa com ${KEYWORD_LABEL[lang].given}, ${KEYWORD_LABEL[lang].when}, ${KEYWORD_LABEL[lang].then}, ${KEYWORD_LABEL[lang].and} ou ${KEYWORD_LABEL[lang].but}. Texto livre só é permitido logo abaixo da ${KEYWORD_LABEL[lang].feature}.`,
    })),

  hasFeature: (doc, { lang }) =>
    doc.feature
      ? []
      : [{
          rule: 'hasFeature',
          category: 'estrutura',
          severity: 'erro',
          line: 1,
          message: `Falta a linha "${KEYWORD_LABEL[lang].feature}:".`,
          hint: 'Todo arquivo .feature começa dizendo qual funcionalidade está sendo descrita.',
          example: lang === 'pt' ? 'Funcionalidade: Saque no caixa eletrônico' : 'Feature: ATM withdrawal',
        }],

  singleFeature: (doc, { lang }) =>
    doc.duplicateFeatures.map((line) => ({
      rule: 'singleFeature',
      category: 'estrutura',
      severity: 'erro',
      line,
      message: `Só pode existir uma "${KEYWORD_LABEL[lang].feature}" por arquivo.`,
      hint: 'Separe cada funcionalidade em um arquivo .feature próprio.',
    })),

  hasScenario: (doc, { lang }) =>
    doc.scenarios.length
      ? []
      : [{
          rule: 'hasScenario',
          category: 'estrutura',
          severity: 'erro',
          line: doc.feature?.line ?? 1,
          message: `Nenhum "${KEYWORD_LABEL[lang].scenario}:" encontrado.`,
          hint: 'A funcionalidade precisa de pelo menos um exemplo concreto de comportamento.',
          example: lang === 'pt'
            ? 'Cenário: Saque com saldo suficiente\n  Dado que tenho R$ 100 na conta\n  Quando saco R$ 30\n  Então meu saldo deve ser R$ 70'
            : 'Scenario: Withdraw with enough balance\n  Given I have $100 in my account\n  When I withdraw $30\n  Then my balance should be $70',
        }],

  strayStep: (doc, { lang }) =>
    doc.strays.map(({ step, context }) => ({
      rule: 'strayStep',
      category: 'estrutura',
      severity: 'erro',
      line: step.line,
      message: context === 'examples'
        ? `Passo depois da tabela de ${KEYWORD_LABEL[lang].examples}.`
        : `Passo fora de um ${KEYWORD_LABEL[lang].scenario}.`,
      hint: context === 'examples'
        ? `A tabela de ${KEYWORD_LABEL[lang].examples} encerra o esquema. Para escrever outro caso, comece um novo "${KEYWORD_LABEL[lang].scenario}:".`
        : `Passos sempre pertencem a um "${KEYWORD_LABEL[lang].scenario}:" ou a um "${KEYWORD_LABEL[lang].background}:".`,
    })),

  scenarioTitle: (doc, { lang }) =>
    doc.scenarios
      .filter((s) => !s.title)
      .map((s) => ({
        rule: 'scenarioTitle',
        category: 'estrutura',
        severity: 'aviso',
        line: s.line,
        message: 'Cenário sem título.',
        hint: 'O título é o que aparece no relatório de testes. Diga qual comportamento está sendo verificado.',
        example: `${KEYWORD_LABEL[lang].scenario}: Saque recusado por saldo insuficiente`,
      })),

  duplicateTitle: (doc) => {
    const seen = new Map<string, number>();
    const out: Finding[] = [];
    doc.scenarios.forEach((s) => {
      if (!s.title) return;
      const key = s.title.trim().toLowerCase();
      if (seen.has(key)) {
        out.push({
          rule: 'duplicateTitle',
          category: 'estrutura',
          severity: 'aviso',
          line: s.line,
          message: `Título repetido (igual ao da linha ${seen.get(key)}).`,
          hint: 'Cada cenário deve ter um nome único para ser identificado no relatório.',
        });
      } else seen.set(key, s.line);
    });
    return out;
  },

  hasWhenThen: (doc, { lang }) =>
    doc.scenarios.flatMap((s, i) => {
      const out: Finding[] = [];
      const has = (t: Step['type']) => s.steps.some((st) => st.type === t);
      if (!s.steps.length) {
        out.push({
          rule: 'hasWhenThen',
          category: 'estrutura',
          severity: 'erro',
          line: s.line,
          message: `O cenário ${scenarioName(s, i)} não tem passos.`,
          hint: `Descreva o comportamento com ${KEYWORD_LABEL[lang].given} → ${KEYWORD_LABEL[lang].when} → ${KEYWORD_LABEL[lang].then}.`,
        });
        return out;
      }
      if (!has('when')) {
        out.push({
          rule: 'hasWhenThen',
          category: 'estrutura',
          severity: 'erro',
          line: s.line,
          message: `O cenário ${scenarioName(s, i)} não tem "${KEYWORD_LABEL[lang].when}".`,
          hint: `"${KEYWORD_LABEL[lang].when}" é a ação que dispara o comportamento. Sem ela, não há o que testar.`,
        });
      }
      if (!has('then')) {
        out.push({
          rule: 'hasWhenThen',
          category: 'estrutura',
          severity: 'erro',
          line: s.line,
          message: `O cenário ${scenarioName(s, i)} não tem "${KEYWORD_LABEL[lang].then}".`,
          hint: `"${KEYWORD_LABEL[lang].then}" é o resultado esperado. É ele que faz o teste passar ou falhar.`,
          example: lang === 'pt' ? 'Então meu saldo deve ser R$ 70' : 'Then my balance should be $70',
        });
      }
      return out;
    }),

  orphanAnd: (doc, { lang }) =>
    doc.scenarios.flatMap((s) =>
      s.steps
        .filter((st) => st.type === null)
        .map((st) => ({
          rule: 'orphanAnd',
          category: 'estrutura' as Category,
          severity: 'erro' as Severity,
          line: st.line,
          message: `"${st.word}" no início do cenário não continua nenhum passo.`,
          hint: `"${KEYWORD_LABEL[lang].and}" e "${KEYWORD_LABEL[lang].but}" repetem o tipo do passo anterior. Comece com ${KEYWORD_LABEL[lang].given}, ${KEYWORD_LABEL[lang].when} ou ${KEYWORD_LABEL[lang].then}.`,
        }))
    ),

  stepOrder: (doc, { lang }) =>
    doc.scenarios.flatMap((s) => {
      const out: Finding[] = [];
      let seenWhen = false;
      let seenThen = false;
      for (const st of s.steps) {
        if (st.type === 'given' && (seenWhen || seenThen)) {
          out.push({
            rule: 'stepOrder',
            category: 'estrutura',
            severity: 'erro',
            line: st.line,
            message: `"${KEYWORD_LABEL[lang].given}" depois de uma ação ou resultado.`,
            hint: `O contexto vem primeiro. Mova este passo para antes do "${KEYWORD_LABEL[lang].when}".`,
          });
        }
        if (st.type === 'when' && seenThen && st.keyword === 'when') {
          out.push({
            rule: 'stepOrder',
            category: 'estrutura',
            severity: 'erro',
            line: st.line,
            message: `"${KEYWORD_LABEL[lang].when}" depois do "${KEYWORD_LABEL[lang].then}".`,
            hint: 'Depois do resultado, o cenário termina. Uma nova ação é um novo cenário.',
          });
        }
        if (st.type === 'when') seenWhen = true;
        if (st.type === 'then') seenThen = true;
      }
      return out;
    }),
};

const SEMANTICS: Record<string, RuleFn> = {
  givenIsState: (doc, { lang }) => {
    const steps = [
      ...doc.scenarios.flatMap((s) => s.steps),
      ...(doc.background?.steps ?? []),
      ...doc.rules.flatMap((r) => r.background?.steps ?? []),
    ];
    return steps
      .filter((st) => st.type === 'given' && looksLikeActionInGiven(st.text))
      .map((st) => ({
        rule: 'givenIsState',
        category: 'semantica' as Category,
        severity: 'erro' as Severity,
        line: st.line,
        message: `"${KEYWORD_LABEL[lang].given}" descreve uma ação, não um estado.`,
        hint: `"${KEYWORD_LABEL[lang].given}" diz como o mundo já está antes do teste. Ações ficam no "${KEYWORD_LABEL[lang].when}".`,
        example: lang === 'pt'
          ? 'Em vez de "Dado que clico em entrar", escreva "Dado que estou na área logada"'
          : 'Instead of "Given I click login", write "Given I am logged in"',
      }));
  },

  singleAction: (doc, { lang }) =>
    doc.scenarios.flatMap((s, i) => {
      const actions = s.steps.filter((st) => st.type === 'when');
      if (actions.length <= 1) return [];
      return [{
        rule: 'singleAction',
        category: 'semantica' as Category,
        severity: 'erro' as Severity,
        line: actions[1].line,
        message: `O cenário ${scenarioName(s, i)} tem ${actions.length} ações.`,
        hint: 'Cada cenário deve verificar um comportamento. Várias ações costumam esconder vários cenários. Divida em cenários menores ou junte as ações em uma só frase de negócio.',
        example: lang === 'pt'
          ? 'Em vez de "Quando informo o email / E informo a senha / E confirmo", escreva "Quando faço login com credenciais válidas"'
          : 'Instead of three steps, write "When I log in with valid credentials"',
      }];
    }),

  whenIsAction: (doc, { lang }) =>
    doc.scenarios.flatMap((s) =>
      s.steps
        .filter((st) => st.keyword === 'when' && !isAction(st.text))
        .map((st) => ({
          rule: 'whenIsAction',
          category: 'semantica' as Category,
          severity: 'aviso' as Severity,
          line: st.line,
          message: `"${KEYWORD_LABEL[lang].when}" não parece descrever uma ação.`,
          hint: 'Descreva o que alguém faz (ou o evento que acontece) com um verbo de ação.',
          example: lang === 'pt' ? 'Quando saco R$ 30' : 'When I withdraw $30',
        }))
    ),

  thenIsObservable: (doc, { lang }) =>
    doc.scenarios.flatMap((s) =>
      s.steps
        .filter((st) => st.keyword === 'then' && !isObservable(st.text))
        .map((st) => ({
          rule: 'thenIsObservable',
          category: 'semantica' as Category,
          severity: 'aviso' as Severity,
          line: st.line,
          message: `"${KEYWORD_LABEL[lang].then}" não descreve algo verificável.`,
          hint: 'O resultado precisa ser algo que dá para conferir: um valor, uma mensagem, um estado.',
          example: lang === 'pt' ? 'Então devo ver a mensagem "Saque realizado"' : 'Then I should see "Withdrawal complete"',
        }))
    ),

  thenNotAction: (doc, { lang }) =>
    doc.scenarios.flatMap((s) =>
      s.steps
        .filter((st) => st.type === 'then' && looksLikeActionInGiven(st.text))
        .map((st) => ({
          rule: 'thenNotAction',
          category: 'semantica' as Category,
          severity: 'erro' as Severity,
          line: st.line,
          message: `"${KEYWORD_LABEL[lang].then}" contém uma ação.`,
          hint: 'Depois do resultado não se faz mais nada no mesmo cenário. Se precisa agir de novo, é outro cenário.',
        }))
    ),
};

const LANGUAGE: Record<string, RuleFn> = {
  noUITerms: (doc) => {
    const steps = allSteps(doc);
    return steps.flatMap((st) => {
      const term = findTerm(st.text, UI_TERMS);
      return term
        ? [{
            rule: 'noUITerms',
            category: 'linguagem' as Category,
            severity: 'aviso' as Severity,
            line: st.line,
            message: `Detalhe de interface: "${term}".`,
            hint: 'Cenários descrevem o que a pessoa quer, não como a tela funciona. Se o botão mudar de lugar, o cenário continua verdadeiro.',
            example: 'Em vez de "clico no botão Entrar", escreva "faço login"',
          }]
        : [];
    });
  },

  noTechTerms: (doc) =>
    allSteps(doc).flatMap((st) => {
      const term = findTerm(st.text, TECH_TERMS);
      return term
        ? [{
            rule: 'noTechTerms',
            category: 'linguagem' as Category,
            severity: 'aviso' as Severity,
            line: st.line,
            message: `Termo técnico: "${term}".`,
            hint: 'Quem é do negócio precisa entender o cenário. Detalhes técnicos ficam nos step definitions.',
            example: 'Em vez de "a API retorna 200", escreva "o pedido é confirmado"',
          }]
        : [];
    }),

  noVagueOutcome: (doc) =>
    allSteps(doc)
      .filter((st) => st.type === 'then')
      .flatMap((st) => {
        const term = findTerm(st.text, VAGUE_TERMS);
        return term
          ? [{
              rule: 'noVagueOutcome',
              category: 'linguagem' as Category,
              severity: 'aviso' as Severity,
              line: st.line,
              message: `Resultado vago: "${term}".`,
              hint: '"Corretamente" não diz o que verificar. Escreva o valor ou a mensagem esperada.',
              example: 'Em vez de "o login funciona corretamente", escreva "devo ver meu nome no topo da página"',
            }]
          : [];
      }),

  consistentPerson: (doc) =>
    doc.scenarios.flatMap((s) => {
      const first = s.steps.filter((st) => findTerm(st.text, FIRST_PERSON));
      const third = s.steps.filter((st) => /\b(o|a) (usuario|cliente|administrador|visitante|user|customer)\b/.test(norm(st.text)));
      if (first.length && third.length) {
        return [{
          rule: 'consistentPerson',
          category: 'linguagem' as Category,
          severity: 'aviso' as Severity,
          line: third[0].line,
          message: 'O cenário mistura "eu" com "o usuário".',
          hint: 'Escolha uma pessoa (1ª: "eu faço login" ou 3ª: "o cliente faz login") e mantenha até o fim.',
        }];
      }
      return [];
    }),

  stepLength: (doc) =>
    allSteps(doc)
      .filter((st) => st.text.length > 110)
      .map((st) => ({
        rule: 'stepLength',
        category: 'linguagem' as Category,
        severity: 'aviso' as Severity,
        line: st.line,
        message: `Passo muito longo (${st.text.length} caracteres).`,
        hint: 'Passos longos geralmente juntam várias ideias. Quebre em passos com "E" ou simplifique.',
      })),
};

const MODELING: Record<string, RuleFn> = {
  backgroundOnlyGiven: (doc, { lang }) =>
    [doc.background, ...doc.rules.map((r) => r.background)]
      .filter((b): b is NonNullable<typeof b> => !!b)
      .flatMap((b) =>
        b.steps
          .filter((st) => st.type !== 'given')
          .map((st) => ({
            rule: 'backgroundOnlyGiven',
            category: 'modelagem' as Category,
            severity: 'erro' as Severity,
            line: st.line,
            message: `"${KEYWORD_LABEL[lang].background}" com passo que não é "${KEYWORD_LABEL[lang].given}".`,
            hint: `O ${KEYWORD_LABEL[lang].background} prepara o terreno para todos os cenários. Ações e resultados pertencem a cada cenário.`,
          }))
      ),

  outlineHasExamples: (doc, { lang }) =>
    doc.scenarios
      .filter((s) => s.type === 'outline')
      .flatMap((s, i) => {
        if (!s.examples.length || !s.examples.some((e) => e.headers.length)) {
          return [{
            rule: 'outlineHasExamples',
            category: 'modelagem' as Category,
            severity: 'erro' as Severity,
            line: s.line,
            message: `O esquema ${scenarioName(s, i)} não tem tabela de ${KEYWORD_LABEL[lang].examples}.`,
            hint: `Um ${KEYWORD_LABEL[lang].outline} roda uma vez para cada linha da tabela de ${KEYWORD_LABEL[lang].examples}.`,
            example: lang === 'pt'
              ? 'Exemplos:\n  | saldo | saque | resultado |\n  | 100   | 30    | 70        |'
              : 'Examples:\n  | balance | amount | result |\n  | 100     | 30     | 70     |',
          }];
        }
        if (s.examples.every((e) => e.rows.length < 2)) {
          return [{
            rule: 'outlineHasExamples',
            category: 'modelagem' as Category,
            severity: 'aviso' as Severity,
            line: s.examples[0].line,
            message: `Só uma linha de ${KEYWORD_LABEL[lang].examples}.`,
            hint: `Com um caso só, um ${KEYWORD_LABEL[lang].scenario} comum é mais simples. O esquema vale a pena com 2 ou mais variações.`,
          }];
        }
        return [];
      }),

  paramsMatchExamples: (doc, { lang }) =>
    doc.scenarios
      .filter((s) => s.type === 'outline' && s.examples.some((e) => e.headers.length))
      .flatMap((s) => {
        const used = new Set(s.steps.flatMap((st) => st.params.map((p) => p.slice(1, -1).trim())));
        const headers = new Set(s.examples.flatMap((e) => e.headers));
        const out: Finding[] = [];
        for (const p of used) {
          if (!headers.has(p)) {
            const st = s.steps.find((x) => x.params.includes(`<${p}>`));
            out.push({
              rule: 'paramsMatchExamples',
              category: 'modelagem',
              severity: 'erro',
              line: st?.line ?? s.line,
              message: `A variável <${p}> não existe na tabela de ${KEYWORD_LABEL[lang].examples}.`,
              hint: 'Cada <variável> usada nos passos precisa de uma coluna com o mesmo nome.',
            });
          }
        }
        for (const h of headers) {
          if (!used.has(h)) {
            const ex = s.examples.find((e) => e.headers.includes(h));
            out.push({
              rule: 'paramsMatchExamples',
              category: 'modelagem',
              severity: 'aviso',
              line: ex?.headerLine ?? s.line,
              message: `A coluna "${h}" não é usada em nenhum passo.`,
              hint: 'Colunas sem uso confundem quem lê. Remova ou use <' + h + '> em um passo.',
            });
          }
        }
        s.examples.forEach((e) =>
          e.rows.forEach((row, ri) => {
            if (row.length !== e.headers.length) {
              out.push({
                rule: 'paramsMatchExamples',
                category: 'modelagem',
                severity: 'erro',
                line: (e.headerLine ?? e.line) + ri + 1,
                message: `Linha da tabela com ${row.length} colunas (o cabeçalho tem ${e.headers.length}).`,
                hint: 'Todas as linhas precisam ter o mesmo número de colunas do cabeçalho.',
              });
            }
          })
        );
        return out;
      }),

  paramsOutsideOutline: (doc, { lang }) =>
    doc.scenarios
      .filter((s) => s.type === 'scenario')
      .flatMap((s) =>
        s.steps
          .filter((st) => st.params.length)
          .map((st) => ({
            rule: 'paramsOutsideOutline',
            category: 'modelagem' as Category,
            severity: 'erro' as Severity,
            line: st.line,
            message: `${st.params.join(', ')} só funciona dentro de um ${KEYWORD_LABEL[lang].outline}.`,
            hint: `Troque "${KEYWORD_LABEL[lang].scenario}:" por "${KEYWORD_LABEL[lang].outline}:" e adicione ${KEYWORD_LABEL[lang].examples}, ou escreva o valor direto.`,
          }))
      ),

  ruleHasTitle: (doc, { lang }) =>
    doc.rules
      .filter((r) => !r.title)
      .map((r) => ({
        rule: 'ruleHasTitle',
        category: 'modelagem' as Category,
        severity: 'aviso' as Severity,
        line: r.line,
        message: `${KEYWORD_LABEL[lang].rule} sem título.`,
        hint: 'O título da regra é a própria regra de negócio, por exemplo "Saque não pode deixar o saldo negativo".',
      })),

  similarScenarios: (doc, { lang }) => {
    const signature = (sc: Scenario) =>
      sc.steps.map((st) => `${st.type}:${norm(st.text).replace(/"[^"]*"/g, '"x"').replace(/\d+([.,]\d+)?/g, '0')}`).join('|');
    const groups = new Map<string, Scenario[]>();
    doc.scenarios
      .filter((sc) => sc.type === 'scenario' && sc.steps.length)
      .forEach((sc) => groups.set(signature(sc), [...(groups.get(signature(sc)) ?? []), sc]));
    return [...groups.values()]
      .filter((g) => g.length >= 2)
      .map((g) => ({
        rule: 'similarScenarios',
        category: 'modelagem' as Category,
        severity: 'aviso' as Severity,
        line: g[1].line,
        message: `${g.length} cenários iguais que só mudam os valores.`,
        hint: `Use um "${KEYWORD_LABEL[lang].outline}:" com <variáveis> e uma tabela de ${KEYWORD_LABEL[lang].examples}: menos texto repetido e mais fácil de acrescentar casos.`,
      }));
  },

  scenarioSize: (doc) =>
    doc.scenarios
      .filter((s) => s.steps.length > 8)
      .map((s, i) => ({
        rule: 'scenarioSize',
        category: 'modelagem' as Category,
        severity: 'aviso' as Severity,
        line: s.line,
        message: `O cenário ${scenarioName(s, i)} tem ${s.steps.length} passos.`,
        hint: 'Cenários longos são difíceis de ler e manter. Use Contexto para o que se repete ou divida o comportamento.',
      })),

  repeatedSetup: (doc, { lang }) => {
    const groups = doc.rules.length
      ? doc.rules.map((r) => ({ bg: r.background ?? doc.background, scenarios: r.scenarios }))
      : [{ bg: doc.background, scenarios: doc.scenarios }];
    return groups.flatMap(({ bg, scenarios }) => {
      if (bg || scenarios.length < 2) return [];
      const firsts = scenarios.map((s) => s.steps[0]).filter((x): x is Step => !!x && x.type === 'given');
      if (firsts.length !== scenarios.length) return [];
      const same = firsts.every((st) => norm(st.text) === norm(firsts[0].text));
      return same
        ? [{
            rule: 'repeatedSetup',
            category: 'modelagem' as Category,
            severity: 'aviso' as Severity,
            line: firsts[1].line,
            message: 'Todos os cenários começam com o mesmo passo.',
            hint: `Passos repetidos no início de todos os cenários podem ir para um "${KEYWORD_LABEL[lang].background}:".`,
          }]
        : [];
    });
  },
};

const RULES_BY_CATEGORY: Record<Category, Record<string, RuleFn>> = {
  estrutura: STRUCTURE,
  semantica: SEMANTICS,
  linguagem: LANGUAGE,
  modelagem: MODELING,
};

function allSteps(doc: GherkinDocument): Step[] {
  return [
    ...(doc.background?.steps ?? []),
    ...doc.rules.flatMap((r) => r.background?.steps ?? []),
    ...doc.scenarios.flatMap((s) => s.steps),
  ];
}

// ----------------------------------------
// Execução e pontuação
// ----------------------------------------

export interface CategoryScore {
  category: Category;
  checks: number;
  passed: number;
  percentage: number;
}

export interface Report {
  doc: GherkinDocument;
  level: LevelInfo;
  findings: Finding[];
  errors: Finding[];
  warnings: Finding[];
  /** sem erros (avisos não reprovam) */
  valid: boolean;
  score: number;
  grade: string;
  categories: CategoryScore[];
}

const WEIGHTS: Record<Category, number> = { estrutura: 0.4, semantica: 0.25, linguagem: 0.2, modelagem: 0.15 };

export function runRules(doc: GherkinDocument, levelId: Level): Report {
  const level = LEVELS[levelId] ?? LEVELS.basico;
  const ctx = { lang: doc.lang };
  const findings: Finding[] = [];
  const categories: CategoryScore[] = [];

  for (const category of level.categories) {
    const rules = RULES_BY_CATEGORY[category];
    let passed = 0;
    let checks = 0;
    for (const fn of Object.values(rules)) {
      const out = fn(doc, ctx);
      checks++;
      // aviso custa metade de um erro
      const penalty = out.some((f) => f.severity === 'erro') ? 1 : out.length ? 0.5 : 0;
      passed += 1 - penalty;
      findings.push(...out);
    }
    categories.push({ category, checks, passed, percentage: Math.round((passed / checks) * 100) });
  }

  // Erros estruturais tornam o resto pouco confiável: limita a nota
  const errors = findings.filter((f) => f.severity === 'erro');
  const warnings = findings.filter((f) => f.severity === 'aviso');
  const weightSum = categories.reduce((s, c) => s + WEIGHTS[c.category], 0);
  let score = Math.round(categories.reduce((s, c) => s + (c.percentage * WEIGHTS[c.category]) / weightSum, 0));
  if (!doc.feature || !doc.scenarios.length) score = Math.min(score, 30);
  // Cada aviso tira 2 pontos (até 15): avisos não reprovam, mas pesam
  score = Math.max(0, score - Math.min(15, warnings.length * 2));
  // Com erros, o cenário ainda não está pronto: a nota não passa de "Em evolução"
  if (errors.length) score = Math.min(score, 70);

  findings.sort((a, b) => (a.line ?? 0) - (b.line ?? 0) || (a.severity === 'erro' ? -1 : 1));

  const grade = score >= 90 ? 'Excelente' : score >= 75 ? 'Bom' : score >= 50 ? 'Em evolução' : 'Iniciando';

  return { doc, level, findings, errors, warnings, valid: errors.length === 0, score, grade, categories };
}

/** Cenários + Contexto aplicável (para gerar step definitions). */
export function stepsWithBackground(doc: GherkinDocument, s: Scenario): Step[] {
  return [...backgroundFor(doc, s).flatMap((b) => b.steps), ...s.steps];
}
