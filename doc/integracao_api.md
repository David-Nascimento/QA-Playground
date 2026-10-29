
## Papel
Você é um **QA Engineer Sênior / SDET**, com forte experiência em **testes de APIs REST**, **APIs mockadas**, **arquitetura de aplicações WEB** e **plataformas educacionais para QA**.

## Contexto Importante
Já existe uma pasta chamada **`api/`** dentro do projeto WEB.  
Essa pasta **não deve ser substituída nem fragmentada em vários arquivos de documentação**.

O objetivo é **UTILIZAR a pasta `api/` existente** para:

- Criar **APIs mockadas reais**
- Criar **cenários realistas de uso**
- Permitir que a **API suba junto com a aplicação WEB**
- Servir como base para **testes manuais e automatizados**
- Ensinar QA a testar APIs como no mundo real

Este projeto se chama **QA Playground**.

---

## Objetivo Principal
Criar **cenários reais de API**, simulando comportamentos reais de backend, incluindo:

- Respostas de sucesso
- Erros de cliente (4xx)
- Erros de servidor (5xx)
- Autenticação e autorização
- Regras de negócio
- Edge cases comuns no dia a dia de QA

Esses cenários devem estar **implementados em código**, não apenas descritos.

---

## Regras Obrigatórias
- NÃO criar vários arquivos `.md`
- NÃO criar documentação extensa
- NÃO criar múltiplas pastas conceituais
- NÃO alterar a arquitetura global do projeto
- USAR a pasta `api/` que já existe
- A API deve rodar **junto com a aplicação WEB**
- Os cenários devem ser **consumíveis pelo front-end**
- Linguagem e estrutura focadas em QA

---

## O Que Deve Existir Dentro da Pasta `api/`

A pasta `pages/senior/apis/` deve conter:

- Endpoints mockados reais
- Dados previsíveis e controlados
- Cenários configuráveis por status code
- Simulação de regras de negócio
- Simulação de autenticação
- Possibilidade de erro proposital

Exemplo conceitual (não documentação):

```text
api/
├── index.ts (ou server.ts)
├── routes/
│   ├── users.ts
│   ├── auth.ts
│   └── orders.ts
├── data/
│   ├── users.mock.ts
│   └── orders.mock.ts
└── config/
    └── scenarios.ts
````

---

## Tipos de Cenários REAIS que Devem Ser Criados

### Cenários de Sucesso

* GET retornando lista válida
* POST criando recurso
* PUT/PATCH atualizando recurso
* DELETE removendo recurso
* 200, 201, 204

### Erros de Cliente (QA essencial)

* 400 – payload inválido
* 401 – não autenticado
* 403 – sem permissão
* 404 – recurso inexistente
* 409 – conflito
* 422 – erro de validação
* 429 – rate limit

### Erros de Servidor

* 500 – erro inesperado
* 503 – serviço indisponível
* Timeout simulado

---

## Autenticação (Obrigatório)

A API deve simular autenticação real, como:

* Login
* Token (fake JWT ou Bearer)
* Token expirado
* Usuário sem permissão

Exemplo de comportamento esperado:

* Token válido → acesso permitido
* Token inválido → 401
* Token válido sem permissão → 403

---

## Controle de Cenários (Muito Importante)

Deve existir uma forma simples de alternar cenários, por exemplo:

* Query param
* Header
* Variável de ambiente
* Flag no código

Exemplo conceitual:

```http
GET /api/users?scenario=error-401
```

Ou:

```http
x-mock-scenario: server-error
```

Isso é essencial para aprendizado e automação QA.

---

## Integração com a Aplicação WEB

* A API deve subir junto com o projeto (`npm run dev`, `npm start`, etc.)
* O front-end deve consumir essa API como se fosse real
* Não depender de serviços externos
* Não depender de backend real

---

## Mentalidade QA (Obrigatória)

Ao criar cada endpoint, pense em:

* O que o QA precisa validar
* Como quebrar esse endpoint
* Que erro é difícil de testar em produção
* Que bug real isso pode simular

---

## Resultado Esperado

Ao final, a pasta `api/` deve permitir que qualquer QA:

* Rode a aplicação
* Consuma APIs reais (mockadas)
* Teste fluxos completos
* Teste erros reais
* Automatize cenários facilmente
* Aprenda API testing na prática

---

## Importante

Este NÃO é um exercício de documentação.
É um exercício de **simulação real de backend para QA**.

Crie APIs que se comportem como sistemas reais, com falhas reais.

```