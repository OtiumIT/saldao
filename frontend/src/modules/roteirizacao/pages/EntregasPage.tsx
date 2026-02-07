import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import * as roteirizacaoService from '../services/roteirizacao.service';
import { Button } from '../../../components/ui/Button';
import { DataTable } from '../../../components/ui/DataTable';
import { Select } from '../../../components/ui/Select';
import type { EntregaComPedido } from '../types/roteirizacao.types';

const STATUS_LABEL: Record<string, string> = { pendente: 'Pendente', em_rota: 'Em rota', entregue: 'Entregue' };

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

  const marcarEntregue = async (id: string) => {
    if (!token) return;
    try {
      await roteirizacaoService.marcarEntregue(token, id);
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

      {pendentes.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h2 className="font-medium mb-2">Pedidos confirmados (entrega) sem rota</h2>
          <ul className="space-y-2">
            {pendentes.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-2">
                <span>{p.cliente_nome ?? 'Cliente'} – R$ {p.total.toFixed(2)} – {p.endereco_entrega?.slice(0, 40) ?? 'Sem endereço'}…</span>
                <AssignarEntrega pedidoId={p.id} veiculos={veiculos} onAssign={assignar} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {loading && entregas.length === 0 ? (
        <p className="text-gray-500">Carregando...</p>
      ) : (
        <DataTable
          data={entregas}
          columns={[
            { key: 'data_entrega_prevista', label: 'Data', render: (e: EntregaComPedido) => e.data_entrega_prevista ?? '-', sortValue: (e) => e.data_entrega_prevista ?? '' },
            { key: 'cliente_nome', label: 'Cliente', render: (e: EntregaComPedido) => e.cliente_nome ?? '-', sortValue: (e) => e.cliente_nome ?? '' },
            { key: 'endereco_entrega', label: 'Endereço', render: (e: EntregaComPedido) => (e.endereco_entrega ?? '').slice(0, 50) + (e.endereco_entrega && e.endereco_entrega.length > 50 ? '…' : ''), sortValue: (e) => e.endereco_entrega ?? '' },
            { key: 'status', label: 'Status', render: (e: EntregaComPedido) => STATUS_LABEL[e.status] ?? e.status, sortValue: (e) => e.status },
            {
              key: 'actions',
              label: 'Ações',
              render: (e: EntregaComPedido) =>
                e.status !== 'entregue' ? (
                  <Button variant="secondary" size="sm" onClick={() => marcarEntregue(e.id)}>Marcar entregue</Button>
                ) : null,
            },
          ]}
          emptyMessage="Nenhuma entrega"
        />
      )}
    </div>
  );
}

function AssignarEntrega({
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
    <span className="flex items-center gap-2">
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
