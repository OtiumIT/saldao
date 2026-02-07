# Publicação do sistema de gestão (Cloudflare)

Frontend na **Cloudflare Pages** e API na **Cloudflare Workers**, com PostgreSQL via **Hyperdrive**.

## Visão geral

| Parte    | Onde              | Projeto / Nome   |
|----------|-------------------|------------------|
| Frontend | Cloudflare Pages  | `gestao`         |
| API      | Cloudflare Workers| `gestao-api`     |
| Banco    | Supabase (ou outro Postgres) | Acesso via Hyperdrive no Worker |

## 1. Frontend (Cloudflare Pages)

### Opção A: Deploy pelo Dashboard

1. Acesse [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Conecte o repositório e configure:
   - **Project name:** `gestao`
   - **Build command:** `cd frontend && npm install && npm run build`
   - **Build output directory:** `frontend/dist`
   - **Root directory:** (deixe em branco ou `/`)
3. Em **Settings** → **Environment variables** (Production):
   - `VITE_API_URL` = URL da API (ex.: `https://gestao-api.<seu-subdominio>.workers.dev`)
4. Faça o deploy. A URL ficará algo como `https://gestao.pages.dev`.

### Opção B: Deploy via Wrangler (CI ou local)

```bash
cd frontend
npm install
npm run build
npx wrangler pages deploy dist --project-name=gestao
```

Defina `VITE_API_URL` no ambiente de build (ou no Dashboard do Pages) para a URL da API em produção.

### SPA (roteamento)

O arquivo `frontend/_redirects` já está configurado para enviar todas as rotas para `index.html` (200).

---

## 2. API (Cloudflare Workers)

A API usa **PostgreSQL** via **Hyperdrive** no Worker. O driver `pg` é usado com a connection string fornecida pelo binding do Hyperdrive.

### 2.1. Criar configuração do Hyperdrive

No diretório `api/`:

```bash
cd api
npx wrangler hyperdrive create gestao-db --connection-string="postgresql://USER:PASSWORD@HOST:6543/postgres"
```

Use a connection string do **pooler** do Supabase (porta 6543), por exemplo:

- Supabase: `postgresql://postgres.[PROJECT-REF]:[SENHA]@aws-0-[REGIAO].pooler.supabase.com:6543/postgres`

O comando retorna um **ID** da configuração. Guarde esse ID.

### 2.2. Configurar `api/wrangler.toml`

1. Descomente e preencha o bloco do Hyperdrive com o ID obtido:

```toml
[[hyperdrive]]
binding = "HYPERDRIVE"
id = "<HYPERDRIVE_CONFIG_ID>"
```

2. (Opcional) Variáveis no Dashboard ou em `[vars]`:
   - `CORS_ORIGIN`: origem do frontend (ex.: `https://gestao.pages.dev`)
   - `FRONTEND_URL`: mesma URL do frontend
   - Demais variáveis conforme `api/.env.example` e `api/ENV.md`

3. Secrets (nunca no código):

```bash
cd api
npx wrangler secret put JWT_SECRET
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY   # se não usar FIXED_AUTH
# etc.
```

Para desenvolvimento local com Worker:

```bash
# api/.dev.vars (não commitar)
HYPERDRIVE_CONNECTION_STRING=postgresql://...
JWT_SECRET=...
CORS_ORIGIN=http://localhost:4055
```

O Hyperdrive em local não existe; use `wrangler dev` com `.dev.vars` e, se necessário, um tunnel para o DB ou rode a API em Node (`npm run dev`) para dev.

### 2.3. Deploy do Worker

```bash
cd api
npm install
npx wrangler deploy
```

A API ficará em `https://gestao-api.<seu-subdominio>.workers.dev`. Use essa URL em `VITE_API_URL` no frontend.

### 2.4. Domínio customizado (opcional)

Em `api/wrangler.toml`, descomente e ajuste:

```toml
[env.production]
routes = [
  { pattern = "api.seudominio.com/*", zone_name = "seudominio.com" }
]
```

Depois faça o deploy com:

```bash
npx wrangler deploy --env production
```

---

## 3. Resumo de variáveis

### Frontend (Pages) – build time

| Variável       | Uso                    |
|----------------|------------------------|
| `VITE_API_URL` | URL base da API (HTTPS)|

### API (Workers)

- **Hyperdrive:** binding `HYPERDRIVE` (connection string do Postgres).
- **Secrets:** `JWT_SECRET`, `SUPABASE_SERVICE_ROLE_KEY` (se usar Supabase auth), etc.
- **Vars (ou secrets):** `CORS_ORIGIN`, `FRONTEND_URL`, `FIXED_AUTH`, `FIXED_AUTH_EMAIL`, `FIXED_AUTH_PASSWORD`, e demais conforme `api/ENV.md`.

---

## 4. Desenvolvimento local

- **Frontend:** `cd frontend && npm run dev` (ex.: `http://localhost:4055`).
- **API (Node):** `cd api && npm run dev` (ex.: `http://localhost:3055`).
- No frontend, use `VITE_API_URL=http://localhost:3055` para apontar para a API local.

Para testar o Worker localmente (com Hyperdrive ou conexão local), use `cd api && npm run dev:worker` (wrangler dev). O banco precisa estar acessível (tunnel ou Supabase em nuvem).

---

## 5. Checklist antes do deploy

- [ ] Hyperdrive criado e ID em `api/wrangler.toml`
- [ ] Secrets da API configurados no Dashboard ou via `wrangler secret put`
- [ ] `CORS_ORIGIN` e `FRONTEND_URL` apontando para a URL do frontend
- [ ] No Pages, `VITE_API_URL` apontando para a URL do Worker (ou domínio customizado da API)
- [ ] Migrações do banco aplicadas no Postgres usado pelo Hyperdrive
