-- Opções de preços extras da entrega (portaria, elevador, escadas por andar, etc.)
-- Usado na venda com entrega para somar ao frete

CREATE TABLE IF NOT EXISTS opcoes_entrega (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('fixo', 'por_andar')),
  valor_fixo NUMERIC(10,2) NULL CHECK (valor_fixo IS NULL OR valor_fixo >= 0),
  valor_por_andar NUMERIC(10,2) NULL CHECK (valor_por_andar IS NULL OR valor_por_andar >= 0),
  ordem INTEGER NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (nome)
);

COMMENT ON COLUMN opcoes_entrega.tipo IS 'fixo = valor único (ex: portaria, elevador); por_andar = valor por andar (ex: escadas)';
COMMENT ON COLUMN opcoes_entrega.valor_fixo IS 'Valor em R$ quando tipo = fixo';
COMMENT ON COLUMN opcoes_entrega.valor_por_andar IS 'Valor em R$ por andar quando tipo = por_andar';

CREATE INDEX IF NOT EXISTS idx_opcoes_entrega_ativo_ordem ON opcoes_entrega (ativo, ordem);

-- Label/placeholder do campo aberto de extras (ex: "Outros extras")
CREATE TABLE IF NOT EXISTS config_entrega (
  chave TEXT PRIMARY KEY,
  valor TEXT
);

INSERT INTO config_entrega (chave, valor) VALUES ('extras_livre_label', 'Outros extras')
ON CONFLICT (chave) DO NOTHING;

-- Carga inicial: exemplos (ignora se já existir por nome)
INSERT INTO opcoes_entrega (nome, tipo, valor_fixo, valor_por_andar, ordem) VALUES
  ('Entregar na portaria', 'fixo', 0, NULL, 1),
  ('Prédio com elevador', 'fixo', 0, NULL, 2),
  ('Prédio com escadas (valor por andar)', 'por_andar', NULL, 0, 3)
ON CONFLICT (nome) DO NOTHING;
