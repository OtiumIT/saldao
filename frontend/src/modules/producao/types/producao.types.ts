export interface BomRow {
  id: string;
  produto_fabricado_id: string;
  produto_insumo_id: string;
  quantidade_por_unidade: number;
  created_at: string;
}

export interface BomComInsumo extends BomRow {
  insumo_codigo?: string;
  insumo_descricao?: string;
}

export interface OrdemProducao {
  id: string;
  produto_fabricado_id: string;
  quantidade: number;
  data_ordem: string;
  status: 'pendente' | 'concluida';
  observacao: string | null;
  cor_id: string | null;
  created_at: string;
}

export interface OrdemComProduto extends OrdemProducao {
  produto_codigo?: string;
  produto_descricao?: string;
  cor_nome?: string | null;
}

export type TipoItemProducao = 'fabricado' | 'kit';

export interface OrdemProducaoItem {
  id: string;
  ordem_id: string;
  produto_id: string;
  tipo: TipoItemProducao;
  quantidade: number;
  produto_codigo?: string;
  produto_descricao?: string;
}

export interface CreateOrdemItem {
  produto_id: string;
  tipo: TipoItemProducao;
  quantidade: number;
}

export interface CreateOrdemRequest {
  produto_fabricado_id?: string;
  quantidade?: number;
  data_ordem?: string;
  observacao?: string | null;
  cor_id?: string | null;
  itens?: CreateOrdemItem[];
}

export interface InsumoFaltando {
  produto_id: string;
  codigo?: string;
  descricao?: string;
  saldo_necessario: number;
  saldo_na_cor: number;
}

export interface ConferenciaEstoquePorCorResult {
  disponivel_na_cor: boolean;
  insumos_faltando: InsumoFaltando[];
  cores_com_estoque: Array<{ cor_id: string; nome: string }>;
}

export interface QuantidadePossivel {
  quantidade: number;
  insumo_gargalo_id: string | null;
  insumo_gargalo_codigo: string | null;
}
