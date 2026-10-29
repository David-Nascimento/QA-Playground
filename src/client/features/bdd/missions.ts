// ========================================
// Trilha guiada de BDD para iniciantes
// ----------------------------------------
// Cada missão traz uma história de usuário, um cenário inicial com um
// problema para corrigir, dicas progressivas e uma verificação automática
// feita pelo mesmo motor de regras do editor.
// ========================================

import type { GherkinDocument } from './gherkin.js';
import type { Level, Report } from './rules.js';

export interface MissionCheck {
  ok: boolean;
  /** o que ainda falta, em linguagem simples */
  missing: string[];
}

export interface Mission {
  id: string;
  title: string;
  concept: string;
  story: string;
  goal: string;
  level: Level;
  starter: string;
  hints: string[];
  solution: string;
  check: (doc: GherkinDocument, report: Report) => MissionCheck;
}

const has = (report: Report, rule: string) => report.findings.some((f) => f.rule === rule);

const result = (missing: string[]): MissionCheck => ({ ok: missing.length === 0, missing });

export const MISSIONS: Mission[] = [
  {
    id: 'primeiro-cenario',
    title: 'Seu primeiro cenário',
    concept: 'Dado → Quando → Então',
    story: 'Como correntista, quero sacar dinheiro no caixa eletrônico para pagar contas em espécie.',
    goal: 'O cenário abaixo não diz qual é o resultado esperado. Complete com um passo "Então" que dê para conferir.',
    level: 'basico',
    starter: `# language: pt
Funcionalidade: Saque no caixa eletrônico

  Cenário: Saque com saldo suficiente
    Dado que tenho R$ 100 na conta
    Quando saco R$ 30
`,
    hints: [
      '"Então" descreve o que deve acontecer depois da ação.',
      'Pense no que você conferiria no extrato depois de sacar R$ 30 de R$ 100.',
    ],
    solution: `# language: pt
Funcionalidade: Saque no caixa eletrônico

  Cenário: Saque com saldo suficiente
    Dado que tenho R$ 100 na conta
    Quando saco R$ 30
    Então meu saldo deve ser R$ 70
`,
    check: (doc, report) =>
      result([
        ...(report.valid ? [] : ['Corrija os erros apontados na validação.']),
        ...(doc.scenarios.some((s) => s.steps.some((st) => st.type === 'then')) ? [] : ['Adicione um passo começando com "Então".']),
      ]),
  },
  {
    id: 'dado-e-estado',
    title: '"Dado" é estado, não ação',
    concept: 'Papel de cada passo',
    story: 'Como cliente cadastrado, quero entrar na loja para ver meus pedidos.',
    goal: 'O "Dado" está descrevendo uma ação. Reescreva para descrever como as coisas já estão antes do teste.',
    level: 'intermediario',
    starter: `# language: pt
Funcionalidade: Meus pedidos

  Cenário: Ver pedidos depois de entrar
    Dado que eu clico em "Entrar" e informo minha senha
    Quando abro a área "Meus pedidos"
    Então devo ver meus 3 pedidos mais recentes
`,
    hints: [
      'Pergunte: "isso já é verdade antes do teste começar?" Se não for, não é um Dado.',
      'Um estado típico: "Dado que estou logado como cliente".',
    ],
    solution: `# language: pt
Funcionalidade: Meus pedidos

  Cenário: Ver pedidos depois de entrar
    Dado que estou logado como cliente com 3 pedidos
    Quando abro a área "Meus pedidos"
    Então devo ver meus 3 pedidos mais recentes
`,
    check: (_doc, report) =>
      result([
        ...(report.valid ? [] : ['Corrija os erros apontados na validação.']),
        ...(has(report, 'givenIsState') ? ['O "Dado" ainda descreve uma ação (clicar, informar…).'] : []),
      ]),
  },
  {
    id: 'um-comportamento',
    title: 'Um comportamento por cenário',
    concept: 'Cenários pequenos e focados',
    story: 'Como correntista, quero ser avisado quando um saque não puder ser feito.',
    goal: 'Este cenário testa duas coisas ao mesmo tempo. Divida em dois cenários, cada um com uma única ação.',
    level: 'intermediario',
    starter: `# language: pt
Funcionalidade: Saque no caixa eletrônico

  Cenário: Regras de saque
    Dado que tenho R$ 50 na conta
    Quando saco R$ 80
    Então devo ver a mensagem "Saldo insuficiente"
    Quando saco R$ 20
    Então meu saldo deve ser R$ 30
`,
    hints: [
      'Cada "Quando" novo costuma ser um novo cenário.',
      'Os dois cenários podem começar com o mesmo "Dado".',
    ],
    solution: `# language: pt
Funcionalidade: Saque no caixa eletrônico

  Cenário: Saque recusado por saldo insuficiente
    Dado que tenho R$ 50 na conta
    Quando saco R$ 80
    Então devo ver a mensagem "Saldo insuficiente"

  Cenário: Saque dentro do saldo
    Dado que tenho R$ 50 na conta
    Quando saco R$ 20
    Então meu saldo deve ser R$ 30
`,
    check: (doc, report) =>
      result([
        ...(report.valid ? [] : ['Corrija os erros apontados na validação.']),
        ...(doc.scenarios.length >= 2 ? [] : ['Crie pelo menos dois cenários.']),
        ...(doc.scenarios.some((s) => s.steps.filter((st) => st.type === 'when').length > 1)
          ? ['Ainda há um cenário com mais de uma ação.']
          : []),
      ]),
  },
  {
    id: 'lingua-do-negocio',
    title: 'Fale a língua do negócio',
    concept: 'Comportamento, não interface',
    story: 'Como comprador, quero aplicar um cupom para pagar menos.',
    goal: 'O cenário descreve cliques e campos da tela. Reescreva falando do que o comprador quer, sem citar botões, campos ou detalhes técnicos.',
    level: 'avancado',
    starter: `# language: pt
Funcionalidade: Cupom de desconto

  Cenário: Aplicar cupom válido
    Dado que tenho um carrinho de R$ 200
    Quando digito "BEMVINDO10" no campo cupom e clico no botão aplicar
    Então a API retorna status 200 e o total fica correto
`,
    hints: [
      'Se a tela mudar amanhã, o cenário ainda deve ser verdadeiro.',
      'Troque "digito no campo e clico no botão" por "aplico o cupom".',
      'Troque "fica correto" pelo valor esperado: 10% de R$ 200.',
    ],
    solution: `# language: pt
Funcionalidade: Cupom de desconto

  Cenário: Aplicar cupom válido
    Dado que tenho um carrinho de R$ 200
    Quando aplico o cupom "BEMVINDO10"
    Então o total do pedido deve ser R$ 180
`,
    check: (_doc, report) =>
      result([
        ...(report.valid ? [] : ['Corrija os erros apontados na validação.']),
        ...(has(report, 'noUITerms') ? ['Ainda há termos de interface (botão, campo, clicar…).'] : []),
        ...(has(report, 'noTechTerms') ? ['Ainda há termos técnicos (API, status…).'] : []),
        ...(has(report, 'noVagueOutcome') ? ['O resultado ainda está vago: diga o valor esperado.'] : []),
      ]),
  },
  {
    id: 'contexto',
    title: 'Contexto para o que se repete',
    concept: 'Contexto (Background)',
    story: 'Como administrador, quero gerenciar usuários da plataforma.',
    goal: 'Os dois cenários começam com o mesmo passo. Mova esse passo para um "Contexto:" no início.',
    level: 'especialista',
    starter: `# language: pt
Funcionalidade: Gestão de usuários

  Cenário: Bloquear um usuário
    Dado que estou logado como administrador
    Quando bloqueio a conta de "maria@exemplo.com"
    Então "maria@exemplo.com" não deve conseguir entrar

  Cenário: Reativar um usuário
    Dado que estou logado como administrador
    E a conta de "joao@exemplo.com" está bloqueada
    Quando reativo a conta de "joao@exemplo.com"
    Então "joao@exemplo.com" deve conseguir entrar
`,
    hints: [
      'O "Contexto:" fica depois da Funcionalidade e antes do primeiro Cenário.',
      'No Contexto entram só passos "Dado". O "E" do segundo cenário continua nele.',
    ],
    solution: `# language: pt
Funcionalidade: Gestão de usuários

  Contexto:
    Dado que estou logado como administrador

  Cenário: Bloquear um usuário
    Quando bloqueio a conta de "maria@exemplo.com"
    Então "maria@exemplo.com" não deve conseguir entrar

  Cenário: Reativar um usuário
    Dado que a conta de "joao@exemplo.com" está bloqueada
    Quando reativo a conta de "joao@exemplo.com"
    Então "joao@exemplo.com" deve conseguir entrar
`,
    check: (doc, report) =>
      result([
        ...(report.valid ? [] : ['Corrija os erros apontados na validação.']),
        ...(doc.background ? [] : ['Crie um "Contexto:" antes dos cenários.']),
        ...(has(report, 'repeatedSetup') ? ['Os cenários ainda começam com o mesmo passo.'] : []),
        ...(doc.scenarios.length >= 2 ? [] : ['Mantenha os dois cenários.']),
      ]),
  },
  {
    id: 'esquema',
    title: 'Muitos dados, um esquema',
    concept: 'Esquema do Cenário + Exemplos',
    story: 'Como loja, quero calcular o frete pela região do cliente.',
    goal: 'Os três cenários são iguais, só mudam os valores. Transforme em um "Esquema do Cenário" com uma tabela de "Exemplos".',
    level: 'especialista',
    starter: `# language: pt
Funcionalidade: Cálculo de frete

  Cenário: Frete para o Nordeste
    Dado que o cliente mora na região "Nordeste"
    Quando ele calcula o frete de uma compra de R$ 100
    Então o frete deve ser R$ 15

  Cenário: Frete para o Sudeste
    Dado que o cliente mora na região "Sudeste"
    Quando ele calcula o frete de uma compra de R$ 100
    Então o frete deve ser R$ 10

  Cenário: Frete para o Norte
    Dado que o cliente mora na região "Norte"
    Quando ele calcula o frete de uma compra de R$ 100
    Então o frete deve ser R$ 25
`,
    hints: [
      'Troque os valores que mudam por <variáveis>, por exemplo "<regiao>" e <frete>.',
      'Depois dos passos, crie "Exemplos:" com uma coluna para cada variável e uma linha por região.',
    ],
    solution: `# language: pt
Funcionalidade: Cálculo de frete

  Esquema do Cenário: Frete por região
    Dado que o cliente mora na região "<regiao>"
    Quando ele calcula o frete de uma compra de R$ 100
    Então o frete deve ser R$ <frete>

    Exemplos:
      | regiao   | frete |
      | Nordeste | 15    |
      | Sudeste  | 10    |
      | Norte    | 25    |
`,
    check: (doc, report) => {
      const outline = doc.scenarios.find((s) => s.type === 'outline');
      const rows = outline?.examples.reduce((n, e) => n + e.rows.length, 0) ?? 0;
      return result([
        ...(report.valid ? [] : ['Corrija os erros apontados na validação.']),
        ...(outline ? [] : ['Use "Esquema do Cenário:" em vez de três cenários.']),
        ...(outline && rows < 3 ? ['A tabela de Exemplos precisa das 3 regiões.'] : []),
        ...(doc.scenarios.filter((s) => s.type === 'scenario').length ? ['Remova os cenários repetidos.'] : []),
      ]);
    },
  },
];
