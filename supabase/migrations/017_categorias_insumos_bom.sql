-- Saldão de Móveis Jerusalém – Categorias (Fundo/HDF, Plásticos), Insumos por especificação, 3 fabricados e BOM
-- Depende de: 001 (fornecedores), 002 (produtos), 004 (bom), 011 (categorias_produto), 012 (produtos_fornecedores), 015 (fornecedores base)
-- BOM independe de fornecedor: produtos por especificação; fornecedor no cadastro do produto.

-- 1) Categorias novas
INSERT INTO categorias_produto (nome) VALUES
  ('Fundo / HDF'),
  ('Plásticos / Injetados')
ON CONFLICT (nome) DO NOTHING;

-- 2) Fornecedores (idempotente; 015 já pode tê-los)
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

-- 3) Insumos – Ferragens (especificação; vincular Albras). Estoque mínimo para aviso.
INSERT INTO produtos (codigo, descricao, unidade, tipo, fornecedor_principal_id, categoria_id, estoque_minimo)
SELECT 'INS-PAR-35-35', 'Parafuso 3,5 x 35 mm', 'UN', 'insumos', f.id, c.id, 100
FROM fornecedores f, categorias_produto c
WHERE TRIM(LOWER(f.nome)) = 'albras' AND c.nome = 'Insumo / Peça' LIMIT 1
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO produtos (codigo, descricao, unidade, tipo, fornecedor_principal_id, categoria_id, estoque_minimo)
SELECT 'INS-PAR-35-12', 'Parafuso 3,5 x 12 mm', 'UN', 'insumos', f.id, c.id, 100
FROM fornecedores f, categorias_produto c
WHERE TRIM(LOWER(f.nome)) = 'albras' AND c.nome = 'Insumo / Peça' LIMIT 1
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO produtos (codigo, descricao, unidade, tipo, fornecedor_principal_id, categoria_id, estoque_minimo)
SELECT 'INS-PAR-35-30', 'Parafuso 3,5 x 30 mm', 'UN', 'insumos', f.id, c.id, 100
FROM fornecedores f, categorias_produto c
WHERE TRIM(LOWER(f.nome)) = 'albras' AND c.nome = 'Insumo / Peça' LIMIT 1
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO produtos (codigo, descricao, unidade, tipo, fornecedor_principal_id, categoria_id, estoque_minimo)
SELECT 'INS-PAR-35-25', 'Parafuso 3,5 x 25 mm', 'UN', 'insumos', f.id, c.id, 100
FROM fornecedores f, categorias_produto c
WHERE TRIM(LOWER(f.nome)) = 'albras' AND c.nome = 'Insumo / Peça' LIMIT 1
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO produtos (codigo, descricao, unidade, tipo, fornecedor_principal_id, categoria_id, estoque_minimo)
SELECT 'INS-PAR-40-45', 'Parafuso 4,0 x 45 mm', 'UN', 'insumos', f.id, c.id, 100
FROM fornecedores f, categorias_produto c
WHERE TRIM(LOWER(f.nome)) = 'albras' AND c.nome = 'Insumo / Peça' LIMIT 1
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO produtos (codigo, descricao, unidade, tipo, fornecedor_principal_id, categoria_id, estoque_minimo)
SELECT 'INS-CANTONEIRA', 'Cantoneira', 'UN', 'insumos', f.id, c.id, 50
FROM fornecedores f, categorias_produto c
WHERE TRIM(LOWER(f.nome)) = 'albras' AND c.nome = 'Insumo / Peça' LIMIT 1
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO produtos (codigo, descricao, unidade, tipo, fornecedor_principal_id, categoria_id, estoque_minimo)
SELECT 'INS-DOBRADICA', 'Dobradiça', 'UN', 'insumos', f.id, c.id, 50
FROM fornecedores f, categorias_produto c
WHERE TRIM(LOWER(f.nome)) = 'albras' AND c.nome = 'Insumo / Peça' LIMIT 1
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO produtos (codigo, descricao, unidade, tipo, fornecedor_principal_id, categoria_id, estoque_minimo)
SELECT 'INS-PUXADOR', 'Puxador', 'UN', 'insumos', f.id, c.id, 50
FROM fornecedores f, categorias_produto c
WHERE TRIM(LOWER(f.nome)) = 'albras' AND c.nome = 'Insumo / Peça' LIMIT 1
ON CONFLICT (codigo) DO NOTHING;

