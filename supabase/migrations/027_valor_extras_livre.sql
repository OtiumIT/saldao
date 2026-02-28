-- Campo de valor para "Outros extras" (valor digitado em R$)
ALTER TABLE pedidos_venda
  ADD COLUMN IF NOT EXISTS valor_extras_livre NUMERIC(15,2) DEFAULT 0;

COMMENT ON COLUMN pedidos_venda.valor_extras_livre IS 'Valor em R$ digitado no campo "Outros extras" da entrega';
