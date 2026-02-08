# Opções de Hosting Node.js Gratuito (2026)

## 🆓 Opções Gratuitas Disponíveis

### 1. **Render** ⭐ (Recomendado para começar)

**Plano Free:**
- ✅ **Gratuito** para sempre
- ✅ Suporta Node.js
- ✅ PostgreSQL gratuito (até 90 dias, depois $7/mês)
- ✅ HTTPS automático
- ✅ Custom domains
- ✅ Deploy automático via Git

**Limitações:**
- ⚠️ **Spin down após 15 minutos** de inatividade
- ⚠️ Primeira requisição após spin down pode demorar ~1 minuto
- ⚠️ Sistema de arquivos efêmero (arquivos perdidos no redeploy)
- ⚠️ Limite de 750 horas/mês

**Ideal para:**
- Projetos pessoais/hobby
- Testes e desenvolvimento
- APIs que não precisam estar sempre online

**Link:** https://render.com

---

### 2. **Railway** ⭐⭐ (Melhor para produção)

**Plano Free:**
- ✅ **$5 de crédito grátis** no trial (30 dias)
- ✅ **$1 de crédito grátis/mês** após trial (não acumula)
- ✅ 1 GB RAM
- ✅ vCPU compartilhado
- ✅ PostgreSQL incluído
- ✅ Deploy automático via Git
- ✅ Sem spin down (sempre online)

**Limitações:**
- ⚠️ Créditos limitados ($1/mês = ~100 horas de uso)
- ⚠️ Pode precisar upgrade para uso contínuo
- ⚠️ Máximo 5 serviços por projeto

**Ideal para:**
- Projetos que precisam estar sempre online
- APIs em produção (com upgrade quando necessário)
- Melhor performance que Render

**Link:** https://railway.app

---

### 3. **Fly.io**

**Plano Free:**
- ✅ **3 VMs grátis** compartilhadas
- ✅ 3 GB de storage
- ✅ 160 GB de transferência/mês
- ✅ Sem spin down
- ✅ Deploy via CLI

**Limitações:**
- ⚠️ Configuração mais complexa
- ⚠️ Requer Dockerfile ou fly.toml
- ⚠️ Limite de recursos compartilhados

**Ideal para:**
- Projetos que já usam Docker
- Desenvolvedores com experiência em DevOps

**Link:** https://fly.io

---

### 4. **DigitalOcean App Platform**

**Plano Free:**
- ✅ **$200 de crédito** por 60 dias (trial)
- ✅ Após trial: $5/mês mínimo
- ⚠️ Não é gratuito permanente

**Ideal para:**
- Projetos que podem pagar $5/mês após trial

**Link:** https://www.digitalocean.com/products/app-platform

---

### 5. **Vercel** (Só para Serverless Functions)

**Plano Free:**
- ✅ Gratuito
- ⚠️ **Apenas para Serverless Functions** (não para APIs Node.js tradicionais)
- ⚠️ Timeout de 10 segundos (Hobby)
- ⚠️ Não suporta conexões persistentes (PostgreSQL pool)

**Ideal para:**
- ❌ **NÃO recomendado** para APIs com PostgreSQL

---

## 🎯 Recomendação para Seu Projeto

### Para Começar (Teste/Gratuito):
**Render** - Mais fácil de configurar, gratuito permanente

### Para Produção (Quando precisar):
**Railway** - Melhor performance, sempre online, upgrade fácil ($5-10/mês)

## 📋 Comparação Rápida

| Serviço | Gratuito? | Spin Down? | PostgreSQL | Dificuldade |
|---------|-----------|------------|------------|-------------|
| **Render** | ✅ Sim | ⚠️ Sim (15min) | ✅ Sim | ⭐ Fácil |
| **Railway** | ✅ $1/mês | ✅ Não | ✅ Sim | ⭐ Fácil |
| **Fly.io** | ✅ Sim | ✅ Não | ⚠️ Separado | ⭐⭐ Médio |
| **Vercel** | ✅ Sim | N/A | ❌ Não | ⭐ Fácil |

## 🚀 Guia Rápido: Deploy no Render

### 1. Criar conta no Render
- Acesse: https://render.com
- Faça login com GitHub

### 2. Criar Web Service
- New → Web Service
- Conecte seu repositório GitHub
- Configure:
  - **Name:** `gestao-api`
  - **Environment:** `Node`
  - **Build Command:** `cd api && npm install && npm run build`
  - **Start Command:** `cd api && npm start`
  - **Root Directory:** `/` (raiz do repo)

### 3. Adicionar PostgreSQL (opcional)
- New → PostgreSQL
- Use connection string no `DATABASE_URL`

### 4. Variáveis de Ambiente
Adicione no Render Dashboard:
```
DATABASE_URL=postgresql://...
CORS_ORIGIN=https://gestao.saldaomoveisjerusalem.com.br
FRONTEND_URL=https://gestao.saldaomoveisjerusalem.com.br
FIXED_AUTH=true
FIXED_AUTH_EMAIL=admin@saldao.local
JWT_SECRET=...
```

### 5. Deploy
- Render faz deploy automático via Git
- Ou clique em "Manual Deploy"

## 🚀 Guia Rápido: Deploy no Railway

### 1. Criar conta no Railway
- Acesse: https://railway.app
- Faça login com GitHub

### 2. New Project → Deploy from GitHub
- Selecione seu repositório
- Railway detecta automaticamente Node.js

### 3. Configurar
- **Root Directory:** `/api`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`

### 4. Adicionar PostgreSQL
- New → Database → PostgreSQL
- Railway cria automaticamente `DATABASE_URL`

### 5. Variáveis de Ambiente
Adicione no Railway Dashboard:
```
CORS_ORIGIN=https://gestao.saldaomoveisjerusalem.com.br
FRONTEND_URL=https://gestao.saldaomoveisjerusalem.com.br
FIXED_AUTH=true
FIXED_AUTH_EMAIL=admin@saldao.local
JWT_SECRET=...
```

## 💡 Dica Importante

**Para seu projeto específico:**
- Se precisa estar **sempre online**: Railway ($1/mês ou upgrade)
- Se pode aceitar **spin down**: Render (gratuito)
- Para **testar primeiro**: Render (mais fácil)

## 📝 Próximos Passos

1. Escolher serviço (Render recomendado para começar)
2. Criar conta e conectar GitHub
3. Fazer deploy seguindo guia acima
4. Atualizar `VITE_API_URL` no Cloudflare Pages

Quer que eu ajude a configurar o deploy em algum desses serviços?
