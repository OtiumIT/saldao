export type TipoCliente = 'externo' | 'loja';

export interface Cliente {
  id: string;
  nome: string;
  fone: string | null;
  email: string | null;
  endereco_entrega: string | null;
  tipo: TipoCliente;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateClienteRequest {
  nome: string;
  fone?: string;
  email?: string;
  endereco_entrega?: string;
  tipo?: TipoCliente;
  observacoes?: string;
}

export interface UpdateClienteRequest {
  nome?: string;
  fone?: string;
  email?: string;
  endereco_entrega?: string;
  tipo?: TipoCliente;
  observacoes?: string;
}
