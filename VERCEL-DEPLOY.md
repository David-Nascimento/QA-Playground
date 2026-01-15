# Deploy na Vercel - QA Playground

## 🚀 Guia de Deploy

Este documento explica como fazer o deploy do QA Playground na Vercel.

## Pré-requisitos

1. Conta na [Vercel](https://vercel.com)
2. Projeto no GitHub, GitLab ou Bitbucket (recomendado)

## Opção 1: Deploy via Interface Web (Recomendado)

### Passo 1: Conectar Repositório

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em **"New Project"** ou **"Add New..."**
3. Selecione seu repositório do QA Playground
4. Se for a primeira vez, autorize o acesso ao repositório

### Passo 2: Configurar Projeto

A Vercel detectará automaticamente as configurações do `vercel.json`. Verifique:

- **Framework Preset**: None (ou Static Site)
- **Root Directory**: `.` (raiz do projeto)
- **Build Command**: `npm run build`
- **Output Directory**: `.` (raiz do projeto)
- **Install Command**: `npm install`

### Passo 3: Variáveis de Ambiente

Não são necessárias variáveis de ambiente para este projeto estático.

### Passo 4: Deploy

1. Clique em **"Deploy"**
2. Aguarde o processo de build (compila SCSS e TypeScript)
3. Após o sucesso, a aplicação estará disponível em uma URL única

## Opção 2: Deploy via CLI

### Passo 1: Instalar Vercel CLI

```bash
npm install -g vercel
```

### Passo 2: Login

```bash
vercel login
```

### Passo 3: Deploy

```bash
# Deploy de produção
vercel --prod

# Ou apenas verificar primeiro (deploy de preview)
vercel
```

## 📋 O que acontece durante o build

1. **Instalação de dependências**: `npm install`
2. **Compilação SCSS**: `npm run build:css` → gera `css/main.css`
3. **Compilação TypeScript**: `npm run build:ts` → gera arquivos em `js/`
4. **Deploy**: Arquivos estáticos são servidos pela Vercel

## ⚙️ Configurações

O arquivo `vercel.json` configura:

- **Build Command**: `npm run build` (compila SCSS e TypeScript)
- **Headers de Segurança**: X-Content-Type-Options, X-Frame-Options, etc.
- **Content-Type**: Configurado corretamente para JS e CSS
- **Clean URLs**: URLs limpas sem `.html`
- **Rewrites**: Redireciona `/` para `/index.html`

## 🔍 Verificação Pós-Deploy

Após o deploy, verifique:

- ✅ Página inicial carrega corretamente
- ✅ Navegação funciona (dropdowns, links)
- ✅ JavaScript compilado carrega sem erros
- ✅ CSS compilado aplica corretamente
- ✅ Módulos ES6 funcionam (verificar console do navegador)
- ✅ Assets estáticos (imagens, ícones) carregam

## 🐛 Troubleshooting

### Erro: "Cannot find module"

**Problema**: Arquivos JavaScript não encontrados

**Solução**: 
- Verifique se o build foi executado: `npm run build`
- Confirme que os arquivos estão em `js/` (não devem estar no `.gitignore`)
- Verifique os caminhos relativos nos HTML

### Erro: CSS não aplica

**Problema**: Estilos não aparecem

**Solução**:
- Verifique se `css/main.css` foi gerado
- Confirme o caminho no HTML: `href="css/main.css"`
- Verifique se o arquivo não está no `.gitignore`

### Erro: 404 em páginas HTML

**Problema**: Páginas não encontradas

**Solução**:
- Verifique se os arquivos HTML estão no repositório
- Confirme os caminhos no `vercel.json`
- Use caminhos relativos nos links HTML

## 📝 Notas Importantes

1. **Arquivos Compilados**: Os arquivos gerados (`js/`, `css/`) precisam estar no repositório ou serem gerados durante o build
2. **Caminhos Relativos**: Todos os caminhos no HTML devem ser relativos
3. **Módulos ES6**: A Vercel serve corretamente módulos ES6, mas verifique se os caminhos incluem `.js`
4. **Source Maps**: Podem ser incluídos para debug, mas não são necessários em produção

## 🔄 Atualizações

Após fazer push para o repositório conectado, a Vercel fará deploy automático:

1. **Preview Deploys**: Cada push cria um preview deploy
2. **Production Deploy**: Push na branch principal (geralmente `main` ou `master`) faz deploy de produção

## 🌐 Domínio Customizado

Para usar um domínio próprio:

1. Vá em **Settings** → **Domains**
2. Adicione seu domínio
3. Configure os registros DNS conforme instruções da Vercel

## 📚 Recursos

- [Documentação da Vercel](https://vercel.com/docs)
- [Guia de Deploy de Sites Estáticos](https://vercel.com/docs/concepts/deployments/overview)
- [Configuração do vercel.json](https://vercel.com/docs/configuration)
