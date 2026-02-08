#!/usr/bin/env bash
# Compara contagem de linhas por tabela entre local e Supabase.
# Uso: carrega api/.env e chama psql em LOCAL_DATABASE_URL e SUPABASE_DATABASE_URL.
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
[ -f "$REPO_ROOT/api/.env" ] && set -a && source "$REPO_ROOT/api/.env" && set +a

LOCAL_URL="${LOCAL_DATABASE_URL:-$DATABASE_URL}"
SUPABASE_URL="${SUPABASE_DATABASE_URL:-$SUPABASE_DB_URL}"
TABLES="fornecedores clientes produtos movimentacoes_estoque pedidos_compra itens_pedido_compra bom ordens_producao pedidos_venda itens_pedido_venda contas_a_pagar contas_a_receber veiculos entregas categorias_custo_operacional custos_operacionais categorias_produto produtos_fornecedores funcionarios pagamentos_funcionarios cores ordens_producao_itens"

echo "Tabela,Local,Supabase,Diferença"
for t in $TABLES; do
  local_count=$(PGSSLMODE=prefer psql "$LOCAL_URL" -t -A -c "SELECT COUNT(*) FROM $t" 2>/dev/null || echo "")
  supabase_count=$(PGSSLMODE=require psql "$SUPABASE_URL" -t -A -c "SELECT COUNT(*) FROM public.\"$t\"" 2>/dev/null || echo "")
  if [ -z "$local_count" ]; then local_count="-"; fi
  if [ -z "$supabase_count" ]; then supabase_count="-"; fi
  if [ "$local_count" != "-" ] && [ "$supabase_count" != "-" ] && [ -n "$local_count" ] && [ -n "$supabase_count" ]; then
    diff=$((local_count - supabase_count))
    echo "$t,$local_count,$supabase_count,$diff"
  else
    echo "$t,$local_count,$supabase_count,-"
  fi
done
