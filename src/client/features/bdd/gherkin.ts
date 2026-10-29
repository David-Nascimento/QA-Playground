// ========================================
// Gherkin - palavras-chave (PT-BR e EN) e parser com número de linha
// ----------------------------------------
// Segue o dialeto oficial do Gherkin (i18n "pt" e "en"). Aceita os dois
// idiomas no mesmo texto; "# language: pt" ou "# language: en" no topo
// apenas define o idioma preferido para mensagens e exemplos.
// ========================================

export type Lang = 'pt' | 'en';

/** Tipo de passo depois de resolver E/Mas para o passo anterior. */
export type StepType = 'given' | 'when' | 'then';
export type StepKeyword = StepType | 'and' | 'but';

export type BlockType = 'feature' | 'background' | 'rule' | 'scenario' | 'outline' | 'examples';

/** Palavras-chave de bloco (terminam com ":"). A ordem importa: mais longas primeiro. */
const BLOCK_KEYWORDS: Array<{ type: BlockType; pt: string[]; en: string[] }> = [
  { type: 'outline', pt: ['Esquema do Cenário', 'Esquema do Cenario', 'Delineação do Cenário', 'Delineacao do Cenario'], en: ['Scenario Outline', 'Scenario Template'] },
  { type: 'background', pt: ['Cenário de Fundo', 'Cenario de Fundo', 'Contexto', 'Fundo'], en: ['Background'] },
  { type: 'feature', pt: ['Funcionalidade', 'Característica', 'Caracteristica'], en: ['Feature', 'Business Need', 'Ability'] },
  { type: 'examples', pt: ['Exemplos', 'Cenários', 'Cenarios'], en: ['Examples', 'Scenarios'] },
  { type: 'scenario', pt: ['Cenário', 'Cenario', 'Exemplo'], en: ['Scenario', 'Example'] },
  { type: 'rule', pt: ['Regra'], en: ['Rule'] },
];

/** Palavras-chave de passo (seguidas de espaço). */
const STEP_KEYWORDS: Array<{ keyword: StepKeyword; pt: string[]; en: string[] }> = [
  { keyword: 'given', pt: ['Dado', 'Dada', 'Dados', 'Dadas'], en: ['Given'] },
  { keyword: 'when', pt: ['Quando'], en: ['When'] },
  { keyword: 'then', pt: ['Então', 'Entao'], en: ['Then'] },
  { keyword: 'and', pt: ['E'], en: ['And'] },
  { keyword: 'but', pt: ['Mas'], en: ['But'] },
];

const PT_WORDS = [...BLOCK_KEYWORDS, ...STEP_KEYWORDS].flatMap((k) => k.pt);

/** Nome da palavra-chave no idioma escolhido (para mensagens e geração). */
export const KEYWORD_LABEL: Record<Lang, Record<BlockType | StepKeyword, string>> = {
  pt: {
    feature: 'Funcionalidade', background: 'Contexto', rule: 'Regra', scenario: 'Cenário',
    outline: 'Esquema do Cenário', examples: 'Exemplos',
    given: 'Dado', when: 'Quando', then: 'Então', and: 'E', but: 'Mas',
  },
  en: {
    feature: 'Feature', background: 'Background', rule: 'Rule', scenario: 'Scenario',
    outline: 'Scenario Outline', examples: 'Examples',
    given: 'Given', when: 'When', then: 'Then', and: 'And', but: 'But',
  },
};

/** Todas as palavras-chave conhecidas (para sugerir correções de digitação). */
export const ALL_KEYWORDS: string[] = [...BLOCK_KEYWORDS, ...STEP_KEYWORDS].flatMap((k) => [...k.pt, ...k.en]);

// ----------------------------------------
// Estrutura resultante
// ----------------------------------------

export interface Step {
  keyword: StepKeyword;
  /** given/when/then efetivo (E/Mas herdam do passo anterior) */
  type: StepType | null;
  /** palavra como foi escrita (ex.: "Dado") */
  word: string;
  text: string;
  line: number;
  params: string[];
  dataTable?: string[][];
  docString?: string;
}

export interface Examples {
  title: string;
  line: number;
  headers: string[];
  rows: string[][];
  headerLine: number | null;
}

export interface Scenario {
  type: 'scenario' | 'outline';
  word: string;
  title: string;
  line: number;
  tags: string[];
  steps: Step[];
  examples: Examples[];
  rule: Rule | null;
}

export interface Background {
  word: string;
  line: number;
  steps: Step[];
}

export interface Rule {
  word: string;
  title: string;
  line: number;
  background: Background | null;
  scenarios: Scenario[];
}

export interface Feature {
  word: string;
  title: string;
  line: number;
  description: string[];
  tags: string[];
}