-- 4) Insumos – Peças cortadas MDF (Fábio). Código por especificação.
INSERT INTO produtos (codigo, descricao, unidade, tipo, fornecedor_principal_id, categoria_id)
SELECT 'INS-MDF-LAT-217-44.5', 'MDF Lateral 217 x 44,5 cm', 'UN', 'insumos', f.id, c.id
FROM fornecedores f, categorias_produto c
WHERE TRIM(LOWER(f.nome)) = 'fábio' AND c.nome = 'Insumo / Peça' LIMIT 1
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO produtos (codigo, descricao, unidade, tipo, fornecedor_principal_id, categoria_id)
SELECT 'INS-MDF-POR-202-29.5', 'MDF Porta 202 x 29,5 cm', 'UN', 'insumos', f.id, c.id
FROM fornecedores f, categorias_produto c
WHERE TRIM(LOWER(f.nome)) = 'fábio' AND c.nome = 'Insumo / Peça' LIMIT 1
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO produtos (codigo, descricao, unidade, tipo, fornecedor_principal_id, categoria_id)
SELECT 'INS-MDF-PRAT-58-44.5', 'MDF Prateleira 58 x 44,5 cm', 'UN', 'insumos', f.id, c.id
FROM fornecedores f, categorias_produto c
WHERE TRIM(LOWER(f.nome)) = 'fábio' AND c.nome = 'Insumo / Peça' LIMIT 1
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO produtos (codigo, descricao, unidade, tipo, fornecedor_principal_id, categoria_id)
SELECT 'INS-MDF-BAND-58-7', 'MDF Bandeira 58 x 7 cm', 'UN', 'insumos', f.id, c.id
FROM fornecedores f, categorias_produto c
WHERE TRIM(LOWER(f.nome)) = 'fábio' AND c.nome = 'Insumo / Peça' LIMIT 1
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO produtos (codigo, descricao, unidade, tipo, fornecedor_principal_id, categoria_id)
SELECT 'INS-MDF-LAT-171-35', 'MDF Lateral 171 x 35 cm', 'UN', 'insumos', f.id, c.id
FROM fornecedores f, categorias_produto c
WHERE TRIM(LOWER(f.nome)) = 'fábio' AND c.nome = 'Insumo / Peça' LIMIT 1
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO produtos (codigo, descricao, unidade, tipo, fornecedor_principal_id, categoria_id)
SELECT 'INS-MDF-POR-170-35', 'MDF Porta 170 x 35 cm', 'UN', 'insumos', f.id, c.id
FROM fornecedores f, categorias_produto c
WHERE TRIM(LOWER(f.nome)) = 'fábio' AND c.nome = 'Insumo / Peça' LIMIT 1
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO produtos (codigo, descricao, unidade, tipo, fornecedor_principal_id, categoria_id)
SELECT 'INS-MDF-PRAT-33.5-35', 'MDF Prateleira 33,5 x 35 cm', 'UN', 'insumos', f.id, c.id
FROM fornecedores f, categorias_produto c
WHERE TRIM(LOWER(f.nome)) = 'fábio' AND c.nome = 'Insumo / Peça' LIMIT 1
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO produtos (codigo, descricao, unidade, tipo, fornecedor_principal_id, categoria_id)
SELECT 'INS-MDF-LAT-101.5-35', 'MDF Lateral 101,5 x 35 cm', 'UN', 'insumos', f.id, c.id
FROM fornecedores f, categorias_produto c
WHERE TRIM(LOWER(f.nome)) = 'fábio' AND c.nome = 'Insumo / Peça' LIMIT 1
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO produtos (codigo, descricao, unidade, tipo, fornecedor_principal_id, categoria_id)
SELECT 'INS-MDF-POR-101-29.5', 'MDF Porta 101 x 29,5 cm', 'UN', 'insumos', f.id, c.id
FROM fornecedores f, categorias_produto c
WHERE TRIM(LOWER(f.nome)) = 'fábio' AND c.nome = 'Insumo / Peça' LIMIT 1
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO produtos (codigo, descricao, unidade, tipo, fornecedor_principal_id, categoria_id)
SELECT 'INS-MDF-PRAT-58-35', 'MDF Prateleira 58 x 35 cm', 'UN', 'insumos', f.id, c.id
FROM fornecedores f, categorias_produto c
WHERE TRIM(LOWER(f.nome)) = 'fábio' AND c.nome = 'Insumo / Peça' LIMIT 1
ON CONFLICT (codigo) DO NOTHING;

