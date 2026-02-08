import { Link } from 'react-router-dom';
import { useVendas } from '../hooks/useVendas';
import { Button } from '../../../components/ui/Button';
import { DataTable } from '../../../components/ui/DataTable';
import type { PedidoVendaComCliente } from '../types/vendas.types';

const STATUS_LABEL: Record<string, string> = {
  rascunho: 'Rascunho',
  confirmado: 'Confirmado',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
};

export function VendasListPage() {
  const { pedidos, loading, error, fetchPedidos, confirmar, marcarEntregue } = useVendas();

  const handleConfirmar = async (p: PedidoVendaComCliente) => {
    if (!confirm('Confirmar pedido? Será dada baixa no estoque.')) return;
    try {
      await confirmar(p.id, (p as { previsao_entrega_em_dias?: number | null }).previsao_entrega_em_dias ?? undefined);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao confirmar';
      if (typeof msg === 'string' && msg.includes('previsão')) {
        const dias = window.prompt(msg + '\n\nInforme a previsão de entrega em dias (ex.: 7):');
        if (dias != null) {
          const n = parseInt(dias, 10);
          if (!isNaN(n) && n >= 1) {
            try {
              await confirmar(p.id, n);
            } catch (err2) {
              alert(err2 instanceof Error ? err2.message : 'Erro');
            }
          }
        }
      } else {
        alert(msg);
      }
    }
  };

  const handleEntregue = async (p: PedidoVendaComCliente) => {
    try {
      await marcarEntregue(p.id);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro');
    }
  };

  if (loading && pedidos.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Erro: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Vendas</h1>
        <Link to="/vendas/caixa">
          <Button className="w-full sm:w-auto">Abrir caixa</Button>
        </Link>
      </div>

      {pedidos.length === 0 && !loading ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">Nenhuma venda registrada</p>
          <Link to="/vendas/caixa">
            <Button>Abrir caixa e registrar venda</Button>
          </Link>
        </div>
      ) : (
        <DataTable
          data={pedidos}
          columns={[
            { key: 'data_pedido', label: 'Data', sortable: true, render: (p) => p.data_pedido, sortValue: (p) => p.data_pedido },
            { key: 'cliente_nome', label: 'Cliente', render: (p) => p.cliente_nome ?? 'Retirada', sortValue: (p) => p.cliente_nome ?? '' },
            { key: 'tipo_entrega', label: 'Entrega', render: (p) => p.tipo_entrega === 'entrega' ? 'Sim' : 'Retirada', sortValue: (p) => p.tipo_entrega },
            { key: 'status', label: 'Status', render: (p) => STATUS_LABEL[p.status] ?? p.status, sortValue: (p) => p.status },
            { key: 'previsao_entrega', label: 'Previsão (dias)', render: (p) => (p as { previsao_entrega_em_dias?: number | null }).previsao_entrega_em_dias ?? '—', sortValue: (p) => (p as { previsao_entrega_em_dias?: number | null }).previsao_entrega_em_dias ?? 0 },
            { key: 'valor_frete', label: 'Frete', render: (p) => (p.valor_frete && Number(p.valor_frete) > 0 ? `R$ ${Number(p.valor_frete).toFixed(2)}` : '—'), sortValue: (p) => Number(p.valor_frete ?? 0) },
            { key: 'total', label: 'Total', render: (p) => `R$ ${Number(p.total).toFixed(2)}`, sortValue: (p) => p.total },
            {
              key: 'actions',
              label: 'Ações',
              render: (p) => (
                <div className="flex gap-2">
                  {p.status === 'rascunho' && (
                    <Button variant="secondary" size="sm" onClick={() => handleConfirmar(p)}>Confirmar</Button>
                  )}
                  {p.status === 'confirmado' && p.tipo_entrega === 'entrega' && (
                    <Button variant="secondary" size="sm" onClick={() => handleEntregue(p)}>Marcar entregue</Button>
                  )}
                </div>
              ),
            },
          ]}
          searchPlaceholder="Buscar..."
          emptyMessage="Nenhuma venda"
        />
      )}
    </div>
  );
}
