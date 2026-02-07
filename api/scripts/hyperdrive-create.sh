#!/usr/bin/env bash
# Cria a config Hyperdrive no Cloudflare usando DATABASE_URL do .env.
# Requer: wrangler login (ou CLOUDFLARE_API_TOKEN).
# Depois: colar o id em wrangler.toml em [[hyperdrive]] e descomentar.

set -e
cd "$(dirname "$0")/.."

if [[ ! -f .env ]]; then
  echo "Arquivo .env não encontrado em $(pwd)"
  exit 1
fi

# DATABASE_URL pode ter = na senha; pega tudo após o primeiro =
DATABASE_URL=$(grep -E '^DATABASE_URL=' .env | cut -d= -f2- | tr -d '"' | tr -d "'")
if [[ -z "$DATABASE_URL" ]]; then
  echo "DATABASE_URL não definido em .env"
  exit 1
fi

echo "Criando Hyperdrive 'gestao-db'..."
npx wrangler hyperdrive create gestao-db --connection-string="$DATABASE_URL"
echo ""
echo "Copie o 'id' exibido acima e cole em wrangler.toml:"
echo "  [[hyperdrive]]"
echo "  binding = \"HYPERDRIVE\""
echo "  id = \"<id>\""
echo ""
echo "Depois rode: npm run deploy"