-- 5) Insumos – Fundo HDF (categoria Fundo / HDF; Berneck como fornecedor principal)
INSERT INTO produtos (codigo, descricao, unidade, tipo, fornecedor_principal_id, categoria_id)
SELECT 'INS-FUNDO-HDF-60.5-203', 'HDF 3mm 60,5 x 203 cm', 'UN', 'insumos', f.id, c.id
FROM fornecedores f, categorias_produto c
WHERE TRIM(LOWER(f.nome)) = 'berneck' AND c.nome = 'Fundo / HDF' LIMIT 1
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO produtos (codigo, descricao, unidade, tipo, fornecedor_principal_id, categoria_id)
SELECT 'INS-FUNDO-HDF-35.8-171', 'HDF 3mm 35,8 x 171 cm', 'UN', 'insumos', f.id, c.id
FROM fornecedores f, categorias_produto c
WHERE TRIM(LOWER(f.nome)) = 'berneck' AND c.nome = 'Fundo / HDF' LIMIT 1
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO produtos (codigo, descricao, unidade, tipo, fornecedor_principal_id, categoria_id)
SELECT 'INS-FUNDO-HDF-60.5-101', 'HDF 3mm 60,5 x 101 cm', 'UN', 'insumos', f.id, c.id
FROM fornecedores f, categorias_produto c
WHERE TRIM(LOWER(f.nome)) = 'berneck' AND c.nome = 'Fundo / HDF' LIMIT 1
ON CONFLICT (codigo) DO NOTHING;

-- 6) Insumos – Plásticos / pés (Opeando)
INSERT INTO produtos (codigo, descricao, unidade, tipo, fornecedor_principal_id, categoria_id)
SELECT 'INS-PE-CANTONEIRA', 'Pé plástico tipo cantoneira', 'UN', 'insumos', f.id, c.id
FROM fornecedores f, categorias_produto c
WHERE TRIM(LOWER(f.nome)) = 'opeando' AND c.nome = 'Plásticos / Injetados' LIMIT 1
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO produtos (codigo, descricao, unidade, tipo, fornecedor_principal_id, categoria_id)
SELECT 'INS-PE-REDONDO-FIXO', 'Pé plástico redondo fixo', 'UN', 'insumos', f.id, c.id
FROM fornecedores f, categorias_produto c
WHERE TRIM(LOWER(f.nome)) = 'opeando' AND c.nome = 'Plásticos / Injetados' LIMIT 1
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO produtos (codigo, descricao, unidade, tipo, fornecedor_principal_id, categoria_id)
SELECT 'INS-PE-REGULAVEL', 'Pé plástico com regulagem', 'UN', 'insumos', f.id, c.id
FROM fornecedores f, categorias_produto c
WHERE TRIM(LOWER(f.nome)) = 'opeando' AND c.nome = 'Plásticos / Injetados' LIMIT 1
ON CONFLICT (codigo) DO NOTHING;

