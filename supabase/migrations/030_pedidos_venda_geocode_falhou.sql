-- Marca pedidos cujo geocode falhou (evita reprocessar infinitamente)
ALTER TABLE pedidos_venda
  ADD COLUMN IF NOT EXISTS endereco_geocode_falhou BOOLEAN DEFAULT false;

COMMENT ON COLUMN pedidos_venda.endereco_geocode_falhou IS 'True quando tentativa de geocode falhou (endereço não localizado ou fora da região).';

-- Atualiza índice para excluir os que já falharam
DROP INDEX IF EXISTS idx_pedidos_venda_geocode_pendente;
CREATE INDEX IF NOT EXISTS idx_pedidos_venda_geocode_pendente
  ON pedidos_venda (data_pedido DESC)
  WHERE tipo_entrega = 'entrega' AND endereco_entrega IS NOT NULL
    AND (endereco_lat IS NULL OR endereco_lon IS NULL)
    AND (endereco_geocode_falhou IS NOT TRUE);
