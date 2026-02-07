# Banco de dados – Saldão de Móveis Jerusalém

O sistema usará **PostgreSQL direto** (local ou remoto), conforme regras do projeto.

## Migrations

- **001_clientes_fornecedores.sql** — Cria tabelas `clientes` e `fornecedores` (Fase 0 do plano).
- Novas migrations serão criadas conforme **Novo Sistema/PLANO_SISTEMA.md**.

### Como executar (PostgreSQL local)

```bash
# Criar o banco (se ainda não existir)
createdb saldao_jerusalem

# Executar a migration
psql -d saldao_jerusalem -f supabase/migrations/001_clientes_fornecedores.sql
```

Na API, configure no `.env`:

```
DATABASE_URL=postgresql://usuario:senha@localhost:5432/saldao_jerusalem
```

## Referência

- **Necessidades:** `Novo Sistema/NECESSIDADES_SISTEMA.md`
- **Plano e desenho do banco:** `Novo Sistema/PLANO_SISTEMA.md`
