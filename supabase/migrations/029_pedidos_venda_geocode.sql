-- Lat/lon do endereço de entrega (preenchido por job a cada 15 min ou na hora)
ALTER TABLE pedidos_venda
  ADD COLUMN IF NOT EXISTS endereco_lat NUMERIC(12,8) NULL,
  ADD COLUMN IF NOT EXISTS endereco_lon NUMERIC(12,8) NULL;

COMMENT ON COLUMN pedidos_venda.endereco_lat IS 'Latitude do endereço de entrega (geocode). Preenchido por job ou na hora.';
COMMENT ON COLUMN pedidos_venda.endereco_lon IS 'Longitude do endereço de entrega (geocode). Preenchido por job ou na hora.';

CREATE INDEX IF NOT EXISTS idx_pedidos_venda_geocode_pendente
  ON pedidos_venda (data_pedido DESC)
  WHERE tipo_entrega = 'entrega' AND endereco_entrega IS NOT NULL AND (endereco_lat IS NULL OR endereco_lon IS NULL);
