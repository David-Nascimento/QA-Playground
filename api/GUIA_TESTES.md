# Guia de Testes - API Mockada QA Playground

## 🚀 Como Iniciar a API

### 1. Instalar Dependências

```bash
npm install
```

### 2. Compilar TypeScript

```bash
npm run build:ts:api
```

### 3. Iniciar o Servidor

```bash
npm run dev:api
```

A API estará disponível em: **http://localhost:3001**

### 4. Verificar se está rodando

Abra no navegador ou faça uma requisição:
- **GET** `http://localhost:3001/api/health`

Resposta esperada:
```json
{
  "status": "ok",
  "timestamp": "2024-01-20T10:00:00.000Z",
  "service": "QA Playground API Mock"
}
```

---

## 📮 Testando com Postman

### Opção 1: Importar Coleção Pronta (Recomendado)

1. Abra o Postman
2. Clique em **Import**
3. Selecione o arquivo: `api/QA-Playground-API.postman_collection.json`
4. A coleção será importada com todas as requisições prontas!

A coleção já inclui:
- ✅ Variáveis configuradas (`base_url` e `token`)
- ✅ Script para salvar token automaticamente após login
- ✅ Todas as requisições principais
- ✅ Exemplos de cenários de erro

### Opção 2: Criar Manualmente

### 2. Criar Nova Collection (se não importou)

1. Abra o Postman
2. Clique em **New** → **Collection**
3. Nomeie como: `QA Playground API`

### 2. Configurar Variáveis de Ambiente

1. Clique em **Environments** → **+**
2. Crie dois ambientes:

**Ambiente: `QA Playground Local` (Desenvolvimento)**
| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `base_url` | `http://localhost:3001/api` | `http://localhost:3001/api` |
| `token` | (deixe vazio) | (será preenchido após login) |

**Ambiente: `QA Playground Production` (Produção)**
| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `base_url` | `https://qa-playground-azure.vercel.app/api` | `https://qa-playground-azure.vercel.app/api` |
| `token` | (deixe vazio) | (será preenchido após login) |

### 4. Configurar Collection (se não importou)

Na sua collection, vá em **Variables** e adicione:
- `base_url`: `http://localhost:3001/api`
- `token`: (deixe vazio inicialmente)

### 5. Criar Requisições (se não importou)

#### Health Check
- **Method**: `GET`
- **URL**: `{{base_url}}/health`
- **Headers**: (nenhum necessário)

#### Login (Admin)
- **Method**: `POST`
- **URL**: `{{base_url}}/auth/login`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body** (raw JSON):
  ```json
  {
    "email": "admin@example.com",
    "password": "admin123"
  }
  ```
- **Tests** (para salvar o token automaticamente):
  ```javascript
  if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    pm.environment.set("token", jsonData.data.token);
    pm.collectionVariables.set("token", jsonData.data.token);
  }
  ```

#### GET Users (requer autenticação)
- **Method**: `GET`
- **URL**: `{{base_url}}/users`
- **Headers**: 
  ```
  Authorization: Bearer {{token}}
  Content-Type: application/json
  ```

#### GET Users com Cenário de Erro
- **Method**: `GET`
- **URL**: `{{base_url}}/users?scenario=error-401`
- **Headers**: 
  ```
  Authorization: Bearer {{token}}
  Content-Type: application/json
  ```

#### POST Users (criar usuário)
- **Method**: `POST`
- **URL**: `{{base_url}}/users`
- **Headers**: 
  ```
  Authorization: Bearer {{token}}
  Content-Type: application/json
  ```
- **Body** (raw JSON):
  ```json
  {
    "name": "Novo Usuário",
    "email": "novo@example.com",
    "role": "user",
    "active": true
  }
  ```

#### GET Orders
- **Method**: `GET`
- **URL**: `{{base_url}}/orders`
- **Headers**: 
  ```
  Authorization: Bearer {{token}}
  Content-Type: application/json
  ```

