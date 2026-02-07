-- Dois tipos de pedido de compra: pedido (com prazo) e recepção (entrada direta)
-- Prazo médio de entrega no produto (para venda sem estoque)
-- Previsão de entrega no pedido de venda (vender sem estoque com prazo)

-- pedidos_compra: tipo (pedido | recepcao) e data prevista de entrega
ALTER TABLE pedidos_compra
  ADD COLUMN IF NOT EXISTS tipo TEXT NOT NULL DEFAULT 'pedido' CHECK (tipo IN ('pedido', 'recepcao'));

ALTER TABLE pedidos_compra
  ADD COLUMN IF NOT EXISTS data_prevista_entrega DATE;

COMMENT ON COLUMN pedidos_compra.tipo IS 'pedido = com prazo de entrega; recepcao = já comprou, só lançar entrada';
COMMENT ON COLUMN pedidos_compra.data_prevista_entrega IS 'Previsão de entrega (só para tipo=pedido)';

-- produtos: prazo médio para entrega quando sem estoque (dias)
ALTER TABLE produtos
  ADD COLUMN IF NOT EXISTS prazo_medio_entrega_dias INTEGER;

COMMENT ON COLUMN produtos.prazo_medio_entrega_dias IS 'Média de dias para entrega quando produto está sem estoque (sugestão na venda)';

-- pedidos_venda: previsão de entrega em dias (promessa ao cliente quando há item sem estoque)
ALTER TABLE pedidos_venda
  ADD COLUMN IF NOT EXISTS previsao_entrega_em_dias INTEGER;

COMMENT ON COLUMN pedidos_venda.previsao_entrega_em_dias IS 'Promessa de entrega em X dias (ex.: 7) quando venda tem item sem estoque';

CREATE INDEX IF NOT EXISTS idx_pedidos_compra_tipo ON pedidos_compra (tipo);
CREATE INDEX IF NOT EXISTS idx_pedidos_compra_data_prevista ON pedidos_compra (data_prevista_entrega) WHERE data_prevista_entrega IS NOT NULL;
