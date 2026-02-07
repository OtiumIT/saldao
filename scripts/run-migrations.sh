#!/usr/bin/env bash
# Aplica as migrations SQL em ordem no banco definido por DATABASE_URL.
# Uso: DATABASE_URL="postgresql://..." ./scripts/run-migrations.sh
# Ou: export DATABASE_URL="..."; ./scripts/run-migrations.sh
#
# Supabase: use a URL do pooler (porta 6543). O script ativa SSL automaticamente.

set -e

if [ -z "$DATABASE_URL" ]; then
  echo "Erro: defina DATABASE_URL (ex.: export DATABASE_URL=\"postgresql://user:pass@host:5432/db\")"
  exit 1
fi

# Supabase exige SSL; psql usa PGSSLMODE
if [[ "$DATABASE_URL" == *"supabase.co"* ]]; then
  export PGSSLMODE=require
  echo "Supabase detectado: SSL ativado (PGSSLMODE=require)"
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MIGRATIONS_DIR="$REPO_ROOT/supabase/migrations"

if [ ! -d "$MIGRATIONS_DIR" ]; then
  echo "Erro: pasta não encontrada: $MIGRATIONS_DIR"
  exit 1
fi

echo "Aplicando migrations em $MIGRATIONS_DIR (DATABASE_URL definida)"
echo "---"

while IFS= read -r f; do
  echo "Running $(basename "$f")"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$f" || exit 1
done < <(find "$MIGRATIONS_DIR" -maxdepth 1 -name '*.sql' | sort)

echo "---"
echo "Migrations concluídas."
