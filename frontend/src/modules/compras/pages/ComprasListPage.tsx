import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { useCompras } from '../hooks/useCompras';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { DataTable } from '../../../components/ui/DataTable';
import { PedidoCompraForm } from '../components/PedidoCompraForm';
import { ReceberPedidoModal } from '../components/ReceberPedidoModal';
import { ImportPlanilhaModal } from '../components/ImportPlanilhaModal';
import { parsePlanilhaCompras } from '../lib/parse-planilha-compras';
import type { PedidoCompraComFornecedor } from '../types/compras.types';
import type { ImportExcelRow } from '../services/compras.service';

const STATUS_LABEL: Record<string, string> = {
  em_aberto: 'Em aberto',
  recebido_parcial: 'Recebido parcial',
  recebido: 'Recebido',
};

type LocationState = { itensPrePreenchidos?: Array<{ produto_id: string; quantidade: number; preco_unitario: number }>; fornecedor_id?: string };

export function ComprasListPage() {
  const { token } = useAuth();
  const { pedidos, loading, error, createPedido, updatePedido, receberPedido, fetchPedidos } = useCompras();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;
  const [isFormOpen, setIsFormOpen] = useState(!!state?.itensPrePreenchidos?.length);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [recebendoId, setRecebendoId] = useState<string | null>(null);
  const [initialItens, setInitialItens] = useState<LocationState['itensPrePreenchidos']>(state?.itensPrePreenchidos ?? undefined);
  const [initialFornecedorId, setInitialFornecedorId] = useState<string | undefined>(state?.fornecedor_id);
  const [importRows, setImportRows] = useState<ImportExcelRow[] | null>(null);
  const [importError, setImportError] = useState('');
  const planilhaInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state?.itensPrePreenchidos?.length) {
      setInitialItens(state.itensPrePreenchidos);
      setInitialFornecedorId(state.fornecedor_id);
      setIsFormOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, navigate, state?.itensPrePreenchidos, state?.fornecedor_id]);

  if (loading && pedidos.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Carregando pedidos...</p>
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedidos de compra</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            No novo pedido: envie uma foto do documento ou um áudio (ex.: áudio do WhatsApp lendo os itens e quantidades). A IA preenche o formulário.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <input
            ref={planilhaInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (!file) return;
              setImportError('');
              try {
                const rows = await parsePlanilhaCompras(file);
                setImportRows(rows);
              } catch (err) {
                setImportError(err instanceof Error ? err.message : 'Erro ao ler planilha');
              }
            }}
          />
          <Button variant="secondary" onClick={() => planilhaInputRef.current?.click()}>
            Importar planilha
          </Button>
          <Button onClick={() => { setEditingId(null); setIsFormOpen(true); }}>Novo pedido</Button>
        </div>
      </div>
      {importError && (
        <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">{importError}</div>
      )}

      {pedidos.length === 0 && !loading ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">Nenhum pedido de compra</p>
          <Button onClick={() => setIsFormOpen(true)}>Criar primeiro pedido</Button>
        </div>
      ) : (
        <DataTable
          data={pedidos}
          columns={[
            { key: 'data_pedido', label: 'Data', sortable: true, render: (p) => p.data_pedido, sortValue: (p) => p.data_pedido },
            { key: 'fornecedor_nome', label: 'Fornecedor', sortable: true, render: (p) => p.fornecedor_nome ?? '-', sortValue: (p) => p.fornecedor_nome ?? '' },
            { key: 'tipo', label: 'Tipo', sortable: true, render: (p) => p.tipo === 'recepcao' ? 'Recepção' : 'Pedido', sortValue: (p) => p.tipo },
            { key: 'data_prevista_entrega', label: 'Previsão entrega', render: (p) => p.data_prevista_entrega ?? '—', sortValue: (p) => p.data_prevista_entrega ?? '' },
            { key: 'status', label: 'Status', sortable: true, render: (p) => STATUS_LABEL[p.status] ?? p.status, sortValue: (p) => p.status },
            { key: 'total', label: 'Total', sortable: true, render: (p) => `R$ ${Number(p.total).toFixed(2)}`, sortValue: (p) => p.total },
            {
              key: 'actions',
              label: 'Ações',
              sortable: false,
              render: (p) => (
                <div className="flex gap-2">
                  {p.tipo === 'pedido' && p.status !== 'recebido' && (
                    <>
                      <Button variant="secondary" size="sm" onClick={() => { setEditingId(p.id); setIsFormOpen(true); }}>Editar</Button>
                      <Button variant="secondary" size="sm" onClick={() => setRecebendoId(p.id)}>Receber</Button>
                    </>
                  )}
                </div>
              ),
            },
          ]}
          searchPlaceholder="Buscar..."
          emptyMessage="Nenhum pedido"
        />
      )}

      <Modal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingId(null); }}
        title={editingId ? 'Editar pedido de compra' : 'Novo pedido de compra'}
      >
        <PedidoCompraForm
          pedidoId={editingId}
          initialItens={initialItens}
          initialFornecedorId={initialFornecedorId}
          onSaved={() => { setIsFormOpen(false); setEditingId(null); setInitialItens(undefined); setInitialFornecedorId(undefined); fetchPedidos(); }}
          onCancel={() => { setIsFormOpen(false); setEditingId(null); setInitialItens(undefined); setInitialFornecedorId(undefined); }}
          createPedido={createPedido}
          updatePedido={updatePedido}
        />
      </Modal>

      <Modal isOpen={!!recebendoId} onClose={() => setRecebendoId(null)} title="Receber pedido">
        {recebendoId && (
          <ReceberPedidoModal
            pedidoId={recebendoId}
            onClose={() => setRecebendoId(null)}
            onRecebido={() => { setRecebendoId(null); fetchPedidos(); }}
            receberPedido={receberPedido}
          />
        )}
      </Modal>

      <ImportPlanilhaModal
        isOpen={importRows !== null && importRows.length > 0}
        onClose={() => { setImportRows(null); setImportError(''); }}
        onSuccess={() => { setImportRows(null); fetchPedidos(); }}
        rows={importRows ?? []}
        token={token}
      />
    </div>
  );
}
