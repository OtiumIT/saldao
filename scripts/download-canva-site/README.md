# Download do site atual (Canva)

Script que baixa **todo o conteúdo** do site atual do Saldão de Móveis Jerusalém (Canva):

- **HTML** da página (`index.html`)
- **Todas as imagens** encontradas (tags `img`, `background-image`, requisições de rede)
- **manifest.json** com a lista de URLs → arquivos baixados

## Uso

```bash
cd scripts/download-canva-site
npm install
npm run download
```

Saída em: **`site/downloaded/`**

- `index.html` — HTML completo da página
- `image-01.jpg`, `image-02.png`, … — imagens numeradas
- `manifest.json` — mapeamento URL → nome do arquivo

## Requisitos

- Node.js 18+
- Na primeira vez, `npm install` pode demorar alguns minutos (download do Chromium pelo Puppeteer)

## URL do site

Configurada no script: `https://paramim.my.canva.site/sald-o-de-m-veis`

Para alterar, edite a constante `SITE_URL` em `download-canva-site.js`.
