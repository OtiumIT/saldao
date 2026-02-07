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
