# QA Playground API Mock

API mockada para prática de testes QA. Simula comportamentos reais de backend incluindo sucessos, erros e autenticação.

## 🚀 Início Rápido

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
# Apenas a API
npm run dev:api

# API + Frontend juntos (RECOMENDADO)
npm run dev

# OU para produção
npm start
```

**A API inicia automaticamente junto com a aplicação web!**

- Frontend: `http://localhost:8000`
- API: `http://localhost:3001/api`

### 4. Verificar se está rodando (Health Check)

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

## 📮 Testando com Postman ou Insomnia

### Postman (Coleção Pronta)

1. **Importar coleção**: Abra o Postman → Import → Selecione `api/QA-Playground-API.postman_collection.json`
2. A coleção já vem com todas as requisições configuradas!
3. Faça login primeiro para obter o token (será salvo automaticamente)

### Insomnia

Para instruções detalhadas, veja:
- **[GUIA_TESTES.md](./GUIA_TESTES.md)** - Guia completo com exemplos passo a passo para Postman e Insomnia

## Endpoints

### Autenticação

- `POST /api/auth/login` - Faz login
- `POST /api/auth/logout` - Faz logout
- `GET /api/auth/me` - Informações do usuário autenticado
- `POST /api/auth/validate` - Valida token

### Usuários

- `GET /api/users` - Lista usuários (admin)
- `GET /api/users/:id` - Busca usuário
- `POST /api/users` - Cria usuário (admin)
- `PUT /api/users/:id` - Atualiza usuário
- `DELETE /api/users/:id` - Deleta usuário (admin)

### Pedidos

- `GET /api/orders` - Lista pedidos
- `GET /api/orders/:id` - Busca pedido
- `POST /api/orders` - Cria pedido
- `PUT /api/orders/:id` - Atualiza pedido
- `DELETE /api/orders/:id` - Deleta pedido (admin)

## Controle de Cenários

Use query param `?scenario=<tipo>` ou header `x-mock-scenario` para controlar comportamentos:

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
- `timeout` - Timeout (10s)

### Exemplos

```bash
# Erro 401
GET /api/users?scenario=error-401

# Com header
GET /api/users
Headers: x-mock-scenario: error-500
```

## Credenciais de Teste

- **Admin**: `admin@example.com` / `admin123`
- **User**: `user@example.com` / `user123`
- **Viewer**: `viewer@example.com` / `viewer123`

## Documentação Completa

**Desenvolvimento:**
- **Documentação da API**: `GET http://localhost:3001/api`
- **Health Check**: `GET http://localhost:3001/api/health`

**Produção:**
- **Documentação da API**: `GET https://qa-playground-azure.vercel.app/api`
- **Health Check**: `GET https://qa-playground-azure.vercel.app/api/health`

- **Guia de Testes (Postman/Insomnia)**: Veja [GUIA_TESTES.md](./GUIA_TESTES.md)

## 🔍 Exemplo Rápido de Teste

### 1. Health Check

**Desenvolvimento:**
```http
GET http://localhost:3001/api/health
```

**Produção:**
```http
GET https://qa-playground-azure.vercel.app/api/health
```

### 2. Login

**Desenvolvimento:**
```http
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Produção:**
```http
POST https://qa-playground-azure.vercel.app/api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

### 3. Listar Usuários (com token)

**Desenvolvimento:**
```http
GET http://localhost:3001/api/users
Authorization: Bearer SEU_TOKEN_AQUI
```

**Produção:**
```http
GET https://qa-playground-azure.vercel.app/api/users
Authorization: Bearer SEU_TOKEN_AQUI
```
