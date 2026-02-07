-- Estrutura completa do banco – rodar no Supabase: SQL Editor → New query → colar → Run
-- === 001_clientes_fornecedores.sql ===
-- Saldão de Móveis Jerusalém – Cadastros base (Fase 0)
-- Executar em PostgreSQL (local ou remoto). Ordem: após auth/usuários se existirem.

-- Fornecedores (compras)
CREATE TABLE IF NOT EXISTS fornecedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  fone TEXT,
  email TEXT,
  contato TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clientes (vendas e entregas)
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  fone TEXT,
  email TEXT,
  endereco_entrega TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_fornecedores_nome ON fornecedores (nome);
CREATE INDEX IF NOT EXISTS idx_clientes_nome ON clientes (nome);

-- === 002_produtos_movimentacoes_estoque.sql ===
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

-- === 003_pedidos_compra.sql ===
-- Saldão de Móveis Jerusalém – Pedidos de compra (Fase 2)
-- Depende de: 001 (fornecedores), 002 (produtos)

CREATE TABLE IF NOT EXISTS pedidos_compra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fornecedor_id UUID NOT NULL REFERENCES fornecedores(id) ON DELETE RESTRICT,
  data_pedido DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'em_aberto' CHECK (status IN ('em_aberto', 'recebido_parcial', 'recebido')),
  observacoes TEXT,
  total NUMERIC(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS itens_pedido_compra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_compra_id UUID NOT NULL REFERENCES pedidos_compra(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE RESTRICT,
  quantidade NUMERIC(15,3) NOT NULL,
  preco_unitario NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_item NUMERIC(15,2) NOT NULL DEFAULT 0,
  quantidade_recebida NUMERIC(15,3) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pedidos_compra_fornecedor ON pedidos_compra (fornecedor_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_compra_data ON pedidos_compra (data_pedido);
CREATE INDEX IF NOT EXISTS idx_pedidos_compra_status ON pedidos_compra (status);
CREATE INDEX IF NOT EXISTS idx_itens_pedido_compra_pedido ON itens_pedido_compra (pedido_compra_id);

-- === 004_bom_ordens_producao.sql ===
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

-- === 005_pedidos_venda.sql ===
-- Saldão de Móveis Jerusalém – Pedidos de venda (Fase 5)
-- Depende de: 001 (clientes), 002 (produtos, movimentacoes_estoque)

CREATE TABLE IF NOT EXISTS pedidos_venda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  data_pedido DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo_entrega TEXT NOT NULL DEFAULT 'retirada' CHECK (tipo_entrega IN ('retirada', 'entrega')),
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'confirmado', 'entregue', 'cancelado')),
  endereco_entrega TEXT,
  observacoes TEXT,
  total NUMERIC(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS itens_pedido_venda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_venda_id UUID NOT NULL REFERENCES pedidos_venda(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE RESTRICT,
  quantidade NUMERIC(15,3) NOT NULL,
  preco_unitario NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_item NUMERIC(15,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pedidos_venda_cliente ON pedidos_venda (cliente_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_venda_data ON pedidos_venda (data_pedido);
CREATE INDEX IF NOT EXISTS idx_pedidos_venda_status ON pedidos_venda (status);
CREATE INDEX IF NOT EXISTS idx_itens_pedido_venda_pedido ON itens_pedido_venda (pedido_venda_id);

-- === 006_financeiro.sql ===
-- Saldão de Móveis Jerusalém – Financeiro (Fase 6)

CREATE TABLE IF NOT EXISTS contas_a_pagar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  descricao TEXT NOT NULL,
  valor NUMERIC(15,2) NOT NULL,
  vencimento DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago')),
  forma_pagamento TEXT,
  pedido_compra_id UUID REFERENCES pedidos_compra(id) ON DELETE SET NULL,
  parcela_numero INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  pago_em TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS contas_a_receber (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  descricao TEXT NOT NULL,
  valor NUMERIC(15,2) NOT NULL,
  vencimento DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'recebido')),
  forma_pagamento TEXT,
  pedido_venda_id UUID REFERENCES pedidos_venda(id) ON DELETE SET NULL,
  parcela_numero INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  recebido_em TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_contas_a_pagar_vencimento ON contas_a_pagar (vencimento);
CREATE INDEX IF NOT EXISTS idx_contas_a_pagar_status ON contas_a_pagar (status);
CREATE INDEX IF NOT EXISTS idx_contas_a_receber_vencimento ON contas_a_receber (vencimento);
CREATE INDEX IF NOT EXISTS idx_contas_a_receber_status ON contas_a_receber (status);

-- === 007_roteirizacao.sql ===
-- Saldão de Móveis Jerusalém – Roteirização (Fase 7)
-- Depende de: 005 (pedidos_venda)

CREATE TABLE IF NOT EXISTS veiculos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  placa TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  dias_entrega TEXT,
  horario_inicio TIME,
  horario_fim TIME,
  capacidade_volume NUMERIC(15,2),
  capacidade_itens INTEGER,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS entregas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_venda_id UUID NOT NULL REFERENCES pedidos_venda(id) ON DELETE CASCADE,
  veiculo_id UUID REFERENCES veiculos(id) ON DELETE SET NULL,
  data_entrega_prevista DATE,
  ordem_na_rota INTEGER,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_rota', 'entregue')),
  entregue_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_entregas_pedido ON entregas (pedido_venda_id);
CREATE INDEX IF NOT EXISTS idx_entregas_veiculo ON entregas (veiculo_id);
CREATE INDEX IF NOT EXISTS idx_entregas_data ON entregas (data_entrega_prevista);
CREATE INDEX IF NOT EXISTS idx_entregas_status ON entregas (status);

-- === 008_veiculos_dimensoes_inoperante.sql ===
-- Saldão de Móveis Jerusalém – Veículos: dimensões de carga e aviso inoperante
-- Depende de: 007 (veiculos)

ALTER TABLE veiculos ADD COLUMN IF NOT EXISTS inoperante BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE veiculos ADD COLUMN IF NOT EXISTS inoperante_desde TIMESTAMPTZ;
ALTER TABLE veiculos ADD COLUMN IF NOT EXISTS inoperante_motivo TEXT;
ALTER TABLE veiculos ADD COLUMN IF NOT EXISTS capacidade_peso_kg NUMERIC(12,2);
ALTER TABLE veiculos ADD COLUMN IF NOT EXISTS carga_comprimento_m NUMERIC(8,2);
ALTER TABLE veiculos ADD COLUMN IF NOT EXISTS carga_largura_m NUMERIC(8,2);
ALTER TABLE veiculos ADD COLUMN IF NOT EXISTS carga_altura_m NUMERIC(8,2);

-- === 009_clientes_tipo.sql ===
-- Saldão de Móveis Jerusalém – Clientes: tipo (externo | loja) para Loja como cliente da Fábrica
-- Ver LOJA_COMO_CLIENTE_FABRICA.md

ALTER TABLE clientes
  ADD COLUMN IF NOT EXISTS tipo TEXT NOT NULL DEFAULT 'externo'
  CHECK (tipo IN ('externo', 'loja'));

CREATE INDEX IF NOT EXISTS idx_clientes_tipo ON clientes (tipo);

COMMENT ON COLUMN clientes.tipo IS 'externo = consumidor final; loja = unidade própria (máx. um cliente tipo loja)';

-- === 009_produtos_dimensoes_roteirizacao.sql ===
-- Saldão de Móveis Jerusalém – Dimensões de produto (montado e desmontado) para roteirização
-- Depende de: 002 (produtos)
-- Produtos podem ser vendidos montados ou desmontados (em caixas). Cada um tem duas dimensões cadastradas.

ALTER TABLE produtos ADD COLUMN IF NOT EXISTS montado_comprimento_m NUMERIC(8,2);
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS montado_largura_m NUMERIC(8,2);
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS montado_altura_m NUMERIC(8,2);
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS montado_peso_kg NUMERIC(10,2);

ALTER TABLE produtos ADD COLUMN IF NOT EXISTS desmontado_comprimento_m NUMERIC(8,2);
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS desmontado_largura_m NUMERIC(8,2);
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS desmontado_altura_m NUMERIC(8,2);
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS desmontado_peso_kg NUMERIC(10,2);

-- === 010_custos_operacionais.sql ===
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

-- === 011_categorias_produto.sql ===
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

-- === 012_produtos_fornecedores.sql ===
-- Produtos podem ter vários fornecedores (N:N)
-- Mantém fornecedor_principal_id como o primeiro da lista (compatibilidade)

CREATE TABLE IF NOT EXISTS produtos_fornecedores (
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  fornecedor_id UUID NOT NULL REFERENCES fornecedores(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (produto_id, fornecedor_id)
);

CREATE INDEX IF NOT EXISTS idx_produtos_fornecedores_fornecedor ON produtos_fornecedores (fornecedor_id);
CREATE INDEX IF NOT EXISTS idx_produtos_fornecedores_produto ON produtos_fornecedores (produto_id);

-- Popular a partir do fornecedor_principal_id existente
INSERT INTO produtos_fornecedores (produto_id, fornecedor_id)
SELECT id, fornecedor_principal_id FROM produtos
WHERE fornecedor_principal_id IS NOT NULL
ON CONFLICT (produto_id, fornecedor_id) DO NOTHING;

-- === 013_fornecedores_tipo.sql ===
-- Tipo do fornecedor: insumos ou revenda (filtro e contexto)
ALTER TABLE fornecedores
  ADD COLUMN IF NOT EXISTS tipo TEXT CHECK (tipo IN ('insumos', 'revenda'));

COMMENT ON COLUMN fornecedores.tipo IS 'Insumos ou revenda - define o tipo de produto que o fornecedor vende';

CREATE INDEX IF NOT EXISTS idx_fornecedores_tipo ON fornecedores (tipo);

-- === 014_veiculos_motorista_whatsapp.sql ===
-- WhatsApp do motorista (para botões que abrem chat com mensagem pré-definida)
ALTER TABLE veiculos
  ADD COLUMN IF NOT EXISTS motorista_whatsapp TEXT;

COMMENT ON COLUMN veiculos.motorista_whatsapp IS 'Número do WhatsApp do motorista (ex: 5511999999999). Usado para links wa.me com mensagem.';

-- === 015_insumos_transcricao_audio.sql ===
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

-- === 016_funcionarios_folha_pagamento.sql ===
-- Funcionários: cadastro com salário e dia de pagamento
CREATE TABLE IF NOT EXISTS funcionarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  salario NUMERIC(15,2) NOT NULL DEFAULT 0,
  dia_pagamento INT NOT NULL DEFAULT 5 CHECK (dia_pagamento >= 1 AND dia_pagamento <= 28),
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_funcionarios_ativo ON funcionarios (ativo);

-- Pagamentos mensais (valor pode diferir do salário; se diferir, observação obrigatória na aplicação)
CREATE TABLE IF NOT EXISTS pagamentos_funcionarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funcionario_id UUID NOT NULL REFERENCES funcionarios(id) ON DELETE CASCADE,
  ano INT NOT NULL,
  mes INT NOT NULL CHECK (mes >= 1 AND mes <= 12),
  valor_pago NUMERIC(15,2) NOT NULL,
  observacao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (funcionario_id, ano, mes)
);

CREATE INDEX IF NOT EXISTS idx_pagamentos_funcionarios_periodo ON pagamentos_funcionarios (ano, mes);

-- Categoria de custo para folha (total lançado automaticamente pelos pagamentos)
INSERT INTO categorias_custo_operacional (nome, descricao, local, ativo)
SELECT 'Folha de pagamento', 'Salários e encargos dos funcionários', 'comum', true
WHERE NOT EXISTS (SELECT 1 FROM categorias_custo_operacional WHERE nome = 'Folha de pagamento');

-- === 017_categorias_custo_seed.sql ===
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

-- === 017_categorias_insumos_bom.sql ===
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

-- === 018_cores_estoque_por_cor.sql ===
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

-- === 019_ordens_itens_e_cor.sql ===
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

-- === 020_tipo_pedido_compra_prazo_entrega.sql ===
-- Dois tipos de pedido de compra: pedido (com prazo) e recepção (entrada direta)
-- Prazo médio de entrega no produto (para venda sem estoque)
-- Previsão de entrega no pedido de venda (vender sem estoque com prazo)

-- pedidos_compra: tipo (pedido | recepcao) e data prevista de entrega
ALTER TABLE pedidos_compra
  ADD COLUMN IF NOT EXISTS tipo TEXT NOT NULL DEFAULT 'pedido' CHECK (tipo IN ('pedido', 'recepcao'));

ALTER TABLE pedidos_compra
  ADD COLUMN IF NOT EXISTS data_prevista_entrega DATE;

COMMENT ON COLUMN pedidos_compra.tipo IS 'pedido = com prazo de entrega; recepcao = já comprou, só lançar entrada';
COMMENT ON COLUMN pedidos_compra.data_prevista_entrega IS 'Previsão de entrega (só para tipo=pedido)';

-- produtos: prazo médio para entrega quando sem estoque (dias)
ALTER TABLE produtos
  ADD COLUMN IF NOT EXISTS prazo_medio_entrega_dias INTEGER;

COMMENT ON COLUMN produtos.prazo_medio_entrega_dias IS 'Média de dias para entrega quando produto está sem estoque (sugestão na venda)';

-- pedidos_venda: previsão de entrega em dias (promessa ao cliente quando há item sem estoque)
ALTER TABLE pedidos_venda
  ADD COLUMN IF NOT EXISTS previsao_entrega_em_dias INTEGER;

COMMENT ON COLUMN pedidos_venda.previsao_entrega_em_dias IS 'Promessa de entrega em X dias (ex.: 7) quando venda tem item sem estoque';

CREATE INDEX IF NOT EXISTS idx_pedidos_compra_tipo ON pedidos_compra (tipo);
CREATE INDEX IF NOT EXISTS idx_pedidos_compra_data_prevista ON pedidos_compra (data_prevista_entrega) WHERE data_prevista_entrega IS NOT NULL;

-- === 021_frete_pedido_venda.sql ===
-- Frete na venda: distância (km) e valor do frete para cálculo do total

ALTER TABLE pedidos_venda
  ADD COLUMN IF NOT EXISTS distancia_km NUMERIC(8,2);

ALTER TABLE pedidos_venda
  ADD COLUMN IF NOT EXISTS valor_frete NUMERIC(15,2) DEFAULT 0;

COMMENT ON COLUMN pedidos_venda.distancia_km IS 'Distância em km para entrega (usado na tabela de frete)';
COMMENT ON COLUMN pedidos_venda.valor_frete IS 'Valor do frete (calculado pela faixa ou informado manualmente acima de 13 km). Total do pedido = itens + valor_frete.';

