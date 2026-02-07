export interface AvisoCompra {
  id: string;
  codigo: string;
  descricao: string;
  tipo: string;
  saldo: number;
  estoque_minimo: number;
  estoque_maximo: number | null;
  quantidade_sugerida: number;
  quantidade_sugerida_ia: number;
  consumo_medio_periodo: number;
  preco_compra: number;
  fornecedor_principal_id: string | null;
}
