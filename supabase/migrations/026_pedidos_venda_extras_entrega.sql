-- Extras de entrega no pedido (opções selecionadas + campo livre)
-- valor_extras_entrega: soma dos valores das opções (fixo ou por_andar * andar)
-- extras_livre: texto livre (ex: "Outros extras")
-- opcoes_entrega_selecionadas: JSONB [{ opcao_id, andar? }] para auditoria

ALTER TABLE pedidos_venda
  ADD COLUMN IF NOT EXISTS valor_extras_entrega NUMERIC(15,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS extras_livre TEXT,
  ADD COLUMN IF NOT EXISTS opcoes_entrega_selecionadas JSONB;

COMMENT ON COLUMN pedidos_venda.valor_extras_entrega IS 'Soma dos valores das opções de entrega selecionadas (portaria, elevador, escadas por andar, etc.)';
COMMENT ON COLUMN pedidos_venda.extras_livre IS 'Texto livre para outros extras (label configurável em config_entrega)';
COMMENT ON COLUMN pedidos_venda.opcoes_entrega_selecionadas IS 'Array [{ opcao_id, andar? }] das opções selecionadas no momento da venda';

