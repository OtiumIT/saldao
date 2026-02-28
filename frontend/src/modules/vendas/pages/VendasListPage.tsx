import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import * as vendasService from '../services/vendas.service';
import * as fornecedoresService from '../../fornecedores/services/fornecedores.service';
import * as estoqueService from '../../estoque/services/estoque.service';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { DataTable } from '../../../components/ui/DataTable';
import type { PedidoVendaComCliente } from '../types/vendas.types';
import type { TotaisVendas } from '../services/vendas.service';
import { formatDateBR } from '../../../shared/lib/format-date';
import { formatNomeFornecedor } from '../../../shared/lib/format-nome';

const STATUS_LABEL: Record<string, string> = {
  rascunho: 'Rascunho',
  confirmado: 'Confirmado',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
};

function formatMoney(n: number): string {
  const val = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
}

function toYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getFiltroRapido(periodo: 'hoje' | 'ontem' | 'esta_semana'): { dataInicio: string; dataFim: string } {
  const hoje = new Date();
  const ontem = new Date(hoje);
  ontem.setDate(ontem.getDate() - 1);
  if (periodo === 'hoje') {
    return { dataInicio: toYMD(hoje), dataFim: toYMD(hoje) };
  }
  if (periodo === 'ontem') {
    return { dataInicio: toYMD(ontem), dataFim: toYMD(ontem) };
  }
  // esta_semana: segunda a hoje
  const dia = hoje.getDay();
  const diasParaSegunda = dia === 0 ? 6 : dia - 1;
  const segunda = new Date(hoje);
  segunda.setDate(segunda.getDate() - diasParaSegunda);
  return { dataInicio: toYMD(segunda), dataFim: toYMD(hoje) };
}

