-- Saldão de Móveis Jerusalém – Clientes: tipo (externo | loja) para Loja como cliente da Fábrica
-- Ver LOJA_COMO_CLIENTE_FABRICA.md

ALTER TABLE clientes
  ADD COLUMN IF NOT EXISTS tipo TEXT NOT NULL DEFAULT 'externo'
  CHECK (tipo IN ('externo', 'loja'));

CREATE INDEX IF NOT EXISTS idx_clientes_tipo ON clientes (tipo);

COMMENT ON COLUMN clientes.tipo IS 'externo = consumidor final; loja = unidade própria (máx. um cliente tipo loja)';
