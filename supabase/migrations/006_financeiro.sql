-- Saldão de Móveis Jerusalém – Financeiro (Fase 6)

CREATE TABLE IF NOT EXISTS contas_a_pagar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  descricao TEXT NOT NULL,
  valor NUMERIC(15,2) NOT NULL,
  vencimento DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago')),
  forma_pagamento TEXT,
  pedido_compra_id UUID REFERENCES pedidos_compra(id) ON DELETE SET NULL,
  parcela_numero INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  pago_em TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS contas_a_receber (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  descricao TEXT NOT NULL,
  valor NUMERIC(15,2) NOT NULL,
  vencimento DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'recebido')),
  forma_pagamento TEXT,
  pedido_venda_id UUID REFERENCES pedidos_venda(id) ON DELETE SET NULL,
  parcela_numero INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  recebido_em TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_contas_a_pagar_vencimento ON contas_a_pagar (vencimento);
CREATE INDEX IF NOT EXISTS idx_contas_a_pagar_status ON contas_a_pagar (status);
CREATE INDEX IF NOT EXISTS idx_contas_a_receber_vencimento ON contas_a_receber (vencimento);
CREATE INDEX IF NOT EXISTS idx_contas_a_receber_status ON contas_a_receber (status);
