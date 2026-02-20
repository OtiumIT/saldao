-- Opções de parcelamento: taxas por número de parcelas (1x sem taxa, 2x+ com taxa editável)
-- Usado na venda: total = (subtotal + frete) * (1 + taxa/100) quando parcelado

CREATE TABLE IF NOT EXISTS opcoes_parcelamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parcelas INTEGER NOT NULL UNIQUE CHECK (parcelas >= 1),
  taxa_percentual NUMERIC(6,2) NOT NULL DEFAULT 0 CHECK (taxa_percentual >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_opcoes_parcelamento_parcelas ON opcoes_parcelamento (parcelas);

-- Carga inicial: 1x sem taxa; 2x a 14x conforme tabela Elo (taxas editáveis)
INSERT INTO opcoes_parcelamento (parcelas, taxa_percentual) VALUES
  (1, 0),
  (2, 4.87),
  (3, 5.55),
  (4, 6.24),
  (5, 6.94),
  (6, 7.40),
  (7, 7.73),
  (8, 8.00),
  (9, 8.72),
  (10, 10.17),
  (11, 11.38),
  (12, 12.67),
  (13, 12.67),
  (14, 13.42)
ON CONFLICT (parcelas) DO NOTHING;

-- Pedido de venda: registrar se foi parcelado e qual taxa foi aplicada
ALTER TABLE pedidos_venda ADD COLUMN IF NOT EXISTS parcelas INTEGER NULL;
ALTER TABLE pedidos_venda ADD COLUMN IF NOT EXISTS taxa_parcelamento_percentual NUMERIC(6,2) NULL;

COMMENT ON COLUMN pedidos_venda.parcelas IS 'Número de parcelas no cartão (null = à vista ou outro meio). Total já inclui a taxa quando parcelas > 1.';
COMMENT ON COLUMN pedidos_venda.taxa_parcelamento_percentual IS 'Taxa % aplicada no parcelamento (armazenada no momento da venda).';