-- 7) Vincular insumos a fornecedores em produtos_fornecedores
INSERT INTO produtos_fornecedores (produto_id, fornecedor_id)
SELECT p.id, f.id FROM produtos p CROSS JOIN fornecedores f
WHERE TRIM(LOWER(f.nome)) = 'albras' AND p.codigo IN (
  'INS-PAR-35-35','INS-PAR-35-12','INS-PAR-35-30','INS-PAR-35-25','INS-PAR-40-45',
  'INS-CANTONEIRA','INS-DOBRADICA','INS-PUXADOR'
)
ON CONFLICT (produto_id, fornecedor_id) DO NOTHING;

INSERT INTO produtos_fornecedores (produto_id, fornecedor_id)
SELECT p.id, f.id FROM produtos p CROSS JOIN fornecedores f
WHERE TRIM(LOWER(f.nome)) = 'fábio' AND p.codigo LIKE 'INS-MDF-%'
ON CONFLICT (produto_id, fornecedor_id) DO NOTHING;

INSERT INTO produtos_fornecedores (produto_id, fornecedor_id)
SELECT p.id, f.id FROM produtos p CROSS JOIN fornecedores f
WHERE TRIM(LOWER(f.nome)) = 'berneck' AND p.codigo LIKE 'INS-FUNDO-HDF-%'
ON CONFLICT (produto_id, fornecedor_id) DO NOTHING;

INSERT INTO produtos_fornecedores (produto_id, fornecedor_id)
SELECT p.id, f.id FROM produtos p CROSS JOIN fornecedores f
WHERE TRIM(LOWER(f.nome)) = 'opeando' AND p.codigo IN ('INS-PE-CANTONEIRA','INS-PE-REDONDO-FIXO','INS-PE-REGULAVEL')
ON CONFLICT (produto_id, fornecedor_id) DO NOTHING;

-- 8) Produtos fabricados
INSERT INTO produtos (codigo, descricao, unidade, tipo, fornecedor_principal_id, categoria_id)
VALUES
  ('FAB-MODULO-AJUSTADO', 'Módulo (Ajustado)', 'UN', 'fabricado', NULL, NULL),
  ('FAB-MULTIUSO-1P', 'Multiuso 1 Porta', 'UN', 'fabricado', NULL, NULL),
  ('FAB-MULTIUSO-2P', 'Multiuso 2 Portas', 'UN', 'fabricado', NULL, NULL)
ON CONFLICT (codigo) DO NOTHING;

-- 9) BOM – Módulo (Ajustado)
INSERT INTO bom (produto_fabricado_id, produto_insumo_id, quantidade_por_unidade)
SELECT (SELECT id FROM produtos WHERE codigo = 'FAB-MODULO-AJUSTADO'), (SELECT id FROM produtos WHERE codigo = 'INS-PAR-35-35'), 16
ON CONFLICT (produto_fabricado_id, produto_insumo_id) DO UPDATE SET quantidade_por_unidade = EXCLUDED.quantidade_por_unidade;

INSERT INTO bom (produto_fabricado_id, produto_insumo_id, quantidade_por_unidade)
SELECT (SELECT id FROM produtos WHERE codigo = 'FAB-MODULO-AJUSTADO'), (SELECT id FROM produtos WHERE codigo = 'INS-PAR-35-12'), 80
ON CONFLICT (produto_fabricado_id, produto_insumo_id) DO UPDATE SET quantidade_por_unidade = EXCLUDED.quantidade_por_unidade;

INSERT INTO bom (produto_fabricado_id, produto_insumo_id, quantidade_por_unidade)
SELECT (SELECT id FROM produtos WHERE codigo = 'FAB-MODULO-AJUSTADO'), (SELECT id FROM produtos WHERE codigo = 'INS-PAR-35-30'), 4
ON CONFLICT (produto_fabricado_id, produto_insumo_id) DO UPDATE SET quantidade_por_unidade = EXCLUDED.quantidade_por_unidade;

INSERT INTO bom (produto_fabricado_id, produto_insumo_id, quantidade_por_unidade)
SELECT (SELECT id FROM produtos WHERE codigo = 'FAB-MODULO-AJUSTADO'), (SELECT id FROM produtos WHERE codigo = 'INS-CANTONEIRA'), 16
ON CONFLICT (produto_fabricado_id, produto_insumo_id) DO UPDATE SET quantidade_por_unidade = EXCLUDED.quantidade_por_unidade;

