# Configuração Supabase + Hyperdrive (Cloudflare Workers)

## Problema: Timeout ao conectar

Se você está recebendo erros de timeout ao conectar via Hyperdrive, verifique as seguintes configurações:

## 1. Connection String Correta

### ❌ Formato INCORRETO (porta direta):
```
postgresql://postgres:senha@db.PROJECT_REF.supabase.co:6543/postgres
```

### ✅ Formato CORRETO (pooler):
```
postgresql://postgres.PROJECT_REF:senha@aws-0-REGIAO.pooler.supabase.com:6543/postgres
```

**Diferenças importantes:**
- Usuário: `postgres.PROJECT_REF` (não apenas `postgres`)
- Host: `aws-0-REGIAO.pooler.supabase.com` (não `db.PROJECT_REF.supabase.co`)
- Porta: `6543` (pooler) - obrigatório para Hyperdrive

## 2. Onde encontrar a Connection String correta no Supabase

1. Acesse o **Dashboard do Supabase**: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** → **Database**
4. Role até **Connection string** → **URI (Session pooler)**
5. Copie a string que começa com `postgresql://postgres.[PROJECT-REF]:...`

**Exemplo:**
```
postgresql://postgres.eoieosbjgwskiobsuplz:gestao%402026@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
```

## 3. Configurações do Supabase que podem causar timeout

### A. IP Allowlist / Firewall

**Localização:** Settings → Database → Network Restrictions

**Problema:** Se houver IP allowlist ativa, o Cloudflare Workers pode estar bloqueado.

**Solução:**
- **Opção 1 (Recomendada):** Desabilitar IP allowlist temporariamente para testar
- **Opção 2:** Adicionar os IPs do Cloudflare (não recomendado, muitos IPs)
- **Opção 3:** Usar apenas o pooler (porta 6543) que geralmente não requer IP allowlist

### B. Connection Pooling Mode

**Localização:** Settings → Database → Connection Pooling

**Configurações disponíveis:**
- **Session mode:** Mantém sessão aberta (melhor para Workers)
- **Transaction mode:** Fecha após cada transação

**Recomendação:** Use **Session mode** para Hyperdrive

### C. Max Connections

**Localização:** Settings → Database → Connection Pooling

**Verifique:**
- Se o limite de conexões não está muito baixo
- Se há muitas conexões simultâneas esgotando o pool

**Recomendação:** Aumente se necessário (depende do seu plano)

## 4. Verificar e Recriar Hyperdrive

Se a connection string estiver incorreta, você precisa recriar o Hyperdrive:

```bash
cd api

# 1. Listar Hyperdrives existentes
npx wrangler hyperdrive list

# 2. Deletar o Hyperdrive antigo (se necessário)
npx wrangler hyperdrive delete <HYPERDRIVE_ID>

# 3. Criar novo Hyperdrive com a connection string CORRETA
npx wrangler hyperdrive create gestao-db \
  --connection-string="postgresql://postgres.PROJECT_REF:senha@aws-0-REGIAO.pooler.supabase.com:6543/postgres"

# 4. Copiar o ID retornado e atualizar wrangler.toml
```

## 5. Testar Connection String Localmente

Antes de usar no Hyperdrive, teste a connection string localmente:

```bash
# Instalar psql (se não tiver)
# macOS: brew install postgresql
# Linux: sudo apt-get install postgresql-client

# Testar conexão
psql "postgresql://postgres.PROJECT_REF:senha@aws-0-REGIAO.pooler.supabase.com:6543/postgres" -c "SELECT 1"
```

Se funcionar localmente mas não no Hyperdrive, o problema pode ser:
- Configuração do Hyperdrive
- Timeout muito baixo no Worker
- Problemas de rede entre Cloudflare e Supabase

## 6. Configurações Adicionais no Supabase

### A. Statement Timeout

**Localização:** Settings → Database → Connection Pooling

**Padrão:** Geralmente 60 segundos

**Para Workers:** Pode precisar ser aumentado se queries forem lentas

### B. Idle Timeout

**Localização:** Settings → Database → Connection Pooling

**Padrão:** Geralmente 10 minutos

**Para Workers:** Pode precisar ser ajustado dependendo do uso

## 7. Checklist de Troubleshooting

- [ ] Connection string usa formato do pooler (`postgres.PROJECT_REF` e `pooler.supabase.com`)
- [ ] Porta 6543 está sendo usada (não 5432)
- [ ] IP allowlist está desabilitada ou permite Cloudflare
- [ ] Connection pooling está em Session mode
- [ ] Max connections não está muito baixo
- [ ] Hyperdrive foi criado com a connection string correta
- [ ] `wrangler.toml` tem o ID correto do Hyperdrive
- [ ] Teste local da connection string funciona

## 8. Alternativa: Usar Connection String Direta (não recomendado)

Se o Hyperdrive continuar dando problemas, você pode tentar usar a connection string direta (porta 5432), mas isso:
- ❌ Não é recomendado para Workers
- ❌ Pode ter problemas de performance
- ❌ Pode esgotar conexões rapidamente
- ✅ Funciona como fallback temporário

**Formato direto:**
```
postgresql://postgres:senha@db.PROJECT_REF.supabase.co:5432/postgres
```

## 9. Logs e Debug

Para ver logs detalhados do Hyperdrive:

```bash
cd api
npx wrangler tail
```

Isso mostra erros de conexão em tempo real.

## 10. Suporte

Se nada funcionar:
1. Verifique os logs do Supabase (Dashboard → Logs → Postgres Logs)
2. Verifique os logs do Cloudflare Workers (Dashboard → Workers → Logs)
3. Entre em contato com suporte do Supabase mencionando uso com Cloudflare Hyperdrive
