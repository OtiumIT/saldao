# Migração para Supabase Data API

## 🎯 Objetivo

Migrar de PostgreSQL direto (via `pg`) para **Supabase Data API** (REST), **sem usar policies** (RLS).

## ✅ Vantagens

- ✅ Funciona em **Cloudflare Workers** (sem Hyperdrive)
- ✅ Sem problemas de timeout de conexão
- ✅ Sem necessidade de pool de conexões
- ✅ Service role key bypassa todas as policies (RLS)
- ✅ Mais simples para serverless

## 📋 Como Funciona

### 1. Service Role Key (Sem Policies)

A **service role key** do Supabase bypassa todas as Row Level Security (RLS) policies. Isso significa:
- ✅ Acesso total a todas as tabelas
- ✅ Não precisa configurar policies
- ✅ Controle de acesso feito na sua API (não no banco)

### 2. Data API vs PostgreSQL Direto

**Antes (PostgreSQL direto):**
```typescript
const pool = getPool();
const { rows } = await pool.query('SELECT * FROM produtos WHERE tipo = $1', ['revenda']);
```

**Depois (Supabase Data API):**
```typescript
const client = getDataClient(env);
const data = await db.select(client, 'produtos', {
  filters: { tipo: 'revenda' }
});
```

## 🔧 Configuração

### 1. Variáveis de Ambiente

Adicione no `.env` ou no Cloudflare Workers:

```bash
# Supabase (obrigatório para Data API)
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui

# Opcional: forçar uso de Data API (padrão: true se Supabase configurado)
USE_SUPABASE_DATA_API=true
```

**⚠️ IMPORTANTE:** Use a **SERVICE ROLE KEY**, não a anon key!

### 2. Onde Encontrar a Service Role Key

1. Acesse: https://supabase.com/dashboard/project/seu-projeto/settings/api
2. Role até **Project API keys**
3. Copie a **`service_role`** key (não a `anon` key)
4. ⚠️ **Nunca exponha** essa key no frontend!

## 📝 Estrutura de Migração

### Arquivos Criados

1. **`src/db/supabase-client.ts`** - Cliente Supabase configurado
2. **`src/db/supabase-query.ts`** - Helpers para queries
3. **`src/db/data-api.ts`** - Abstração principal
4. **`src/config/db-mode.ts`** - Detecta qual modo usar

### Padrão de Migração

Para cada módulo, crie dois arquivos:

1. **`{modulo}.repository.ts`** - Versão PostgreSQL direto (mantida)
2. **`{modulo}.repository.supabase.ts`** - Versão Supabase Data API (nova)

O service detecta automaticamente qual usar baseado em `USE_SUPABASE_DATA_API`.

## 🔄 Exemplo: Módulo Clientes

### Repository Original (PostgreSQL)
```typescript
// clientes.repository.ts
export async function list(): Promise<Cliente[]> {
  const pool = getPool();
  const { rows } = await pool.query('SELECT * FROM clientes');
  return rows;
}
```

### Repository Novo (Supabase Data API)
```typescript
// clientes.repository.supabase.ts
export async function list(env: Env): Promise<Cliente[]> {
  const client = getDataClient(env);
  return db.select<Cliente>(client, 'clientes');
}
```

### Service Atualizado
```typescript
// clientes.service.ts
export const clientesService = {
  list: (env: Env) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.list(env);
    }
    return repo.list();
  },
  // ...
};
```

### Routes Atualizado
```typescript
// clientes.routes.ts
.get('/', async (c) => {
  const list = await clientesService.list(c.env); // Passa env
  return c.json(list);
})
```

## 🚀 Queries Complexas

### JOINs

**PostgreSQL:**
```sql
SELECT p.*, s.quantidade 
FROM produtos p 
LEFT JOIN saldo_estoque s ON s.produto_id = p.id
```

**Supabase Data API:**
```typescript
// Opção 1: Usar RPC (função no banco)
const data = await db.rpc(client, 'get_produtos_com_saldos', { tipo: 'revenda' });

// Opção 2: Fazer duas queries e combinar (menos eficiente)
const produtos = await db.select(client, 'produtos', { filters: { tipo: 'revenda' } });
const saldos = await db.select(client, 'saldo_estoque');
// Combinar manualmente...
```

**⚠️ Para JOINs complexos, recomenda-se criar uma função/stored procedure no Supabase.**

### Agregações (SUM, COUNT, etc)

**PostgreSQL:**
```sql
SELECT produto_id, SUM(quantidade) as total 
FROM movimentacoes_estoque 
GROUP BY produto_id
```

**Supabase Data API:**
```typescript
// Usar RPC ou fazer no código
const data = await db.rpc(client, 'get_saldos_por_produto');
```

## 📋 Checklist de Migração

Para cada módulo:

- [ ] Criar `{modulo}.repository.supabase.ts`
- [ ] Migrar todas as funções do repository
- [ ] Atualizar service para passar `env` e detectar modo
- [ ] Atualizar routes para passar `c.env`
- [ ] Testar todas as operações (list, findById, create, update, delete)
- [ ] Verificar queries complexas (JOINs, agregações)
- [ ] Criar RPCs no Supabase se necessário

## 🔍 Queries que Precisam de Atenção

### 1. Views (como `saldo_estoque`)

Views não podem ser consultadas diretamente via Data API. Opções:

**Opção A:** Criar RPC no Supabase:
```sql
CREATE OR REPLACE FUNCTION get_produtos_com_saldos(tipo_produto TEXT DEFAULT NULL)
RETURNS TABLE (
  -- campos do produto + saldo
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.*, COALESCE(s.quantidade, 0) as saldo
  FROM produtos p
  LEFT JOIN saldo_estoque s ON s.produto_id = p.id
  WHERE (tipo_produto IS NULL OR p.tipo = tipo_produto);
END;
$$ LANGUAGE plpgsql;
```

**Opção B:** Fazer duas queries e combinar no código (menos eficiente)

### 2. Transações

Supabase Data API não suporta transações explícitas. Para operações que precisam de transação:

**Opção A:** Criar RPC que faz tudo em uma transação
**Opção B:** Usar PostgreSQL direto para essas operações específicas

### 3. Queries com Subqueries Complexas

Melhor criar RPCs no Supabase.

## 🎯 Próximos Passos

1. ✅ Módulo `clientes` migrado (exemplo)
2. Migrar módulos restantes seguindo o mesmo padrão
3. Criar RPCs no Supabase para queries complexas
4. Testar tudo
5. Remover dependência de `pg` se não for mais necessária

## 📚 Referências

- [Supabase Data API Docs](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase RPC Functions](https://supabase.com/docs/guides/database/functions)
