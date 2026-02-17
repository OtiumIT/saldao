-- CPF em clientes: busca na venda por CPF; se não achar, cadastra.
-- Armazenamos só dígitos (11) para busca e unicidade.
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS cpf TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_clientes_cpf ON clientes (cpf) WHERE cpf IS NOT NULL AND cpf != '';
