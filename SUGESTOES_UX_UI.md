# Sugestões de UX/UI - QA Playground

## 📋 Análise do Estado Atual

### Pontos Fortes
- Design system consistente com variáveis CSS
- Dark mode implementado
- Estrutura semântica adequada
- Responsividade básica presente

### Oportunidades de Melhoria
- Densidade visual alta em algumas seções
- Hierarquia tipográfica pode ser mais clara
- Falta busca global e filtros
- Progressão por senioridade pouco visual
- Cards muito similares entre si
- CTAs podem ser mais diretos

---

## 🎯 1. HERO SECTION

### Problemas Identificados
- Texto muito longo (3 parágrafos)
- Falta de CTA principal claro
- Não há indicação visual de progressão

### Sugestões de Melhoria

#### Estrutura Proposta
```
[H1: QA Playground]
[Subtitle: Uma linha, máximo 12 palavras]
[CTA Principal: "Explorar Conteúdo" ou "Começar Agora"]
[Indicadores rápidos: 3 badges com números - Ex: "6 Áreas", "3 Níveis", "10+ Playgrounds"]
```

#### Microcopy Sugerido
- **H1**: "QA Playground" (mantém)
- **Subtitle**: "Aprenda testes de software na prática, do júnior ao sênior"
- **CTA Principal**: "Explorar Conteúdo" ou "Ver Roadmaps"
- **Badges**: "6 Áreas de Prática", "3 Níveis", "10+ Ferramentas"

#### Ajustes CSS
- Reduzir `hero-description` para 1 linha ou remover
- Adicionar padding maior no topo (calc(var(--spacing-xl) * 2))
- Badges com background sutil e ícones

---

## 🎴 2. CARDS - Diferenciação Visual

### Problema Principal
Todos os cards têm o mesmo estilo, dificultando identificação rápida do tipo de conteúdo.

### Sistema de Badges por Tipo

#### Áreas de Prática (`.area-item`)
- **Badge**: "ÁREA" em verde claro
- **Ícone**: Pequeno ícone no canto superior direito
- **Borda**: Borda esquerda verde (4px)
- **CTA**: "Explorar →" (mais curto)

#### Playgrounds (`.tool-card` com categoria "Playground")
- **Badge**: "PLAYGROUND" em verde médio
- **Ícone**: Ícone maior, mais destacado
- **Borda**: Borda superior verde (3px) - já existe
- **CTA**: "Abrir Playground →"

#### Ferramentas (`.tool-card` com categoria "Ferramenta")
- **Badge**: "FERRAMENTA" em verde escuro
- **Ícone**: Ícone técnico
- **Borda**: Borda superior verde (3px)
- **CTA**: "Usar Ferramenta →"

#### Documentação (`.tool-card` com categoria "Documentação")
- **Badge**: "DOCS" em cinza com verde
- **Ícone**: Ícone de livro/documento
- **Borda**: Borda superior cinza (3px)
- **CTA**: "Ler Documentação →"

### Hierarquia Visual nos Cards

#### Tamanhos de Texto
- **Título**: `var(--font-size-xl)` → manter
- **Descrição**: `var(--font-size-sm)` → reduzir de `base` para `sm`
- **Features**: `var(--font-size-xs)` → reduzir de `sm` para `xs`
- **CTA**: `var(--font-size-base)` → manter

#### Espaçamento
- Padding interno: `var(--spacing-lg)` → `var(--spacing-xl)` (mais respiro)
- Gap entre cards: `var(--spacing-lg)` → `var(--spacing-xl)`
- Margin-bottom da descrição: `var(--spacing-md)` → `var(--spacing-sm)`

#### Limite de Features
- Máximo 3-4 features visíveis
- Resto em "Ver mais" (expandir on click)

---

## 🧭 3. NAVEGAÇÃO

### Header - Melhorias

#### Busca Global (NOVO)
```
[Logo] [Nav Links] [🔍 Busca] [🌞 Tema]
```

- Input de busca no header (sticky)
- Placeholder: "Buscar conteúdo, áreas, níveis..."
- Resultados em dropdown abaixo do input
- Atalho: `Ctrl/Cmd + K`

#### Menu Mobile
- Hamburger menu para mobile
- Dropdown "Desafios" mais visível (ícone de seta)

### Breadcrumbs (NOVO)
Adicionar breadcrumbs em páginas internas:
```
Home > Áreas > Funcional > Formulários
```