INSERT INTO bom (produto_fabricado_id, produto_insumo_id, quantidade_por_unidade)
SELECT (SELECT id FROM produtos WHERE codigo = 'FAB-MODULO-AJUSTADO'), (SELECT id FROM produtos WHERE codigo = 'INS-DOBRADICA'), 8
ON CONFLICT (produto_fabricado_id, produto_insumo_id) DO UPDATE SET quantidade_por_unidade = EXCLUDED.quantidade_por_unidade;

INSERT INTO bom (produto_fabricado_id, produto_insumo_id, quantidade_por_unidade)
SELECT (SELECT id FROM produtos WHERE codigo = 'FAB-MODULO-AJUSTADO'), (SELECT id FROM produtos WHERE codigo = 'INS-PUXADOR'), 2
ON CONFLICT (produto_fabricado_id, produto_insumo_id) DO UPDATE SET quantidade_por_unidade = EXCLUDED.quantidade_por_unidade;

INSERT INTO bom (produto_fabricado_id, produto_insumo_id, quantidade_por_unidade)
SELECT (SELECT id FROM produtos WHERE codigo = 'FAB-MODULO-AJUSTADO'), (SELECT id FROM produtos WHERE codigo = 'INS-MDF-LAT-217-44.5'), 2
ON CONFLICT (produto_fabricado_id, produto_insumo_id) DO UPDATE SET quantidade_por_unidade = EXCLUDED.quantidade_por_unidade;

INSERT INTO bom (produto_fabricado_id, produto_insumo_id, quantidade_por_unidade)
SELECT (SELECT id FROM produtos WHERE codigo = 'FAB-MODULO-AJUSTADO'), (SELECT id FROM produtos WHERE codigo = 'INS-MDF-POR-202-29.5'), 2
ON CONFLICT (produto_fabricado_id, produto_insumo_id) DO UPDATE SET quantidade_por_unidade = EXCLUDED.quantidade_por_unidade;

INSERT INTO bom (produto_fabricado_id, produto_insumo_id, quantidade_por_unidade)
SELECT (SELECT id FROM produtos WHERE codigo = 'FAB-MODULO-AJUSTADO'), (SELECT id FROM produtos WHERE codigo = 'INS-MDF-PRAT-58-44.5'), 6
ON CONFLICT (produto_fabricado_id, produto_insumo_id) DO UPDATE SET quantidade_por_unidade = EXCLUDED.quantidade_por_unidade;

INSERT INTO bom (produto_fabricado_id, produto_insumo_id, quantidade_por_unidade)
SELECT (SELECT id FROM produtos WHERE codigo = 'FAB-MODULO-AJUSTADO'), (SELECT id FROM produtos WHERE codigo = 'INS-MDF-BAND-58-7'), 4
ON CONFLICT (produto_fabricado_id, produto_insumo_id) DO UPDATE SET quantidade_por_unidade = EXCLUDED.quantidade_por_unidade;

INSERT INTO bom (produto_fabricado_id, produto_insumo_id, quantidade_por_unidade)
SELECT (SELECT id FROM produtos WHERE codigo = 'FAB-MODULO-AJUSTADO'), (SELECT id FROM produtos WHERE codigo = 'INS-FUNDO-HDF-60.5-203'), 1
ON CONFLICT (produto_fabricado_id, produto_insumo_id) DO UPDATE SET quantidade_por_unidade = EXCLUDED.quantidade_por_unidade;

INSERT INTO bom (produto_fabricado_id, produto_insumo_id, quantidade_por_unidade)
SELECT (SELECT id FROM produtos WHERE codigo = 'FAB-MODULO-AJUSTADO'), (SELECT id FROM produtos WHERE codigo = 'INS-PE-CANTONEIRA'), 4
ON CONFLICT (produto_fabricado_id, produto_insumo_id) DO UPDATE SET quantidade_por_unidade = EXCLUDED.quantidade_por_unidade;

