/**
 * Repository de Avisos de Compra usando Supabase Data API (sem policies)
 * Substitui avisos-compra.repository.ts quando usando Data API
 * 
 * NOTA: Esta query complexa com CTE e JOINs precisa de uma RPC no Supabase.
 * Por enquanto, fazemos múltiplas queries e combinamos no código.
 */
import type { Env } from '../../types/worker-env.js';
import { getDataClient, db } from '../../db/data-api.js';
import type { AvisoCompra } from './avisos-compra.repository.js';

const SEMANAS_HISTORICO = 8;
const DIAS_HISTORICO = SEMANAS_HISTORICO * 7;
const SEMANAS_COBERTURA = 2;

export async function listAbaixoMinimo(env: Env): Promise<AvisoCompra[]> {
  const client = getDataClient(env);
  
  // Buscar produtos revenda/insumos
  // Nota: Supabase pode ter problemas com array no filtro, então buscamos todos e filtramos
  const todosProdutos = await db.select<{
    id: string;
    codigo: string;
    descricao: string;
    tipo: string;
    estoque_minimo: number;
    estoque_maximo: number | null;
    preco_compra: number;
    fornecedor_principal_id: string | null;
  }>(client, 'produtos', {});
  
  // Filtrar por tipo em memória (revenda ou insumos)
  const produtos = todosProdutos.filter((p) => p.tipo === 'revenda' || p.tipo === 'insumos');

  // Buscar saldos de estoque
  const saldos = await db.select<{ produto_id: string; quantidade: number }>(
    client,
    'saldo_estoque',
    {
      filters: {
        produto_id: produtos.map((p) => p.id),
      },
    }
  );

  const saldosMap = new Map(saldos.map((s) => [s.produto_id, s.quantidade]));

  // Buscar consumo (saídas) dos últimos DIAS_HISTORICO dias
  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() - DIAS_HISTORICO);
  const movimentacoes = await db.select<{
    produto_id: string;
    quantidade: number;
    tipo: string;
    data: string;
  }>(client, 'movimentacoes_estoque', {
    filters: {
      tipo: ['saida', 'producao'],
      data: `>=${dataLimite.toISOString().split('T')[0]}`,
    },
  });

  // Calcular consumo por produto
  const consumoMap = new Map<string, number>();
  for (const mov of movimentacoes) {
    const atual = consumoMap.get(mov.produto_id) || 0;
    consumoMap.set(mov.produto_id, atual + Math.abs(mov.quantidade));
  }

  // Filtrar produtos abaixo do mínimo e calcular sugestões
  const avisos: AvisoCompra[] = [];
  for (const produto of produtos) {
    const saldo = saldosMap.get(produto.id) || 0;
    if (saldo > produto.estoque_minimo) continue;

    const total_saidas = consumoMap.get(produto.id) || 0;
    const consumo_medio_periodo = total_saidas / SEMANAS_HISTORICO;
    const consumo_medio_semanal = total_saidas / SEMANAS_HISTORICO;

    // Calcular quantidade_sugerida
    let quantidade_sugerida = Math.max(0, produto.estoque_minimo - saldo);
    if (produto.estoque_maximo != null && saldo < produto.estoque_maximo) {
      quantidade_sugerida = Math.min(
        quantidade_sugerida,
        Math.max(0, produto.estoque_maximo - saldo)
      );
    }

    // Calcular quantidade_sugerida_ia
    let quantidade_sugerida_ia = Math.max(
      quantidade_sugerida,
      Math.ceil(consumo_medio_semanal * SEMANAS_COBERTURA)
    );
    if (produto.estoque_maximo != null) {
      quantidade_sugerida_ia = Math.min(
        quantidade_sugerida_ia,
        Math.max(0, produto.estoque_maximo - saldo)
      );
    }

    avisos.push({
      id: produto.id,
      codigo: produto.codigo,
      descricao: produto.descricao,
      tipo: produto.tipo,
      saldo,
      estoque_minimo: produto.estoque_minimo,
      estoque_maximo: produto.estoque_maximo,
      quantidade_sugerida,
      quantidade_sugerida_ia,
      consumo_medio_periodo,
      preco_compra: produto.preco_compra,
      fornecedor_principal_id: produto.fornecedor_principal_id,
    });
  }

  // Ordenar por urgência (diferença entre mínimo e saldo)
  avisos.sort((a, b) => {
    const urgA = a.estoque_minimo - a.saldo;
    const urgB = b.estoque_minimo - b.saldo;
    return urgB - urgA;
  });

  return avisos;
}
