// ========================================
// Gera esqueletos de step definitions (Cucumber) a partir do Gherkin
// ----------------------------------------
// Mostra a ponte entre o cenário escrito e o código de automação:
// valores entre aspas viram {string}, números viram {int}/{float} e
// <variáveis> do Esquema do Cenário viram parâmetros.
// ========================================

import type { GherkinDocument, Scenario, StepType } from './gherkin.js';

export type Target = 'js' | 'java';

interface StepDef {
  type: StepType;
  expression: string;
  params: Array<{ name: string; kind: 'string' | 'int' | 'float' }>;
  sample: string;
  note?: string;
}

const NUMBER_RE = /(?<![\w.,])-?\d+(?:[.,]\d+)?(?![\w])/g;

/** Converte o texto de um passo em Cucumber Expression. */
interface ExprResult {
  expr: string;
  params: StepDef['params'];
  note?: string;
}

function toExpression(text: string, scenario: Scenario): ExprResult {
  const params: StepDef['params'] = [];
  let note: string | undefined;
  const counters = { string: 0, int: 0, float: 0 };
  const baseName = { string: 'texto', int: 'numero', float: 'valor' } as const;
  const add = (kind: 'string' | 'int' | 'float') => {
    counters[kind]++;
    params.push({ name: `${baseName[kind]}${counters[kind] > 1 ? counters[kind] : ''}`, kind });
  };
  // Marcador sem dígitos (caractere de uso privado), para não ser capturado como número
  const mark = (i: number) => `\uE000${String.fromCharCode(0xe100 + i)}\uE000`;

  // Marca trechos antes de escapar
  const tokens: string[] = [];
  let work = text;

  // "<param>" ou "texto"
  work = work.replace(/"([^"]*)"/g, () => {
    add('string');
    tokens.push('{string}');
    return mark(tokens.length - 1);
  });

  // <param> sem aspas: decide pelo primeiro valor do exemplo
  work = work.replace(/<([^>]+)>/g, (_m, name: string) => {
    const ex = scenario.examples.find((e) => e.headers.includes(name.trim()));
    const value = ex ? ex.rows[0]?.[ex.headers.indexOf(name.trim())] ?? '' : '';
    if (/^-?\d+$/.test(value)) {
      add('int');
      tokens.push('{int}');
    } else if (/^-?\d+[.,]\d+$/.test(value)) {
      add('float');
      tokens.push('{float}');
    } else {
      add('string');
      tokens.push('{string}');
      note = `coloque <${name}> entre aspas no passo para casar com {string}`;
    }
    return mark(tokens.length - 1);
  });

  // Números soltos
  work = work.replace(NUMBER_RE, (m) => {
    const isFloat = /[.,]/.test(m);
    add(isFloat ? 'float' : 'int');
    tokens.push(isFloat ? '{float}' : '{int}');
    return mark(tokens.length - 1);
  });

  // Escapa caracteres especiais das Cucumber Expressions
  work = work.replace(/([(){}/\\])/g, '\\$1');
  const expr = work.replace(/\uE000([\uE100-\uEFFF])\uE000/g, (_m, c: string) => tokens[c.charCodeAt(0) - 0xe100]);
  return { expr, params, note };
}

export function collectStepDefs(doc: GherkinDocument): StepDef[] {
  const seen = new Map<string, StepDef>();
  const withBg = doc.scenarios.map((s) => ({
    scenario: s,
    steps: [...(doc.background?.steps ?? []), ...(s.rule?.background?.steps ?? []), ...s.steps],
  }));

  for (const { scenario, steps } of withBg) {
    for (const st of steps) {
      if (!st.type || !st.text) continue;
      const { expr, params, note } = toExpression(st.text, scenario);
      if (!seen.has(expr)) seen.set(expr, { type: st.type, expression: expr, params, sample: `${st.word} ${st.text}`, note });
    }
  }
  return [...seen.values()];
}

const JS_KW: Record<StepType, string> = { given: 'Given', when: 'When', then: 'Then' };
const JAVA_KW = {
  pt: { given: 'Dado', when: 'Quando', then: 'Entao', pkg: 'io.cucumber.java.pt' },
  en: { given: 'Given', when: 'When', then: 'Then', pkg: 'io.cucumber.java.en' },
} as const;

const jsString = (s: string) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const javaString = (s: string) => `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

const camel = (s: string): string => {
  const w = s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((x) => x && !['que', 'o', 'a', 'os', 'as', 'de', 'do', 'da', 'eu', 'the', 'i'].includes(x.toLowerCase()))
    .slice(0, 5);
  const name = w.map((x, i) => (i ? x[0].toUpperCase() + x.slice(1).toLowerCase() : x.toLowerCase())).join('');
  return /^[a-z]/.test(name) ? name : `passo${name}`;
};

export function generate(doc: GherkinDocument, target: Target): string {
  const defs = collectStepDefs(doc);
  if (!defs.length) return '';

  if (target === 'js') {
    const used = [...new Set(defs.map((d) => JS_KW[d.type]))];
    const body = defs
      .map((d) => {
        const args = d.params.map((p) => p.name).join(', ');
        const note = d.note ? `\n  // Dica: ${d.note}` : '';
        return `// ${d.sample}\n${JS_KW[d.type]}(${jsString(d.expression)}, async function (${args}) {${note}\n  // TODO: automatizar este passo\n  return 'pending';\n});`;
      })
      .join('\n\n');
    return `import { ${used.join(', ')} } from '@cucumber/cucumber';\n\n${body}\n`;
  }

  const kw = JAVA_KW[doc.lang];
  const imports = [...new Set(defs.map((d) => kw[d.type]))].map((k) => `import ${kw.pkg}.${k};`).join('\n');
  const javaType = { string: 'String', int: 'int', float: 'double' } as const;
  const usedNames = new Map<string, number>();
  const methods = defs
    .map((d) => {
      let name = camel(d.sample.replace(/^\S+\s/, ''));
      const n = (usedNames.get(name) ?? 0) + 1;
      usedNames.set(name, n);
      if (n > 1) name += n;
      const args = d.params.map((p) => `${javaType[p.kind]} ${p.name}`).join(', ');
      const note = d.note ? `\n        // Dica: ${d.note}` : '';
      return `    // ${d.sample}\n    @${kw[d.type]}(${javaString(d.expression)})\n    public void ${name}(${args}) {${note}\n        throw new io.cucumber.java.PendingException();\n    }`;
    })
    .join('\n\n');
  return `${imports}\n\npublic class StepDefinitions {\n\n${methods}\n}\n`;
}
