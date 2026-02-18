import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import * as roteirizacaoService from '../services/roteirizacao.service';
import { Button } from '../../../components/ui/Button';
import { DataTable } from '../../../components/ui/DataTable';
import { Select } from '../../../components/ui/Select';
import type { EntregaComPedido } from '../types/roteirizacao.types';

const STATUS_LABEL: Record<string, string> = {
  sem_rota: 'Sem rota',
  pendente: 'Pendente',
  em_rota: 'Em rota',
  entregue: 'Entregue',
};

/** Linha unificada: pedido com entrega (sem rota) ou entrega já na rota */
type LinhaEntrega =
  | { id: string; pedido_venda_id: string; data_entrega_prevista: string | null; cliente_nome: string | null; endereco_entrega: string | null; total: number; status: 'sem_rota'; entrega_id?: undefined }
  | (EntregaComPedido & { status: 'pendente' | 'em_rota' | 'entregue'; entrega_id?: string });

export function EntregasPage() {
  const { token } = useAuth();
  const [entregas, setEntregas] = useState<EntregaComPedido[]>([]);
  const [veiculos, setVeiculos] = useState<Array<{ id: string; nome: string }>>([]);
  const [pendentes, setPendentes] = useState<Array<{ id: string; cliente_nome: string | null; endereco_entrega: string | null; total: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [filtroVeiculo, setFiltroVeiculo] = useState('');
  const [filtroData, setFiltroData] = useState('');

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [ent, vec, pen] = await Promise.all([
        roteirizacaoService.listEntregas(token, { veiculo_id: filtroVeiculo || undefined, data: filtroData || undefined }),
        roteirizacaoService.listVeiculos(token),
        roteirizacaoService.listPendentesEntrega(token),
      ]);
      setEntregas(ent);
      setVeiculos(vec);
      setPendentes(pen);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [token, filtroVeiculo, filtroData]);

  /** Lista única: primeiro pendentes (sem rota), depois entregas já agendadas */
  const listaUnificada = useMemo<LinhaEntrega[]>(() => {
    const linhasPendentes: LinhaEntrega[] = pendentes.map((p) => ({
      id: `pendente-${p.id}`,
      pedido_venda_id: p.id,
      data_entrega_prevista: null,
      cliente_nome: p.cliente_nome,
      endereco_entrega: p.endereco_entrega,
      total: p.total,
      status: 'sem_rota',
    }));
    const linhasEntregas: LinhaEntrega[] = entregas.map((e) => ({
      ...e,
      status: e.status,
      entrega_id: e.id,
    }));
    return [...linhasPendentes, ...linhasEntregas];
  }, [pendentes, entregas]);

  const assignar = async (pedidoId: string, veiculoId: string, dataEntrega: string) => {
    if (!token) return;
    try {
      await roteirizacaoService.createEntrega(token, {
        pedido_venda_id: pedidoId,
        veiculo_id: veiculoId || null,
        data_entrega_prevista: dataEntrega || null,
      });
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro');
    }
  };

  const marcarEntregue = async (entregaId: string) => {
    if (!token) return;
    try {
      await roteirizacaoService.marcarEntregue(token, entregaId);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Entregas</h1>

      <div className="bg-white p-4 rounded-lg shadow flex flex-wrap gap-4 items-end">
        <Select
          label="Veículo"
          options={[{ value: '', label: '— Todos —' }, ...veiculos.map((v) => ({ value: v.id, label: v.nome }))]}
          value={filtroVeiculo}
          onChange={(e) => setFiltroVeiculo(e.target.value)}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
          <input type="date" className="px-3 py-2 border border-gray-300 rounded-lg" value={filtroData} onChange={(e) => setFiltroData(e.target.value)} />
        </div>
      </div>

      {loading && listaUnificada.length === 0 ? (
        <p className="text-gray-500">Carregando...</p>
      ) : (
        <DataTable
          data={listaUnificada}
          columns={[
            { key: 'data_entrega_prevista', label: 'Data', render: (r: LinhaEntrega) => r.data_entrega_prevista ?? '-', sortValue: (r) => r.data_entrega_prevista ?? '' },
            { key: 'cliente_nome', label: 'Cliente', render: (r: LinhaEntrega) => r.cliente_nome ?? '-', sortValue: (r) => r.cliente_nome ?? '' },
            { key: 'endereco_entrega', label: 'Endereço', render: (r: LinhaEntrega) => (r.endereco_entrega ?? '').slice(0, 50) + (r.endereco_entrega && r.endereco_entrega.length > 50 ? '…' : ''), sortValue: (r) => r.endereco_entrega ?? '' },
            { key: 'total', label: 'Total', render: (r: LinhaEntrega) => (r.total != null ? `R$ ${r.total.toFixed(2)}` : '-'), sortValue: (r) => r.total ?? 0 },
            { key: 'status', label: 'Situação', render: (r: LinhaEntrega) => STATUS_LABEL[r.status] ?? r.status, sortValue: (r) => r.status },
            {
              key: 'actions',
              label: 'Ações',
              render: (r: LinhaEntrega) =>
                r.status === 'sem_rota' ? (
                  <AssignarEntregaInline pedidoId={r.pedido_venda_id} veiculos={veiculos} onAssign={assignar} />
                ) : r.status !== 'entregue' && r.entrega_id ? (
                  <Button variant="secondary" size="sm" onClick={() => marcarEntregue(r.entrega_id!)}>Marcar entregue</Button>
                ) : null,
            },
          ]}
          emptyMessage="Nenhuma venda com entrega no momento"
        />
      )}
    </div>
  );
}

function AssignarEntregaInline({
  pedidoId,
  veiculos,
  onAssign,
}: {
  pedidoId: string;
  veiculos: Array<{ id: string; nome: string }>;
  onAssign: (pedidoId: string, veiculoId: string, dataEntrega: string) => void;
}) {
  const [veiculoId, setVeiculoId] = useState('');
  const [dataEntrega, setDataEntrega] = useState(new Date().toISOString().slice(0, 10));

  return (
    <span className="flex flex-wrap items-center gap-2">
      <select className="text-sm border rounded px-2 py-1" value={veiculoId} onChange={(e) => setVeiculoId(e.target.value)}>
        <option value="">— Veículo —</option>
        {veiculos.map((v) => (
          <option key={v.id} value={v.id}>{v.nome}</option>
        ))}
      </select>
      <input type="date" className="text-sm border rounded px-2 py-1" value={dataEntrega} onChange={(e) => setDataEntrega(e.target.value)} />
      <Button size="sm" onClick={() => onAssign(pedidoId, veiculoId, dataEntrega)} disabled={!veiculoId}>Adicionar à rota</Button>
    </span>
  );
}
