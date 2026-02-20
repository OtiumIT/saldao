import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import * as vendasService from '../services/vendas.service';
import * as fornecedoresService from '../../fornecedores/services/fornecedores.service';
import * as estoqueService from '../../estoque/services/estoque.service';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { DataTable } from '../../../components/ui/DataTable';
import type { RelatorioVendasResult, LinhaRelatorioVendas } from '../services/vendas.service';

const MESES: { value: string; label: string }[] = (() => {
  const out: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 24; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    out.push({ value: `${y}-${m}`, label: `${m}/${y}` });
  }
  return out;
})();

function formatDate(s: string): string {
  if (!s) return '—';
  const d = new Date(s + 'T12:00:00');
  return d.toLocaleDateString('pt-BR');
}

function formatMoney(n: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}

export function RelatorioVendasPage() {
  const { token } = useAuth();
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [mes, setMes] = useState('');
  const [fornecedorId, setFornecedorId] = useState('');
  const [produtoId, setProdutoId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RelatorioVendasResult | null>(null);
  const [error, setError] = useState('');
  const [fornecedores, setFornecedores] = useState<Array<{ id: string; nome: string }>>([]);
  const [produtos, setProdutos] = useState<Array<{ id: string; codigo: string; descricao: string; tipo: string }>>([]);

  const loadFornecedores = async () => {
    if (!token) return;
    try {
      const list = await fornecedoresService.listFornecedores(token, 'revenda');
      setFornecedores(list.map((f) => ({ id: f.id, nome: f.nome })));
    } catch {
      setFornecedores([]);
    }
  };

  const loadProdutos = async () => {
    if (!token) return;
    try {
      const list = await estoqueService.listProdutos(token, false);
      const arr = Array.isArray(list) ? list : [];
      setProdutos(
        arr
          .filter((p) => p.tipo === 'revenda' || p.tipo === 'fabricado')
          .map((p) => ({
            id: p.id,
            codigo: p.codigo ?? '',
            descricao: p.descricao ?? '',
            tipo: p.tipo ?? '',
          }))
      );
    } catch {
      setProdutos([]);
    }
  };

  useEffect(() => {
    loadFornecedores();
    loadProdutos();
  }, [token]);

  const handleGerar = async () => {
    if (!token) return;
    setError('');
    let data_inicio: string;
    let data_fim: string;
    if (mes) {
      const [y, m] = mes.split('-');
      data_inicio = `${y}-${m}-01`;
      const lastDay = new Date(Number(y), Number(m), 0).getDate();
      data_fim = `${y}-${m}-${String(lastDay).padStart(2, '0')}`;
    } else if (dataInicio && dataFim) {
      data_inicio = dataInicio;
      data_fim = dataFim;
    } else {
      setError('Informe o período: selecione um mês ou data início e data fim.');
      return;
    }
    setLoading(true);
    try {
      const res = await vendasService.getRelatorioVendas(token, {
        data_inicio,
        data_fim,
        fornecedor_id: fornecedorId.trim() || null,
        produto_id: produtoId.trim() || null,
      });
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar relatório');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const aplicarMes = (valorMes: string) => {
    if (!valorMes) return;
    const [y, m] = valorMes.split('-');
    setDataInicio(`${y}-${m}-01`);
    const lastDay = new Date(Number(y), Number(m), 0).getDate();
    setDataFim(`${y}-${m}-${String(lastDay).padStart(2, '0')}`);
  };

  const fornecedorOptions = [
    { value: '', label: '— Todos os fornecedores —' },
    ...fornecedores.map((f) => ({ value: f.id, label: f.nome })),
  ];
  const produtoOptions = [
    { value: '', label: '— Todos os produtos —' },
    ...produtos.map((p) => ({ value: p.id, label: `${p.codigo} - ${p.descricao}` })),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Relatório de vendas</h1>
        <p className="text-gray-600 text-sm mt-1">
          Período por data início/fim ou por mês. Filtros opcionais: fornecedor (revendas) e produto. Apenas pedidos confirmados ou entregues.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mês (rápido)</label>
            <Select
              options={[{ value: '', label: '— Selecione um mês —' }, ...MESES]}
              value={mes}
              onChange={(e) => {
                const v = e.target.value;
                setMes(v);
                aplicarMes(v);
              }}
            />
          </div>
          <div>
            <Input
              label="Data início"
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
          </div>
          <div>
            <Input
              label="Data fim"
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fornecedor (revendas)</label>
            <Select
              options={fornecedorOptions}
              value={fornecedorId}
              onChange={(e) => setFornecedorId(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Produto</label>
            <Select
              options={produtoOptions}
              value={produtoId}
              onChange={(e) => setProdutoId(e.target.value)}
            />
          </div>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
            {error}
          </div>
        )}
        <Button onClick={handleGerar} disabled={loading}>
          {loading ? 'Gerando...' : 'Gerar relatório'}
        </Button>
      </div>

      {result && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Pedidos</p>
              <p className="text-xl font-semibold text-gray-900">{result.resumo.total_pedidos}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Total vendido</p>
              <p className="text-xl font-semibold text-gray-900">{formatMoney(result.resumo.total_valor)}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Linhas (itens)</p>
              <p className="text-xl font-semibold text-gray-900">{result.resumo.total_linhas}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <h2 className="text-lg font-semibold text-gray-900 p-4 border-b border-gray-200">
              Detalhamento ({result.periodo.data_inicio} a {result.periodo.data_fim})
            </h2>
            {result.linhas.length === 0 ? (
              <p className="p-6 text-gray-500 text-center">Nenhum item no período com os filtros aplicados.</p>
            ) : (
              <DataTable
                data={result.linhas}
                columns={[
                  { key: 'data_pedido', label: 'Data', render: (r: LinhaRelatorioVendas) => formatDate(r.data_pedido), sortValue: (r: LinhaRelatorioVendas) => r.data_pedido, sortable: true },
                  { key: 'pedido_id', label: 'Pedido', render: (r: LinhaRelatorioVendas) => r.pedido_id.slice(0, 8), sortValue: (r: LinhaRelatorioVendas) => r.pedido_id, sortable: true },
                  { key: 'cliente_nome', label: 'Cliente', render: (r: LinhaRelatorioVendas) => r.cliente_nome ?? '—', sortValue: (r: LinhaRelatorioVendas) => (r.cliente_nome ?? '').toLowerCase(), sortable: true },
                  { key: 'produto_codigo', label: 'Código', sortValue: (r: LinhaRelatorioVendas) => r.produto_codigo, sortable: true },
                  { key: 'produto_descricao', label: 'Descrição', render: (r: LinhaRelatorioVendas) => r.produto_descricao, sortValue: (r: LinhaRelatorioVendas) => r.produto_descricao.toLowerCase(), sortable: true },
                  { key: 'produto_tipo', label: 'Tipo', sortValue: (r: LinhaRelatorioVendas) => r.produto_tipo, sortable: true },
                  { key: 'fornecedor_nome', label: 'Fornecedor', render: (r: LinhaRelatorioVendas) => r.fornecedor_nome ?? '—', sortValue: (r: LinhaRelatorioVendas) => (r.fornecedor_nome ?? '').toLowerCase(), sortable: true },
                  { key: 'quantidade', label: 'Qtd', render: (r: LinhaRelatorioVendas) => Number(r.quantidade).toLocaleString('pt-BR'), sortValue: (r: LinhaRelatorioVendas) => r.quantidade, sortable: true },
                  { key: 'preco_unitario', label: 'Preço unit.', render: (r: LinhaRelatorioVendas) => formatMoney(r.preco_unitario), sortValue: (r: LinhaRelatorioVendas) => r.preco_unitario, sortable: true },
                  { key: 'total_item', label: 'Total', render: (r: LinhaRelatorioVendas) => formatMoney(r.total_item), sortValue: (r: LinhaRelatorioVendas) => r.total_item, sortable: true },
                ]}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
