-- Saldão de Móveis Jerusalém – Roteirização (Fase 7)
-- Depende de: 005 (pedidos_venda)

CREATE TABLE IF NOT EXISTS veiculos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  placa TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  dias_entrega TEXT,
  horario_inicio TIME,
  horario_fim TIME,
  capacidade_volume NUMERIC(15,2),
  capacidade_itens INTEGER,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS entregas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_venda_id UUID NOT NULL REFERENCES pedidos_venda(id) ON DELETE CASCADE,
  veiculo_id UUID REFERENCES veiculos(id) ON DELETE SET NULL,
  data_entrega_prevista DATE,
  ordem_na_rota INTEGER,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_rota', 'entregue')),
  entregue_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_entregas_pedido ON entregas (pedido_venda_id);
CREATE INDEX IF NOT EXISTS idx_entregas_veiculo ON entregas (veiculo_id);
CREATE INDEX IF NOT EXISTS idx_entregas_data ON entregas (data_entrega_prevista);
CREATE INDEX IF NOT EXISTS idx_entregas_status ON entregas (status);
