import { getPool } from '../../db/client.js';

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

const veiculoNumFields = ['capacidade_volume', 'capacidade_itens', 'capacidade_peso_kg', 'carga_comprimento_m', 'carga_largura_m', 'carga_altura_m'] as const;
type VeiculoRow = Veiculo & Record<(typeof veiculoNumFields)[number], string | null>;

function mapVeiculoRow(r: VeiculoRow): Veiculo {
  return {
    ...r,
    capacidade_volume: r.capacidade_volume != null ? Number(r.capacidade_volume) : null,
    capacidade_itens: r.capacidade_itens != null ? Number(r.capacidade_itens) : null,
    capacidade_peso_kg: r.capacidade_peso_kg != null ? Number(r.capacidade_peso_kg) : null,
    carga_comprimento_m: r.carga_comprimento_m != null ? Number(r.carga_comprimento_m) : null,
    carga_largura_m: r.carga_largura_m != null ? Number(r.carga_largura_m) : null,
    carga_altura_m: r.carga_altura_m != null ? Number(r.carga_altura_m) : null,
  };
}

export async function listVeiculos(): Promise<Veiculo[]> {
  const pool = getPool();
  if (!pool) return [];
  const { rows } = await pool.query<VeiculoRow>(
    `SELECT id, nome, placa, ativo, dias_entrega, horario_inicio::text, horario_fim::text, capacidade_volume::numeric, capacidade_itens, observacoes, motorista_whatsapp,
     COALESCE(inoperante, false) AS inoperante, inoperante_desde, inoperante_motivo, capacidade_peso_kg::numeric, carga_comprimento_m::numeric, carga_largura_m::numeric, carga_altura_m::numeric,
     created_at, updated_at FROM veiculos ORDER BY nome`
  );
  return rows.map(mapVeiculoRow);
}

export async function findVeiculoById(id: string): Promise<Veiculo | null> {
  const pool = getPool();
  if (!pool) return null;
  const { rows } = await pool.query<VeiculoRow>(
    `SELECT id, nome, placa, ativo, dias_entrega, horario_inicio::text, horario_fim::text, capacidade_volume::numeric, capacidade_itens, observacoes, motorista_whatsapp,
     COALESCE(inoperante, false) AS inoperante, inoperante_desde, inoperante_motivo, capacidade_peso_kg::numeric, carga_comprimento_m::numeric, carga_largura_m::numeric, carga_altura_m::numeric,
     created_at, updated_at FROM veiculos WHERE id = $1`,
    [id]
  );
  const r = rows[0];
  return r ? mapVeiculoRow(r) : null;
}

export type CreateVeiculoData = {
  nome: string;
  placa?: string | null;
  ativo?: boolean;
  dias_entrega?: string | null;
  horario_inicio?: string | null;
  horario_fim?: string | null;
  capacidade_volume?: number | null;
  capacidade_itens?: number | null;
  observacoes?: string | null;
  motorista_whatsapp?: string | null;
  inoperante?: boolean;
  inoperante_desde?: string | null;
  inoperante_motivo?: string | null;
  capacidade_peso_kg?: number | null;
  carga_comprimento_m?: number | null;
  carga_largura_m?: number | null;
  carga_altura_m?: number | null;
};

export async function createVeiculo(data: CreateVeiculoData): Promise<Veiculo> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  const { rows } = await pool.query<VeiculoRow>(
    `INSERT INTO veiculos (nome, placa, ativo, dias_entrega, horario_inicio, horario_fim, capacidade_volume, capacidade_itens, observacoes, motorista_whatsapp, inoperante, inoperante_desde, inoperante_motivo, capacidade_peso_kg, carga_comprimento_m, carga_largura_m, carga_altura_m)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
     RETURNING id, nome, placa, ativo, dias_entrega, horario_inicio::text, horario_fim::text, capacidade_volume::numeric, capacidade_itens, observacoes, motorista_whatsapp,
     COALESCE(inoperante, false) AS inoperante, inoperante_desde, inoperante_motivo, capacidade_peso_kg::numeric, carga_comprimento_m::numeric, carga_largura_m::numeric, carga_altura_m::numeric, created_at, updated_at`,
    [data.nome, data.placa ?? null, data.ativo ?? true, data.dias_entrega ?? null, data.horario_inicio ?? null, data.horario_fim ?? null, data.capacidade_volume ?? null, data.capacidade_itens ?? null, data.observacoes ?? null, data.motorista_whatsapp ?? null, data.inoperante ?? false, data.inoperante_desde ?? null, data.inoperante_motivo ?? null, data.capacidade_peso_kg ?? null, data.carga_comprimento_m ?? null, data.carga_largura_m ?? null, data.carga_altura_m ?? null]
  );
  const r = rows[0];
  return mapVeiculoRow(r);
}

