# Checklist: Verificar Configurações do Supabase

## ⚠️ Problema: Timeout ao conectar via Hyperdrive

Siga este checklist na ordem para identificar e resolver o problema:

## 1. ✅ Connection String do Hyperdrive

**Status:** ✅ CORRIGIDO
- Hyperdrive ID: `a1a4b4587d284e078337c97e5229e81d`
- Host: `aws-0-us-west-2.pooler.supabase.com` ✅
- Porta: `6543` ✅
- Usuário: `postgres.eoieosbjgwskiobsuplz` ✅

## 2. 🔍 Network Restrictions (CRÍTICO)

**Localização:** Dashboard → Settings → Database → Network Restrictions

### Verificar:
- [ ] **IP Allowlist está DESABILITADA?**
  - Se estiver habilitada, o Cloudflare Workers será bloqueado
  - **Ação:** Desabilite temporariamente para testar
  
- [ ] Se precisar manter IP allowlist:
  - Adicione os IPs do Cloudflare (não recomendado - muitos IPs)
  - Ou use apenas o pooler (porta 6543) que geralmente não requer allowlist

**Como verificar:**
1. Acesse: https://supabase.com/dashboard/project/eoieosbjgwskiobsuplz/settings/database
2. Role até "Network Restrictions"
3. Verifique se há IPs bloqueados ou allowlist ativa

## 3. 🔍 Connection Pooling (CRÍTICO)

**Localização:** Dashboard → Settings → Database → Connection Pooling

### Verificar:
- [ ] **Pooling Mode:** Deve ser **"Session"** (não "Transaction")
- [ ] **Max connections:** Verifique se não está muito baixo (recomendado: pelo menos 20-50)
- [ ] **Connection string:** Use sempre a do **Session pooler** (porta 6543)

**Como verificar:**
1. Acesse: https://supabase.com/dashboard/project/eoieosbjgwskiobsuplz/settings/database
2. Role até "Connection Pooling"
3. Verifique as configurações acima

## 4. 🔍 Database Status

**Localização:** Dashboard → Project Overview

### Verificar:
- [ ] **Projeto está ATIVO?**
  - Projetos pausados não aceitam conexões
  - Verifique se não há avisos de pausa ou suspensão

- [ ] **Quota de conexões:**
  - Verifique se não excedeu o limite de conexões simultâneas
  - Free tier geralmente tem limite de 60 conexões

## 5. 🔍 Testar Connection String Localmente

Teste se a connection string funciona fora do Hyperdrive:

```bash
# Instalar psql (se não tiver)
# macOS: brew install postgresql
# Linux: sudo apt-get install postgresql-client

# Testar conexão direta (porta 5432)
psql "postgresql://postgres.eoieosbjgwskiobsuplz:gestao%402026@db.eoieosbjgwskiobsuplz.supabase.co:5432/postgres" -c "SELECT 1"

# Testar pooler (porta 6543)
psql "postgresql://postgres.eoieosbjgwskiobsuplz:gestao%402026@aws-0-us-west-2.pooler.supabase.com:6543/postgres" -c "SELECT 1"
```

**Se funcionar localmente mas não no Hyperdrive:**
- Problema pode ser específico do Hyperdrive/Cloudflare
- Verifique Network Restrictions novamente
- Pode ser necessário contatar suporte do Supabase

## 6. 🔍 Verificar Logs do Supabase

**Localização:** Dashboard → Logs → Postgres Logs

### Verificar:
- [ ] Há erros de conexão nos logs?
- [ ] Há mensagens de "connection refused" ou "timeout"?
- [ ] Há mensagens sobre IP bloqueado?

**Como verificar:**
1. Acesse: https://supabase.com/dashboard/project/eoieosbjgwskiobsuplz/logs/explorer
2. Selecione "Postgres Logs"
3. Procure por erros relacionados a conexões

## 7. 🔍 Verificar Logs do Worker

Execute para ver erros em tempo real:

```bash
cd api
npx wrangler tail
```

Depois faça uma requisição e veja os logs.

## 8. 🔄 Alternativas se Nada Funcionar

### Opção A: Usar Connection String Direta (temporário)

Se o pooler não funcionar, tente a connection string direta:

```bash
cd api
npx wrangler hyperdrive delete a1a4b4587d284e078337c97e5229e81d
npx wrangler hyperdrive create gestao-db \
  --connection-string="postgresql://postgres.eoieosbjgwskiobsuplz:gestao%402026@db.eoieosbjgwskiobsuplz.supabase.co:5432/postgres"
```

**⚠️ ATENÇÃO:** Isso não é recomendado para produção, mas pode funcionar temporariamente.

### Opção B: Verificar se há Problema com a View `saldo_estoque`

A query `listComSaldos` usa uma view `saldo_estoque`. Verifique:

```sql
-- No Supabase SQL Editor
SELECT * FROM saldo_estoque LIMIT 1;
```

Se a view não existir ou estiver com problemas, isso pode causar timeout.

### Opção C: Contatar Suporte do Supabase

Se nada funcionar, entre em contato com o suporte do Supabase mencionando:
- Uso com Cloudflare Hyperdrive
- Connection string do pooler (porta 6543)
- Erro de timeout
- Projeto ID: `eoieosbjgwskiobsuplz`

## 9. 📋 Resumo das Configurações Corretas

### Connection String (Session Pooler):
```
postgresql://postgres.eoieosbjgwskiobsuplz:gestao%402026@aws-0-us-west-2.pooler.supabase.com:6543/postgres
```

### Configurações Recomendadas:
- **Network Restrictions:** DESABILITADO (ou apenas pooler permitido)
- **Pooling Mode:** Session
- **Max Connections:** 20-50 (depende do plano)
- **Porta:** 6543 (pooler)

## 10. 🎯 Próximos Passos

1. ✅ Verificar Network Restrictions (desabilitar se ativo)
2. ✅ Verificar Connection Pooling (Session mode)
3. ✅ Testar connection string localmente
4. ✅ Verificar logs do Supabase
5. ✅ Verificar logs do Worker
6. Se nada funcionar: tentar connection string direta ou contatar suporte