export function VendasListPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [pedidos, setPedidos] = useState<PedidoVendaComCliente[]>([]);
  const [totais, setTotais] = useState<TotaisVendas | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingTotais, setLoadingTotais] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [clienteNome, setClienteNome] = useState('');
  const [fornecedorId, setFornecedorId] = useState('');
  const [produtoId, setProdutoId] = useState('');
  const [incluirCancelados, setIncluirCancelados] = useState(false);
  const [fornecedores, setFornecedores] = useState<Array<{ id: string; nome: string }>>([]);
  const [produtos, setProdutos] = useState<Array<{ id: string; codigo: string; descricao: string }>>([]);

  const filtrosRef = useRef({ dataInicio, dataFim, clienteNome, fornecedorId, produtoId, incluirCancelados });
  filtrosRef.current = { dataInicio, dataFim, clienteNome, fornecedorId, produtoId, incluirCancelados };

  const syncFiltro = (k: 'dataInicio' | 'dataFim' | 'clienteNome' | 'fornecedorId' | 'produtoId' | 'incluirCancelados', v: string | boolean) => {
    (filtrosRef.current as Record<string, string | boolean>)[k] = v;
  };

  const fetchTotais = useCallback(async () => {
    if (!token) return;
    setLoadingTotais(true);
    try {
      const t = await vendasService.getTotaisVendas(token);
      setTotais(t);
    } catch {
      setTotais(null);
    } finally {
      setLoadingTotais(false);
    }
  }, [token]);

  const fetchPedidos = useCallback(
    async (overrides?: Partial<{ dataInicio: string; dataFim: string; clienteNome: string; fornecedorId: string; produtoId: string; incluirCancelados: boolean }>) => {
      if (!token) return;
      setLoading(true);
      setError(null);
      const d = overrides ?? filtrosRef.current;
      try {
        const params: vendasService.ListPedidosVendaParams = {};
        if (d.dataInicio?.trim()) params.data_inicio = d.dataInicio.trim();
        if (d.dataFim?.trim()) params.data_fim = d.dataFim.trim();
        if (d.clienteNome?.trim()) params.cliente_nome = d.clienteNome.trim();
        if (d.fornecedorId?.trim()) params.fornecedor_id = d.fornecedorId.trim();
        if (d.produtoId?.trim()) params.produto_id = d.produtoId.trim();
        if (d.incluirCancelados) params.incluir_cancelados = true;
        const data = await vendasService.listPedidosVenda(token, params);
        setPedidos(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar vendas');
        setPedidos([]);
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const [clienteNomeDebounced, setClienteNomeDebounced] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setClienteNomeDebounced(clienteNome), 400);
    return () => clearTimeout(t);
  }, [clienteNome]);

  useEffect(() => {
    fetchTotais();
  }, [fetchTotais]);

  useEffect(() => {
    fetchPedidos({ dataInicio, dataFim, clienteNome: clienteNomeDebounced, fornecedorId, produtoId, incluirCancelados });
  }, [token, dataInicio, dataFim, clienteNomeDebounced, fornecedorId, produtoId, incluirCancelados, fetchPedidos]);

  useEffect(() => {
    if (!token) return;
    fornecedoresService.listFornecedores(token).then(
      (list) => setFornecedores(list.map((f) => ({ id: f.id, nome: f.nome }))),
      () => setFornecedores([])
    );
  }, [token]);

  useEffect(() => {
    if (!token) return;
    estoqueService.listProdutos(token, false).then(
      (list) => {
        const arr = Array.isArray(list) ? list : [];
        setProdutos(
          arr
            .filter((p) => p.tipo === 'revenda' || p.tipo === 'fabricado')
            .map((p) => ({
              id: p.id,
              codigo: p.codigo ?? '',
              descricao: p.descricao ?? '',
            }))
        );
      },
      () => setProdutos([])
    );
  }, [token]);

  const handleConfirmar = async (p: PedidoVendaComCliente) => {
    if (!confirm('Confirmar pedido? Será dada baixa no estoque.')) return;
    if (!token) return;
    try {
      await vendasService.confirmarPedidoVenda(
        p.id,
        token,
        (p as { previsao_entrega_em_dias?: number | null }).previsao_entrega_em_dias
          ? { previsao_entrega_em_dias: (p as { previsao_entrega_em_dias?: number }).previsao_entrega_em_dias }
          : undefined
      );
      fetchPedidos();
      fetchTotais();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao confirmar';
      if (typeof msg === 'string' && msg.includes('previsão')) {
        const dias = window.prompt(msg + '\n\nInforme a previsão de entrega em dias (ex.: 7):');
        if (dias != null) {
          const n = parseInt(dias, 10);
          if (!isNaN(n) && n >= 1) {
            try {
              await vendasService.confirmarPedidoVenda(p.id, token, { previsao_entrega_em_dias: n });
              fetchPedidos();
              fetchTotais();
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
    if (!token) return;
    try {
      await vendasService.marcarEntregue(p.id, token);
      fetchPedidos();
      fetchTotais();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro');
    }
  };

  const handleCancelar = async (p: PedidoVendaComCliente) => {
    if (!confirm('Cancelar esta venda? Os itens serão devolvidos ao estoque e o pedido ficará como cancelado.')) return;
    if (!token) return;
    try {
      await vendasService.cancelarPedidoVenda(p.id, token);
      fetchPedidos();
      fetchTotais();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao cancelar');
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
        Erro: {error}
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

      {/* Totais do dia, semana e mês */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total do dia</p>
          <p className="text-xl font-bold text-gray-900 mt-1">
            {loadingTotais ? '...' : formatMoney(totais?.total_dia ?? 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total da semana</p>
          <p className="text-xl font-bold text-gray-900 mt-1">
            {loadingTotais ? '...' : formatMoney(totais?.total_semana ?? 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total do mês</p>
          <p className="text-xl font-bold text-gray-900 mt-1">
            {loadingTotais ? '...' : formatMoney(totais?.total_mes ?? 0)}
          </p>
        </div>
      </div>

      {/* Filtros e pesquisa */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-800 mb-3">Filtros e pesquisa</h2>
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="text-xs text-gray-500 self-center mr-1">Rápido:</span>
          {(['hoje', 'ontem', 'esta_semana'] as const).map((p) => {
            const { dataInicio, dataFim } = getFiltroRapido(p);
            const label = p === 'hoje' ? 'Hoje' : p === 'ontem' ? 'Ontem' : 'Esta semana';
            return (
              <Button
                key={p}
                variant="secondary"
                size="sm"
                onClick={() => {
                  setDataInicio(dataInicio);
                  setDataFim(dataFim);
                  syncFiltro('dataInicio', dataInicio);
                  syncFiltro('dataFim', dataFim);
                }}
              >
                {label}
              </Button>
            );
          })}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <Input
            label="Data início"
            type="date"
            value={dataInicio}
            onChange={(e) => {
              const v = e.target.value;
              setDataInicio(v);
              syncFiltro('dataInicio', v);
            }}
          />
          <Input
            label="Data fim"
            type="date"
            value={dataFim}
            onChange={(e) => {
              const v = e.target.value;
              setDataFim(v);
              syncFiltro('dataFim', v);
            }}
          />
          <Input
            label="Cliente"
            value={clienteNome}
            onChange={(e) => {
              const v = e.target.value;
              setClienteNome(v);
              syncFiltro('clienteNome', v);
            }}
            placeholder="Nome do cliente"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fornecedor</label>
            <Select
              options={[
                { value: '', label: '— Todos —' },
                ...fornecedores.map((f) => ({ value: f.id, label: formatNomeFornecedor(f.nome) || f.nome })),
              ]}
              value={fornecedorId}
              onChange={(e) => {
                const v = e.target.value;
                setFornecedorId(v);
                syncFiltro('fornecedorId', v);
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Produto</label>
            <Select
              options={[
                { value: '', label: '— Todos —' },
                ...produtos.map((p) => ({ value: p.id, label: `${p.codigo} — ${p.descricao}` })),
              ]}
              value={produtoId}
              onChange={(e) => {
                const v = e.target.value;
                setProdutoId(v);
                syncFiltro('produtoId', v);
              }}
            />
          </div>
        </div>
        <div className="mt-2 flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setDataInicio('');
              setDataFim('');
              setClienteNome('');
              setFornecedorId('');
              setProdutoId('');
              setIncluirCancelados(false);
            }}
          >
            Limpar
          </Button>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={incluirCancelados}
              onChange={(e) => {
                const v = e.target.checked;
                setIncluirCancelados(v);
                syncFiltro('incluirCancelados', v);
              }}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Exibir cancelados</span>
          </label>
        </div>
      </div>

      {/* Resumo e grid com loading */}
      <div className="relative min-h-[200px]">
        {loading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 rounded-xl">
            <span className="text-gray-600 font-medium">Carregando...</span>
          </div>
        )}
      {/* Resumo do período filtrado */}
      {(() => {
        const ativos = pedidos.filter((p) => p.status !== 'cancelado');
        const cancelados = pedidos.filter((p) => p.status === 'cancelado');
        const totalAtivos = ativos.reduce((s, p) => s + Number(p.total ?? 0), 0);
        const totalCancelados = cancelados.reduce((s, p) => s + Number(p.total ?? 0), 0);
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">Período buscado</h2>
            <div className={`grid grid-cols-2 gap-4 ${cancelados.length > 0 ? 'sm:grid-cols-4' : 'sm:grid-cols-2'}`}>
              <div>
                <p className="text-sm text-gray-500">Qtd vendas</p>
                <p className="text-xl font-bold text-gray-900">{ativos.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total vendas</p>
                <p className="text-xl font-bold text-gray-900">{formatMoney(totalAtivos)}</p>
              </div>
              {cancelados.length > 0 && (
                <>
                  <div>
                    <p className="text-sm text-gray-500">Qtd cancelados</p>
                    <p className="text-xl font-bold text-gray-900">{cancelados.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total cancelados</p>
                    <p className="text-xl font-bold text-gray-900">{formatMoney(totalCancelados)}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })()}

      {pedidos.length === 0 && !loading ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">Nenhuma venda encontrada</p>
          <Link to="/vendas/caixa">
            <Button>Abrir caixa e registrar venda</Button>
          </Link>
        </div>
      ) : (
        <DataTable
          data={pedidos}
          columns={[
            { key: 'data_pedido', label: 'Data', sortable: true, render: (p) => formatDateBR(p.data_pedido), sortValue: (p) => p.data_pedido },
            { key: 'cliente_nome', label: 'Cliente', render: (p) => p.cliente_nome ?? 'Retirada', sortValue: (p) => p.cliente_nome ?? '' },
            { key: 'tipo_entrega', label: 'Entrega', render: (p) => (p.tipo_entrega === 'entrega' ? 'Sim' : 'Retirada'), sortValue: (p) => p.tipo_entrega },
            { key: 'status', label: 'Status', render: (p) => STATUS_LABEL[p.status] ?? p.status, sortValue: (p) => p.status },
            {
              key: 'previsao_entrega',
              label: 'Previsão (dias)',
              render: (p) => (p as { previsao_entrega_em_dias?: number | null }).previsao_entrega_em_dias ?? '—',
              sortValue: (p) => (p as { previsao_entrega_em_dias?: number | null }).previsao_entrega_em_dias ?? 0,
            },
            {
              key: 'valor_frete',
              label: 'Frete',
              render: (p) => (p.valor_frete && Number(p.valor_frete) > 0 ? `R$ ${Number(p.valor_frete).toFixed(2)}` : '—'),
              sortValue: (p) => Number(p.valor_frete ?? 0),
            },
            { key: 'total', label: 'Total', render: (p) => `R$ ${Number(p.total).toFixed(2)}`, sortValue: (p) => p.total },
            {
              key: 'actions',
              label: 'Ações',
              render: (p) => (
                <div className="flex gap-2 flex-wrap">
                  <Button variant="secondary" size="sm" onClick={() => navigate(`/vendas/${p.id}`)}>
                    Ver
                  </Button>
                  {p.status === 'rascunho' && (
                    <Button variant="secondary" size="sm" onClick={() => handleConfirmar(p)}>
                      Confirmar
                    </Button>
                  )}
                  {p.status === 'confirmado' && p.tipo_entrega === 'entrega' && (
                    <Button variant="secondary" size="sm" onClick={() => handleEntregue(p)}>
                      Marcar entregue
                    </Button>
                  )}
                  {(p.status === 'confirmado' || p.status === 'entregue') && (
                    <Button variant="danger" size="sm" onClick={() => handleCancelar(p)}>
                      Cancelar
                    </Button>
                  )}
                </div>
              ),
            },
          ]}
          searchPlaceholder="Buscar na lista..."
          emptyMessage="Nenhuma venda"
        />
      )}
      </div>
    </div>
  );
}
