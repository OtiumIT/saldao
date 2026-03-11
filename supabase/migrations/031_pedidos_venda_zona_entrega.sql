-- Zona/bairro de entrega (preenchido por script a partir de lat/lon via reverse geocode)
-- Facilita agrupar entregas por região ao selecionar para o caminhão
ALTER TABLE pedidos_venda
  ADD COLUMN IF NOT EXISTS zona_entrega TEXT NULL;

COMMENT ON COLUMN pedidos_venda.zona_entrega IS 'Bairro ou região de entrega (reverse geocode a partir de lat/lon). Usado para agrupar pendentes por zona.';