export interface UnknownLine {
  line: number;
  text: string;
  /** palavra-chave mais parecida, se o início da linha parecer um erro de digitação */
  suggestion: string | null;
  /** onde a linha apareceu */
  context: 'before-feature' | 'feature' | 'scenario' | 'background' | 'examples' | 'rule';
}

export interface StrayStep {
  step: Step;
  context: 'before-feature' | 'feature' | 'rule' | 'examples';
}

export interface GherkinDocument {
  lang: Lang;
  declaredLang: Lang | null;
  feature: Feature | null;
  background: Background | null;
  rules: Rule[];
  /** todos os cenários do documento, inclusive os que estão dentro de regras */
  scenarios: Scenario[];
  unknown: UnknownLine[];
  strays: StrayStep[];
  duplicateFeatures: number[];
  lineCount: number;
}

// ----------------------------------------
// Utilitários
// ----------------------------------------

const normalize = (s: string): string =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Distância de edição (Levenshtein), usada para "você quis dizer…?". */
export function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...new Array(n).fill(0)]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return d[m][n];
}

/** Sugere a palavra-chave mais próxima do início de uma linha desconhecida. */
function suggestKeyword(line: string): string | null {
  const head = line.split(/[:\s]/)[0];
  if (!head || head.length < 2) return null;
  const nh = normalize(head);
  let best: string | null = null;
  let bestDist = Infinity;
  for (const kw of ALL_KEYWORDS) {
    const first = normalize(kw.split(' ')[0]);
    const dist = editDistance(nh, first);
    if (dist < bestDist || (dist === bestDist && best && kw.length < best.length)) {
      bestDist = dist;
      best = kw;
    }
  }
  const tolerance = nh.length <= 4 ? 1 : 2;
  return bestDist > 0 && bestDist <= tolerance ? best : null;
}

const isPt = (word: string): boolean => PT_WORDS.some((w) => normalize(w) === normalize(word));

function matchBlock(line: string): { type: BlockType; word: string; rest: string } | null {
  for (const { type, pt, en } of BLOCK_KEYWORDS) {
    for (const word of [...pt, ...en]) {
      if (normalize(line).startsWith(normalize(word) + ':')) {
        return { type, word: line.slice(0, word.length), rest: line.slice(word.length + 1).trim() };
      }
    }
  }
  return null;
}

function matchStep(line: string): { keyword: StepKeyword; word: string; rest: string } | null {
  for (const { keyword, pt, en } of STEP_KEYWORDS) {
    for (const word of [...pt, ...en]) {
      // A palavra precisa estar inteira e seguida de espaço ("E " e não "Então")
      if (line.length > word.length && normalize(line.slice(0, word.length)) === normalize(word) && /\s/.test(line[word.length])) {
        return { keyword, word: line.slice(0, word.length), rest: line.slice(word.length).trim() };
      }
    }
  }
  return null;
}

const splitRow = (line: string): string[] =>
  line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim());

// ----------------------------------------
// Parser
// ----------------------------------------

