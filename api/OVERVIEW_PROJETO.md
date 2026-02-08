# Overview do Projeto - Conformidade e Performance

**Data:** 2026-02-08  
**Status:** Migração para Supabase Data API concluída

---

## ✅ Conformidade com Regras de Arquitetura

### 1. Estrutura Modular ✅

**Status:** ✅ **CONFORME**

- ✅ Todos os módulos estão organizados em `api/src/modules/{nome}/`
- ✅ Cada módulo contém: `{nome}.routes.ts`, `{nome}.service.ts`, `{nome}.repository.ts`
- ✅ Não há pasta única `api/src/routes/` com rotas soltas
- ✅ Não há pasta única `api/src/repositories/` com repositórios soltos
- ✅ Frontend organizado em `frontend/src/modules/{nome}/` com `pages/`, `components/`, `services/`

**Módulos identificados:**
- auth, avisos-compra, categorias-produto, clientes, compras, cores
- custos-operacionais, estoque (movimentacoes, produtos), financeiro
- fornecedores, funcionarios, producao, roteirizacao, vendas

### 2. Separação de Responsabilidades ✅

**Status:** ✅ **CONFORME**

- ✅ Routes apenas fazem validação e chamam services
- ✅ Services contêm lógica de negócio e chamam repositories
- ✅ Repositories fazem acesso ao banco de dados
- ✅ Dependência: `routes → service → repository → db`

**Exceções encontradas:**
- `estoque/movimentacoes.routes.ts` importa diretamente repositories (mas usa condicionalmente Supabase)
  - **Impacto:** Baixo - é um módulo simples sem service dedicado
  - **Recomendação:** Criar `movimentacoes.service.ts` para manter consistência

### 3. Acesso ao Banco de Dados ✅

**Status:** ✅ **CONFORME**

- ✅ Acesso ao banco **somente** em `*.repository.ts` dentro de `api/src/modules/{nome}/`
- ✅ Frontend **nunca** importa bibliotecas de banco (`pg`, Supabase client)
- ✅ Frontend comunica apenas via HTTP/HTTPS com a API
- ✅ Não há imports cruzados entre `api/**` e `frontend/**`

### 4. Prepared Statements ✅

**Status:** ✅ **CONFORME**

- ✅ Repositories PostgreSQL usam `$1, $2, ...` (prepared statements)
- ✅ Supabase Data API usa helpers que abstraem SQL injection
- ✅ Não há concatenação de strings com input do usuário em SQL

**Exemplo correto:**
```typescript
// produtos.repository.ts
await pool.query('SELECT * FROM produtos WHERE id = $1', [id]);
```

### 5. Imports Entre Módulos ⚠️

**Status:** ⚠️ **ATENÇÃO - Alguns imports entre módulos**

**Imports encontrados:**
- `compras.repository.supabase.ts` → `movimentacoes.repository.supabase.js`
- `producao.repository.supabase.ts` → `movimentacoes.repository.supabase.js`
- `vendas.repository.supabase.ts` → `movimentacoes.repository.supabase.js`
- `funcionarios.service.ts` → `custos-operacionais.service.js` ✅ (correto - service → service)

**Análise:**
- ✅ Imports de repositories entre módulos são aceitáveis quando há dependência de domínio
- ✅ Movimentações de estoque são usadas por compras, produção e vendas (dependência legítima)
- ⚠️ **Recomendação:** Documentar essas dependências em README dos módulos

---

## ⚠️ Problemas de Performance Identificados

### 1. **CRÍTICO: N+1 Query em `produtos.repository.supabase.ts`**

**Localização:** `api/src/modules/estoque/produtos.repository.supabase.ts:104-114`

**Problema:**
```typescript
export async function listComSaldos(env: Env, filtros?: FiltrosProduto): Promise<ProdutoComSaldo[]> {
  const produtos = await list(env, filtros);
  const produtosComSaldo: ProdutoComSaldo[] = [];

  for (const produto of produtos) {
    const saldo = await calcularSaldo(env, produto.id); // ❌ Query por produto!
    produtosComSaldo.push({ ...produto, saldo });
  }

  return produtosComSaldo;
}
```

**Impacto:**
- Se houver 100 produtos, serão feitas **100 queries adicionais** para calcular saldos
- Cada `calcularSaldo` busca todas as movimentações do produto

**Solução:**
```typescript
export async function listComSaldos(env: Env, filtros?: FiltrosProduto): Promise<ProdutoComSaldo[]> {
  const produtos = await list(env, filtros);
  const produtoIds = produtos.map((p) => p.id);
  
  // ✅ Uma única query para todos os produtos
  const movimentacoes = await db.select<{ produto_id: string; quantidade: number }>(
    client,
    'movimentacoes_estoque',
    { filters: { produto_id: produtoIds } }
  );
  
  // Calcular saldos em memória
  const saldosMap = new Map<string, number>();
  for (const mov of movimentacoes) {
    saldosMap.set(mov.produto_id, (saldosMap.get(mov.produto_id) || 0) + mov.quantidade);
  }
  
  return produtos.map((p) => ({
    ...p,
    saldo: saldosMap.get(p.id) || 0,
  }));
}
```

**Prioridade:** 🔴 **ALTA** - Impacta performance significativamente

---

### 2. **MÉDIO: Múltiplas Queries Quando Poderia Ser Uma (JOIN)**

**Localização:** Vários repositories Supabase

**Exemplos:**

