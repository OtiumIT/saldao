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
