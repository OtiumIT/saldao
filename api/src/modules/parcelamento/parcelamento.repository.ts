import { getPool } from '../../db/client.js';

export interface OpcaoParcelamento {
  id: string;
  parcelas: number;
  taxa_percentual: number;
  created_at: string;
  updated_at: string;
}

export async function list(): Promise<OpcaoParcelamento[]> {
  const pool = getPool();
  if (!pool) return [];
  const { rows } = await pool.query<OpcaoParcelamento & { taxa_percentual: string; parcelas: string }>(
    'SELECT id, parcelas, taxa_percentual::numeric, created_at, updated_at FROM opcoes_parcelamento ORDER BY parcelas'
  );
  return rows.map((r) => ({ ...r, parcelas: Number(r.parcelas), taxa_percentual: Number(r.taxa_percentual) }));
}

export async function findById(id: string): Promise<OpcaoParcelamento | null> {
  const pool = getPool();
  if (!pool) return null;
  const { rows } = await pool.query<OpcaoParcelamento & { taxa_percentual: string; parcelas: string }>(
    'SELECT id, parcelas, taxa_percentual::numeric, created_at, updated_at FROM opcoes_parcelamento WHERE id = $1',
    [id]
  );
  const r = rows[0];
  if (!r) return null;
  return { ...r, parcelas: Number(r.parcelas), taxa_percentual: Number(r.taxa_percentual) };
}

export async function findByParcelas(parcelas: number): Promise<OpcaoParcelamento | null> {
  const pool = getPool();
  if (!pool) return null;
  const { rows } = await pool.query<OpcaoParcelamento & { taxa_percentual: string; parcelas: string }>(
    'SELECT id, parcelas, taxa_percentual::numeric, created_at, updated_at FROM opcoes_parcelamento WHERE parcelas = $1',
    [parcelas]
  );
  const r = rows[0];
  if (!r) return null;
  return { ...r, parcelas: Number(r.parcelas), taxa_percentual: Number(r.taxa_percentual) };
}

export async function update(id: string, data: { taxa_percentual: number }): Promise<OpcaoParcelamento | null> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  const { rows } = await pool.query<OpcaoParcelamento & { taxa_percentual: string; parcelas: string }>(
    `UPDATE opcoes_parcelamento SET taxa_percentual = $2, updated_at = NOW() WHERE id = $1
     RETURNING id, parcelas, taxa_percentual::numeric, created_at, updated_at`,
    [id, data.taxa_percentual]
  );
  const r = rows[0];
  if (!r) return null;
  return { ...r, parcelas: Number(r.parcelas), taxa_percentual: Number(r.taxa_percentual) };
}

/** Atualiza a taxa de uma opção por número de parcelas (útil para bulk). */
export async function updateByParcelas(parcelas: number, taxa_percentual: number): Promise<OpcaoParcelamento | null> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  const { rows } = await pool.query<OpcaoParcelamento & { taxa_percentual: string; parcelas: string }>(
    `UPDATE opcoes_parcelamento SET taxa_percentual = $2, updated_at = NOW() WHERE parcelas = $1
     RETURNING id, parcelas, taxa_percentual::numeric, created_at, updated_at`,
    [parcelas, taxa_percentual]
  );
  const r = rows[0];
  if (!r) return null;
  return { ...r, parcelas: Number(r.parcelas), taxa_percentual: Number(r.taxa_percentual) };
}
