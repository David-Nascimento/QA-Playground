# Estilos — QA Playground

## Organização

| Pasta | Responsabilidade |
|---|---|
| `abstracts/` | Variáveis SCSS (`_variables`), tokens CSS (`_tokens`), mixins e funções. Não gera CSS sozinho, exceto os tokens. |
| `base/` | Reset, tipografia e regras globais. |
| `layout/` | Header (com menu-gaveta), footer e seções de página. |
| `components/` | Peças reaproveitadas em várias páginas: botões, cartões, formulários, tabelas, código, feedback. |
| `pages/` | Estilos de **uma** página ou ferramenta. Devem ser escopados ao contêiner da página. |
| `legacy/` | CSS ainda não migrado para SCSS (copiado como está). |

`main.scss` só importa módulos. Não escreva regras nele.

## Regras

1. **Só tokens.** Componentes usam `var(--…)`, nunca hex/rgba fixos, para os temas
   claro/escuro e a cor do nível funcionarem. Tons translúcidos: `color-mix(in srgb, var(--accent) 20%, transparent)`.
2. **Texto sobre cor de destaque** usa `var(--on-accent)` (branco no claro, tinta no escuro), nunca `white`.
3. **Nada global em `pages/`.** Se a regra vale para várias páginas, ela é um componente.
4. **Não mude o DOM para estilizar.** IDs, classes e textos das páginas são usados por suítes
   de automação de terceiros (veja `npm run qa:dom`).

## Paleta

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `--accent` | `#2f55e4` | `#8ea2ff` | Marca, links, botões |
| `--text` / `--muted` | `#161a33` / `#525a75` | `#e7eaf6` / `#a3abc9` | Texto |
| `--bg` / `--surface` / `--surface-2` | `#f4f6fb` / `#fff` / `#eef1f8` | `#0d1022` / `#151a31` / `#1c2240` | Fundos |
| `--junior` | `#047857` | `#34d399` | Nível Júnior |
| `--pleno` | `#b45309` | `#fbbf24` | Nível Pleno |
| `--senior` | `#6d28d9` | `#b79bff` | Nível Sênior |

Todos os pares de texto foram verificados para WCAG AA (4,5:1).

## Cor do nível

O build marca `<body data-level="junior|pleno|senior">` pelo caminho da página
(`pages/junior/**`, `pages/desafio/junior.html`, …). Componentes usam
`--level`, `--level-fill` e `--level-soft`, que valem a cor do nível ou, fora
deles, a cor da marca.

## Tipografia

- **Manrope** (títulos), **Inter** (texto e interface), **JetBrains Mono** (código).
- Texto corrido limitado a `--measure` (70ch).
- Campos com 16px para evitar zoom automático no iOS; alvos de toque ≥ 44px.

## Responsivo

- `< 960px`: menu vira gaveta (`#nav-toggle`, ver `src/client/ui/navigation.ts`).
- Grids usam `minmax(min(100%, Npx), 1fr)` e `minmax(0, 1fr)` para nunca estourar a tela.
- Tabelas largas rolam dentro do próprio bloco em telas `< 768px`.
