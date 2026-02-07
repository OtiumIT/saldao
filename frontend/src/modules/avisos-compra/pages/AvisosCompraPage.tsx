import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAvisosCompra } from '../hooks/useAvisosCompra';
import { Button } from '../../../components/ui/Button';
import { DataTable } from '../../../components/ui/DataTable';
import type { AvisoCompra } from '../types/avisos.types';

const TIPO_LABEL: Record<string, string> = { revenda: 'Revenda', insumos: 'Insumos' };

export function AvisosCompraPage() {
  const { avisos, loading, error } = useAvisosCompra();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === avisos.length) setSelected(new Set());
    else setSelected(new Set(avisos.map((a) => a.id)));
  };

  const gerarPedido = () => {
    const itens = avisos
      .filter((a) => selected.has(a.id) && (a.quantidade_sugerida_ia > 0 || a.quantidade_sugerida > 0))
      .map((a) => ({
        produto_id: a.id,
        quantidade: a.quantidade_sugerida_ia > 0 ? a.quantidade_sugerida_ia : a.quantidade_sugerida,
        preco_unitario: a.preco_compra,
      }));
    if (itens.length === 0) return;
    const fornecedorId = avisos.find((a) => selected.has(a.id))?.fornecedor_principal_id ?? '';
    navigate('/compras', { state: { itensPrePreenchidos: itens, fornecedor_id: fornecedorId || undefined } });
  };

  if (loading && avisos.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Carregando avisos...</p>
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
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Avisos de compra</h1>
        <Button
          onClick={gerarPedido}
          disabled={selected.size === 0 || !avisos.some((a) => selected.has(a.id) && (a.quantidade_sugerida_ia > 0 || a.quantidade_sugerida > 0))}
        >
          Gerar pedido de compra ({selected.size} itens)
        </Button>
      </div>

      <p className="text-gray-600">
        Estes produtos estão com saldo igual ou abaixo do estoque mínimo. Reponha para não perder vendas. Selecione os itens e clique em &quot;Gerar pedido de compra&quot; para abrir o módulo Compras com os itens pré-preenchidos.
      </p>

      {avisos.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">Nenhum produto abaixo do estoque mínimo.</p>
        </div>
      ) : (
        <>
          <div className="flex gap-2 items-center">
            <button type="button" onClick={selectAll} className="text-sm text-green-600 hover:underline">
              {selected.size === avisos.length ? 'Desmarcar todos' : 'Marcar todos'}
            </button>
          </div>
          <DataTable
            data={avisos}
            columns={[
              {
                key: 'select',
                label: '',
                sortable: false,
                render: (a: AvisoCompra) => (
                  <input
                    type="checkbox"
                    checked={selected.has(a.id)}
                    onChange={() => toggle(a.id)}
                    disabled={(a.quantidade_sugerida_ia ?? a.quantidade_sugerida) <= 0}
                  />
                ),
              },
              { key: 'codigo', label: 'Código', sortable: true, sortValue: (a: AvisoCompra) => a.codigo },
              { key: 'descricao', label: 'Descrição', sortable: true, sortValue: (a: AvisoCompra) => a.descricao },
              { key: 'tipo', label: 'Tipo', render: (a: AvisoCompra) => TIPO_LABEL[a.tipo] ?? a.tipo, sortValue: (a: AvisoCompra) => a.tipo },
              { key: 'saldo', label: 'Saldo', sortable: true, sortValue: (a: AvisoCompra) => a.saldo },
              { key: 'estoque_minimo', label: 'Mínimo', sortable: true, sortValue: (a: AvisoCompra) => a.estoque_minimo },
              { key: 'estoque_maximo', label: 'Máximo', sortable: true, render: (a: AvisoCompra) => a.estoque_maximo != null ? String(a.estoque_maximo) : '—', sortValue: (a: AvisoCompra) => a.estoque_maximo ?? 0 },
              { key: 'quantidade_sugerida_ia', label: 'Sugerido (IA)', sortable: true, render: (a: AvisoCompra) => (a.quantidade_sugerida_ia ?? a.quantidade_sugerida), sortValue: (a: AvisoCompra) => a.quantidade_sugerida_ia ?? a.quantidade_sugerida },
              { key: 'preco_compra', label: 'Preço compra', render: (a: AvisoCompra) => `R$ ${Number(a.preco_compra).toFixed(2)}`, sortValue: (a: AvisoCompra) => a.preco_compra },
            ]}
            searchPlaceholder="Buscar..."
            emptyMessage="Nenhum aviso"
          />
        </>
      )}
    </div>
  );
}
