export interface OpcaoParcelamento {
  id: string;
  parcelas: number;
  taxa_percentual: number;
  created_at: string;
  updated_at: string;
}

export interface UpdateTaxaParcelamentoRequest {
  taxa_percentual: number;
}
