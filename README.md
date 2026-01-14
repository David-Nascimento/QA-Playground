# QA Playground

## Sobre o projeto

O **QA Playground** é um projeto educacional criado para **simular cenários reais de aplicações web e mobile**, com foco em **testes manuais, automação de testes e análise de qualidade de software**.

O objetivo não é ensinar uma ferramenta específica, mas fornecer um **ambiente estável, previsível e bem estruturado**, onde profissionais de QA possam **praticar técnicas, estratégias e raciocínio de teste** próximos do que é encontrado em projetos reais.

Todo o projeto é desenvolvido em **HTML, CSS e JavaScript puro**, sem backend ou dependências externas, justamente para manter o foco no comportamento da aplicação e nas regras de negócio.

---

## Proposta

O QA Playground se propõe a ser um **ambiente de prática contínua**, permitindo que o usuário:

* Execute testes manuais baseados em regras de negócio;
* Crie cenários de teste e BDD focados em comportamento observável;
* Pratique automação web e mobile com diferentes ferramentas e abordagens;
* Treine análise de requisitos, exploração e pensamento crítico em QA;
* Utilize o projeto como parte de um portfólio profissional.

O projeto foi pensado para ser simples de executar, mas **rico em detalhes**, pois são esses detalhes que fazem a diferença em testes de qualidade.

---

## Público-alvo

Este projeto é indicado para:

* Profissionais de QA que desejam praticar ou evoluir em testes manuais e automação;
* Pessoas iniciantes em automação que precisam de um ambiente controlado para aprendizado;
* Estudantes e pessoas em transição de carreira para a área de QA;
* Recrutadores e líderes técnicos que queiram avaliar a abordagem de testes de um candidato.

---

## Estrutura do projeto

O QA Playground é organizado em **cenários com níveis de complexidade progressivos**, permitindo uma evolução natural:

### Nível Júnior

* Formulários simples
* Validações básicas
* Regras de negócio diretas
* Tabelas com conteúdo dinâmico
* Interações básicas (radio buttons, checkboxes, dropdowns)
* Ideal para testes manuais e primeiros scripts de automação

### Nível Pleno

* Elementos dinâmicos
* Tabelas com paginação, ordenação e filtros
* Upload e download de arquivos
* Interações avançadas (drag and drop, hovers, sliders)
* Cenários mais próximos de sistemas corporativos

### Nível Sênior

* Desafios avançados de automação
* Elementos complexos (Shadow DOM, iframes, múltiplas janelas)
* Simulações de autenticação (OAuth 2.0, HTTP Basic/Digest)
* APIs REST e códigos de status HTTP
* Comportamentos que exigem maior análise e estratégia de teste
* Utilitários e ferramentas auxiliares

### Mobile

* Responsividade e adaptação de layouts
* Touch events e gestos (tap, swipe, long press)
* Viewport e orientação (portrait/landscape)
* Interações avançadas (pinch/zoom, pull to refresh, scroll infinito, multi-touch, shake detection)
* Mobile Playground com documentação completa para automação Android e iOS

### Ferramentas para QA e SDET

* **XPath e CSS Tester**: Teste e valide seletores XPath e CSS com exemplos práticos
* **BDD Playground**: Crie, valide e avalie cenários BDD em Gherkin com validação automática
* **NFT Playground**: Simulador de Testes Não Funcionais (performance, carga, stress, resiliência)
* **Mobile Playground**: Documentação completa para automação mobile com simuladores Android e iOS

---

## Características principais

* Conteúdo 100% em português
* Interface simples e objetiva
* Elementos com identificadores estáveis (id e data-testid)
* Cenários pensados para testes manuais e automação
* Suporte para testes web e mobile
* Sem backend e sem dependências externas
* Execução fácil em ambiente local
* Documentação profissional para automação mobile
* Simuladores interativos de dispositivos Android e iOS

---

## Tecnologias utilizadas

