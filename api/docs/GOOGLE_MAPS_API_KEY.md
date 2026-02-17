# Chave do Google Maps (cálculo de distância no Caixa)

Para o botão **"Calcular km"** no Caixa (vendas com entrega) funcionar, é preciso configurar a **Distance Matrix API** do Google e uma **API Key**.

## Onde gerar a API Key

1. Acesse: **https://console.cloud.google.com/**
2. Crie um projeto ou selecione um existente.
3. No menu lateral: **APIs & Services** → **Library** (Biblioteca).
4. Pesquise por **"Distance Matrix API"** e clique em **Enable** (Ativar).
5. Depois: **APIs & Services** → **Credentials** (Credenciais).
6. Clique em **+ Create Credentials** → **API Key**.
7. Copie a chave gerada.

## Onde configurar

- **Local (Node):** no arquivo `api/.env`:
  ```env
  GOOGLE_MAPS_API_KEY=sua-chave-aqui
  ENDERECO_ORIGEM_LOJA="Av. da Barreira Grande, 2504, Vila Bancária, São Paulo, SP"
  ```
- **Produção (Cloudflare Workers):** o endereço da loja já está em `wrangler.toml`. Para a chave (nunca no código):
  ```bash
  cd api && npx wrangler secret put GOOGLE_MAPS_API_KEY
  ```
  Cole a chave quando solicitado.

## Endereço da loja

Conforme o site **saldaomoveisjerusalem.com.br**:
**Av. da Barreira Grande, 2504, Vila Bancária, São Paulo, SP**

Já está definido em `wrangler.toml` para produção. Para rodar local com cálculo de distância, use o mesmo valor em `ENDERECO_ORIGEM_LOJA` no `.env`.
