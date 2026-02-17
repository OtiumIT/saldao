-- CNPJ em clientes: busca por CPF, CNPJ ou WhatsApp (fone).
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS cnpj TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_clientes_cnpj ON clientes (cnpj) WHERE cnpj IS NOT NULL AND cnpj != '';
