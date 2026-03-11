export type TipoCliente = 'externo' | 'loja';

export interface Cliente {
  id: string;
  nome: string;
  cpf: string | null;
  cnpj: string | null;
  fone: string | null;
  email: string | null;
  cep: string | null;
  endereco_entrega: string | null;
  tipo: TipoCliente;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

/** Cliente com estatísticas de vendas (compras do cliente na loja) */
export interface ClienteCompleto extends Cliente {
  data_ultima_compra: string | null;
  total_compras: number;
  total_gasto: number;
}

export interface CreateClienteRequest {
  nome: string;
  cpf?: string | null;
  cnpj?: string | null;
  fone?: string;
  email?: string;
  cep?: string | null;
  endereco_entrega?: string;
  tipo?: TipoCliente;
  observacoes?: string;
}

export interface UpdateClienteRequest {
  nome?: string;
  cpf?: string | null;
  cnpj?: string | null;
  fone?: string;
  email?: string;
  cep?: string | null;
  endereco_entrega?: string;
  tipo?: TipoCliente;
  observacoes?: string;
}
