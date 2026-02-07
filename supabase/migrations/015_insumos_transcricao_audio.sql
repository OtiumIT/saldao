-- Cadastro de fornecedores e insumos citados na transcrição de áudio
-- (Fábio – chapas; Albras – parafusos e dobradiças; Opeando – plásticos; Berneck – chapas fundo HDF)
-- Só insere se ainda não existir (fornecedor por nome, produto por código).

-- 1) Fornecedores (só se não existir por nome, case-insensitive)
INSERT INTO fornecedores (nome, tipo)
SELECT v.nome, v.tipo
FROM (VALUES
  ('Albras', 'insumos'),
  ('Opeando', 'insumos'),
  ('Berneck', 'insumos'),
  ('Fábio', 'insumos')
) AS v(nome, tipo)
WHERE NOT EXISTS (
  SELECT 1 FROM fornecedores f
  WHERE TRIM(LOWER(f.nome)) = LOWER(TRIM(v.nome))
);

-- 2) Insumos (ON CONFLICT codigo DO NOTHING); categoria Insumo / Peça; fornecedor por nome
INSERT INTO produtos (codigo, descricao, unidade, tipo, fornecedor_principal_id, categoria_id)
SELECT 'INS-ALBRAS-1', 'Parafusos', 'UN', 'insumos', f.id, cat.id
FROM fornecedores f, categorias_produto cat
WHERE TRIM(LOWER(f.nome)) = 'albras' AND cat.nome = 'Insumo / Peça'
LIMIT 1
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO produtos (codigo, descricao, unidade, tipo, fornecedor_principal_id, categoria_id)
SELECT 'INS-ALBRAS-2', 'Dobradiças', 'UN', 'insumos', f.id, cat.id
FROM fornecedores f, categorias_produto cat
WHERE TRIM(LOWER(f.nome)) = 'albras' AND cat.nome = 'Insumo / Peça'
LIMIT 1
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO produtos (codigo, descricao, unidade, tipo, fornecedor_principal_id, categoria_id)
SELECT 'INS-OPEANDO-1', 'Pés plásticos', 'UN', 'insumos', f.id, cat.id
FROM fornecedores f, categorias_produto cat
WHERE TRIM(LOWER(f.nome)) = 'opeando' AND cat.nome = 'Insumo / Peça'
LIMIT 1
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO produtos (codigo, descricao, unidade, tipo, fornecedor_principal_id, categoria_id)
SELECT 'INS-OPEANDO-2', 'Puxadores (plástico)', 'UN', 'insumos', f.id, cat.id
FROM fornecedores f, categorias_produto cat
WHERE TRIM(LOWER(f.nome)) = 'opeando' AND cat.nome = 'Insumo / Peça'
LIMIT 1
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO produtos (codigo, descricao, unidade, tipo, fornecedor_principal_id, categoria_id)
SELECT 'INS-BERNECK-1', 'Chapa fundo HDF 3mm', 'UN', 'insumos', f.id, cat.id
FROM fornecedores f, categorias_produto cat
WHERE TRIM(LOWER(f.nome)) = 'berneck' AND cat.nome = 'Insumo / Peça'
LIMIT 1
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO produtos (codigo, descricao, unidade, tipo, fornecedor_principal_id, categoria_id)
SELECT 'INS-FABIO-1', 'Chapa padrão 2,75m x 1,85m', 'UN', 'insumos', f.id, cat.id
FROM fornecedores f, categorias_produto cat
WHERE TRIM(LOWER(f.nome)) = 'fábio' AND cat.nome = 'Insumo / Peça'
LIMIT 1
ON CONFLICT (codigo) DO NOTHING;

-- 3) Vincular produto ↔ fornecedor em produtos_fornecedores (evita duplicata)
INSERT INTO produtos_fornecedores (produto_id, fornecedor_id)
SELECT p.id, f.id
FROM produtos p
CROSS JOIN fornecedores f
WHERE TRIM(LOWER(f.nome)) = 'albras'
  AND p.codigo IN ('INS-ALBRAS-1', 'INS-ALBRAS-2')
ON CONFLICT (produto_id, fornecedor_id) DO NOTHING;

INSERT INTO produtos_fornecedores (produto_id, fornecedor_id)
SELECT p.id, f.id
FROM produtos p
CROSS JOIN fornecedores f
WHERE TRIM(LOWER(f.nome)) = 'opeando'
  AND p.codigo IN ('INS-OPEANDO-1', 'INS-OPEANDO-2')
ON CONFLICT (produto_id, fornecedor_id) DO NOTHING;

INSERT INTO produtos_fornecedores (produto_id, fornecedor_id)
SELECT p.id, f.id
FROM produtos p
CROSS JOIN fornecedores f
WHERE TRIM(LOWER(f.nome)) = 'berneck'
  AND p.codigo = 'INS-BERNECK-1'
ON CONFLICT (produto_id, fornecedor_id) DO NOTHING;

INSERT INTO produtos_fornecedores (produto_id, fornecedor_id)
SELECT p.id, f.id
FROM produtos p
CROSS JOIN fornecedores f
WHERE TRIM(LOWER(f.nome)) = 'fábio'
  AND p.codigo = 'INS-FABIO-1'
ON CONFLICT (produto_id, fornecedor_id) DO NOTHING;
