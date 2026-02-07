import { useState, useEffect } from 'react';
import { useMovimentacoes, FiltrosMovimentacao } from '../hooks/useMovimentacoes';
import { useProdutos } from '../hooks/useProdutos';
import { Button } from '../../../components/ui/Button';
import { DataTable } from '../../../components/ui/DataTable';
import { Select } from '../../../components/ui/Select';
import type { MovimentacaoComProduto } from '../types/estoque.types';

const TIPO_LABEL: Record<string, string> = {
  entrada: 'Entrada',
  saida: 'Saída',
  ajuste: 'Ajuste',
  producao: 'Produção',
};

export function MovimentacoesPage() {
  const [filtros, setFiltros] = useState<FiltrosMovimentacao>({});
  const { movimentacoes, loading, error } = useMovimentacoes(filtros);
  const { produtos } = useProdutos(true);

  const [produtoId, setProdutoId] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  useEffect(() => {
    const hoje = new Date().toISOString().slice(0, 10);
    const mesAtras = new Date();
    mesAtras.setMonth(mesAtras.getMonth() - 1);
    setDataInicio(mesAtras.toISOString().slice(0, 10));
    setDataFim(hoje);
  }, []);

  const applyFilters = () => {
    setFiltros({
      produto_id: produtoId || undefined,
      data_inicio: dataInicio || undefined,
      data_fim: dataFim || undefined,
    });
  };

  if (loading && movimentacoes.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Carregando movimentações...</p>
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
      <h1 className="text-2xl font-bold text-gray-900">Movimentações de estoque</h1>

      <div className="bg-white p-4 rounded-lg shadow flex flex-wrap gap-4 items-end">
        <Select
          label="Produto"
          options={[{ value: '', label: '— Todos —' }, ...produtos.map((p) => ({ value: p.id, label: `${p.codigo} - ${p.descricao}` }))]}
          value={produtoId}
          onChange={(e) => setProdutoId(e.target.value)}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data início</label>
          <input
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data fim</label>
          <input
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
          />
        </div>
        <Button onClick={applyFilters}>Filtrar</Button>
      </div>

      <DataTable
        data={movimentacoes}
        columns={[
          { key: 'data', label: 'Data', sortable: true, render: (m: MovimentacaoComProduto) => m.data, sortValue: (m) => m.data },
          { key: 'tipo', label: 'Tipo', sortable: true, render: (m) => TIPO_LABEL[m.tipo] ?? m.tipo, sortValue: (m) => m.tipo },
          { key: 'produto_codigo', label: 'Código', render: (m) => m.produto_codigo ?? '-', sortValue: (m) => m.produto_codigo ?? '' },
          { key: 'produto_descricao', label: 'Produto', render: (m) => m.produto_descricao ?? '-', sortValue: (m) => m.produto_descricao ?? '' },
          {
            key: 'quantidade',
            label: 'Quantidade',
            sortable: true,
            render: (m) => {
              const q = Math.round(Number(m.quantidade));
              return (
                <span className={q >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {q >= 0 ? '+' : ''}{q}
                </span>
              );
            },
            sortValue: (m) => Math.round(Number(m.quantidade)),
          },
          { key: 'cor_nome', label: 'Cor', render: (m) => m.cor_nome ?? '—', sortValue: (m) => m.cor_nome ?? '' },
          { key: 'observacao', label: 'Observação', render: (m) => m.observacao ?? '-', sortValue: (m) => m.observacao ?? '' },
        ]}
        searchPlaceholder="Buscar..."
        emptyMessage="Nenhuma movimentação no período"
      />
    </div>
  );
}
