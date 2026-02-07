export type TipoProduto = 'revenda' | 'insumos' | 'fabricado';

export type TipoItemProducao = 'fabricado' | 'kit';

export interface Produto {
  id: string;
  codigo: string;
  descricao: string;
  unidade: string;
  tipo: TipoProduto;
  /** Controle de estoque por cor (chapas) */
  controlar_por_cor?: boolean;
  /** Para produtos tipo fabricado: 'fabricado' ou 'kit' (kit opcional não dá entrada em estoque) */
  tipo_item_producao?: TipoItemProducao | null;
  /** Média de dias para entrega quando sem estoque (sugestão na venda) */
  prazo_medio_entrega_dias?: number | null;
  preco_compra: number;
  preco_venda: number;
  estoque_minimo: number;
  estoque_maximo: number | null;
  fornecedor_principal_id: string | null;
  /** IDs dos fornecedores vinculados ao produto */
  fornecedores_ids?: string[];
  categoria_id: string | null;
  /** Dimensões montado (para roteirização) */
  montado_comprimento_m: number | null;
  montado_largura_m: number | null;
  montado_altura_m: number | null;
  montado_peso_kg: number | null;
  /** Dimensões desmontado / em caixas (para roteirização) */
  desmontado_comprimento_m: number | null;
  desmontado_largura_m: number | null;
  desmontado_altura_m: number | null;
  desmontado_peso_kg: number | null;
  created_at: string;
  updated_at: string;
}

export interface ProdutoComSaldo extends Produto {
  saldo: number;
}

export interface CreateProdutoRequest {
  codigo: string;
  descricao: string;
  unidade?: string;
  tipo: TipoProduto;
  preco_compra?: number;
  preco_venda?: number;
  estoque_minimo?: number;
  estoque_maximo?: number | null;
  fornecedor_principal_id?: string | null;
  fornecedores_ids?: string[] | null;
  categoria_id?: string | null;
  montado_comprimento_m?: number | null;
  montado_largura_m?: number | null;
  montado_altura_m?: number | null;
  montado_peso_kg?: number | null;
  desmontado_comprimento_m?: number | null;
  desmontado_largura_m?: number | null;
  desmontado_altura_m?: number | null;
  desmontado_peso_kg?: number | null;
  /** Média de dias para entrega quando sem estoque (sugestão na venda) */
  prazo_medio_entrega_dias?: number | null;
}

export interface UpdateProdutoRequest {
  codigo?: string;
  descricao?: string;
  unidade?: string;
  tipo?: TipoProduto;
  preco_compra?: number;
  preco_venda?: number;
  estoque_minimo?: number;
  estoque_maximo?: number | null;
  fornecedor_principal_id?: string | null;
  fornecedores_ids?: string[] | null;
  categoria_id?: string | null;
  montado_comprimento_m?: number | null;
  montado_largura_m?: number | null;
  montado_altura_m?: number | null;
  montado_peso_kg?: number | null;
  desmontado_comprimento_m?: number | null;
  desmontado_largura_m?: number | null;
  desmontado_altura_m?: number | null;
  desmontado_peso_kg?: number | null;
  prazo_medio_entrega_dias?: number | null;
}

export type TipoMovimentacao = 'entrada' | 'saida' | 'ajuste' | 'producao';

export interface MovimentacaoEstoque {
  id: string;
  data: string;
  tipo: TipoMovimentacao;
  produto_id: string;
  quantidade: number;
  origem_tipo: string | null;
  origem_id: string | null;
  observacao: string | null;
  created_at: string;
}

export interface MovimentacaoComProduto extends MovimentacaoEstoque {
  produto_codigo?: string;
  produto_descricao?: string;
  cor_id?: string | null;
  cor_nome?: string | null;
}

export interface SaldoPorCor {
  cor_id: string;
  cor_nome: string;
  quantidade: number;
}
