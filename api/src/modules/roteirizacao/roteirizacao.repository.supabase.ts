/**
 * Repository de Roteirização usando Supabase Data API (sem policies)
 * Substitui roteirizacao.repository.ts quando usando Data API
 */
import type { Env } from '../../types/worker-env.js';
import { getDataClient, db } from '../../db/data-api.js';
import type { Veiculo, Entrega, EntregaComPedido, CreateVeiculoData } from './roteirizacao.repository.js';

function mapVeiculoRow(r: any): Veiculo {
  return {
    ...r,
    capacidade_volume: r.capacidade_volume != null ? Number(r.capacidade_volume) : null,
    capacidade_itens: r.capacidade_itens != null ? Number(r.capacidade_itens) : null,
    capacidade_peso_kg: r.capacidade_peso_kg != null ? Number(r.capacidade_peso_kg) : null,
    carga_comprimento_m: r.carga_comprimento_m != null ? Number(r.carga_comprimento_m) : null,
    carga_largura_m: r.carga_largura_m != null ? Number(r.carga_largura_m) : null,
    carga_altura_m: r.carga_altura_m != null ? Number(r.carga_altura_m) : null,
    inoperante: r.inoperante ?? false,
  };
}

export async function listVeiculos(env: Env): Promise<Veiculo[]> {
  const client = getDataClient(env);
  const veiculos = await db.select<Veiculo>(client, 'veiculos', {
    orderBy: { column: 'nome', ascending: true },
  });
  return veiculos.map(mapVeiculoRow);
}

export async function findVeiculoById(env: Env, id: string): Promise<Veiculo | null> {
  const client = getDataClient(env);
  const veiculo = await db.findById<Veiculo>(client, 'veiculos', id);
  return veiculo ? mapVeiculoRow(veiculo) : null;
}

export async function createVeiculo(env: Env, data: CreateVeiculoData): Promise<Veiculo> {
  const client = getDataClient(env);
  const result = await db.insert<Veiculo>(client, 'veiculos', {
    nome: data.nome,
    placa: data.placa ?? null,
    ativo: data.ativo ?? true,
    dias_entrega: data.dias_entrega ?? null,
    horario_inicio: data.horario_inicio ?? null,
    horario_fim: data.horario_fim ?? null,
    capacidade_volume: data.capacidade_volume ?? null,
    capacidade_itens: data.capacidade_itens ?? null,
    observacoes: data.observacoes ?? null,
    motorista_whatsapp: data.motorista_whatsapp ?? null,
    inoperante: data.inoperante ?? false,
    inoperante_desde: data.inoperante_desde ?? null,
    inoperante_motivo: data.inoperante_motivo ?? null,
    capacidade_peso_kg: data.capacidade_peso_kg ?? null,
    carga_comprimento_m: data.carga_comprimento_m ?? null,
    carga_largura_m: data.carga_largura_m ?? null,
    carga_altura_m: data.carga_altura_m ?? null,
  } as any);
  return mapVeiculoRow(result[0]);
}

export async function updateVeiculo(env: Env, id: string, data: Partial<CreateVeiculoData>): Promise<Veiculo | null> {
  const client = getDataClient(env);
  const current = await findVeiculoById(env, id);
  if (!current) return null;

  const updateData: Partial<Veiculo> = {};
  if (data.nome !== undefined) updateData.nome = data.nome;
  if (data.placa !== undefined) updateData.placa = data.placa;
  if (data.ativo !== undefined) updateData.ativo = data.ativo;
  if (data.dias_entrega !== undefined) updateData.dias_entrega = data.dias_entrega;
  if (data.horario_inicio !== undefined) updateData.horario_inicio = data.horario_inicio;
  if (data.horario_fim !== undefined) updateData.horario_fim = data.horario_fim;
  if (data.capacidade_volume !== undefined) updateData.capacidade_volume = data.capacidade_volume;
  if (data.capacidade_itens !== undefined) updateData.capacidade_itens = data.capacidade_itens;
  if (data.observacoes !== undefined) updateData.observacoes = data.observacoes;
  if (data.motorista_whatsapp !== undefined) updateData.motorista_whatsapp = data.motorista_whatsapp;
  if (data.inoperante !== undefined) updateData.inoperante = data.inoperante;
  if (data.inoperante_desde !== undefined) updateData.inoperante_desde = data.inoperante_desde;
  if (data.inoperante_motivo !== undefined) updateData.inoperante_motivo = data.inoperante_motivo;
  if (data.capacidade_peso_kg !== undefined) updateData.capacidade_peso_kg = data.capacidade_peso_kg;
  if (data.carga_comprimento_m !== undefined) updateData.carga_comprimento_m = data.carga_comprimento_m;
  if (data.carga_largura_m !== undefined) updateData.carga_largura_m = data.carga_largura_m;
  if (data.carga_altura_m !== undefined) updateData.carga_altura_m = data.carga_altura_m;

  const updated = await db.update<Veiculo>(client, 'veiculos', id, updateData as any);
  return updated ? mapVeiculoRow(updated) : null;
}

