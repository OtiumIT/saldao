-- Categorias de custo operacional (Fábrica e Loja) – seed inicial
-- Contas de água, luz, telefone, aluguel etc. para viabilidade por unidade.

-- Comum (rateio entre Fábrica e Loja)
INSERT INTO categorias_custo_operacional (nome, descricao, local, ativo)
SELECT 'Internet', 'Provedor de internet / link', 'comum', true
WHERE NOT EXISTS (SELECT 1 FROM categorias_custo_operacional WHERE nome = 'Internet');

INSERT INTO categorias_custo_operacional (nome, descricao, local, ativo)
SELECT 'Telefone fixo', 'Linha fixa / celular corporativo (quando único)', 'comum', true
WHERE NOT EXISTS (SELECT 1 FROM categorias_custo_operacional WHERE nome = 'Telefone fixo');

INSERT INTO categorias_custo_operacional (nome, descricao, local, ativo)
SELECT 'Contador / assessoria', 'Honorários contábeis e fiscais', 'comum', true
WHERE NOT EXISTS (SELECT 1 FROM categorias_custo_operacional WHERE nome = 'Contador / assessoria');

INSERT INTO categorias_custo_operacional (nome, descricao, local, ativo)
SELECT 'Material de escritório', 'Papel, caneta, material de expediente', 'comum', true
WHERE NOT EXISTS (SELECT 1 FROM categorias_custo_operacional WHERE nome = 'Material de escritório');

INSERT INTO categorias_custo_operacional (nome, descricao, local, ativo)
SELECT 'Seguros', 'Seguro predial, seguro de equipamentos etc.', 'comum', true
WHERE NOT EXISTS (SELECT 1 FROM categorias_custo_operacional WHERE nome = 'Seguros');

-- Fábrica
INSERT INTO categorias_custo_operacional (nome, descricao, local, ativo)
SELECT 'Aluguel (Fábrica)', 'Aluguel do imóvel da fábrica', 'fabrica', true
WHERE NOT EXISTS (SELECT 1 FROM categorias_custo_operacional WHERE nome = 'Aluguel (Fábrica)');

INSERT INTO categorias_custo_operacional (nome, descricao, local, ativo)
SELECT 'Água (Fábrica)', 'Conta de água da fábrica', 'fabrica', true
WHERE NOT EXISTS (SELECT 1 FROM categorias_custo_operacional WHERE nome = 'Água (Fábrica)');

INSERT INTO categorias_custo_operacional (nome, descricao, local, ativo)
SELECT 'Luz (Fábrica)', 'Conta de energia elétrica da fábrica', 'fabrica', true
WHERE NOT EXISTS (SELECT 1 FROM categorias_custo_operacional WHERE nome = 'Luz (Fábrica)');

INSERT INTO categorias_custo_operacional (nome, descricao, local, ativo)
SELECT 'Gás (Fábrica)', 'Gás de cozinha ou industrial (fábrica)', 'fabrica', true
WHERE NOT EXISTS (SELECT 1 FROM categorias_custo_operacional WHERE nome = 'Gás (Fábrica)');

INSERT INTO categorias_custo_operacional (nome, descricao, local, ativo)
SELECT 'Telefone (Fábrica)', 'Linha/plano da fábrica (se separado)', 'fabrica', true
WHERE NOT EXISTS (SELECT 1 FROM categorias_custo_operacional WHERE nome = 'Telefone (Fábrica)');

INSERT INTO categorias_custo_operacional (nome, descricao, local, ativo)
SELECT 'Manutenção e conservação (Fábrica)', 'Reparos, pintura, conservação do prédio e máquinas', 'fabrica', true
WHERE NOT EXISTS (SELECT 1 FROM categorias_custo_operacional WHERE nome = 'Manutenção e conservação (Fábrica)');

INSERT INTO categorias_custo_operacional (nome, descricao, local, ativo)
SELECT 'Material de limpeza (Fábrica)', 'Produtos de limpeza da fábrica', 'fabrica', true
WHERE NOT EXISTS (SELECT 1 FROM categorias_custo_operacional WHERE nome = 'Material de limpeza (Fábrica)');

INSERT INTO categorias_custo_operacional (nome, descricao, local, ativo)
SELECT 'IPTU (Fábrica)', 'IPTU do imóvel da fábrica (se próprio)', 'fabrica', true
WHERE NOT EXISTS (SELECT 1 FROM categorias_custo_operacional WHERE nome = 'IPTU (Fábrica)');

INSERT INTO categorias_custo_operacional (nome, descricao, local, ativo)
SELECT 'Condomínio (Fábrica)', 'Condomínio do imóvel da fábrica (se aplicável)', 'fabrica', true
WHERE NOT EXISTS (SELECT 1 FROM categorias_custo_operacional WHERE nome = 'Condomínio (Fábrica)');

-- Loja
INSERT INTO categorias_custo_operacional (nome, descricao, local, ativo)
SELECT 'Aluguel (Loja)', 'Aluguel do imóvel da loja', 'loja', true
WHERE NOT EXISTS (SELECT 1 FROM categorias_custo_operacional WHERE nome = 'Aluguel (Loja)');

INSERT INTO categorias_custo_operacional (nome, descricao, local, ativo)
SELECT 'Água (Loja)', 'Conta de água da loja', 'loja', true
WHERE NOT EXISTS (SELECT 1 FROM categorias_custo_operacional WHERE nome = 'Água (Loja)');

INSERT INTO categorias_custo_operacional (nome, descricao, local, ativo)
SELECT 'Luz (Loja)', 'Conta de energia elétrica da loja', 'loja', true
WHERE NOT EXISTS (SELECT 1 FROM categorias_custo_operacional WHERE nome = 'Luz (Loja)');

INSERT INTO categorias_custo_operacional (nome, descricao, local, ativo)
SELECT 'Telefone (Loja)', 'Linha/plano da loja (se separado)', 'loja', true
WHERE NOT EXISTS (SELECT 1 FROM categorias_custo_operacional WHERE nome = 'Telefone (Loja)');

INSERT INTO categorias_custo_operacional (nome, descricao, local, ativo)
SELECT 'Manutenção e conservação (Loja)', 'Reparos, pintura, conservação da loja', 'loja', true
WHERE NOT EXISTS (SELECT 1 FROM categorias_custo_operacional WHERE nome = 'Manutenção e conservação (Loja)');

INSERT INTO categorias_custo_operacional (nome, descricao, local, ativo)
SELECT 'Material de limpeza (Loja)', 'Produtos de limpeza da loja', 'loja', true
WHERE NOT EXISTS (SELECT 1 FROM categorias_custo_operacional WHERE nome = 'Material de limpeza (Loja)');

INSERT INTO categorias_custo_operacional (nome, descricao, local, ativo)
SELECT 'IPTU (Loja)', 'IPTU do imóvel da loja (se próprio)', 'loja', true
WHERE NOT EXISTS (SELECT 1 FROM categorias_custo_operacional WHERE nome = 'IPTU (Loja)');

INSERT INTO categorias_custo_operacional (nome, descricao, local, ativo)
SELECT 'Condomínio (Loja)', 'Condomínio do imóvel da loja (se aplicável)', 'loja', true
WHERE NOT EXISTS (SELECT 1 FROM categorias_custo_operacional WHERE nome = 'Condomínio (Loja)');
