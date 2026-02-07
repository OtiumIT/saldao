# Site público — Saldão de Móveis Jerusalém

Landing page de vendas: logo, ofertas, botão WhatsApp, categorias com fotos, galeria de produtos, mapa (Google Maps) e footer com redes sociais. Link "Acesso à Gestão" no rodapé para o sistema em `gestao.saldaomoveisjerusalem.com.br`.

## Configuração (no próprio `index.html`)

No início do arquivo há um `<script>` com variáveis para você preencher:

| Variável | Uso |
|----------|-----|
| `WHATSAPP_NUMBER` | Número com DDI, sem + (ex: `5511999999999`) |
| `WHATSAPP_MSG` | Mensagem padrão ao abrir o chat |
| `GOOGLE_MAPS_EMBED_SRC` | URL do iframe do Google Maps (Compartilhar > Incorporar mapa) — cole o `src` do iframe |
| `GOOGLE_MAPS_LINK` | Link para abrir o endereço no Google Maps |
| `INSTAGRAM_URL` | Perfil Instagram da loja |
| `FACEBOOK_URL` | Página Facebook da loja |

## Conteúdo da página

- **Hero:** badge "Ofertas de até 60% OFF", logo, slogan, botão "Ver catálogo no WhatsApp"
- **Nossos móveis:** 3 categorias (Sala, Dormitórios e Colchões, Cozinhas) com foto e link para WhatsApp com mensagem específica
- **Galeria:** 4 fotos de produtos (pasta `images/`) + botão "Quero ver mais no WhatsApp"
- **Onde estamos:** mapa (se `GOOGLE_MAPS_EMBED_SRC` estiver preenchido) + link "Abrir no Google Maps"
- **Footer:** ©, Instagram, Facebook, "Acesso à Gestão"

## Fotos de produtos

As imagens em `images/` (produto-1.jpeg a produto-4.jpeg) vieram da pasta `Novo Sistema/GestaoAtual`. Para trocar, substitua os arquivos ou altere os `src` no HTML.

## Deploy no Cloudflare Pages

O site é estático (sem build). Duas formas de publicar:

### Opção 1: Deploy pela CLI (Wrangler)

1. **Primeira vez:** faça login e crie o projeto no Cloudflare:
   ```bash
   npx wrangler login
   npx wrangler pages project create saldao
   ```
2. **Publicar:** na raiz do repositório:
   ```bash
   npm run deploy:site
   ```
   Ou diretamente: `cd api && npx wrangler pages deploy ../site --project-name=saldao`

O script usa o `wrangler` instalado em `api/`. A URL ficará algo como `https://saldao.pages.dev`.

### Opção 2: Deploy por Git (Cloudflare Dashboard)

1. Em [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Conecte o repositório e configure:
   - **Root directory:** `site`
   - **Framework preset:** None
   - **Build command:** (deixe vazio)
   - **Build output directory:** `.` (ou raiz)
3. Salve. Cada push na branch escolhida gera um deploy automático.

Para outros hosts: use a pasta `site/` como raiz (build: nenhum; diretório de saída: raiz da pasta).

## Estrutura

```
site/
  index.html
  styles.css
  logo.png
  images/
    produto-1.jpeg ... produto-4.jpeg
  README.md
```
