-- Saldão de Móveis Jerusalém – Pedidos de compra (Fase 2)
-- Depende de: 001 (fornecedores), 002 (produtos)

CREATE TABLE IF NOT EXISTS pedidos_compra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fornecedor_id UUID NOT NULL REFERENCES fornecedores(id) ON DELETE RESTRICT,
  data_pedido DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'em_aberto' CHECK (status IN ('em_aberto', 'recebido_parcial', 'recebido')),
  observacoes TEXT,
  total NUMERIC(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS itens_pedido_compra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_compra_id UUID NOT NULL REFERENCES pedidos_compra(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE RESTRICT,
  quantidade NUMERIC(15,3) NOT NULL,
  preco_unitario NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_item NUMERIC(15,2) NOT NULL DEFAULT 0,
  quantidade_recebida NUMERIC(15,3) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pedidos_compra_fornecedor ON pedidos_compra (fornecedor_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_compra_data ON pedidos_compra (data_pedido);
CREATE INDEX IF NOT EXISTS idx_pedidos_compra_status ON pedidos_compra (status);
CREATE INDEX IF NOT EXISTS idx_itens_pedido_compra_pedido ON itens_pedido_compra (pedido_compra_id);