---

## 📊 4. PROGRESSÃO POR SENIORIDADE

### Problema
Cards de progressão não comunicam visualmente a hierarquia e evolução.

### Solução: Design Escalonado

#### Visual Hierarchy
```
┌─────────────────────────────────┐
│  JÚNIOR                         │
│  [Badge Verde Claro]            │
│  ─────────────────────────────  │
│  • Fundamentos                  │
│  • Validações básicas           │
│  [CTA: Ver Roadmap →]           │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  PLENO                          │
│  [Badge Verde Médio]            │
│  ─────────────────────────────  │
│  • Interações avançadas         │
│  • Automação intermediária      │
│  [CTA: Ver Roadmap →]           │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  SÊNIOR                         │
│  [Badge Verde Escuro]           │
│  ─────────────────────────────  │
│  • Cenários complexos           │
│  • Arquitetura de testes        │
│  [CTA: Ver Roadmap →]           │
└─────────────────────────────────┘
```

#### Badges de Nível
- **Júnior**: `background: rgba(122, 168, 116, 0.15)` + `color: var(--accent)`
- **Pleno**: `background: rgba(122, 168, 116, 0.25)` + `color: var(--accent)`
- **Sênior**: `background: rgba(122, 168, 116, 0.35)` + `color: var(--accent)`

#### Indicador Visual de Progressão
- Adicionar linha conectando os 3 cards (opcional, apenas desktop)
- Ou usar setas entre cards: `Júnior → Pleno → Sênior`

#### Microcopy
- **Júnior**: "Comece aqui" (substituir "Fundamentos e primeiros cenários")
- **Pleno**: "Evolua suas habilidades" (substituir "Manipulação dinâmica...")
- **Sênior**: "Domine cenários complexos" (substituir "Cenários complexos...")

---

## 🔍 5. BUSCA E FILTROS

### Busca Global (Header)

#### Implementação
```html
<div class="header-search">
  <input 
    type="search" 
    placeholder="Buscar conteúdo..." 
    id="global-search"
    aria-label="Busca global"
  />
  <button aria-label="Buscar">🔍</button>
</div>
```

#### Funcionalidades
- Busca em tempo real (debounce 300ms)
- Resultados por tipo: Área, Playground, Ferramenta, Nível
- Highlight de termos encontrados
- Atalho de teclado: `Ctrl/Cmd + K`

### Filtros Rápidos (NOVO)

#### Localização
Abaixo do título de cada seção principal:
- "Áreas de prática"
- "Progressão por senioridade"
- "Playgrounds e ferramentas"

#### Componente de Filtros
```html
<div class="quick-filters">
  <button class="filter-btn active" data-filter="all">Todos</button>
  <button class="filter-btn" data-filter="area">Áreas</button>
  <button class="filter-btn" data-filter="playground">Playgrounds</button>
  <button class="filter-btn" data-filter="tool">Ferramentas</button>
  <button class="filter-btn" data-filter="docs">Docs</button>
</div>
```

#### Filtros por Nível (Progressão)
```html
<div class="level-filters">
  <button class="level-filter active" data-level="all">Todos</button>
  <button class="level-filter" data-level="junior">Júnior</button>
  <button class="level-filter" data-level="pleno">Pleno</button>
  <button class="level-filter" data-level="senior">Sênior</button>
</div>
```

#### Estilo dos Filtros
- Botões pequenos, estilo pill
- Ativo: background verde, texto branco
- Inativo: background transparente, borda verde
- Hover: background verde claro

---

## 📝 6. TIPOGRAFIA E ESPAÇAMENTO

### Hierarquia Tipográfica

#### Títulos de Seção (`.section-title`)
- **Atual**: `var(--font-size-2xl)` (1.5rem)
- **Sugestão**: Manter, mas aumentar `font-weight` para `800` (mais destaque)
- **Espaçamento**: `margin-bottom: var(--spacing-xl)` → `calc(var(--spacing-xl) * 1.5)`

#### Subtítulos (`.hero-subtitle`)
- **Atual**: `var(--font-size-xl)` (1.25rem)
- **Sugestão**: Manter, mas `font-weight: 500` (menos pesado)

#### Texto de Cards
- **Descrição**: `var(--font-size-sm)` (0.875rem) - reduzir de `base`
- **Features**: `var(--font-size-xs)` (0.75rem) - reduzir de `sm`
- **Line-height**: `1.5` para descrições (mais compacto)

