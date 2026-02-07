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

## Deploy

Arquivos estáticos. Publicar a pasta `site/` em Cloudflare Pages ou qualquer host (build: nenhum; diretório de saída: raiz da pasta).

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
