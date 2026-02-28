import { getPool } from '../../db/client.js';

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

export interface ConfigEntrega {
  chave: string;
  valor: string | null;
}

const rowToOpcao = (r: OpcaoEntrega & { valor_fixo?: string; valor_por_andar?: string }): OpcaoEntrega => ({
  ...r,
  valor_fixo: r.valor_fixo != null ? Number(r.valor_fixo) : null,
  valor_por_andar: r.valor_por_andar != null ? Number(r.valor_por_andar) : null,
});

export async function list(): Promise<OpcaoEntrega[]> {
  const pool = getPool();
  if (!pool) return [];
  const { rows } = await pool.query<OpcaoEntrega & { valor_fixo?: string; valor_por_andar?: string }>(
    `SELECT id, nome, tipo, valor_fixo::numeric, valor_por_andar::numeric, ordem, ativo, created_at, updated_at
     FROM opcoes_entrega ORDER BY ordem, nome`
  );
  return rows.map(rowToOpcao);
}

export async function findById(id: string): Promise<OpcaoEntrega | null> {
  const pool = getPool();
  if (!pool) return null;
  const { rows } = await pool.query<OpcaoEntrega & { valor_fixo?: string; valor_por_andar?: string }>(
    `SELECT id, nome, tipo, valor_fixo::numeric, valor_por_andar::numeric, ordem, ativo, created_at, updated_at
     FROM opcoes_entrega WHERE id = $1`,
    [id]
  );
  const r = rows[0];
  return r ? rowToOpcao(r) : null;
}

export interface CreateOpcaoEntregaData {
  nome: string;
  tipo: TipoOpcaoEntrega;
  valor_fixo?: number | null;
  valor_por_andar?: number | null;
  ordem?: number;
  ativo?: boolean;
}

export async function create(data: CreateOpcaoEntregaData): Promise<OpcaoEntrega> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  const { rows } = await pool.query<OpcaoEntrega & { valor_fixo?: string; valor_por_andar?: string }>(
    `INSERT INTO opcoes_entrega (nome, tipo, valor_fixo, valor_por_andar, ordem, ativo)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, nome, tipo, valor_fixo::numeric, valor_por_andar::numeric, ordem, ativo, created_at, updated_at`,
    [
      data.nome.trim(),
      data.tipo,
      data.valor_fixo ?? null,
      data.valor_por_andar ?? null,
      data.ordem ?? 0,
      data.ativo ?? true,
    ]
  );
  return rowToOpcao(rows[0]);
}

export async function update(
  id: string,
  data: Partial<CreateOpcaoEntregaData>
): Promise<OpcaoEntrega | null> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  const current = await findById(id);
  if (!current) return null;

  const nome = data.nome !== undefined ? data.nome.trim() : current.nome;
  const tipo = data.tipo ?? current.tipo;
  const valor_fixo = data.valor_fixo !== undefined ? data.valor_fixo : current.valor_fixo;
  const valor_por_andar = data.valor_por_andar !== undefined ? data.valor_por_andar : current.valor_por_andar;
  const ordem = data.ordem !== undefined ? data.ordem : current.ordem;
  const ativo = data.ativo !== undefined ? data.ativo : current.ativo;

  const { rows } = await pool.query<OpcaoEntrega & { valor_fixo?: string; valor_por_andar?: string }>(
    `UPDATE opcoes_entrega SET nome = $2, tipo = $3, valor_fixo = $4, valor_por_andar = $5, ordem = $6, ativo = $7, updated_at = NOW()
     WHERE id = $1 RETURNING id, nome, tipo, valor_fixo::numeric, valor_por_andar::numeric, ordem, ativo, created_at, updated_at`,
    [id, nome, tipo, valor_fixo, valor_por_andar, ordem, ativo]
  );
  const r = rows[0];
  return r ? rowToOpcao(r) : null;
}

export async function remove(id: string): Promise<boolean> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  const { rowCount } = await pool.query('DELETE FROM opcoes_entrega WHERE id = $1', [id]);
  return (rowCount ?? 0) > 0;
}

export async function getConfig(chave: string): Promise<string | null> {
  const pool = getPool();
  if (!pool) return null;
  const { rows } = await pool.query<ConfigEntrega>('SELECT chave, valor FROM config_entrega WHERE chave = $1', [chave]);
  return rows[0]?.valor ?? null;
}

export async function setConfig(chave: string, valor: string | null): Promise<void> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  await pool.query(
    `INSERT INTO config_entrega (chave, valor) VALUES ($1, $2)
     ON CONFLICT (chave) DO UPDATE SET valor = EXCLUDED.valor`,
    [chave, valor]
  );
}