* **HTML5** – estrutura semântica
* **CSS3** – layout e responsividade
* **JavaScript (ES6+)** – comportamento e regras de negócio

---

## Como executar

O projeto pode ser executado de forma simples:

1. Utilizando um servidor HTTP local (ex.: Python ou Node.js);
2. Usando a extensão Live Server no Visual Studio Code;
3. Abrindo os arquivos HTML diretamente no navegador (com possíveis limitações).

Nenhuma configuração adicional é necessária.

### Exemplos de servidores locais

**Python 3:**
```bash
python -m http.server 8000
```

**Node.js (http-server):**
```bash
npx http-server -p 8000
```

**PHP:**
```bash
php -S localhost:8000
```

Acesse `http://localhost:8000` no navegador após iniciar o servidor.

---

## Uso em QA e Automação

O QA Playground pode ser utilizado com qualquer ferramenta de automação web, como:

* Selenium (WebDriver)
* Playwright
* Cypress
* Robot Framework
* Appium (para testes mobile)

Também é adequado para:

* Criação de casos de teste
* Escrita de cenários BDD
* Testes exploratórios
* Exercícios de análise de qualidade e estratégia de testes
* Prática de automação mobile (Android e iOS)

---

## Mobile Playground

O **Mobile Playground** é uma seção dedicada à automação mobile, oferecendo:

* Documentação completa para configuração de ambiente Android e iOS
* Guias passo a passo de instalação (Node.js, Java, Android SDK, Xcode)
* Exemplos de código em Java, Python e Ruby para Appium
* Simuladores interativos de dispositivos Android e iOS
* Explicação detalhada de Capabilities
* Comparação entre automação Web e Mobile
* Troubleshooting de problemas comuns
* Estruturas de projeto para diferentes linguagens

---

## Boas práticas esperadas ao testar este projeto

O QA Playground foi concebido para incentivar **boas práticas de qualidade**, indo além da simples execução de fluxos positivos.

Ao utilizar este projeto, espera-se que o profissional de QA:

* Analise regras de negócio antes de iniciar a execução de testes;
* Identifique cenários positivos, negativos e de borda;
* Questione comportamentos implícitos e decisões da aplicação;
* Priorize testes com base em risco e impacto;
* Documente cenários e resultados de forma clara e objetiva;
* Construa automações focadas em legibilidade, manutenção e confiabilidade.

### Uso raso

Um uso raso do projeto normalmente se limita a:

* Executar apenas o fluxo feliz;
* Automatizar cenários sem análise prévia;
* Criar scripts frágeis, dependentes de estrutura visual;
* Ignorar validações, mensagens e comportamentos alternativos;
* Focar apenas em quantidade de testes.

### Uso maduro

Um uso maduro do QA Playground demonstra:

* Entendimento das regras de negócio envolvidas;
* Cobertura consciente de cenários relevantes e críticos;
* Exploração de comportamentos inesperados ou inconsistentes;
* Automação pensada para evolução do projeto;
* Clareza na comunicação de riscos, limitações e achados.

Essa diferença de abordagem é intencional e faz parte da proposta do projeto: **avaliar como o profissional pensa qualidade**, não apenas se consegue automatizar.

---

## Contribuições

Contribuições são bem-vindas! Se você tem ideias para melhorar o projeto, adicionar novos cenários ou corrigir problemas, sinta-se à vontade para abrir issues ou pull requests.

---

## Licença

Este projeto está licenciado sob a [MIT License](LICENSE). Você é livre para usar, modificar e distribuir este projeto para fins educacionais, comerciais ou pessoais.

---

## Autor

Desenvolvido por **David Nascimento**, com foco em prática real de QA, aprendizado contínuo e construção de portfólio profissional.

---

## Agradecimentos

Agradecimentos a todos os profissionais de QA que contribuem com feedback, sugestões e melhorias para tornar este projeto cada vez mais útil para a comunidade.
