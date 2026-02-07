-- Frete na venda: distância (km) e valor do frete para cálculo do total

ALTER TABLE pedidos_venda
  ADD COLUMN IF NOT EXISTS distancia_km NUMERIC(8,2);

ALTER TABLE pedidos_venda
  ADD COLUMN IF NOT EXISTS valor_frete NUMERIC(15,2) DEFAULT 0;

COMMENT ON COLUMN pedidos_venda.distancia_km IS 'Distância em km para entrega (usado na tabela de frete)';
COMMENT ON COLUMN pedidos_venda.valor_frete IS 'Valor do frete (calculado pela faixa ou informado manualmente acima de 13 km). Total do pedido = itens + valor_frete.';
