export type LocalCusto = 'fabrica' | 'loja' | 'comum';

export interface CategoriaCustoOperacional {
  id: string;
  nome: string;
  descricao: string | null;
  local: LocalCusto;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustoOperacional {
  id: string;
  categoria_id: string;
  ano: number;
  mes: number;
  valor_planejado: number;
  valor_realizado: number | null;
  observacao: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustoOperacionalComCategoria extends CustoOperacional {
  categoria_nome?: string;
  categoria_local?: LocalCusto;
}

export interface CreateCategoriaRequest {
  nome: string;
  descricao?: string | null;
  local?: LocalCusto;
  ativo?: boolean;
}

export interface UpdateCategoriaRequest {
  nome?: string;
  descricao?: string | null;
  local?: LocalCusto;
  ativo?: boolean;
}

export interface CustosMesResponse {
  data: CustoOperacionalComCategoria[];
  totais: { total_planejado: number; total_realizado: number | null };
}

export interface UpsertCustosMesRequest {
  ano: number;
  mes: number;
  itens: Array<{
    categoria_id: string;
    valor_planejado?: number;
    valor_realizado?: number | null;
    observacao?: string | null;
  }>;
}