-- 10) BOM – Multiuso 1 Porta
INSERT INTO bom (produto_fabricado_id, produto_insumo_id, quantidade_por_unidade)
SELECT (SELECT id FROM produtos WHERE codigo = 'FAB-MULTIUSO-1P'), (SELECT id FROM produtos WHERE codigo = 'INS-PAR-35-35'), 12
ON CONFLICT (produto_fabricado_id, produto_insumo_id) DO UPDATE SET quantidade_por_unidade = EXCLUDED.quantidade_por_unidade;

INSERT INTO bom (produto_fabricado_id, produto_insumo_id, quantidade_por_unidade)
SELECT (SELECT id FROM produtos WHERE codigo = 'FAB-MULTIUSO-1P'), (SELECT id FROM produtos WHERE codigo = 'INS-PAR-35-12'), 36
ON CONFLICT (produto_fabricado_id, produto_insumo_id) DO UPDATE SET quantidade_por_unidade = EXCLUDED.quantidade_por_unidade;

INSERT INTO bom (produto_fabricado_id, produto_insumo_id, quantidade_por_unidade)
SELECT (SELECT id FROM produtos WHERE codigo = 'FAB-MULTIUSO-1P'), (SELECT id FROM produtos WHERE codigo = 'INS-PAR-35-30'), 2
ON CONFLICT (produto_fabricado_id, produto_insumo_id) DO UPDATE SET quantidade_por_unidade = EXCLUDED.quantidade_por_unidade;

INSERT INTO bom (produto_fabricado_id, produto_insumo_id, quantidade_por_unidade)
SELECT (SELECT id FROM produtos WHERE codigo = 'FAB-MULTIUSO-1P'), (SELECT id FROM produtos WHERE codigo = 'INS-PAR-35-25'), 4
ON CONFLICT (produto_fabricado_id, produto_insumo_id) DO UPDATE SET quantidade_por_unidade = EXCLUDED.quantidade_por_unidade;

INSERT INTO bom (produto_fabricado_id, produto_insumo_id, quantidade_por_unidade)
SELECT (SELECT id FROM produtos WHERE codigo = 'FAB-MULTIUSO-1P'), (SELECT id FROM produtos WHERE codigo = 'INS-CANTONEIRA'), 12
ON CONFLICT (produto_fabricado_id, produto_insumo_id) DO UPDATE SET quantidade_por_unidade = EXCLUDED.quantidade_por_unidade;

INSERT INTO bom (produto_fabricado_id, produto_insumo_id, quantidade_por_unidade)
SELECT (SELECT id FROM produtos WHERE codigo = 'FAB-MULTIUSO-1P'), (SELECT id FROM produtos WHERE codigo = 'INS-DOBRADICA'), 3
ON CONFLICT (produto_fabricado_id, produto_insumo_id) DO UPDATE SET quantidade_por_unidade = EXCLUDED.quantidade_por_unidade;

INSERT INTO bom (produto_fabricado_id, produto_insumo_id, quantidade_por_unidade)
SELECT (SELECT id FROM produtos WHERE codigo = 'FAB-MULTIUSO-1P'), (SELECT id FROM produtos WHERE codigo = 'INS-PUXADOR'), 1
ON CONFLICT (produto_fabricado_id, produto_insumo_id) DO UPDATE SET quantidade_por_unidade = EXCLUDED.quantidade_por_unidade;

INSERT INTO bom (produto_fabricado_id, produto_insumo_id, quantidade_por_unidade)
SELECT (SELECT id FROM produtos WHERE codigo = 'FAB-MULTIUSO-1P'), (SELECT id FROM produtos WHERE codigo = 'INS-MDF-LAT-171-35'), 2
ON CONFLICT (produto_fabricado_id, produto_insumo_id) DO UPDATE SET quantidade_por_unidade = EXCLUDED.quantidade_por_unidade;