#### `compras.repository.supabase.ts:18-35`
```typescript
// Query 1: Pedidos
const pedidos = await db.select<PedidoCompra>(client, 'pedidos_compra', {...});

// Query 2: Fornecedores
const fornecedores = await db.select<{ id: string; nome: string }>(client, 'fornecedores', {...});
```

**Solução:** Usar JOIN via Supabase Data API:
```typescript
const pedidos = await db.select(client, 'pedidos_compra', {
  select: '*, fornecedores(nome)',
  ...
});
```

#### `produtos.repository.supabase.ts:55-101`
- Query 1: Produtos
- Query 2: Produtos_fornecedores (se filtro por fornecedor)
- Query 3: Produtos_fornecedores (para buscar todos os fornecedores)

**Solução:** Usar JOIN ou RPC no Supabase

**Prioridade:** 🟡 **MÉDIA** - Pode ser otimizado com RPCs

---

### 3. **BAIXO: Queries Complexas Sem RPC**

**Localização:** Módulos com queries complexas

**Módulos afetados:**
- `avisos-compra` - CTE com JOINs e agregações
- `financeiro` - Agregações múltiplas
- `funcionarios` - JOINs e agregações para folha de pagamento
- `produtos` - Cálculo de saldos por cor

**Status Atual:**
- ✅ Implementação funcional com múltiplas queries
- ⚠️ Performance pode ser melhorada com RPCs no Supabase

**Recomendação:**
- Criar funções PostgreSQL (RPCs) no Supabase para queries complexas
- Exemplo: `get_produtos_com_saldos(tipo text)`, `get_avisos_compra_abaixo_minimo()`

**Prioridade:** 🟢 **BAIXA** - Funciona, mas pode ser otimizado

---

### 4. **INFORMAÇÃO: Falta de Índices**

**Status:** Não verificado (precisa análise do schema)

**Recomendações:**
- Verificar índices em colunas usadas em `WHERE`, `JOIN`, `ORDER BY`
- Exemplos:
  - `produtos.tipo`, `produtos.categoria_id`
  - `movimentacoes_estoque.produto_id`, `movimentacoes_estoque.data`
  - `pedidos_venda.status`, `pedidos_venda.data_pedido`
  - `entregas.veiculo_id`, `entregas.data_entrega_prevista`

---

## 📊 Resumo de Conformidade

| Aspecto | Status | Observações |
|---------|--------|-------------|
| Estrutura Modular | ✅ | 100% conforme |
| Separação de Responsabilidades | ✅ | Routes → Service → Repository |
| Acesso ao Banco | ✅ | Apenas em repositories |
| Prepared Statements | ✅ | Sem SQL injection |
| Imports Entre Módulos | ⚠️ | Alguns imports legítimos documentados |
| Performance - N+1 Queries | ✅ | **CORRIGIDO:** `listComSaldos` otimizado |
| Performance - JOINs | 🟡 | Pode ser otimizado com RPCs |
| Performance - Índices | ⚪ | Não verificado |

---

## 🎯 Plano de Ação Recomendado

### Prioridade ALTA 🔴

1. ✅ **Corrigir N+1 Query em `produtos.repository.supabase.ts`** - **CONCLUÍDO**
   - Arquivo: `api/src/modules/estoque/produtos.repository.supabase.ts`
   - Função: `listComSaldos`
   - **Status:** Corrigido - Agora faz uma única query para todos os produtos

### Prioridade MÉDIA 🟡

2. **Otimizar queries com JOINs usando Supabase Data API**
   - Módulos: `compras`, `produtos`, `roteirizacao`, `vendas`
   - Usar `select: '*, tabela_relacionada(*)'` ou criar RPCs
   - Estimativa: 2-4 horas

3. **Criar RPCs para queries complexas**
   - `avisos-compra`: `get_avisos_compra_abaixo_minimo()`
   - `financeiro`: `get_resumo_financeiro(data_inicio, data_fim)`
   - `produtos`: `get_produtos_com_saldos(tipo, categoria_id)`
   - Estimativa: 4-6 horas

### Prioridade BAIXA 🟢

4. **Criar `movimentacoes.service.ts`**
   - Para manter consistência arquitetural
   - Estimativa: 30 minutos

5. **Documentar dependências entre módulos**
   - Adicionar README.md nos módulos que importam outros
   - Estimativa: 1 hora

6. **Verificar e criar índices no banco**
   - Analisar queries mais usadas
   - Criar índices conforme necessário
   - Estimativa: 2 horas

---

## 📝 Notas Finais

### Pontos Positivos ✅

1. **Arquitetura sólida:** Estrutura modular bem definida e seguida consistentemente
2. **Separação de responsabilidades:** Routes, services e repositories bem separados
3. **Segurança:** Prepared statements e validação adequadas
4. **Migração bem executada:** Supabase Data API implementada mantendo compatibilidade

### Áreas de Melhoria ⚠️

1. **Performance:** N+1 queries precisam ser corrigidas
2. **Otimização:** Queries complexas podem usar RPCs do Supabase
3. **Documentação:** Dependências entre módulos podem ser melhor documentadas

### Conclusão

O projeto está **bem estruturado** e **conforme** com as regras de arquitetura estabelecidas. A principal área de atenção é **performance**, especialmente o problema de N+1 queries em `listComSaldos`. Com as correções recomendadas, o projeto estará otimizado e pronto para produção.

---

**Próximos Passos:**
1. ✅ Corrigir N+1 query em `produtos.repository.supabase.ts` - **CONCLUÍDO**
2. Testar performance após correção
3. Planejar criação de RPCs para otimização adicional
