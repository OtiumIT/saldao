-- Saldão de Móveis Jerusalém – Custos operacionais (suporte à precificação e viabilidade Fábrica/Loja)
-- Ver CUSTOS_OPERACIONAIS_PRECIFICACAO.md e LOJA_COMO_CLIENTE_FABRICA.md

-- Categorias de custo (Aluguel, Luz, Salários, etc.) com local para viabilidade por unidade
CREATE TABLE IF NOT EXISTS categorias_custo_operacional (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  local TEXT NOT NULL DEFAULT 'comum' CHECK (local IN ('fabrica', 'loja', 'comum')),
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categorias_custo_operacional_ativo ON categorias_custo_operacional (ativo);

-- Valores por categoria por mês/ano
CREATE TABLE IF NOT EXISTS custos_operacionais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria_id UUID NOT NULL REFERENCES categorias_custo_operacional(id) ON DELETE CASCADE,
  ano INT NOT NULL,
  mes INT NOT NULL CHECK (mes >= 1 AND mes <= 12),
  valor_planejado NUMERIC(15,2) NOT NULL DEFAULT 0,
  valor_realizado NUMERIC(15,2),
  observacao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (categoria_id, ano, mes)
);

CREATE INDEX IF NOT EXISTS idx_custos_operacionais_periodo ON custos_operacionais (ano, mes);
CREATE INDEX IF NOT EXISTS idx_custos_operacionais_categoria ON custos_operacionais (categoria_id);