#### POST Orders (criar pedido)
- **Method**: `POST`
- **URL**: `{{base_url}}/orders`
- **Headers**: 
  ```
  Authorization: Bearer {{token}}
  Content-Type: application/json
  ```
- **Body** (raw JSON):
  ```json
  {
    "items": [
      {
        "productId": 101,
        "productName": "Notebook",
        "quantity": 1,
        "price": 2500.0
      },
      {
        "productId": 102,
        "productName": "Mouse",
        "quantity": 2,
        "price": 50.0
      }
    ]
  }
  ```

### 6. Testar Cenários de Erro

Para testar diferentes cenários, adicione query param `?scenario=<tipo>`:

- `?scenario=error-400` - Bad Request
- `?scenario=error-401` - Unauthorized
- `?scenario=error-403` - Forbidden
- `?scenario=error-404` - Not Found
- `?scenario=error-409` - Conflict
- `?scenario=error-422` - Unprocessable Entity
- `?scenario=error-429` - Too Many Requests
- `?scenario=error-500` - Internal Server Error
- `?scenario=error-503` - Service Unavailable
- `?scenario=timeout` - Gateway Timeout (aguarda 10s)

**Exemplo:**
```
GET {{base_url}}/users?scenario=error-500
```

Ou use header `x-mock-scenario`:
```
x-mock-scenario: error-401
```

---

## 📮 Testando com Insomnia

### 1. Criar Novo Projeto

1. Abra o Insomnia
2. Clique em **Create** → **New Design Document**
3. Nomeie como: `QA Playground API`

### 2. Configurar Variáveis de Ambiente

1. Clique no ícone de **Environment** (canto superior direito)
2. Clique em **Manage Environments** → **Create Environment**
3. Nomeie como: `Local`
4. Adicione as variáveis:

```json
{
  "base_url": "http://localhost:3001/api",
  "token": ""
}
```

### 3. Criar Requisições

#### Health Check
- **Method**: `GET`
- **URL**: `{{ _.base_url }}/health`
- **Auth**: None

#### Login (Admin)
- **Method**: `POST`
- **URL**: `{{ _.base_url }}/auth/login`
- **Body** (JSON):
  ```json
  {
    "email": "admin@example.com",
    "password": "admin123"
  }
  ```
- **Response Filtering** (para salvar token):
  - Após receber resposta, clique com botão direito na resposta
  - Selecione **Response** → **Copy Response Body**
  - Cole o token manualmente na variável `token` do ambiente

**Ou use o plugin de automação:**
1. Vá em **Plugins** → **Install Plugin**
2. Instale plugin de automação
3. Configure para salvar token automaticamente

#### GET Users
- **Method**: `GET`
- **URL**: `{{ _.base_url }}/users`
- **Auth**: Bearer Token
- **Token**: `{{ _.token }}`

#### POST Users
- **Method**: `POST`
- **URL**: `{{ _.base_url }}/users`
- **Auth**: Bearer Token
- **Token**: `{{ _.token }}`
- **Body** (JSON):
  ```json
  {
    "name": "Novo Usuário",
    "email": "novo@example.com",
    "role": "user",
    "active": true
  }
  ```

### 4. Testar Cenários de Erro

Adicione query param ou header:

**Query Param:**
```
GET {{ _.base_url }}/users?scenario=error-401
```

**Header:**
```
x-mock-scenario: error-500
```

---

## 🔐 Credenciais de Teste

| Role | Email | Senha |
|------|-------|-------|
| Admin | `admin@example.com` | `admin123` |
| User | `user@example.com` | `user123` |
| Viewer | `viewer@example.com` | `viewer123` |

---

## 📋 Endpoints Disponíveis

### Autenticação
- `POST /api/auth/login` - Faz login e retorna token
- `POST /api/auth/logout` - Faz logout
- `GET /api/auth/me` - Informações do usuário autenticado
- `POST /api/auth/validate` - Valida um token