export async function updateVeiculo(id: string, data: Partial<CreateVeiculoData>): Promise<Veiculo | null> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  const current = await findVeiculoById(id);
  if (!current) return null;
  const nome = data.nome ?? current.nome;
  const placa = data.placa !== undefined ? data.placa : current.placa;
  const ativo = data.ativo !== undefined ? data.ativo : current.ativo;
  const dias_entrega = data.dias_entrega !== undefined ? data.dias_entrega : current.dias_entrega;
  const horario_inicio = data.horario_inicio !== undefined ? data.horario_inicio : current.horario_inicio;
  const horario_fim = data.horario_fim !== undefined ? data.horario_fim : current.horario_fim;
  const capacidade_volume = data.capacidade_volume !== undefined ? data.capacidade_volume : current.capacidade_volume;
  const capacidade_itens = data.capacidade_itens !== undefined ? data.capacidade_itens : current.capacidade_itens;
  const observacoes = data.observacoes !== undefined ? data.observacoes : current.observacoes;
  const inoperante = data.inoperante !== undefined ? data.inoperante : current.inoperante;
  const inoperante_desde = data.inoperante_desde !== undefined ? data.inoperante_desde : current.inoperante_desde;
  const inoperante_motivo = data.inoperante_motivo !== undefined ? data.inoperante_motivo : current.inoperante_motivo;
  const motorista_whatsapp = data.motorista_whatsapp !== undefined ? data.motorista_whatsapp : current.motorista_whatsapp;
  const capacidade_peso_kg = data.capacidade_peso_kg !== undefined ? data.capacidade_peso_kg : current.capacidade_peso_kg;
  const carga_comprimento_m = data.carga_comprimento_m !== undefined ? data.carga_comprimento_m : current.carga_comprimento_m;
  const carga_largura_m = data.carga_largura_m !== undefined ? data.carga_largura_m : current.carga_largura_m;
  const carga_altura_m = data.carga_altura_m !== undefined ? data.carga_altura_m : current.carga_altura_m;
  const { rows } = await pool.query<VeiculoRow>(
    `UPDATE veiculos SET nome = $2, placa = $3, ativo = $4, dias_entrega = $5, horario_inicio = $6, horario_fim = $7, capacidade_volume = $8, capacidade_itens = $9, observacoes = $10, motorista_whatsapp = $11,
     inoperante = $12, inoperante_desde = $13, inoperante_motivo = $14, capacidade_peso_kg = $15, carga_comprimento_m = $16, carga_largura_m = $17, carga_altura_m = $18, updated_at = NOW()
     WHERE id = $1 RETURNING id, nome, placa, ativo, dias_entrega, horario_inicio::text, horario_fim::text, capacidade_volume::numeric, capacidade_itens, observacoes, motorista_whatsapp,
     COALESCE(inoperante, false) AS inoperante, inoperante_desde, inoperante_motivo, capacidade_peso_kg::numeric, carga_comprimento_m::numeric, carga_largura_m::numeric, carga_altura_m::numeric, created_at, updated_at`,
    [id, nome, placa, ativo, dias_entrega, horario_inicio, horario_fim, capacidade_volume ?? null, capacidade_itens ?? null, observacoes ?? null, motorista_whatsapp ?? null, inoperante, inoperante_desde ?? null, inoperante_motivo ?? null, capacidade_peso_kg ?? null, carga_comprimento_m ?? null, carga_largura_m ?? null, carga_altura_m ?? null]
  );
  const r = rows[0];
  return r ? mapVeiculoRow(r) : null;
}