### Espaçamento

#### Variáveis CSS Adicionais
```css
--spacing-2xl: 48px;
--spacing-3xl: 64px;
```

#### Aplicação
- **Entre seções**: `var(--spacing-2xl)` (48px)
- **Padding de cards**: `var(--spacing-xl)` (32px)
- **Gap entre cards**: `var(--spacing-xl)` (32px)

---

## 🎨 7. CORES E BADGES

### Sistema de Cores para Badges

#### Por Tipo de Conteúdo
```css
/* Área */
.badge-area {
  background: rgba(122, 168, 116, 0.15);
  color: var(--accent);
  border: 1px solid rgba(122, 168, 116, 0.3);
}

/* Playground */
.badge-playground {
  background: rgba(122, 168, 116, 0.25);
  color: var(--accent);
  border: 1px solid rgba(122, 168, 116, 0.4);
}

/* Ferramenta */
.badge-tool {
  background: rgba(122, 168, 116, 0.35);
  color: #ffffff;
  border: 1px solid var(--accent);
}

/* Documentação */
.badge-docs {
  background: rgba(154, 154, 154, 0.15);
  color: var(--muted);
  border: 1px solid rgba(154, 154, 154, 0.3);
}
```

#### Por Nível de Senioridade
```css
.badge-junior {
  background: rgba(122, 168, 116, 0.15);
  color: var(--accent);
}

.badge-pleno {
  background: rgba(122, 168, 116, 0.25);
  color: var(--accent);
}

.badge-senior {
  background: rgba(122, 168, 116, 0.35);
  color: var(--accent);
}
```

### Uso de Verde (Accent)
- **Primário**: `var(--accent)` - CTAs principais, links
- **Secundário**: `rgba(122, 168, 116, 0.1)` - Backgrounds sutis
- **Terciário**: `rgba(122, 168, 116, 0.05)` - Hover states

---

## 🔘 8. CTAs (CALL-TO-ACTIONS)

### Microcopy Padronizado

#### Por Tipo de Ação
- **Explorar conteúdo**: "Explorar →"
- **Ver roadmap**: "Ver Roadmap →"
- **Abrir playground**: "Abrir Playground →"
- **Usar ferramenta**: "Usar Ferramenta →"
- **Ler documentação**: "Ler Docs →"
- **Ver práticas**: "Ver Práticas →"

#### Hierarquia de CTAs
- **Primário**: Background verde, texto branco, `font-weight: 600`
- **Secundário**: Borda verde, texto verde, background transparente
- **Terciário**: Apenas texto verde com seta

### Estilo Visual
- Sempre incluir seta `→` no final
- Hover: seta move 4px para direita (`transform: translateX(4px)`)
- Transição suave: `transition: all 0.2s ease`

---

## 📱 9. RESPONSIVIDADE

### Breakpoints Sugeridos
```css
/* Mobile First */
@media (max-width: 575px) { /* Mobile */ }
@media (max-width: 767px) { /* Tablet Portrait */ }
@media (max-width: 991px) { /* Tablet Landscape */ }
@media (min-width: 992px) { /* Desktop */ }
```

### Ajustes Mobile
- **Hero**: Padding reduzido, subtitle em 1 linha
- **Cards**: Grid 1 coluna, padding reduzido
- **Filtros**: Scroll horizontal
- **Busca**: Full width no header

---

## 🎯 10. PRIORIDADES DE IMPLEMENTAÇÃO

### Fase 1 (Alto Impacto, Baixa Complexidade)
1. ✅ Ajustar microcopy dos CTAs
2. ✅ Reduzir tamanho de fonte em descrições de cards
3. ✅ Adicionar badges diferenciados por tipo
4. ✅ Aumentar espaçamento entre seções

### Fase 2 (Alto Impacto, Média Complexidade)
5. ✅ Implementar busca global no header
6. ✅ Adicionar filtros rápidos
7. ✅ Melhorar visual da progressão por senioridade
8. ✅ Otimizar hero section (reduzir texto)

### Fase 3 (Médio Impacto, Alta Complexidade)
9. ⚠️ Sistema de busca avançada com filtros combinados
10. ⚠️ Breadcrumbs em páginas internas
11. ⚠️ Indicadores visuais de progressão (linhas/setas)