INSERT INTO bom (produto_fabricado_id, produto_insumo_id, quantidade_por_unidade)
SELECT (SELECT id FROM produtos WHERE codigo = 'FAB-MULTIUSO-1P'), (SELECT id FROM produtos WHERE codigo = 'INS-MDF-POR-170-35'), 1
ON CONFLICT (produto_fabricado_id, produto_insumo_id) DO UPDATE SET quantidade_por_unidade = EXCLUDED.quantidade_por_unidade;

INSERT INTO bom (produto_fabricado_id, produto_insumo_id, quantidade_por_unidade)
SELECT (SELECT id FROM produtos WHERE codigo = 'FAB-MULTIUSO-1P'), (SELECT id FROM produtos WHERE codigo = 'INS-MDF-PRAT-33.5-35'), 5
ON CONFLICT (produto_fabricado_id, produto_insumo_id) DO UPDATE SET quantidade_por_unidade = EXCLUDED.quantidade_por_unidade;

INSERT INTO bom (produto_fabricado_id, produto_insumo_id, quantidade_por_unidade)
SELECT (SELECT id FROM produtos WHERE codigo = 'FAB-MULTIUSO-1P'), (SELECT id FROM produtos WHERE codigo = 'INS-FUNDO-HDF-35.8-171'), 1
ON CONFLICT (produto_fabricado_id, produto_insumo_id) DO UPDATE SET quantidade_por_unidade = EXCLUDED.quantidade_por_unidade;

INSERT INTO bom (produto_fabricado_id, produto_insumo_id, quantidade_por_unidade)
SELECT (SELECT id FROM produtos WHERE codigo = 'FAB-MULTIUSO-1P'), (SELECT id FROM produtos WHERE codigo = 'INS-PE-REDONDO-FIXO'), 4
ON CONFLICT (produto_fabricado_id, produto_insumo_id) DO UPDATE SET quantidade_por_unidade = EXCLUDED.quantidade_por_unidade;

-- 11) BOM – Multiuso 2 Portas
INSERT INTO bom (produto_fabricado_id, produto_insumo_id, quantidade_por_unidade)
SELECT (SELECT id FROM produtos WHERE codigo = 'FAB-MULTIUSO-2P'), (SELECT id FROM produtos WHERE codigo = 'INS-PAR-35-35'), 10
ON CONFLICT (produto_fabricado_id, produto_insumo_id) DO UPDATE SET quantidade_por_unidade = EXCLUDED.quantidade_por_unidade;

INSERT INTO bom (produto_fabricado_id, produto_insumo_id, quantidade_por_unidade)
SELECT (SELECT id FROM produtos WHERE codigo = 'FAB-MULTIUSO-2P'), (SELECT id FROM produtos WHERE codigo = 'INS-PAR-35-12'), 48
ON CONFLICT (produto_fabricado_id, produto_insumo_id) DO UPDATE SET quantidade_por_unidade = EXCLUDED.quantidade_por_unidade;

INSERT INTO bom (produto_fabricado_id, produto_insumo_id, quantidade_por_unidade)
SELECT (SELECT id FROM produtos WHERE codigo = 'FAB-MULTIUSO-2P'), (SELECT id FROM produtos WHERE codigo = 'INS-PAR-35-30'), 4
ON CONFLICT (produto_fabricado_id, produto_insumo_id) DO UPDATE SET quantidade_por_unidade = EXCLUDED.quantidade_por_unidade;

INSERT INTO bom (produto_fabricado_id, produto_insumo_id, quantidade_por_unidade)
SELECT (SELECT id FROM produtos WHERE codigo = 'FAB-MULTIUSO-2P'), (SELECT id FROM produtos WHERE codigo = 'INS-PAR-40-45'), 4
ON CONFLICT (produto_fabricado_id, produto_insumo_id) DO UPDATE SET quantidade_por_unidade = EXCLUDED.quantidade_por_unidade;

INSERT INTO bom (produto_fabricado_id, produto_insumo_id, quantidade_por_unidade)
SELECT (SELECT id FROM produtos WHERE codigo = 'FAB-MULTIUSO-2P'), (SELECT id FROM produtos WHERE codigo = 'INS-CANTONEIRA'), 12
ON CONFLICT (produto_fabricado_id, produto_insumo_id) DO UPDATE SET quantidade_por_unidade = EXCLUDED.quantidade_por_unidade;