export async function listEntregas(filtros?: { veiculo_id?: string; data?: string; status?: string }): Promise<EntregaComPedido[]> {
  const pool = getPool();
  if (!pool) return [];
  let sql = `SELECT e.id, e.pedido_venda_id, e.veiculo_id, e.data_entrega_prevista::text, e.ordem_na_rota, e.status, e.entregue_em, e.created_at,
    p.cliente_id, p.endereco_entrega, p.total,
    c.nome AS cliente_nome
    FROM entregas e
    JOIN pedidos_venda p ON p.id = e.pedido_venda_id
    LEFT JOIN clientes c ON c.id = p.cliente_id
    WHERE 1=1`;
  const params: unknown[] = [];
  let i = 1;
  if (filtros?.veiculo_id) { sql += ` AND e.veiculo_id = $${i++}`; params.push(filtros.veiculo_id); }
  if (filtros?.data) { sql += ` AND e.data_entrega_prevista = $${i++}`; params.push(filtros.data); }
  if (filtros?.status) { sql += ` AND e.status = $${i++}`; params.push(filtros.status); }
  sql += ' ORDER BY e.data_entrega_prevista NULLS LAST, e.ordem_na_rota NULLS LAST';
  const { rows } = await pool.query<EntregaComPedido & { total: string }>(sql, params);
  return rows.map((r) => ({ ...r, total: Number(r.total ?? 0) }));
}

/** Pedidos de venda confirmados com tipo_entrega=entrega que ainda não têm entrega. */
export async function listPedidosPendentesEntrega(): Promise<Array<{ id: string; cliente_nome: string | null; endereco_entrega: string | null; total: number }>> {
  const pool = getPool();
  if (!pool) return [];
  const { rows } = await pool.query<{ id: string; cliente_nome: string | null; endereco_entrega: string | null; total: string }>(
    `SELECT p.id, c.nome AS cliente_nome, p.endereco_entrega, p.total::numeric
     FROM pedidos_venda p
     LEFT JOIN clientes c ON c.id = p.cliente_id
     WHERE p.tipo_entrega = 'entrega' AND p.status = 'confirmado'
       AND NOT EXISTS (SELECT 1 FROM entregas e WHERE e.pedido_venda_id = p.id)
     ORDER BY p.data_pedido`
  );
  return rows.map((r) => ({ ...r, total: Number(r.total) }));
}

export async function createEntrega(data: { pedido_venda_id: string; veiculo_id?: string | null; data_entrega_prevista?: string | null }): Promise<Entrega> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  const { rows } = await pool.query<Entrega>(
    `INSERT INTO entregas (pedido_venda_id, veiculo_id, data_entrega_prevista)
     VALUES ($1, $2, $3)
     RETURNING id, pedido_venda_id, veiculo_id, data_entrega_prevista::text, ordem_na_rota, status, entregue_em, created_at`,
    [data.pedido_venda_id, data.veiculo_id ?? null, data.data_entrega_prevista ?? null]
  );
  return rows[0];
}

export async function updateEntrega(id: string, data: { veiculo_id?: string | null; data_entrega_prevista?: string | null; ordem_na_rota?: number | null }): Promise<Entrega | null> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  const { rows } = await pool.query<Entrega>(
    `UPDATE entregas SET veiculo_id = COALESCE($2, veiculo_id), data_entrega_prevista = COALESCE($3, data_entrega_prevista), ordem_na_rota = COALESCE($4, ordem_na_rota) WHERE id = $1
     RETURNING id, pedido_venda_id, veiculo_id, data_entrega_prevista::text, ordem_na_rota, status, entregue_em, created_at`,
    [id, data.veiculo_id ?? null, data.data_entrega_prevista ?? null, data.ordem_na_rota ?? null]
  );
  return rows[0] ?? null;
}

