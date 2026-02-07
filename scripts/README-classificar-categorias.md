# Classificar categorias de produtos

Script que associa cada produto a uma categoria (Cozinha, Quarto, Lavanderia, Sala, etc.) usando:

- **Palavras-chave** (sempre disponível): regras por termo na descrição.
- **LLM (OpenAI)** (opcional): melhor precisão; defina `OPENAI_API_KEY`.

## Uso

Da **raiz do projeto** (com `dotenv` instalado, ou rodando de dentro de `api/`):

```bash
# Com login (email/senha)
API_URL=http://localhost:3055 TEST_EMAIL=seu@email.com TEST_PASSWORD=suasenha npx tsx scripts/classificar-categorias-produtos.ts

# Com token fixo
API_URL=http://localhost:3055 API_TOKEN=seu_jwt_aqui npx tsx scripts/classificar-categorias-produtos.ts

# Com LLM (recomendado)
OPENAI_API_KEY=sk-... API_URL=http://localhost:3055 TEST_EMAIL=... TEST_PASSWORD=... npx tsx scripts/classificar-categorias-produtos.ts
```

### Opções

- **DRY_RUN=1** — só mostra o que seria alterado, não envia PATCH.
- **API_URL** — base da API (default: `http://localhost:3055`).
- **OPENAI_API_KEY** — se definida, usa GPT para classificar; senão usa apenas palavras-chave.

## Rodando a partir de `api/`

Se na raiz não tiver `dotenv`, use:

```bash
cd api && npx tsx ../scripts/classificar-categorias-produtos.ts
```

E defina as variáveis no `api/.env` ou na linha de comando.
