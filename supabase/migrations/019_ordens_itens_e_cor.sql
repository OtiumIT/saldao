-- Ordens com itens (fabricado/kit) e cor para chapas
-- Depende de: 004 (ordens_producao), 018 (cores)

-- Cor na ordem (quando BOM usa chapas com controlar_por_cor)
ALTER TABLE ordens_producao ADD COLUMN IF NOT EXISTS cor_id UUID REFERENCES cores(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_ordens_producao_cor ON ordens_producao (cor_id) WHERE cor_id IS NOT NULL;

-- Tipo do produto na produção: fabricado (dá entrada) ou kit (só baixa)
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS tipo_item_producao TEXT
  CHECK (tipo_item_producao IS NULL OR tipo_item_producao IN ('fabricado', 'kit'));
CREATE INDEX IF NOT EXISTS idx_produtos_tipo_item_producao ON produtos (tipo_item_producao) WHERE tipo_item_producao IS NOT NULL;

-- Itens da ordem (permite Módulo Base + kits; se vazio, usa produto_fabricado_id + quantidade da ordem)
CREATE TABLE IF NOT EXISTS ordens_producao_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ordem_id UUID NOT NULL REFERENCES ordens_producao(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE RESTRICT,
  tipo TEXT NOT NULL CHECK (tipo IN ('fabricado', 'kit')),
  quantidade NUMERIC(15,3) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ordens_producao_itens_ordem ON ordens_producao_itens (ordem_id);
