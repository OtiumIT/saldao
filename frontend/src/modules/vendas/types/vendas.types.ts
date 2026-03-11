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
  /** Latitude do endereço de entrega (geocode). */
  endereco_lat?: number | null;
  /** Longitude do endereço de entrega (geocode). */
  endereco_lon?: number | null;
  /** Bairro/região de entrega (reverse geocode). Usado para agrupar por zona. */
  zona_entrega?: string | null;
  /** Micro-região de entrega (ex.: Leste 1, Leste 2). Mapeado de subprefeitura SP. */
  micro_regiao_entrega?: string | null;
  observacoes: string | null;
  total: number;
  /** Promessa de entrega em X dias quando há item sem estoque */
  previsao_entrega_em_dias: number | null;
  /** Distância em km para cálculo do frete */
  distancia_km: number | null;
  /** Valor do frete (total = itens + valor_frete [+ taxa parcelamento]) */
  valor_frete: number | null;
  /** Soma dos extras de entrega (portaria, elevador, escadas, etc.) */
  valor_extras_entrega?: number | null;
  /** Valor em R$ do campo "Outros extras" */
  valor_extras_livre?: number | null;
  /** Número de parcelas no cartão (null = à vista). Total já inclui taxa quando > 1. */
  parcelas: number | null;
  /** Taxa % aplicada no parcelamento (armazenada no momento da venda). */
  taxa_parcelamento_percentual: number | null;
  created_at: string;
  updated_at: string;
}

export interface PedidoVendaComCliente extends PedidoVenda {
  cliente_nome?: string | null;
  /** Telefone/WhatsApp do cliente (para enviar resumo) */
  cliente_fone?: string | null;
  /** CEP do cliente (endereço de entrega) */
  cliente_cep?: string | null;
}

export interface PedidoVendaComItens extends PedidoVendaComCliente {
  itens: ItemPedidoVendaComProduto[];
}

export interface OpcaoEntregaSelecionada {
  opcao_id: string;
  andar?: number;
}

export interface CreatePedidoVendaRequest {
  cliente_id?: string | null;
  data_pedido?: string;
  tipo_entrega: TipoEntrega;
  endereco_entrega?: string | null;
  /** CEP do cliente (para atualizar cadastro ao criar venda com entrega) */
  cliente_cep?: string | null;
  observacoes?: string | null;
  /** Quando há item sem estoque, informe a previsão de entrega em dias (ex.: 7) */
  previsao_entrega_em_dias?: number | null;
  /** Distância em km (entrega). Usado para calcular valor_frete pela tabela. */
  distancia_km?: number | null;
  /** Valor do frete. Calculado pela faixa até 13 km; acima de 13 km informar manualmente. */
  valor_frete?: number | null;
  /** Opções de entrega selecionadas (portaria, elevador, escadas por andar, etc.) */
  opcoes_entrega_selecionadas?: OpcaoEntregaSelecionada[];
  /** Valor em R$ digitado no campo "Outros extras" */
  valor_extras_livre?: number | null;
  /** Número de parcelas no cartão (1 = à vista no cartão sem taxa; 2+ = parcelado com taxa). Null = à vista (outro meio). */
  parcelas?: number | null;
  /** Taxa % de parcelamento (aplicada sobre subtotal + frete). O total enviado deve já incluir a taxa. */
  taxa_parcelamento_percentual?: number | null;
  itens: Array<{ produto_id: string; quantidade: number; preco_unitario: number }>;
}
