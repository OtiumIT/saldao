#!/bin/bash
# Script para testar extração de recibo

IMAGE_PATH="$1"
TOKEN="$2"
API_URL="${API_URL:-https://api.partnerfinancecontrol.com}"

if [ -z "$IMAGE_PATH" ]; then
  echo "❌ Uso: ./scripts/test-extract-receipt.sh <caminho-da-imagem> [token]"
  exit 1
fi

# Converter imagem para base64
echo "📸 Convertendo imagem para base64..."
BASE64=$(base64 -i "$IMAGE_PATH" | tr -d '\n')

# Fazer requisição
echo "📤 Enviando requisição..."
if [ -z "$TOKEN" ]; then
  curl -X POST "$API_URL/api/financial-exits/extract-receipt" \
    -H "Content-Type: application/json" \
    -d "{\"imageBase64\":\"$BASE64\"}" \
    -w "\n📊 Status: %{http_code}\n" \
    -s | jq .
else
  curl -X POST "$API_URL/api/financial-exits/extract-receipt" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{\"imageBase64\":\"$BASE64\"}" \
    -w "\n📊 Status: %{http_code}\n" \
    -s | jq .
fi
