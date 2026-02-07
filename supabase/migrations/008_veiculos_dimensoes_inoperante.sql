-- Saldão de Móveis Jerusalém – Veículos: dimensões de carga e aviso inoperante
-- Depende de: 007 (veiculos)

ALTER TABLE veiculos ADD COLUMN IF NOT EXISTS inoperante BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE veiculos ADD COLUMN IF NOT EXISTS inoperante_desde TIMESTAMPTZ;
ALTER TABLE veiculos ADD COLUMN IF NOT EXISTS inoperante_motivo TEXT;
ALTER TABLE veiculos ADD COLUMN IF NOT EXISTS capacidade_peso_kg NUMERIC(12,2);
ALTER TABLE veiculos ADD COLUMN IF NOT EXISTS carga_comprimento_m NUMERIC(8,2);
ALTER TABLE veiculos ADD COLUMN IF NOT EXISTS carga_largura_m NUMERIC(8,2);
ALTER TABLE veiculos ADD COLUMN IF NOT EXISTS carga_altura_m NUMERIC(8,2);
