# API em Produção - Vercel

## 🌐 URLs da API

**Domínio de produção:** `https://qa-playground-azure.vercel.app`

**URLs da API:**
- Base: `https://qa-playground-azure.vercel.app/api`
- Health Check: `https://qa-playground-azure.vercel.app/api/health`
- Documentação: `https://qa-playground-azure.vercel.app/api`

## 🔧 Como Funciona

A API está configurada para funcionar automaticamente na Vercel como **serverless functions**:

1. **Arquivo handler**: `api/[...path].ts` - Captura todas as rotas `/api/*`
2. **Compilação**: A Vercel compila automaticamente os arquivos TypeScript
3. **Rotas**: Todas as rotas são roteadas através do handler serverless

## 📝 Configuração

### vercel.json
```json
{
  "functions": {
    "api/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  }
}
```

### Dependências Necessárias
- `@vercel/node` - Para tipos TypeScript da Vercel
- `express` - Framework web
- `cors` - Middleware CORS

## 🧪 Testando em Produção

### Postman/Insomnia

Crie um ambiente de produção com:
- `base_url`: `https://qa-playground-azure.vercel.app/api`

### Exemplo de Requisição

```http
GET https://qa-playground-azure.vercel.app/api/health
```

```http
POST https://qa-playground-azure.vercel.app/api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

## ⚠️ Notas Importantes

1. **Detecção Automática**: As páginas HTML detectam automaticamente se estão em desenvolvimento ou produção
2. **CORS**: A API está configurada com CORS habilitado para aceitar requisições do domínio
3. **Serverless**: Cada requisição é uma função serverless independente
4. **Estado**: Os dados mockados são mantidos apenas durante a execução da função (stateless)

## 🔍 Troubleshooting

### API não responde em produção
- Verifique se o arquivo `api/[...path].ts` está presente
- Verifique se as dependências estão instaladas
- Verifique os logs da Vercel para erros de compilação

### Erro de importação
- Certifique-se de que os arquivos de rotas estão na pasta `api/routes/`
- Verifique se o TypeScript está compilando corretamente

### CORS Errors
- A API já está configurada com CORS
- Verifique se está usando o domínio correto: `https://qa-playground-azure.vercel.app`
