-- Micro-região de entrega (subprefeitura/distrito, ex.: Leste 1, Leste 2, Itaquera)
-- Preenchido junto com zona_entrega pelo script popular-zonas-entrega (reverse geocode).
ALTER TABLE pedidos_venda
  ADD COLUMN IF NOT EXISTS micro_regiao_entrega TEXT NULL;

COMMENT ON COLUMN pedidos_venda.micro_regiao_entrega IS 'Micro-região/subprefeitura de entrega (ex.: Leste 1, Itaquera). Usado para agrupar entregas mais granularmente que zona.';
