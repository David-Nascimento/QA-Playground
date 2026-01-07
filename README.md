# 🧪 QA Playground

> Plataforma educacional 100% em português para prática de QA Manual e Automação de Testes

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)

---

## 📋 Sobre o Projeto

O **QA Playground** é uma plataforma web completa e moderna criada especificamente para servir como ambiente de prática e aprendizado em **Quality Assurance (QA)**, **Testes Manuais** e **Automação de Testes**. 

Este projeto foi desenvolvido com foco em educação, oferecendo mais de **60 páginas interativas** organizadas por níveis de dificuldade (Júnior, Pleno e Sênior), permitindo que iniciantes e profissionais evoluam suas habilidades de forma estruturada e prática.

### 🎯 Características Principais

- ✅ **100% em Português** - Conteúdo totalmente em português brasileiro
- 🎨 **Design Moderno** - Interface limpa e responsiva com suporte a tema claro/escuro
- 📱 **Totalmente Responsivo** - Funciona perfeitamente em desktop, tablet e mobile
- 🔍 **Elementos Identificáveis** - Todos os elementos possuem `id` e `data-testid` para facilitar automação
- 📚 **Organizado por Níveis** - Conteúdo estruturado do básico ao avançado
- 🎯 **Cenários Realistas** - Desafios baseados em situações reais de QA
- 🚀 **Zero Dependências** - Apenas HTML, CSS e JavaScript puro

---

## 🎓 Níveis de Dificuldade

### 🟢 Nível Júnior
Conceitos básicos de QA, automação e validação de elementos simples.

**Conteúdo:**
- Formulários básicos (Login, Registro, Recuperação de Senha)
- Inputs HTML (text, email, password, checkbox, radio)
- Tabelas simples
- Validações básicas de formulário
- Elementos interativos simples

### 🟡 Nível Pleno
Cenários intermediários, manipulação dinâmica, tabelas, arquivos e interações mais complexas.

**Conteúdo:**
- Tabelas com paginação e ordenação
- Upload e download de arquivos
- Drag & Drop
- Autocomplete
- Elementos dinâmicos (aparecer/desaparecer)
- Notificações e mensagens
- Tooltips e hover effects

### 🔴 Nível Sênior
Desafios avançados, automação complexa, manipulação de DOM, APIs, autenticação e cenários reais de QA.

**Conteúdo:**
- Shadow DOM
- Challenging DOM (classes dinâmicas)
- Infinite Scroll
- JavaScript Dialogs (alert, confirm, prompt)
- OAuth 2.0 e autenticação
- API REST mockada
- Cypress spies, stubs e clocks
- Testes flaky
- E-commerce simulado
- E muito mais...

---

## 🚀 Como Executar

### Pré-requisitos

- Navegador moderno (Chrome, Firefox, Edge, Safari)
- Servidor HTTP local (opcional, mas recomendado)

### Opção 1: Servidor HTTP Local (Recomendado)

#### Python 3
```bash
# Navegue até a pasta do projeto
cd qa-playground

# Execute o servidor HTTP
python -m http.server 8000

# Abra no navegador
# http://localhost:8000
```

#### Node.js (http-server)
```bash
# Instale o http-server globalmente (se ainda não tiver)
npm install -g http-server

# Execute na pasta do projeto
http-server -p 8000

# Abra no navegador
# http://localhost:8000
```

#### VS Code (Live Server)
1. Instale a extensão **Live Server** no VS Code
2. Clique com o botão direito em `index.html`
3. Selecione "Open with Live Server"

### Opção 2: Abrir Diretamente
> ⚠️ Algumas funcionalidades podem não funcionar devido a restrições de segurança do navegador.

1. Abra o arquivo `index.html` no navegador
2. Pronto! O projeto está rodando

---

## 📁 Estrutura do Projeto

```
qa-playground/
│
├── index.html                 # Página inicial
├── README.md                  # Documentação
│
├── css/
│   └── styles.css            # Design system e estilos
│
├── js/
│   └── app.js                # Tema, validações e helpers
│
├── assets/
│   └── icons/                # Ícones SVG do projeto
│
└── pages/
    ├── fundamentos.html      # Elementos básicos
    ├── formularios.html      # Índice de formulários
    │   └── formularios/
    │       ├── login.html
    │       ├── test-login.html
    │       ├── web-inputs.html
    │       └── ...
    │
    ├── tabelas.html          # Tabelas e listas
    │   └── tabelas/
    │       ├── dynamic.html
    │       └── dynamic-pagination.html
    │
    ├── interacoes.html       # Interações avançadas
    │   └── interacoes/
    │       ├── cypress.html
    │       ├── hovers.html
    │       ├── slider.html
    │       └── ...
    │
    ├── dinamicos.html        # Elementos dinâmicos
    │   └── dinamicos/
    │       ├── challenging-dom.html
    │       ├── shadow-dom.html
    │       ├── infinite-scroll.html
    │       └── ... (40+ páginas)
    │
    ├── arquivos.html         # Upload/Download
    ├── api.html              # API Playground mock
    └── ...
```

---

## 🛠️ Tecnologias Utilizadas