### Usuários (requer autenticação)
- `GET /api/users` - Lista todos os usuários (admin)
- `GET /api/users/:id` - Busca usuário específico
- `POST /api/users` - Cria novo usuário (admin)
- `PUT /api/users/:id` - Atualiza usuário
- `DELETE /api/users/:id` - Deleta usuário (admin)

### Pedidos (requer autenticação)
- `GET /api/orders` - Lista pedidos (próprios ou todos se admin)
- `GET /api/orders/:id` - Busca pedido específico
- `POST /api/orders` - Cria novo pedido
- `PUT /api/orders/:id` - Atualiza pedido
- `DELETE /api/orders/:id` - Deleta pedido (admin)

### Health Check
- `GET /api/health` - Verifica status da API

### Documentação
- `GET /api` - Retorna documentação completa da API

---

## 🎯 Controle de Cenários

A API permite simular diferentes comportamentos usando:

### Query Parameter
```
GET /api/users?scenario=error-401
POST /api/users?scenario=error-422
```

### Header
```
x-mock-scenario: error-500
```

### Cenários Disponíveis
- `success` - Resposta de sucesso (padrão)
- `error-400` - Bad Request
- `error-401` - Unauthorized
- `error-403` - Forbidden
- `error-404` - Not Found
- `error-409` - Conflict
- `error-422` - Unprocessable Entity
- `error-429` - Too Many Requests
- `error-500` - Internal Server Error
- `error-503` - Service Unavailable
- `timeout` - Gateway Timeout (10 segundos)

---

## 🔍 Exemplos de Testes

### Teste 1: Login e Obter Token
```http
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

### Teste 2: Listar Usuários (com token)
```http
GET http://localhost:3001/api/users
Authorization: Bearer SEU_TOKEN_AQUI
```

### Teste 3: Criar Usuário
```http
POST http://localhost:3001/api/users
Authorization: Bearer SEU_TOKEN_AQUI
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@example.com",
  "role": "user",
  "active": true
}
```

### Teste 4: Simular Erro 401
```http
GET http://localhost:3001/api/users?scenario=error-401
Authorization: Bearer token-invalido
```

### Teste 5: Simular Erro 500
```http
GET http://localhost:3001/api/users?scenario=error-500
Authorization: Bearer SEU_TOKEN_AQUI
```

---

## ⚠️ Troubleshooting

### API não inicia
- Verifique se a porta 3001 está livre: `netstat -ano | findstr :3001` (Windows) ou `lsof -i :3001` (Mac/Linux)
- Verifique se as dependências foram instaladas: `npm install`
- Verifique se o TypeScript foi compilado: `npm run build:ts:api`

### Erro de conexão no Postman/Insomnia
- Verifique se a API está rodando: `http://localhost:3001/api/health`
- Verifique se a URL está correta: `http://localhost:3001/api`
- Verifique se não há firewall bloqueando

### Token inválido
- Faça login novamente para obter um novo token
- Tokens expiram após 1 hora
- Verifique se está usando `Bearer` antes do token no header

### CORS Errors
- A API já está configurada com CORS habilitado
- Se ainda tiver problemas, verifique se está usando `http://localhost:3001` e não `http://127.0.0.1:3001`

---

## 📚 Recursos Adicionais

- **Documentação da API**: `GET http://localhost:3001/api`
- **Health Check**: `GET http://localhost:3001/api/health`
- **README da API**: Veja `api/README.md`

---

## 💡 Dicas

1. **Sempre faça login primeiro** para obter o token
2. **Use variáveis de ambiente** para facilitar a troca entre ambientes
3. **Teste cenários de erro** usando o parâmetro `scenario`
4. **Salve o token automaticamente** usando scripts de teste no Postman
5. **Use a documentação da API** (`GET /api`) para ver todos os endpoints disponíveis
