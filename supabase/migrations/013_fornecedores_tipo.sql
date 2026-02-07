-- Tipo do fornecedor: insumos ou revenda (filtro e contexto)
ALTER TABLE fornecedores
  ADD COLUMN IF NOT EXISTS tipo TEXT CHECK (tipo IN ('insumos', 'revenda'));

COMMENT ON COLUMN fornecedores.tipo IS 'Insumos ou revenda - define o tipo de produto que o fornecedor vende';

CREATE INDEX IF NOT EXISTS idx_fornecedores_tipo ON fornecedores (tipo);