INSERT INTO bom (produto_fabricado_id, produto_insumo_id, quantidade_por_unidade)
SELECT (SELECT id FROM produtos WHERE codigo = 'FAB-MULTIUSO-2P'), (SELECT id FROM produtos WHERE codigo = 'INS-DOBRADICA'), 4
ON CONFLICT (produto_fabricado_id, produto_insumo_id) DO UPDATE SET quantidade_por_unidade = EXCLUDED.quantidade_por_unidade;

INSERT INTO bom (produto_fabricado_id, produto_insumo_id, quantidade_por_unidade)
SELECT (SELECT id FROM produtos WHERE codigo = 'FAB-MULTIUSO-2P'), (SELECT id FROM produtos WHERE codigo = 'INS-PUXADOR'), 2
ON CONFLICT (produto_fabricado_id, produto_insumo_id) DO UPDATE SET quantidade_por_unidade = EXCLUDED.quantidade_por_unidade;

INSERT INTO bom (produto_fabricado_id, produto_insumo_id, quantidade_por_unidade)
SELECT (SELECT id FROM produtos WHERE codigo = 'FAB-MULTIUSO-2P'), (SELECT id FROM produtos WHERE codigo = 'INS-MDF-LAT-101.5-35'), 2
ON CONFLICT (produto_fabricado_id, produto_insumo_id) DO UPDATE SET quantidade_por_unidade = EXCLUDED.quantidade_por_unidade;

INSERT INTO bom (produto_fabricado_id, produto_insumo_id, quantidade_por_unidade)
SELECT (SELECT id FROM produtos WHERE codigo = 'FAB-MULTIUSO-2P'), (SELECT id FROM produtos WHERE codigo = 'INS-MDF-POR-101-29.5'), 2
ON CONFLICT (produto_fabricado_id, produto_insumo_id) DO UPDATE SET quantidade_por_unidade = EXCLUDED.quantidade_por_unidade;

INSERT INTO bom (produto_fabricado_id, produto_insumo_id, quantidade_por_unidade)
SELECT (SELECT id FROM produtos WHERE codigo = 'FAB-MULTIUSO-2P'), (SELECT id FROM produtos WHERE codigo = 'INS-MDF-PRAT-58-35'), 4
ON CONFLICT (produto_fabricado_id, produto_insumo_id) DO UPDATE SET quantidade_por_unidade = EXCLUDED.quantidade_por_unidade;

INSERT INTO bom (produto_fabricado_id, produto_insumo_id, quantidade_por_unidade)
SELECT (SELECT id FROM produtos WHERE codigo = 'FAB-MULTIUSO-2P'), (SELECT id FROM produtos WHERE codigo = 'INS-MDF-BAND-58-7'), 2
ON CONFLICT (produto_fabricado_id, produto_insumo_id) DO UPDATE SET quantidade_por_unidade = EXCLUDED.quantidade_por_unidade;

INSERT INTO bom (produto_fabricado_id, produto_insumo_id, quantidade_por_unidade)
SELECT (SELECT id FROM produtos WHERE codigo = 'FAB-MULTIUSO-2P'), (SELECT id FROM produtos WHERE codigo = 'INS-FUNDO-HDF-60.5-101'), 1
ON CONFLICT (produto_fabricado_id, produto_insumo_id) DO UPDATE SET quantidade_por_unidade = EXCLUDED.quantidade_por_unidade;

INSERT INTO bom (produto_fabricado_id, produto_insumo_id, quantidade_por_unidade)
SELECT (SELECT id FROM produtos WHERE codigo = 'FAB-MULTIUSO-2P'), (SELECT id FROM produtos WHERE codigo = 'INS-PE-REGULAVEL'), 4
ON CONFLICT (produto_fabricado_id, produto_insumo_id) DO UPDATE SET quantidade_por_unidade = EXCLUDED.quantidade_por_unidade;
