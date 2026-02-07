-- Saldão de Móveis Jerusalém – Produtos e movimentações de estoque (Fase 1)
-- Depende de: 001_clientes_fornecedores.sql (fornecedores)

-- Produtos (Revenda, Insumos, Fabricados)
CREATE TABLE IF NOT EXISTS produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT NOT NULL UNIQUE,
  descricao TEXT NOT NULL,
  unidade TEXT NOT NULL DEFAULT 'UN',
  tipo TEXT NOT NULL CHECK (tipo IN ('revenda', 'insumos', 'fabricado')),
  preco_compra NUMERIC(15,2) DEFAULT 0,
  preco_venda NUMERIC(15,2) DEFAULT 0,
  estoque_minimo NUMERIC(15,3) DEFAULT 0,
  estoque_maximo NUMERIC(15,3),
  fornecedor_principal_id UUID REFERENCES fornecedores(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_produtos_codigo ON produtos (codigo);
CREATE INDEX IF NOT EXISTS idx_produtos_tipo ON produtos (tipo);
CREATE INDEX IF NOT EXISTS idx_produtos_fornecedor ON produtos (fornecedor_principal_id);

-- Movimentações de estoque (entrada, saída, ajuste, produção)
CREATE TABLE IF NOT EXISTS movimentacoes_estoque (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida', 'ajuste', 'producao')),
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  quantidade NUMERIC(15,3) NOT NULL,
  origem_tipo TEXT,
  origem_id UUID,
  observacao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_movimentacoes_produto ON movimentacoes_estoque (produto_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_data ON movimentacoes_estoque (data);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_origem ON movimentacoes_estoque (origem_tipo, origem_id);

-- View: saldo atual por produto
CREATE OR REPLACE VIEW saldo_estoque AS
SELECT
  produto_id,
  COALESCE(SUM(quantidade), 0) AS quantidade
FROM movimentacoes_estoque
GROUP BY produto_id;
