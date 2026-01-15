# Testando Build Localmente para Vercel

## 🔍 Verificando o Build

Quando você executa `vercel build`, o processo faz:

1. **Instalação de dependências** (`npm install`)
2. **Build CSS** (`npm run build:css`) - Compila SCSS → `css/main.css`
3. **Build TypeScript** (`npm run build:ts`) - Compila TS → `js/`

## ✅ O que esperar

Após executar `vercel build`, você deve ver:

```
Running "install" command: `npm install`...
[instalação das dependências]
Running "build" command: `npm run build`...

> qa-playground@1.0.0 build
> npm run build:css && npm run build:ts

> qa-playground@1.0.0 build:css
> sass styles/main.scss css/main.css --style=expanded --source-map
[avisos do SASS - podem aparecer deprecation warnings]

> qa-playground@1.0.0 build:ts
> tsc
[compilação do TypeScript]
```

## ⏱️ Tempo de Build

O build normalmente leva:
- **10-30 segundos** dependendo do hardware
- Pode demorar mais na primeira vez

## 🔍 Verificando se o Build Funcionou

Após o build, verifique se os arquivos foram gerados:

```bash
# Verificar se CSS foi gerado
ls -la css/main.css

# Verificar se JS foi gerado
ls -la js/index.js
```

## 🐛 Problemas Comuns

### Build parece travado

Se o build parece travado, pode ser porque:
1. **Está compilando** - aguarde alguns segundos (especialmente TypeScript)
2. **Aguardando input** - verifique se há alguma pergunta pendente no terminal

### Avisos de Deprecation do SASS

Os avisos sobre `@import` são normais e não impedem o build. O SASS continua funcionando.

### Erros de TypeScript

Se houver erros de TypeScript, o build falhará. Corrija os erros antes de fazer deploy.

## 🚀 Próximos Passos

Após o build local funcionar:

1. **Deploy na Vercel**:
   ```bash
   vercel --prod
   ```

2. **Ou via interface web**:
   - Conecte o repositório na Vercel
   - O deploy automático acontecerá a cada push

## 📝 Notas

- O `vercel build` é apenas para **testar localmente**
- O deploy real usa o mesmo processo, mas na infraestrutura da Vercel
- Se o build local funciona, o deploy também funcionará
