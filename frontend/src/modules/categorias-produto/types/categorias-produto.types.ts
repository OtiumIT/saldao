export interface CategoriaProduto {
  id: string;
  nome: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoriaProdutoRequest {
  nome: string;
}

export interface UpdateCategoriaProdutoRequest {
  nome?: string;
}