---

## 📐 11. WIREFRAME TEXTUAL - LAYOUT PROPOSTO

```
┌─────────────────────────────────────────────────────────┐
│ [Logo] [Nav] [🔍 Busca] [🌞]                            │ HEADER
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    QA Playground                        │
│     Aprenda testes de software na prática              │ HERO
│     [Explorar Conteúdo →]                              │
│     [6 Áreas] [3 Níveis] [10+ Ferramentas]            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Como o QA Playground funciona                          │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                    │
│ │ Info │ │ Info │ │ Info │ │ Info │                    │
│ └──────┘ └──────┘ └──────┘ └──────┘                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Áreas de prática                                       │
│ [Todos] [Áreas] [Playgrounds] [Ferramentas] [Docs]    │ FILTROS
│ ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│ │[ÁREA]    │ │[ÁREA]    │ │[ÁREA]    │               │
│ │Título    │ │Título    │ │Título    │               │
│ │Descrição │ │Descrição │ │Descrição │               │
│ │Explorar→ │ │Explorar→ │ │Explorar→ │               │
│ └──────────┘ └──────────┘ └──────────┘               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Progressão por senioridade                             │
│ [Todos] [Júnior] [Pleno] [Sênior]                      │ FILTROS
│ ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│ │[JÚNIOR]  │ │[PLENO]   │ │[SÊNIOR]  │               │
│ │Comece... │ │Evolua... │ │Domine... │               │
│ │• Item    │ │• Item    │ │• Item    │               │
│ │[Roadmap→]│ │[Roadmap→]│ │[Roadmap→]│               │
│ └──────────┘ └──────────┘ └──────────┘               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Playgrounds e ferramentas                              │
│ [Todos] [Playgrounds] [Ferramentas] [Docs]            │ FILTROS
│ ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│ │[PLAY]    │ │[TOOL]    │ │[DOCS]    │               │
│ │Título    │ │Título    │ │Título    │               │
│ │Descrição │ │Descrição │ │Descrição │               │
│ │Abrir →   │ │Usar →    │ │Ler →     │               │
│ └──────────┘ └──────────┘ └──────────┘               │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Design System
- [ ] Adicionar variáveis de espaçamento (`--spacing-2xl`, `--spacing-3xl`)
- [ ] Criar classes de badges por tipo (`.badge-area`, `.badge-playground`, etc.)
- [ ] Ajustar hierarquia tipográfica (tamanhos e pesos)

### Hero Section
- [ ] Reduzir texto para 1-2 linhas
- [ ] Adicionar CTA principal
- [ ] Criar badges de indicadores (6 Áreas, 3 Níveis, etc.)

### Cards
- [ ] Aplicar badges diferenciados
- [ ] Reduzir tamanho de fonte em descrições
- [ ] Limitar features visíveis (máx 3-4)
- [ ] Padronizar microcopy dos CTAs

### Navegação
- [ ] Adicionar busca global no header
- [ ] Implementar atalho `Ctrl/Cmd + K`
- [ ] Melhorar menu mobile (hamburger)

### Progressão
- [ ] Adicionar badges de nível diferenciados
- [ ] Melhorar microcopy (Comece aqui, Evolua, Domine)
- [ ] Adicionar indicador visual de progressão (opcional)

### Busca e Filtros
- [ ] Implementar busca global
- [ ] Criar componente de filtros rápidos
- [ ] Adicionar filtros por nível
- [ ] Implementar funcionalidade de filtragem

### Responsividade
- [ ] Testar em mobile (375px, 414px)
- [ ] Testar em tablet (768px, 1024px)
- [ ] Ajustar espaçamentos para mobile
- [ ] Otimizar cards para telas pequenas

---

## 📚 RECURSOS ADICIONAIS

### Ícones Sugeridos
- Busca: 🔍 ou SVG
- Níveis: Badges numéricos ou ícones de progresso
- Tipos: Ícones distintos por categoria

### Animações Sutis
- Hover em cards: `transform: translateY(-2px)`
- Hover em CTAs: Seta move para direita
- Transições: `0.2s ease` (padrão)

### Acessibilidade
- Labels ARIA em todos os inputs
- Contraste adequado (WCAG AA)
- Navegação por teclado funcional
- Focus states visíveis

---

**Documento criado para guiar a implementação das melhorias de UX/UI no QA Playground.**
