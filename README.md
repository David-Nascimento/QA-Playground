# QA Playground

## Sobre o projeto

O **QA Playground** é um projeto educacional criado para **simular cenários reais de aplicações web e mobile**, com foco em **testes manuais, automação de testes e análise de qualidade de software**.

O objetivo não é ensinar uma ferramenta específica, mas fornecer um **ambiente estável, previsível e bem estruturado**, onde profissionais de QA possam **praticar técnicas, estratégias e raciocínio de teste** próximos do que é encontrado em projetos reais.

Todo o projeto é desenvolvido em **HTML, CSS e JavaScript puro**, sem backend ou dependências externas, justamente para manter o foco no comportamento da aplicação e nas regras de negócio.

---

## 🚀 Início Rápido

### Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn

### Instalação

```bash
npm install
```

### Desenvolvimento

```bash
# Compila e inicia servidor (abre navegador automaticamente)
npm start

# OU: Watch mode em um terminal + servidor em outro
npm run dev    # Terminal 1: Watch mode
npm run serve  # Terminal 2: Servidor HTTP
```

### Build de Produção

```bash
npm run build
```

---

## 📁 Estrutura do Projeto

O projeto utiliza uma arquitetura modular com TypeScript e SCSS:

- **`src/`** - Código fonte TypeScript (core, UI, features)
- **`styles/`** - Código fonte SCSS (Design System modular)
- **`js/`** - JavaScript compilado (gerado automaticamente)
- **`css/`** - CSS compilado (gerado automaticamente)
- **`pages/`** - Páginas HTML organizadas por nível e categoria

Veja **[STRUCTURE.md](STRUCTURE.md)** e **[PROJECT-STRUCTURE.md](PROJECT-STRUCTURE.md)** para detalhes completos.

---

## 📚 Documentação

- **[STRUCTURE.md](STRUCTURE.md)** - Estrutura de pastas e organização
- **[PROJECT-STRUCTURE.md](PROJECT-STRUCTURE.md)** - Estrutura detalhada e guia de desenvolvimento
- **[docs/BUILD.md](docs/BUILD.md)** - Guia de build e desenvolvimento
- **[docs/README-REFACTORING.md](docs/README-REFACTORING.md)** - Detalhes técnicos da refatoração
- **[docs/PROBLEMA-SERVIDOR.md](docs/PROBLEMA-SERVIDOR.md)** - Solução de problemas com servidor

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
| `npm start` | Compila e inicia servidor HTTP |
| `npm run build` | Compila SCSS e TypeScript |
| `npm run dev` | Watch mode (recompila automaticamente) |
| `npm run serve` | Inicia servidor HTTP local |
| `npm run build:css` | Compila apenas SCSS |
| `npm run build:ts` | Compila apenas TypeScript |

---

## ⚠️ Importante

1. **Sempre edite arquivos fonte** em `src/` e `styles/`
2. **Nunca edite arquivos compilados** em `js/core/`, `js/ui/`, `css/main.css`
3. **Execute `npm run build`** antes de commitar mudanças ou fazer deploy
4. **Use servidor HTTP**: Módulos ES não funcionam com `file://`

## 🚀 Deploy na Vercel

O projeto está configurado para deploy na Vercel. Veja **[VERCEL-DEPLOY.md](VERCEL-DEPLOY.md)** para instruções completas.

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