- **HTML5** - Estrutura semântica e acessível
- **CSS3** - Design system moderno com variáveis CSS
- **JavaScript (ES6+)** - Funcionalidades interativas sem dependências
- **Font Inter** - Tipografia moderna e legível

---

## ✨ Funcionalidades

### 🎨 Design System
- **Tema Claro/Escuro** - Alternância suave com persistência no localStorage
- **Design Responsivo** - Mobile-first, funciona em todos os dispositivos
- **Variáveis CSS** - Fácil customização de cores e espaçamentos
- **Componentes Padronizados** - Botões, formulários, cards e tabelas consistentes

### 🔍 Elementos para Testes
- **data-testid** - Atributos específicos para localização em testes
- **IDs únicos** - Todos os elementos interativos possuem IDs
- **Mensagens previsíveis** - Textos consistentes para facilitar assertions
- **Estrutura semântica** - HTML semântico para melhor acessibilidade

### 📚 Documentação Integrada
- **Informações de Teste** - Cada página possui seção com elementos identificáveis
- **Cenários Sugeridos** - Exemplos de casos de teste por página
- **Credenciais de Teste** - Dados fornecidos para validação

---

## 🎯 Casos de Uso

### Para Iniciantes
- Aprender conceitos básicos de QA
- Praticar testes manuais
- Entender estrutura de formulários web
- Familiarizar-se com elementos HTML

### Para Desenvolvedores de Automação
- Praticar seletores CSS/XPath
- Testar estratégias de wait
- Lidar com elementos dinâmicos
- Automatizar cenários complexos

### Para Estudantes
- Criar portfólio de projetos
- Preparar-se para entrevistas
- Aprender boas práticas de QA
- Desenvolver casos de teste

---

## 🧪 Ferramentas de Teste Suportadas

Este playground é compatível com todas as principais ferramentas de automação:

- ✅ **Cypress** - Testes end-to-end modernos
- ✅ **Playwright** - Automação multi-navegador
- ✅ **Selenium** - Framework tradicional
- ✅ **WebdriverIO** - Framework Node.js
- ✅ **TestCafe** - Sem necessidade de drivers
- ✅ **Puppeteer** - Controle de Chrome headless

---

## 📖 Exemplos de Uso

### Exemplo com Cypress

```javascript
describe('Login Page', () => {
  it('deve fazer login com sucesso', () => {
    cy.visit('http://localhost:8000/pages/formularios/login.html');
    cy.get('[data-testid="input-email"]').type('teste@qaplayground.com');
    cy.get('[data-testid="input-senha"]').type('senha123');
    cy.get('[data-testid="btn-login"]').click();
    cy.get('.toast').should('contain', 'sucesso');
  });
});
```

### Exemplo com Playwright

```javascript
test('deve adicionar item na tabela', async ({ page }) => {
  await page.goto('http://localhost:8000/pages/tabelas.html');
  await page.fill('[data-testid="input-nome-tabela"]', 'Novo Item');
  await page.click('[data-testid="btn-adicionar"]');
  await expect(page.locator('[data-testid="tbody-dados"]')).toContainText('Novo Item');
});
```

---

## 🗺️ Roadmap

### ✅ Implementado
- [x] Design system completo
- [x] Tema claro/escuro
- [x] +60 páginas interativas
- [x] Organização por níveis
- [x] Responsividade completa
- [x] Elementos identificáveis
- [x] API Playground mock

### 🚧 Em Planejamento
- [ ] Suíte de testes exemplo (Cypress/Playwright)
- [ ] Cenários BDD em Gherkin
- [ ] Documentação de API
- [ ] Modo desafio avançado
- [ ] Trilha de aprendizado guiada
- [ ] Integração com CI/CD

---

## 🤝 Contribuindo

Contribuições são muito bem-vindas! Este é um projeto educacional e toda ajuda é valiosa.

### Como Contribuir

1. **Fork** o projeto
2. Crie uma **branch** para sua feature (`git checkout -b feature/NovaFeature`)
3. **Commit** suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. **Push** para a branch (`git push origin feature/NovaFeature`)
5. Abra um **Pull Request**

### Áreas para Contribuir

- 🐛 **Correção de bugs**
- 📚 **Novas páginas de treino**
- 📖 **Melhorias na documentação**
- 🎨 **Melhorias de design**
- 🧪 **Novos desafios de automação**
- 🌐 **Traduções**

---

## 📝 Licença

Este projeto é de código aberto e está disponível para uso educacional e de aprendizado.

---

## 🙏 Agradecimentos

- Comunidade de QA brasileira
- Contribuidores e usuários do projeto
- Todas as pessoas que testam e melhoram este playground

---

## 📞 Suporte

- 📧 **Issues**: Abra uma issue no GitHub
- 💬 **Discussões**: Participe das discussões do projeto
- 📚 **Documentação**: Consulte a documentação em cada página

---

## ⭐ Estrelas

Se este projeto foi útil para você, considere dar uma ⭐ no repositório!

---

<div align="center">

**Desenvolvido com ❤️ para a comunidade QA brasileira**

[🔝 Voltar ao topo](#-qa-playground)

</div>
