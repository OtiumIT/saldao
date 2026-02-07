-- Categorias de produto (cozinha, quarto, lavanderia, sala, etc.)
CREATE TABLE IF NOT EXISTS categorias_produto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categorias_produto_nome ON categorias_produto (nome);

-- Vincular produtos a categoria
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS categoria_id UUID REFERENCES categorias_produto(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON produtos (categoria_id);

-- Inserir categorias iniciais
INSERT INTO categorias_produto (nome) VALUES
  ('Cozinha'),
  ('Quarto'),
  ('Lavanderia'),
  ('Sala'),
  ('Escritório'),
  ('Área de serviço'),
  ('Insumo / Peça')
ON CONFLICT (nome) DO NOTHING;
