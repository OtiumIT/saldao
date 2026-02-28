export type TipoOpcaoEntrega = 'fixo' | 'por_andar';

export interface OpcaoEntrega {
  id: string;
  nome: string;
  tipo: TipoOpcaoEntrega;
  valor_fixo: number | null;
  valor_por_andar: number | null;
  ordem: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateOpcaoEntregaRequest {
  nome: string;
  tipo: TipoOpcaoEntrega;
  valor_fixo?: number | null;
  valor_por_andar?: number | null;
  ordem?: number;
  ativo?: boolean;
}

export type UpdateOpcaoEntregaRequest = Partial<CreateOpcaoEntregaRequest>;
