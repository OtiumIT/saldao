export type StatusPedidoCompra = 'em_aberto' | 'recebido_parcial' | 'recebido';

export interface ItemPedidoCompra {
  id: string;
  pedido_compra_id: string;
  produto_id: string;
  quantidade: number;
  preco_unitario: number;
  total_item: number;
  quantidade_recebida: number;
  created_at: string;
}

export interface ItemPedidoCompraComProduto extends ItemPedidoCompra {
  produto_codigo?: string;
  produto_descricao?: string;
}

export type TipoPedidoCompra = 'pedido' | 'recepcao';

export interface PedidoCompra {
  id: string;
  fornecedor_id: string;
  data_pedido: string;
  status: StatusPedidoCompra;
  tipo: TipoPedidoCompra;
  data_prevista_entrega: string | null;
  observacoes: string | null;
  total: number;
  created_at: string;
  updated_at: string;
}

export interface PedidoCompraComFornecedor extends PedidoCompra {
  fornecedor_nome?: string;
}

export interface PedidoCompraComItens extends PedidoCompraComFornecedor {
  itens: ItemPedidoCompraComProduto[];
}

export interface CreatePedidoCompraRequest {
  fornecedor_id: string;
  data_pedido?: string;
  observacoes?: string | null;
  tipo?: TipoPedidoCompra;
  data_prevista_entrega?: string | null;
  itens: Array<{ produto_id: string; quantidade: number; preco_unitario: number }>;
}

export interface ReceberItemRequest {
  item_id: string;
  quantidade_recebida: number;
}
