-- Saldão de Móveis Jerusalém – Dimensões de produto (montado e desmontado) para roteirização
-- Depende de: 002 (produtos)
-- Produtos podem ser vendidos montados ou desmontados (em caixas). Cada um tem duas dimensões cadastradas.

ALTER TABLE produtos ADD COLUMN IF NOT EXISTS montado_comprimento_m NUMERIC(8,2);
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS montado_largura_m NUMERIC(8,2);
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS montado_altura_m NUMERIC(8,2);
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS montado_peso_kg NUMERIC(10,2);

ALTER TABLE produtos ADD COLUMN IF NOT EXISTS desmontado_comprimento_m NUMERIC(8,2);
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS desmontado_largura_m NUMERIC(8,2);
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS desmontado_altura_m NUMERIC(8,2);
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS desmontado_peso_kg NUMERIC(10,2);
