#!/usr/bin/env bash
# Migra dados do PostgreSQL local para o Supabase.
# Uso:
#   1. Garanta que o schema já está aplicado no Supabase (run-migrations.sh).
#   2. Defina as variáveis e execute:
#      export LOCAL_DATABASE_URL="postgresql://localhost:5432/saldao_jerusalem"
#      export SUPABASE_DATABASE_URL="postgresql://postgres.[PROJECT]:[SENHA]@aws-0-us-west-2.pooler.supabase.com:6543/postgres"
#      ./scripts/migrate-data-local-to-supabase.sh
#
# Variáveis são lidas do api/.env (DATABASE_URL = local, SUPABASE_DATABASE_URL = destino).

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
API_ENV="$REPO_ROOT/api/.env"
DUMP_FILE="${REPO_ROOT}/tmp/saldao_data_$(date +%Y%m%d_%H%M%S).sql"

# Carregar api/.env
if [ -f "$API_ENV" ]; then
  echo "Carregando variáveis de api/.env"
  set -a
  source "$API_ENV"
  set +a
else
  echo "Aviso: api/.env não encontrado. Use export LOCAL_DATABASE_URL e SUPABASE_DATABASE_URL"
fi

# Origem: banco local
LOCAL_URL="${LOCAL_DATABASE_URL:-$DATABASE_URL}"
if [ -z "$LOCAL_URL" ]; then
  echo "Erro: defina LOCAL_DATABASE_URL ou DATABASE_URL (banco local)."
  echo "Ex.: export LOCAL_DATABASE_URL=\"postgresql://localhost:5432/saldao_jerusalem\""
  exit 1
fi

# Destino: Supabase
SUPABASE_URL="${SUPABASE_DATABASE_URL:-$SUPABASE_DB_URL}"
if [ -z "$SUPABASE_URL" ]; then
  echo "Erro: defina SUPABASE_DATABASE_URL (connection string do Supabase)."
  echo "Ex.: export SUPABASE_DATABASE_URL=\"postgresql://postgres.XXX:SENHA@aws-0-us-west-2.pooler.supabase.com:6543/postgres\""
  exit 1
fi

mkdir -p "$(dirname "$DUMP_FILE")"

echo "---"
echo "1. Exportando dados do banco local..."
echo "   URL: ${LOCAL_URL%%@*}@***"
pg_dump "$LOCAL_URL" \
  --data-only \
  --column-inserts \
  --no-owner \
  --no-privileges \
  -f "$DUMP_FILE" || {
  echo "Dica: se falhar, tente com usuário explícito: pg_dump -U postgres -d saldao_jerusalem ..."
  exit 1
}

LINES=$(wc -l < "$DUMP_FILE")
echo "   Exportado: $LINES linhas em $DUMP_FILE"

if [ -n "${TRUNCATE_BEFORE_IMPORT:-}" ]; then
  echo "---"
  echo "1.5. Limpando tabelas no Supabase (TRUNCATE_BEFORE_IMPORT)..."
  export PGSSLMODE=require
  psql "$SUPABASE_URL" -v ON_ERROR_STOP=1 -f "$SCRIPT_DIR/truncate-saldao-tables.sql" || exit 1
fi

echo "---"
echo "2. Importando no Supabase..."
echo "   URL: ${SUPABASE_URL%%@*}@***"
export PGSSLMODE=require
psql "$SUPABASE_URL" -v ON_ERROR_STOP=1 \
  -c "SET session_replication_role = replica;" \
  -f "$DUMP_FILE" \
  -c "SET session_replication_role = DEFAULT;"

echo "---"
echo "Migração concluída. Dados importados no Supabase."
echo "Arquivo de dump mantido em: $DUMP_FILE"
echo "Para remover: rm $DUMP_FILE"
