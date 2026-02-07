export interface Funcionario {
  id: string;
  nome: string;
  salario: number;
  dia_pagamento: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface PagamentoComFuncionario {
  id: string;
  funcionario_id: string;
  ano: number;
  mes: number;
  valor_pago: number;
  observacao: string | null;
  created_at: string;
  updated_at: string;
  funcionario_nome: string;
  funcionario_salario: number;
  funcionario_dia_pagamento: number;
}

export interface FolhaPeriodo {
  pagamentos: PagamentoComFuncionario[];
  total: number;
}

export interface CreateFuncionarioRequest {
  nome: string;
  salario: number;
  dia_pagamento?: number;
  ativo?: boolean;
}

export interface UpdateFuncionarioRequest {
  nome?: string;
  salario?: number;
  dia_pagamento?: number;
  ativo?: boolean;
}

export interface FolhaItemRequest {
  funcionario_id: string;
  valor_pago: number;
  observacao?: string | null;
}

export interface SaveFolhaRequest {
  ano: number;
  mes: number;
  itens: FolhaItemRequest[];
}
