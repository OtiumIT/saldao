export interface Cor {
  id: string;
  nome: string;
  codigo: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCorRequest {
  nome: string;
  codigo?: string | null;
}

export interface UpdateCorRequest {
  nome?: string;
  codigo?: string | null;
}
