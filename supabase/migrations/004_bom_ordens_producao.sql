-- Saldão de Móveis Jerusalém – BOM e ordens de produção (Fase 4)
-- Depende de: 002 (produtos, movimentacoes_estoque)

-- BOM: por 1 unidade do fabricado, quanto de cada insumo
CREATE TABLE IF NOT EXISTS bom (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_fabricado_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  produto_insumo_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  quantidade_por_unidade NUMERIC(15,3) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(produto_fabricado_id, produto_insumo_id)
);

CREATE INDEX IF NOT EXISTS idx_bom_fabricado ON bom (produto_fabricado_id);

-- Ordens de produção
CREATE TABLE IF NOT EXISTS ordens_producao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_fabricado_id UUID NOT NULL REFERENCES produtos(id) ON DELETE RESTRICT,
  quantidade NUMERIC(15,3) NOT NULL,
  data_ordem DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'concluida')),
  observacao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ordens_producao_data ON ordens_producao (data_ordem);
CREATE INDEX IF NOT EXISTS idx_ordens_producao_status ON ordens_producao (status);
