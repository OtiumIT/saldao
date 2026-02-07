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
