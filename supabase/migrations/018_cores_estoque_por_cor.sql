-- Chapas por cor: cores, controle por cor em produtos, movimentações com cor_id, saldo por (produto_id, cor_id)
-- Depende de: 002 (produtos, movimentacoes_estoque)

-- Tabela de cores (lista mestra para chapas)
CREATE TABLE IF NOT EXISTS cores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  codigo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_cores_nome ON cores (LOWER(TRIM(nome)));
CREATE INDEX IF NOT EXISTS idx_cores_codigo ON cores (codigo) WHERE codigo IS NOT NULL;

-- Produtos que controlam estoque por cor (chapas)
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS controlar_por_cor BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_produtos_controlar_por_cor ON produtos (controlar_por_cor) WHERE controlar_por_cor = true;

-- Movimentações com cor (quando produto.controlar_por_cor = true, cor_id deve ser informado)
ALTER TABLE movimentacoes_estoque ADD COLUMN IF NOT EXISTS cor_id UUID REFERENCES cores(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_movimentacoes_cor ON movimentacoes_estoque (cor_id) WHERE cor_id IS NOT NULL;

-- View: saldo por produto e cor (cor_id NULL = produto sem controle por cor)
CREATE OR REPLACE VIEW saldo_estoque_por_cor AS
SELECT
  produto_id,
  cor_id,
  COALESCE(SUM(quantidade), 0) AS quantidade
FROM movimentacoes_estoque
GROUP BY produto_id, cor_id;

-- Manter saldo_estoque para produtos sem cor: soma de todas as linhas onde cor_id IS NULL ou produto não controla por cor
-- (a view antiga saldo_estoque continua: GROUP BY produto_id apenas - para compatibilidade com queries que ignoram cor)
-- Não alteramos saldo_estoque aqui; quem usar produtos com controlar_por_cor deve usar saldo_estoque_por_cor.

-- Seed cores iniciais (Branco, Marrom, Cinza - conforme uso na loja)
INSERT INTO cores (nome, codigo)
SELECT v.nome, v.codigo FROM (VALUES
  ('Branco', 'BR'),
  ('Marrom', 'MR'),
  ('Cinza', 'CZ')
) AS v(nome, codigo)
WHERE NOT EXISTS (SELECT 1 FROM cores c WHERE LOWER(TRIM(c.nome)) = LOWER(TRIM(v.nome)));

-- Marcar produtos chapa como controlar_por_cor (INS-MDF-% e chapa padrão)
UPDATE produtos
SET controlar_por_cor = true
WHERE controlar_por_cor = false
  AND (codigo LIKE 'INS-MDF-%' OR codigo = 'INS-FABIO-1');
