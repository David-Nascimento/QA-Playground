# Arquitetura do QA Playground — Diagnóstico e Proposta

> Análise feita em 29/10/2026 na branch `feature/nova-estrutura` (commit `5f7ad81`).

## 1. Como o projeto está hoje

| Camada | Onde está | Tamanho |
|---|---|---|
| Páginas | `pages/**` + `index.html` (148 HTML) | ~47.900 linhas |
| JS **inline** nas páginas | `<script>` dentro dos HTML | **~10.100 linhas** |
| CSS **inline** nas páginas | `<style>` dentro dos HTML + 2.651 atributos `style=""` | ~1.470 linhas |
| TypeScript (fonte) | `src/` → compila para `js/` | ~2.300 linhas |
| JS escrito à mão **dentro da pasta de build** | `js/modules/bdd`, `js/modules/nft`, `js/api-config.js`, `js/accessibility-playground.js` | ~2.300 linhas |
| SCSS | `styles/` → `css/main.css` | ~3.200 linhas |
| CSS fora do SCSS | `css/accessibility-playground.css` | 756 linhas |
| API mock | `api/` (Express local + função Vercel) | ~2.250 linhas |

**Conclusão central:** o código-fonte "oficial" (`src/`) representa menos de 20% do comportamento do site. A maior parte da lógica vive espalhada dentro dos HTML, e a outra parte está em JS solto na pasta que deveria ser só de build.

## 2. Problemas de responsabilidade encontrados

### 2.1 Páginas fazem tudo (estrutura + estilo + comportamento)
- 10 mil linhas de JS inline. Exemplos: `otp.html` (522 linhas de script), `tools/mobile-playground.html` (424 linhas de JS + 301 de CSS), `registro.html` (316), `validacao.html` (289).
- **Código copiado entre páginas:** `initTabs()` aparece **63 vezes**, idêntica; `validateEmail` 5×, `maskCPF`/`validateCPF`/`formatFileSize`/`mostrarModal`/`renderTable` 2× cada.
- 41 `onclick=""`, 5 `onsubmit=""` misturando HTML e comportamento.

### 2.2 Layout (header/nav/footer) duplicado em cada página
- O header está colado em 146 páginas, com **mais de 10 variações diferentes** (versões que divergiram com o tempo).
- Consequência real: **55 links quebrados**, quase todos no menu (`../fundamentos.html`, `../interacoes.html`, `../tabelas.html` apontando para arquivos que não existem).
- O `scripts/generate-accessibility-pages.py` gera páginas com outra cópia do header embutida no script Python.

### 2.3 Fonte e build misturados
- `js/` é ao mesmo tempo **saída do `tsc`** (`js/core`, `js/ui`, `js/features`, `js/index.js` — ignorados no git) e **código-fonte escrito à mão** (`js/modules/**`, `js/api-config.js`, `js/accessibility-playground.js` — versionados). O README manda "nunca editar `js/`", mas parte dela só existe ali.
- Mesmo problema no `css/`: `main.css` é gerado; `accessibility-playground.css` é fonte.
- `api/js/` é o build da API dentro da pasta de fonte da API.

### 2.4 Dois sistemas de módulos conversando por `window`
- O BDD Playground em TS (`src/features/bdd`) depende de `window.BDDParser`, `window.BDDValidator` etc., que vêm de 6 scripts clássicos em `js/modules/bdd`, carregados manualmente na página. O TS não importa nada disso: só checa se existe no `window`.
- `xpath-tester.ts` chama `window.showToast` 18 vezes via `typeof === 'function'` em vez de importar o `ToastManager`.
- O NFT Playground é inteiro JS ES module fora do TS.

### 2.5 Entry point único que inicializa tudo em toda página
- `src/index.ts` instancia Navigation, Theme, Search, BDD, Challenge, Fundamentos e XPath em **todas** as 148 páginas; cada feature "descobre" se deve rodar checando IDs no DOM.
- Código morto: `StorageManager` não é usado em lugar nenhum; `StateManager` só pelo tema.

### 2.6 API: roteamento duplicado e camadas misturadas
- **Dois roteadores para as mesmas rotas:** `api/index.ts` (Express, local) e `api/[...path].ts` (if/else manual + um "fake Express response", na Vercel). Toda rota nova precisa ser registrada duas vezes.
- `routes/*.ts` fazem autenticação, autorização, cenários de erro, validação e regra de negócio no mesmo arquivo. `authenticate()` está **copiada** em `users.ts` e `orders.ts`.
- `data/*.mock.ts` são importados como `usersService` — dado e serviço na mesma coisa.
- Na Vercel, todo `.ts/.js` dentro de `api/` vira função serverless: `routes/`, `data/`, `config/` e `api/js/**` estão sendo publicados como endpoints.
- Duas cópias da coleção Postman (`api/` e `api/js/`), e já estão diferentes.
- `api-config` duplicado (`js/api-config.js` e `api/utils/api-config.js`, versões diferentes).
- `tsconfig.api.json` tem a chave `exclude` duplicada (a primeira é ignorada).

### 2.7 SCSS
- `styles/main.scss` deveria só importar módulos, mas contém ~600 linhas de componentes (forms, tabelas, toast, tabs, badges, hero).
- Estilos de páginas inteiras estão em `<style>` inline (NFT, mobile-playground, shadow-dom…), fora do design system.

### 2.8 Documentação desatualizada
- README cita `STRUCTURE.md`, `PROJECT-STRUCTURE.md`, `docs/*.md`, `VERCEL-DEPLOY.md` — nenhum existe.
- README diz "sem backend" e "Node 16+"; o projeto tem API e exige Node ≥ 20.