export function parseGherkin(source: string): GherkinDocument {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const doc: GherkinDocument = {
    lang: 'pt',
    declaredLang: null,
    feature: null,
    background: null,
    rules: [],
    scenarios: [],
    unknown: [],
    strays: [],
    duplicateFeatures: [],
    lineCount: lines.length,
  };

  let ptHits = 0;
  let enHits = 0;
  let pendingTags: string[] = [];
  let currentRule: Rule | null = null;
  let currentScenario: Scenario | null = null;
  let currentBackground: Background | null = null;
  let currentExamples: Examples | null = null;
  let lastStep: Step | null = null;
  let lastType: StepType | null = null;
  let inDocString: { delimiter: string; step: Step | null; buffer: string[] } | null = null;

  const context = (): UnknownLine['context'] => {
    if (currentExamples) return 'examples';
    if (currentScenario) return 'scenario';
    if (currentBackground) return 'background';
    if (currentRule) return 'rule';
    if (doc.feature) return 'feature';
    return 'before-feature';
  };

  lines.forEach((raw, idx) => {
    const lineNo = idx + 1;
    const line = raw.trim();

    // DocString ("""...""" ou ```...```)
    if (inDocString) {
      if (line.startsWith(inDocString.delimiter)) {
        if (inDocString.step) inDocString.step.docString = inDocString.buffer.join('\n');
        inDocString = null;
      } else {
        inDocString.buffer.push(raw);
      }
      return;
    }
    if (line.startsWith('"""') || line.startsWith('```')) {
      inDocString = { delimiter: line.slice(0, 3), step: lastStep, buffer: [] };
      return;
    }

    if (!line) return;

    if (line.startsWith('#')) {
      const lang = line.match(/^#\s*language\s*:\s*([a-z-]+)/i);
      if (lang && idx < 5) {
        const code = lang[1].toLowerCase();
        doc.declaredLang = code.startsWith('pt') ? 'pt' : code.startsWith('en') ? 'en' : null;
      }
      return;
    }

    if (line.startsWith('@')) {
      pendingTags.push(...line.split(/\s+/).filter((t) => t.startsWith('@')));
      return;
    }

    // Tabela (Examples ou data table de um passo)
    if (line.startsWith('|')) {
      const cells = splitRow(line);
      if (currentExamples) {
        if (!currentExamples.headers.length) {
          currentExamples.headers = cells;
          currentExamples.headerLine = lineNo;
        } else {
          currentExamples.rows.push(cells);
        }
      } else if (lastStep) {
        (lastStep.dataTable ||= []).push(cells);
      } else {
        doc.unknown.push({ line: lineNo, text: line, suggestion: null, context: context() });
      }
      return;
    }

    const block = matchBlock(line);
    if (block) {
      if (isPt(block.word)) ptHits++;
      else enHits++;
      const tags = pendingTags;
      pendingTags = [];
      lastStep = null;
      lastType = null;

      switch (block.type) {
        case 'feature':
          if (doc.feature) {
            doc.duplicateFeatures.push(lineNo);
          } else {
            doc.feature = { word: block.word, title: block.rest, line: lineNo, description: [], tags };
          }
          currentRule = null;
          currentScenario = null;
          currentBackground = null;
          currentExamples = null;
          break;
        case 'rule':
          currentRule = { word: block.word, title: block.rest, line: lineNo, background: null, scenarios: [] };
          doc.rules.push(currentRule);
          currentScenario = null;
          currentBackground = null;
          currentExamples = null;
          break;
        case 'background':
          currentBackground = { word: block.word, line: lineNo, steps: [] };
          if (currentRule) currentRule.background = currentBackground;
          else doc.background = currentBackground;
          currentScenario = null;
          currentExamples = null;
          break;
        case 'scenario':
        case 'outline':
          currentScenario = {
            type: block.type === 'outline' ? 'outline' : 'scenario',
            word: block.word,
            title: block.rest,
            line: lineNo,
            tags,
            steps: [],
            examples: [],
            rule: currentRule,
          };
          doc.scenarios.push(currentScenario);
          if (currentRule) currentRule.scenarios.push(currentScenario);
          currentBackground = null;
          currentExamples = null;
          break;
        case 'examples':
          if (currentScenario) {
            currentExamples = { title: block.rest, line: lineNo, headers: [], rows: [], headerLine: null };
            currentScenario.examples.push(currentExamples);
          } else {
            doc.unknown.push({ line: lineNo, text: line, suggestion: null, context: context() });
          }
          break;
      }
      return;
    }

    const stepMatch = matchStep(line);
    if (stepMatch) {
      if (isPt(stepMatch.word)) ptHits++;
      else enHits++;

      const type: StepType | null =
        stepMatch.keyword === 'and' || stepMatch.keyword === 'but' ? lastType : stepMatch.keyword;
      const step: Step = {
        keyword: stepMatch.keyword,
        type,
        word: stepMatch.word,
        text: stepMatch.rest,
        line: lineNo,
        params: stepMatch.rest.match(/<[^>]+>/g) || [],
      };
      lastStep = step;
      if (type) lastType = type;

      if (currentExamples) {
        // Passo depois de Exemplos: provavelmente faltou um novo Cenário
        doc.strays.push({ step, context: 'examples' });
      } else if (currentScenario) {
        currentScenario.steps.push(step);
      } else if (currentBackground) {
        currentBackground.steps.push(step);
      } else {
        doc.strays.push({ step, context: currentRule ? 'rule' : doc.feature ? 'feature' : 'before-feature' });
      }
      return;
    }

    // Texto livre: descrição da Funcionalidade/Regra é permitido; no resto, é erro
    if (doc.feature && !currentScenario && !currentBackground && !currentRule && !currentExamples) {
      doc.feature.description.push(line);
      return;
    }
    if (currentRule && !currentScenario && !currentBackground) return; // descrição da regra
    doc.unknown.push({ line: lineNo, text: line, suggestion: suggestKeyword(line), context: context() });
  });

  doc.lang = doc.declaredLang ?? (enHits > ptHits ? 'en' : 'pt');
  return doc;
}

/** Todos os passos de um cenário, incluindo o Contexto que se aplica a ele. */
export function backgroundFor(doc: GherkinDocument, scenario: Scenario): Background[] {
  const list: Background[] = [];
  if (doc.background) list.push(doc.background);
  if (scenario.rule?.background) list.push(scenario.rule.background);
  return list;
}
