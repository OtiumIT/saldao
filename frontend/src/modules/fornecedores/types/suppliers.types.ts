export type TipoFornecedor = 'insumos' | 'revenda';

export interface Fornecedor {
  id: string;
  nome: string;
  fone: string | null;
  email: string | null;
  contato: string | null;
  observacoes: string | null;
  tipo: TipoFornecedor | null;
  created_at: string;
  updated_at: string;
}

export interface CreateFornecedorRequest {
  nome: string;
  fone?: string;
  email?: string;
  contato?: string;
  observacoes?: string;
  tipo?: TipoFornecedor | null;
}

export interface UpdateFornecedorRequest {
  nome?: string;
  fone?: string;
  email?: string;
  contato?: string;
  observacoes?: string;
  tipo?: TipoFornecedor | null;
}
