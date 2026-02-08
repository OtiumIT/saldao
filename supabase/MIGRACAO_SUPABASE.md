# Migração do banco local para Supabase

Este guia leva o PostgreSQL local para o Supabase para que a API e o frontend possam rodar em produção usando o mesmo banco.

## Pré-requisitos

- Conta no [Supabase](https://supabase.com)
- PostgreSQL local com o banco `saldao_jerusalem` (ou o nome que você usa) já populado
- `psql` e `pg_dump` no PATH (vêm com o Postgres)

---

## 1. Criar o projeto no Supabase

1. Acesse [app.supabase.com](https://app.supabase.com) e crie um novo projeto.
2. Anote:
   - **Senha do banco** (definida na criação)
   - **Connection string** em **Project Settings → Database**:
     - **URI** (para uso direto na API)
     - Use a opção **Connection pooling** (porta **6543**) para serverless/API:
       - Formato: `postgresql://postgres.[PROJECT-REF]:[SENHA]@aws-0-[REGIAO].pooler.supabase.com:6543/postgres`
     - Ou a conexão direta (porta **5432**) se preferir.

---

## 2. Aplicar o schema (migrations) no Supabase

O schema é aplicado executando as migrations em ordem na base do Supabase.

### Opção A: Script (recomendado)

Na raiz do repositório, com a variável `DATABASE_URL` apontando para o **Supabase**:

```bash
# Substitua pela connection string do Supabase (Settings → Database → Connection string → URI, modo pooler)
export DATABASE_URL="postgresql://postgres.XXXXX:SuaSenha@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

./scripts/run-migrations.sh
```

### Opção B: Manual com psql

```bash
# Uma vez com a connection string do Supabase
export SUPABASE_URL="postgresql://postgres.XXXXX:SuaSenha@...pooler.supabase.com:6543/postgres"

# Rodar cada migration em ordem (ordem alfabética pelo nome do arquivo)
for f in supabase/migrations/*.sql; do
  echo "Running $f"
  psql "$SUPABASE_URL" -f "$f"
done
```

Isso cria todas as tabelas, índices e views no Supabase (sem dados).

---

## 3. Exportar e importar dados (script único)

Use o script que exporta do banco local e importa no Supabase:

```bash
# Na raiz do repositório. O script usa .env se existir (DATABASE_URL = local).
export LOCAL_DATABASE_URL="postgresql://localhost:5432/saldao_jerusalem"
export SUPABASE_DATABASE_URL="postgresql://postgres.[PROJECT]:[SENHA]@aws-0-[REGIAO].pooler.supabase.com:6543/postgres"

./scripts/migrate-data-local-to-supabase.sh
```

O script faz:
1. `pg_dump` do banco local com `--data-only --column-inserts`
2. Import no Supabase com `session_replication_role = replica` (evita conflito de FKs)

O dump fica em `tmp/saldao_data_*.sql` para eventual nova importação ou conferência.

---

## 4. (Alternativa) Exportar e importar manualmente

Se preferir fazer à mão:

```bash
# Exportar
pg_dump -d saldao_jerusalem -U "$USER" --data-only --column-inserts --no-owner --no-privileges -f /tmp/saldao_data.sql

# Importar (SUPABASE_DATABASE_URL = connection string do Supabase)
export PGSSLMODE=require
psql "$SUPABASE_DATABASE_URL" -v ON_ERROR_STOP=1 \
  -c "SET session_replication_role = replica;" \
  -f /tmp/saldao_data.sql \
  -c "SET session_replication_role = DEFAULT;"
```

Se alguma tabela tiver conflito de ID (por exemplo, sequências), edite o `.sql` e ajuste os `INSERT` ou as sequências depois. Em seguida, corrija as sequences:

```sql
-- No Supabase (SQL Editor ou psql), para tabelas com serial/id gerado:
-- Exemplo para uma tabela com id serial (ajuste o nome da tabela e da sequence):
SELECT setval(pg_get_serial_sequence('nome_da_tabela', 'id'), COALESCE((SELECT MAX(id) FROM nome_da_tabela), 1));
```

---

## 5. Configurar a API para usar o Supabase

No ambiente de produção (e no `.env` local se quiser apontar para o Supabase):

```env
# Connection string do Supabase (Database → Connection string → URI, pooler 6543)
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[SENHA]@aws-0-[REGIAO].pooler.supabase.com:6543/postgres
```

- Não commite a `DATABASE_URL` com senha. Use variáveis de ambiente do servidor (Cloudflare Workers, Vercel, etc.) ou um `.env` fora do repositório.
- O restante do `.env` (JWT, CORS, etc.) segue igual; só a `DATABASE_URL` passa a apontar para o Supabase.

---

## 6. Conferir a migração

- No Supabase: **Table Editor** (ou SQL Editor) para ver tabelas e contagem de linhas.
- Subir a API com `DATABASE_URL` do Supabase e testar os fluxos (login, estoque, vendas, etc.).

---

## Resumo rápido

| Passo | Ação |
|-------|------|
| 1 | Criar projeto no Supabase e copiar connection string (pooler 6543) |
| 2 | `export DATABASE_URL="..."; ./scripts/run-migrations.sh` (aplicar schema no Supabase) |
| 3 | `export LOCAL_DATABASE_URL="..."; export SUPABASE_DATABASE_URL="..."; ./scripts/migrate-data-local-to-supabase.sh` |
| 4 | Definir `DATABASE_URL` (ou Supabase Data API) no ambiente da API |

Depois disso, frontend e API podem ser publicados (Cloudflare Pages + Workers ou outro host) usando esse mesmo banco no Supabase.