export async function listEntregas(
  env: Env,
  filtros?: { veiculo_id?: string; data?: string; status?: string }
): Promise<EntregaComPedido[]> {
  const client = getDataClient(env);
  const filters: Record<string, unknown> = {};
  if (filtros?.veiculo_id) filters.veiculo_id = filtros.veiculo_id;
  if (filtros?.data) filters.data_entrega_prevista = filtros.data;
  if (filtros?.status) filters.status = filtros.status;

  const entregas = await db.select<Entrega>(client, 'entregas', {
    filters,
  });

  const pedidoIds = [...new Set(entregas.map((e) => e.pedido_venda_id))];
  const pedidos = await db.select<{ id: string; cliente_id: string | null; endereco_entrega: string | null; total: number }>(
    client,
    'pedidos_venda',
    {
      filters: { id: pedidoIds },
    }
  );

  const clienteIds = [...new Set(pedidos.map((p) => p.cliente_id).filter((id): id is string => id !== null))];
  const clientes = clienteIds.length > 0
    ? await db.select<{ id: string; nome: string }>(client, 'clientes', {
        filters: { id: clienteIds },
      })
    : [];

  const pedidosMap = new Map(pedidos.map((p) => [p.id, p]));
  const clientesMap = new Map(clientes.map((c) => [c.id, c]));

  return entregas.map((e) => {
    const pedido = pedidosMap.get(e.pedido_venda_id);
    const cliente = pedido?.cliente_id ? clientesMap.get(pedido.cliente_id) : null;
    return {
      ...e,
      cliente_nome: cliente?.nome ?? null,
      endereco_entrega: pedido?.endereco_entrega ?? null,
      total: pedido?.total ?? 0,
    };
  }).sort((a, b) => {
    if (a.data_entrega_prevista !== b.data_entrega_prevista) {
      return (a.data_entrega_prevista || '').localeCompare(b.data_entrega_prevista || '');
    }
    return (a.ordem_na_rota ?? 0) - (b.ordem_na_rota ?? 0);
  });
}

export async function listPedidosPendentesEntrega(env: Env): Promise<Array<{ id: string; cliente_nome: string | null; endereco_entrega: string | null; total: number }>> {
  const client = getDataClient(env);
  const pedidos = await db.select<{ id: string; cliente_id: string | null; endereco_entrega: string | null; total: number }>(
    client,
    'pedidos_venda',
    {
      filters: { tipo_entrega: 'entrega', status: 'confirmado' },
    }
  );

  const entregas = await db.select<{ pedido_venda_id: string }>(client, 'entregas', {});
  const entregasPedidoIds = new Set(entregas.map((e) => e.pedido_venda_id));
  const pendentes = pedidos.filter((p) => !entregasPedidoIds.has(p.id));

  const clienteIds = [...new Set(pendentes.map((p) => p.cliente_id).filter((id): id is string => id !== null))];
  const clientes = clienteIds.length > 0
    ? await db.select<{ id: string; nome: string }>(client, 'clientes', {
        filters: { id: clienteIds },
      })
    : [];

  const clientesMap = new Map(clientes.map((c) => [c.id, c]));

  return pendentes.map((p) => ({
    id: p.id,
    cliente_nome: p.cliente_id ? clientesMap.get(p.cliente_id)?.nome ?? null : null,
    endereco_entrega: p.endereco_entrega,
    total: p.total,
  }));
}