export async function marcarEntregue(id: string): Promise<Entrega | null> {
  const pool = getPool();
  if (!pool) return null;
  const { rows } = await pool.query<Entrega>(
    `UPDATE entregas SET status = 'entregue', entregue_em = NOW() WHERE id = $1
     RETURNING id, pedido_venda_id, veiculo_id, data_entrega_prevista::text, ordem_na_rota, status, entregue_em, created_at`,
    [id]
  );
  const entrega = rows[0];
  if (entrega) {
    await pool.query("UPDATE pedidos_venda SET status = 'entregue', updated_at = NOW() WHERE id = $1", [entrega.pedido_venda_id]);
  }
  return entrega ?? null;
}

/** Entregas pendentes ou em rota do veículo com data >= hoje (para aviso de veículo inoperante). */
export async function listEntregasAfetadasPorVeiculoInoperante(veiculoId: string): Promise<EntregaComPedido[]> {
  const pool = getPool();
  if (!pool) return [];
  const { rows } = await pool.query<EntregaComPedido & { total: string }>(
    `SELECT e.id, e.pedido_venda_id, e.veiculo_id, e.data_entrega_prevista::text, e.ordem_na_rota, e.status, e.entregue_em, e.created_at,
      p.endereco_entrega, p.total::numeric, c.nome AS cliente_nome
     FROM entregas e
     JOIN pedidos_venda p ON p.id = e.pedido_venda_id
     LEFT JOIN clientes c ON c.id = p.cliente_id
     WHERE e.veiculo_id = $1 AND e.status IN ('pendente', 'em_rota') AND (e.data_entrega_prevista IS NULL OR e.data_entrega_prevista >= CURRENT_DATE)
     ORDER BY e.data_entrega_prevista NULLS LAST, e.ordem_na_rota NULLS LAST`,
    [veiculoId]
  );
  return rows.map((r) => ({ ...r, total: Number(r.total ?? 0) }));
}

/** Reagenda entregas: atualiza veículo e/ou data. */
export async function reagendarEntregas(
  entregaIds: string[],
  novoVeiculoId: string | null,
  novaData: string | null
): Promise<number> {
  const pool = getPool();
  if (!pool || entregaIds.length === 0) return 0;
  const updates: string[] = [];
  const params: unknown[] = [];
  let idx = 1;
  if (novoVeiculoId !== null) {
    updates.push(`veiculo_id = $${idx++}`);
    params.push(novoVeiculoId);
  }
  if (novaData !== null) {
    updates.push(`data_entrega_prevista = $${idx++}`);
    params.push(novaData);
  }
  if (updates.length === 0) return 0;
  const setClause = updates.join(', ');
  const inPlaceholders = entregaIds.map(() => `$${idx++}`).join(',');
  const { rowCount } = await pool.query(
    `UPDATE entregas SET ${setClause} WHERE id IN (${inPlaceholders})`,
    [...params, ...entregaIds]
  );
  return rowCount ?? 0;
}

/** Retorna IDs das entregas na ordem sugerida (por veículo e data; sem geocoding ordena por endereço texto). */
export async function sugerirOrdemRota(veiculoId: string, dataEntrega: string): Promise<string[]> {
  const pool = getPool();
  if (!pool) return [];
  const { rows } = await pool.query<{ id: string }>(
    `SELECT e.id FROM entregas e
     JOIN pedidos_venda p ON p.id = e.pedido_venda_id
     WHERE e.veiculo_id = $1 AND e.data_entrega_prevista = $2 AND e.status IN ('pendente', 'em_rota')
     ORDER BY p.endereco_entrega ASC NULLS LAST, e.ordem_na_rota NULLS LAST`,
    [veiculoId, dataEntrega]
  );
  return rows.map((r) => r.id);
}

/** Atualiza ordem_na_rota das entregas conforme a posição na lista (1, 2, 3...). */
export async function aplicarOrdemRota(entregaIdsOrdenados: string[]): Promise<void> {
  const pool = getPool();
  if (!pool || entregaIdsOrdenados.length === 0) return;
  for (let i = 0; i < entregaIdsOrdenados.length; i++) {
    await pool.query('UPDATE entregas SET ordem_na_rota = $2 WHERE id = $1', [entregaIdsOrdenados[i], i + 1]);
  }
}
