# Aplicar migrations no Supabase

Quando usar **Supabase Data API** (`USE_SUPABASE_DATA_API=true`), o schema do banco no Supabase precisa estar igual às migrations.

Se aparecer erro como: *Could not find the 'cnpj' column of 'clientes' in the schema cache*:

1. Abra o [Supabase Dashboard](https://supabase.com/dashboard) do projeto.
2. Vá em **SQL Editor**.
3. Rode as migrations na ordem (ou o script consolidado abaixo).

## Script consolidado (clientes: cpf + cnpj)

```sql
-- 022: CPF em clientes
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS cpf TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_clientes_cpf ON clientes (cpf) WHERE cpf IS NOT NULL AND cpf != '';

-- 023: CNPJ em clientes
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS cnpj TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_clientes_cnpj ON clientes (cnpj) WHERE cnpj IS NOT NULL AND cnpj != '';
```

Depois de rodar, o schema cache do Supabase passa a reconhecer as colunas (pode levar alguns segundos).