export async function createEntrega(
  env: Env,
  data: { pedido_venda_id: string; veiculo_id?: string | null; data_entrega_prevista?: string | null }
): Promise<Entrega> {
  const client = getDataClient(env);
  const result = await db.insert<Entrega>(client, 'entregas', {
    pedido_venda_id: data.pedido_venda_id,
    veiculo_id: data.veiculo_id ?? null,
    data_entrega_prevista: data.data_entrega_prevista ?? null,
    status: 'pendente',
  } as any);
  return result[0];
}

export async function updateEntrega(
  env: Env,
  id: string,
  data: { veiculo_id?: string | null; data_entrega_prevista?: string | null; ordem_na_rota?: number | null }
): Promise<Entrega | null> {
  const client = getDataClient(env);
  const updateData: Partial<Entrega> = {};
  if (data.veiculo_id !== undefined) updateData.veiculo_id = data.veiculo_id;
  if (data.data_entrega_prevista !== undefined) updateData.data_entrega_prevista = data.data_entrega_prevista;
  if (data.ordem_na_rota !== undefined) updateData.ordem_na_rota = data.ordem_na_rota;

  return db.update<Entrega>(client, 'entregas', id, updateData as any);
}

export async function marcarEntregue(env: Env, id: string): Promise<Entrega | null> {
  const client = getDataClient(env);
  const entrega = await db.findById<Entrega>(client, 'entregas', id);
  if (!entrega) return null;

  const now = new Date().toISOString();
  const updated = await db.update<Entrega>(client, 'entregas', id, {
    status: 'entregue',
    entregue_em: now,
  } as any);

  if (updated) {
    await db.update(client, 'pedidos_venda', entrega.pedido_venda_id, { status: 'entregue' } as any);
  }

  return updated;
}

export async function listEntregasAfetadasPorVeiculoInoperante(env: Env, veiculoId: string): Promise<EntregaComPedido[]> {
  const hoje = new Date().toISOString().split('T')[0];
  return listEntregas(env, {
    veiculo_id: veiculoId,
    status: 'pendente',
  }).then((entregas) =>
    entregas.filter((e) => !e.data_entrega_prevista || e.data_entrega_prevista >= hoje)
  );
}

export async function reagendarEntregas(
  env: Env,
  entregaIds: string[],
  novoVeiculoId: string | null,
  novaData: string | null
): Promise<number> {
  const client = getDataClient(env);
  let atualizadas = 0;

  for (const entregaId of entregaIds) {
    const updateData: Partial<Entrega> = {};
    if (novoVeiculoId !== null) updateData.veiculo_id = novoVeiculoId;
    if (novaData !== null) updateData.data_entrega_prevista = novaData;

    if (Object.keys(updateData).length > 0) {
      const updated = await db.update<Entrega>(client, 'entregas', entregaId, updateData as any);
      if (updated) atualizadas++;
    }
  }

  return atualizadas;
}

export async function sugerirOrdemRota(env: Env, veiculoId: string, dataEntrega: string): Promise<string[]> {
  const entregas = await listEntregas(env, {
    veiculo_id: veiculoId,
    data: dataEntrega,
    status: 'pendente',
  });

  // Ordenar por endereço (simples, sem geocoding)
  return entregas
    .sort((a, b) => (a.endereco_entrega || '').localeCompare(b.endereco_entrega || ''))
    .map((e) => e.id);
}

export async function aplicarOrdemRota(env: Env, entregaIdsOrdenados: string[]): Promise<void> {
  const client = getDataClient(env);
  for (let i = 0; i < entregaIdsOrdenados.length; i++) {
    await db.update<Entrega>(client, 'entregas', entregaIdsOrdenados[i], {
      ordem_na_rota: i + 1,
    } as any);
  }
}