## 3. Restrição importante: o "contrato público"

O QA Playground é usado como **alvo de automação** (Selenium, Cypress, Playwright). As suítes de teste dos usuários dependem de:
- **URLs** das páginas (`/pages/junior/formularios/login.html`)
- **IDs, classes, `data-*`, textos e comportamento** dos elementos
- **Endpoints e respostas** da API

Por isso a reestruturação deve ser **interna**: mudar onde o código vive, sem mudar o que o navegador entrega. Cada fase termina com uma verificação de que URLs e o DOM testável ficaram iguais.

## 4. Estrutura proposta

```
QA-Playground/
├── src/
│   ├── client/                      # todo o frontend em TS
│   │   ├── core/                    # dom helpers, storage, events, api-client
│   │   ├── components/              # header, nav, theme-toggle, toast, code-tabs, modal
│   │   ├── lib/                     # validadores, máscaras, formatadores (CPF, email, filesize…)
│   │   ├── features/                # ferramentas: bdd/, nft/, xpath/, accessibility/, challenge/, search/
│   │   ├── pages/                   # 1 script por página que tinha JS inline
│   │   │   └── junior/formularios/otp.ts …
│   │   └── main.ts                  # só layout/tema/nav (comum a todas as páginas)
│   ├── styles/                      # SCSS (main.scss só com @use)
│   │   ├── abstracts/ base/ layout/ components/
│   │   └── pages/                   # inclui o que hoje está em <style> e accessibility.css
│   └── partials/                    # header.html, footer.html (fonte única)
│
├── server/                          # API mock (independente do frontend)
│   ├── app.ts                       # cria o Express e registra rotas (fonte única de rotas)
│   ├── routes/                      # mapa rota → controller
│   ├── controllers/                 # lê req, chama service, devolve res
│   ├── services/                    # regras de negócio (users, orders, auth)
│   ├── data/                        # seeds em memória
│   ├── middlewares/                 # authenticate, authorize, scenario, errorHandler, cors
│   ├── docs/                        # documentação + coleção Postman (uma cópia)
│   └── dev.ts                       # app.listen(3001) para uso local
│
├── api/
│   └── [...path].ts                 # 3 linhas: export default app (Vercel usa o mesmo Express)
│
├── public/                          # site estático, URLs idênticas às atuais
│   ├── index.html
│   ├── pages/**                     # HTML só com estrutura (sem <script>/<style> inline)
│   └── assets/
│
├── tools/                           # scripts de build: injeção de partials, checagem de links
├── docs/                            # documentação do projeto
└── dist/                            # SAÍDA do build (gitignored) → publicada na Vercel
```

### Regras de responsabilidade
1. **HTML** = estrutura e conteúdo. Nada de `<script>` com lógica, `<style>` ou `onclick`.
2. **Partials** = header/nav/footer existem uma vez; o build injeta em cada página (o HTML final continua estático, bom para automação).
3. **`main.ts`** carrega só o comum. Cada página/ferramenta tem seu próprio entry (`pages/…/otp.ts`, `features/bdd/index.ts`).
4. **Comunicação entre módulos por `import`**, nunca por `window`. `window` só para o que for intencionalmente exposto ao aluno.
5. **API:** rota → controller → service → data. Middlewares cuidam de auth e cenários. Um único roteador serve local e Vercel.
6. **Fonte nunca dentro da pasta de saída.** Tudo em `src/` e `server/` é fonte; tudo em `dist/` é gerado.

## 5. Plano de migração (por fases, cada uma entregável sozinha)

| Fase | O que muda | Risco |
|---|---|---|
| **0. Rede de segurança** | Script que tira um "snapshot" de cada página (URLs, IDs, `data-*`, textos de botões/labels) + checador de links + smoke da API. Rodado antes e depois de cada fase. | Nenhum |
| **1. API** | Criar `server/` em camadas, middleware único de auth, Vercel exportando o mesmo Express, uma coleção Postman. | Baixo (tem a coleção Postman para validar) |
| **2. Build e pastas** | `src/client`, `src/styles`, `public/`, `dist/`; mover `js/modules/**` e o JS solto para `src/`; `.gitignore`, `tsconfig`, `vercel.json` (`outputDirectory: dist`), scripts npm. | Médio (deploy) |
| **3. Layout único** | Partials de header/footer + injeção no build. Corrige os 55 links quebrados. | Médio |
| **4. Extrair JS inline** | `lib/` com utilitários compartilhados (tabs, validadores, máscaras); 1 módulo TS por página. Feito por área (Júnior → Pleno → Sênior → Mobile → Tools). | Alto (maior volume) — snapshot da Fase 0 garante o DOM |
| **5. CSS** | `main.scss` só com imports; `<style>` inline e `accessibility-playground.css` viram parciais SCSS. | Baixo |
| **6. Limpeza** | Código morto, BDD/NFT 100% TS sem `window`, README e docs atualizados. | Baixo |

## 6. Anexo — números da análise
- 148 páginas HTML; 146 com header colado; >10 variações de header.
- 10.099 linhas de JS inline; 1.473 linhas de CSS inline; 2.651 `style=""`.
- 55 referências (`href`/`src`) para arquivos inexistentes.
- `initTabs` duplicada 63×.
- 2 roteadores de API; `authenticate()` duplicada 2×; 2 coleções Postman divergentes; 2 `api-config` divergentes.
