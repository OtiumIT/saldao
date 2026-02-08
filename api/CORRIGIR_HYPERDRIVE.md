# Como Corrigir o Hyperdrive - Timeout de Conexão

## Problema Identificado

O Hyperdrive está configurado com a connection string **incorreta**:
- ❌ Host: `db.eoieosbjgwskiobsuplz.supabase.co` (formato direto)
- ❌ User: `postgres` (deveria ter o project ref)

**Deveria ser:**
- ✅ Host: `aws-0-[REGIAO].pooler.supabase.com` (pooler)
- ✅ User: `postgres.eoieosbjgwskiobsuplz` (com project ref)

## Passo a Passo para Corrigir

### 1. Obter a Connection String Correta do Supabase

1. Acesse: https://supabase.com/dashboard/project/eoieosbjgwskiobsuplz
2. Vá em **Settings** → **Database**
3. Role até **Connection string**
4. Selecione **URI (Session pooler)** - **NÃO** use "Direct connection"
5. Copie a string completa

**Formato esperado:**
```
postgresql://postgres.eoieosbjgwskiobsuplz:[SENHA]@aws-0-[REGIAO].pooler.supabase.com:6543/postgres
```

**Importante:** 
- A senha `gestao@2026` precisa ser codificada como `gestao%402026` na URL
- Use a porta **6543** (pooler), não 5432

### 2. Verificar Configurações do Supabase

No Dashboard do Supabase, verifique:

#### A. Network Restrictions (Settings → Database → Network Restrictions)
- **Desabilite** qualquer IP allowlist temporariamente para testar
- Ou adicione os IPs do Cloudflare (não recomendado, muitos IPs)

#### B. Connection Pooling (Settings → Database → Connection Pooling)
- **Mode:** Session (recomendado para Workers)
- **Max connections:** Verifique se não está muito baixo

### 3. Recriar o Hyperdrive

```bash
cd api

# 1. Deletar o Hyperdrive antigo
npx wrangler hyperdrive delete 1a04132d459f442abd695ddd84f74336

# 2. Criar novo com a connection string CORRETA
# Substitua [SENHA_CODIFICADA] pela senha codificada (gestao%402026)
# Substitua [REGIAO] pela região do seu Supabase (ex: sa-east-1, us-east-1)
npx wrangler hyperdrive create gestao-db \
  --connection-string="postgresql://postgres.eoieosbjgwskiobsuplz:[SENHA_CODIFICADA]@aws-0-[REGIAO].pooler.supabase.com:6543/postgres"

# 3. Copiar o NOVO ID retornado
# 4. Atualizar wrangler.toml com o novo ID
```

### 4. Atualizar wrangler.toml

Substitua o ID antigo pelo novo:

```toml
[[hyperdrive]]
binding = "HYPERDRIVE"
id = "<NOVO_ID_AQUI>"
```

### 5. Testar Localmente (Opcional)

Antes de fazer deploy, teste a connection string:

```bash
# Testar com psql (se tiver instalado)
psql "postgresql://postgres.eoieosbjgwskiobsuplz:gestao%402026@aws-0-[REGIAO].pooler.supabase.com:6543/postgres" -c "SELECT 1"
```

### 6. Fazer Deploy

```bash
cd api
npm run build
npx wrangler deploy
```

## Como Descobrir a Região do Supabase

A região geralmente está na URL do dashboard ou você pode:

1. Ir em **Settings** → **Database** → **Connection string**
2. A connection string do pooler mostrará a região no host
3. Exemplos comuns:
   - `aws-0-sa-east-1.pooler.supabase.com` (São Paulo)
   - `aws-0-us-east-1.pooler.supabase.com` (EUA Leste)
   - `aws-0-eu-west-1.pooler.supabase.com` (Europa)

## Troubleshooting

Se ainda der timeout após corrigir:

1. **Verifique os logs do Supabase:**
   - Dashboard → Logs → Postgres Logs
   - Procure por erros de conexão

2. **Verifique os logs do Worker:**
   ```bash
   cd api
   npx wrangler tail
   ```

3. **Teste com connection string direta temporariamente:**
   - Use porta 5432 (não recomendado para produção)
   - Isso ajuda a identificar se é problema do pooler ou geral

4. **Verifique se o projeto Supabase está ativo:**
   - Projetos pausados não aceitam conexões

## Exemplo Completo

Se sua região for `sa-east-1` e senha `gestao@2026`:

```bash
npx wrangler hyperdrive create gestao-db \
  --connection-string="postgresql://postgres.eoieosbjgwskiobsuplz:gestao%402026@aws-0-sa-east-1.pooler.supabase.com:6543/postgres"
```

**Nota:** A senha `gestao@2026` vira `gestao%402026` na URL (o `@` vira `%40`)
