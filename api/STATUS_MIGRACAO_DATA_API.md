# Status da Migração para Supabase Data API

## ✅ O que foi implementado

### 1. Infraestrutura Base
- ✅ **`src/db/supabase-client.ts`** - Cliente Supabase configurado com service role key
- ✅ **`src/db/supabase-query.ts`** - Helpers para queries (select, insert, update, delete, rpc)
- ✅ **`src/db/data-api.ts`** - Abstração principal exportada
- ✅ **`src/config/db-mode.ts`** - Detecta automaticamente qual modo usar

### 2. Módulo de Exemplo Migrado
- ✅ **`src/modules/clientes/clientes.repository.supabase.ts`** - Versão usando Data API
- ✅ **`src/modules/clientes/clientes.service.ts`** - Atualizado para detectar modo automaticamente
- ✅ **`src/modules/clientes/clientes.routes.ts`** - Atualizado para passar `c.env`

### 3. Configuração
- ✅ **`src/types/worker-env.ts`** - Adicionado `USE_SUPABASE_DATA_API`
- ✅ **`.env.example`** - Atualizado com instruções de Supabase Data API

## 🎯 Como Funciona

### Detecção Automática

O sistema detecta automaticamente qual modo usar:

1. **Se `USE_SUPABASE_DATA_API=true`** → Usa Supabase Data API
2. **Se `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` estão configurados** → Usa Supabase Data API (padrão)
3. **Caso contrário** → Usa PostgreSQL direto (pg)

### Service Role Key (Sem Policies)

A **service role key** bypassa todas as Row Level Security (RLS) policies:
- ✅ Acesso total a todas as tabelas
- ✅ Não precisa configurar policies no Supabase
- ✅ Controle de acesso feito na sua API

## 📋 Próximos Passos

### 1. Configurar Variáveis de Ambiente

No Cloudflare Workers ou `.env`:

```bash
SUPABASE_URL=https://eoieosbjgwskiobsuplz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui
USE_SUPABASE_DATA_API=true  # Opcional, padrão é true se Supabase configurado
```

**⚠️ IMPORTANTE:** Use a **SERVICE ROLE KEY** (não anon key)!

### 2. Migrar Módulos Restantes

Para cada módulo, seguir o padrão do `clientes`:

1. Criar `{modulo}.repository.supabase.ts`
2. Migrar funções do repository original
3. Atualizar service para passar `env` e detectar modo
4. Atualizar routes para passar `c.env`

### 3. Queries Complexas (JOINs, Views)

Para queries que usam JOINs ou views (como `saldo_estoque`), criar **RPCs no Supabase**:

```sql
-- Exemplo: get_produtos_com_saldos
CREATE OR REPLACE FUNCTION get_produtos_com_saldos(tipo_produto TEXT DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  codigo TEXT,
  descricao TEXT,
  -- ... outros campos do produto
  saldo NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.*, COALESCE(s.quantidade, 0)::numeric as saldo
  FROM produtos p
  LEFT JOIN saldo_estoque s ON s.produto_id = p.id
  WHERE (tipo_produto IS NULL OR p.tipo = tipo_produto)
  ORDER BY p.codigo;
END;
$$ LANGUAGE plpgsql;
```

Depois usar no código:
```typescript
const produtos = await db.rpc(client, 'get_produtos_com_saldos', { tipo_produto: 'revenda' });
```

## 📝 Módulos para Migrar

- [ ] ✅ clientes (já migrado - exemplo)
- [ ] fornecedores
- [ ] produtos (precisa RPC para `listComSaldos`)
- [ ] movimentacoes_estoque
- [ ] compras
- [ ] avisos-compra
- [ ] producao
- [ ] vendas
- [ ] financeiro
- [ ] roteirizacao
- [ ] custos-operacionais
- [ ] categorias-produto
- [ ] funcionarios
- [ ] cores

## 🔍 Testando

Para testar a migração:

1. Configure `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`
2. Teste o módulo `clientes` (já migrado)
3. Verifique se funciona em Workers e Node.js

## 📚 Documentação

Veja `MIGRACAO_SUPABASE_DATA_API.md` para guia completo de migração.
