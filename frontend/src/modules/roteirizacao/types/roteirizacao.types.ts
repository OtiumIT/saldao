export interface Veiculo {
  id: string;
  nome: string;
  placa: string | null;
  ativo: boolean;
  dias_entrega: string | null;
  horario_inicio: string | null;
  horario_fim: string | null;
  capacidade_volume: number | null;
  capacidade_itens: number | null;
  observacoes: string | null;
  /** Número WhatsApp do motorista (ex: 5511999999999). Para links wa.me com mensagem. */
  motorista_whatsapp: string | null;
  inoperante: boolean;
  inoperante_desde: string | null;
  inoperante_motivo: string | null;
  capacidade_peso_kg: number | null;
  carga_comprimento_m: number | null;
  carga_largura_m: number | null;
  carga_altura_m: number | null;
  created_at: string;
  updated_at: string;
}

export interface Entrega {
  id: string;
  pedido_venda_id: string;
  veiculo_id: string | null;
  data_entrega_prevista: string | null;
  ordem_na_rota: number | null;
  status: 'pendente' | 'em_rota' | 'entregue';
  entregue_em: string | null;
  created_at: string;
}

export interface EntregaComPedido extends Entrega {
  cliente_nome?: string | null;
  endereco_entrega?: string | null;
  total?: number;
}
