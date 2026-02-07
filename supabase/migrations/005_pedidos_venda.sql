-- Saldão de Móveis Jerusalém – Pedidos de venda (Fase 5)
-- Depende de: 001 (clientes), 002 (produtos, movimentacoes_estoque)

CREATE TABLE IF NOT EXISTS pedidos_venda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  data_pedido DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo_entrega TEXT NOT NULL DEFAULT 'retirada' CHECK (tipo_entrega IN ('retirada', 'entrega')),
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'confirmado', 'entregue', 'cancelado')),
  endereco_entrega TEXT,
  observacoes TEXT,
  total NUMERIC(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS itens_pedido_venda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_venda_id UUID NOT NULL REFERENCES pedidos_venda(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE RESTRICT,
  quantidade NUMERIC(15,3) NOT NULL,
  preco_unitario NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_item NUMERIC(15,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pedidos_venda_cliente ON pedidos_venda (cliente_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_venda_data ON pedidos_venda (data_pedido);
CREATE INDEX IF NOT EXISTS idx_pedidos_venda_status ON pedidos_venda (status);
CREATE INDEX IF NOT EXISTS idx_itens_pedido_venda_pedido ON itens_pedido_venda (pedido_venda_id);
