export type TipoEntrega = 'retirada' | 'entrega';
export type StatusPedidoVenda = 'rascunho' | 'confirmado' | 'entregue' | 'cancelado';

export interface ItemPedidoVenda {
  id: string;
  pedido_venda_id: string;
  produto_id: string;
  quantidade: number;
  preco_unitario: number;
  total_item: number;
  created_at: string;
}

export interface ItemPedidoVendaComProduto extends ItemPedidoVenda {
  produto_codigo?: string;
  produto_descricao?: string;
}

export interface PedidoVenda {
  id: string;
  cliente_id: string | null;
  data_pedido: string;
  tipo_entrega: TipoEntrega;
  status: StatusPedidoVenda;
  endereco_entrega: string | null;
  observacoes: string | null;
  total: number;
  /** Promessa de entrega em X dias quando há item sem estoque */
  previsao_entrega_em_dias: number | null;
  /** Distância em km para cálculo do frete */
  distancia_km: number | null;
  /** Valor do frete (total = itens + valor_frete) */
  valor_frete: number | null;
  created_at: string;
  updated_at: string;
}

export interface PedidoVendaComCliente extends PedidoVenda {
  cliente_nome?: string | null;
}

export interface PedidoVendaComItens extends PedidoVendaComCliente {
  itens: ItemPedidoVendaComProduto[];
}

export interface CreatePedidoVendaRequest {
  cliente_id?: string | null;
  data_pedido?: string;
  tipo_entrega: TipoEntrega;
  endereco_entrega?: string | null;
  observacoes?: string | null;
  /** Quando há item sem estoque, informe a previsão de entrega em dias (ex.: 7) */
  previsao_entrega_em_dias?: number | null;
  /** Distância em km (entrega). Usado para calcular valor_frete pela tabela. */
  distancia_km?: number | null;
  /** Valor do frete. Calculado pela faixa até 13 km; acima de 13 km informar manualmente. */
  valor_frete?: number | null;
  itens: Array<{ produto_id: string; quantidade: number; preco_unitario: number }>;
}
