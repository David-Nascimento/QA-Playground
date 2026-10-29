# QA Playground

## Sobre o projeto

O **QA Playground** é um projeto educacional criado para **simular cenários reais de aplicações web e mobile**, com foco em **testes manuais, automação de testes e análise de qualidade de software**.

O objetivo não é ensinar uma ferramenta específica, mas fornecer um **ambiente estável, previsível e bem estruturado**, onde profissionais de QA possam **praticar técnicas, estratégias e raciocínio de teste** próximos do que é encontrado em projetos reais.

O site é **HTML, SCSS e TypeScript**, sem frameworks, para manter o foco no comportamento da aplicação e nas regras de negócio. Uma **API mock** (Express) acompanha o projeto para a prática de testes de API.

---

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 20 ou superior
- npm ou yarn

### Instalação

```bash
npm install
```

### Desenvolvimento

```bash
# Compila e inicia servidor + API (abre navegador automaticamente)
npm start

# OU: Watch mode com API e servidor HTTP (recomendado para desenvolvimento)
npm run dev    # Inicia tudo: watch mode, API e servidor HTTP
```

**Nota:** O comando `npm start` e `npm run dev` agora iniciam automaticamente:
- ✅ Frontend na porta **8000** (http://localhost:8000)
- ✅ API na porta **3001** (http://localhost:3001/api)

### Build de Produção

```bash
npm run build
```

### 🚀 API Mockada (Novo!)

O projeto agora inclui uma **API mockada completa** para prática de testes de API:

```bash
# Compilar e iniciar apenas a API
npm run build:ts:api
npm run dev:api

# OU iniciar API + Frontend juntos
npm run dev
```

A API estará disponível em **http://localhost:3001**

**Health Check:**
```bash
GET http://localhost:3001/api/health
```

**Documentação completa:**
- **[api/README.md](api/README.md)** - Guia rápido da API
- **[api/GUIA_TESTES.md](api/GUIA_TESTES.md)** - Guia completo para Postman/Insomnia
- **Coleção Postman pronta**: `api/QA-Playground-API.postman_collection.json`

**Credenciais de teste:**
- Admin: `admin@example.com` / `admin123`
- User: `user@example.com` / `user123`
- Viewer: `viewer@example.com` / `viewer123`

---

## 📁 Estrutura do Projeto

```
public/            # site estático: index.html, pages/, assets/ (URLs públicas)
src/
├── client/        # TypeScript do site (core, ui, features)
│   └── legacy/    # JS ainda não migrado para TS (copiado sem alteração)
└── styles/        # SCSS (design system) + legacy/ (CSS ainda não migrado)
server/            # API mock em camadas (ver server/README.md)
api/[...path].ts   # entrada serverless da Vercel (reusa server/app.ts)
tools/
├── build/         # montagem do site em dist/public
├── dev/           # utilitários de desenvolvimento
└── qa/            # verificações de contrato (DOM, links, API) e baselines
dist/              # SAÍDA do build (não versionada)
├── public/        # site publicado
└── server/        # API compilada para uso local
```

**Regra de ouro:** tudo em `public/`, `src/` e `server/` é fonte; tudo em `dist/` é gerado. Nunca edite `dist/`.

---

## 📚 Documentação

- **[doc/ARQUITETURA.md](doc/ARQUITETURA.md)** - Arquitetura, responsabilidades e plano de migração
- **[server/README.md](server/README.md)** - API mock: rotas, cenários e camadas

---

## 🎯 Estrutura por Níveis

### Nível Júnior
- Formulários simples
- Validações básicas
- Tabelas com conteúdo dinâmico
- Interações básicas

### Nível Pleno
- Elementos dinâmicos
- Tabelas com paginação e ordenação
- Upload e download de arquivos
- Interações avançadas

### Nível Sênior
- Desafios avançados de automação
- Shadow DOM, iframes, múltiplas janelas
- Autenticação OAuth e HTTP
- APIs REST e códigos de status

### Mobile
- Responsividade
- Touch events
- Viewport e orientação
- Interações avançadas

### Ferramentas
- XPath & CSS Tester
- BDD Playground
- NFT Playground
- Mobile Playground

---

## 🛠️ Tecnologias

- **HTML5** – estrutura semântica
- **SCSS** – design system modular
- **TypeScript** – código type-safe
- **JavaScript (ES2020+)** – após compilação

---

## 📝 Scripts NPM

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Build + watch (site, SCSS, TS, API) + servidores web (8000) e API (3001) |
| `npm start` | Build e sobe os servidores web e API |
| `npm run build` | Gera `dist/public` (site) e `dist/server` (API) do zero |
| `npm run dev:api` | Sobe apenas a API mock |
| `npm run test:api` | Teste de contrato da API (local e Vercel) contra o baseline |
| `npm run qa` | Build + todas as verificações de contrato (DOM, links, API) |

---

## ⚠️ Importante

1. **Edite apenas fontes**: `public/`, `src/`, `server/`.
2. **Não quebre o contrato público**: URLs, ids, classes e textos das páginas são usados por suítes de automação de terceiros. Rode `npm run qa` antes de commitar.
3. **Use servidor HTTP**: módulos ES não funcionam com `file://`.

---

## 🚀 Deploy na Vercel

O build da Vercel roda `npm run build` e publica `dist/public`. As rotas `/api/*` são servidas pela função `api/[...path].ts`, que reutiliza o app de `server/`.

**Deploy rápido:**
```bash
# Instalar Vercel CLI
npm install -g vercel

# Fazer deploy
vercel --prod
```

---

## 📄 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

---

## 👤 Autor

Desenvolvido por **David Nascimento**, com foco em prática real de QA, aprendizado contínuo e construção de portfólio profissional.

---

## 🎓 Uso em QA e Automação

O QA Playground pode ser utilizado com qualquer ferramenta de automação web:

- Selenium (WebDriver)
- Playwright
- Cypress
- Robot Framework
- Appium (para testes mobile)

Também é adequado para:

- Criação de casos de teste
- Escrita de cenários BDD
- Testes exploratórios
- Exercícios de análise de qualidade
