export interface ContaPagar {
  id: string;
  descricao: string;
  valor: number;
  vencimento: string;
  status: 'pendente' | 'pago';
  forma_pagamento: string | null;
  pedido_compra_id: string | null;
  parcela_numero: number | null;
  created_at: string;
  updated_at: string;
  pago_em: string | null;
}

export interface ContaReceber {
  id: string;
  descricao: string;
  valor: number;
  vencimento: string;
  status: 'pendente' | 'recebido';
  forma_pagamento: string | null;
  pedido_venda_id: string | null;
  parcela_numero: number | null;
  created_at: string;
  updated_at: string;
  recebido_em: string | null;
}

export interface ResumoFinanceiro {
  total_a_pagar: number;
  total_a_receber: number;
  total_pago: number;
  total_recebido: number;
  pendente_pagar: number;
  pendente_receber: number;
}
