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
import { MapaEntregasModal } from '../components/MapaEntregasModal';
import { whatsappNumber } from '../lib/pedido-print-whatsapp';

const STATUS_LABEL: Record<string, string> = {
  rascunho: 'Rascunho',
  confirmado: 'Confirmado',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
};

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'rascunho', label: 'Rascunho' },
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'entregue', label: 'Entregue' },
  { value: 'cancelado', label: 'Cancelado' },
];

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
  if (periodo === 'hoje') return { dataInicio: toYMD(hoje), dataFim: toYMD(hoje) };
  if (periodo === 'ontem') return { dataInicio: toYMD(ontem), dataFim: toYMD(ontem) };
  const dia = hoje.getDay();
  const diasParaSegunda = dia === 0 ? 6 : dia - 1;
  const segunda = new Date(hoje);
  segunda.setDate(segunda.getDate() - diasParaSegunda);
  return { dataInicio: toYMD(segunda), dataFim: toYMD(hoje) };
}

function getWhatsAppUrl(fone: string | null | undefined): string | null {
  const num = whatsappNumber(fone);
  return num ? `https://wa.me/${num}` : null;
}

function WhatsAppButton({ fone, className }: { fone: string | null | undefined; className?: string }) {
  const url = getWhatsAppUrl(fone);
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors touch-manipulation ${className ?? ''}`}
      title="Abrir WhatsApp"
      onClick={(e) => e.stopPropagation()}
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    </a>
  );
}

export function VendasListPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [pedidos, setPedidos] = useState<PedidoVendaComCliente[]>([]);
  const [totais, setTotais] = useState<TotaisVendas | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingTotais, setLoadingTotais] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [clienteNome, setClienteNome] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [fornecedorId, setFornecedorId] = useState('');
  const [produtoId, setProdutoId] = useState('');
  const [incluirCancelados, setIncluirCancelados] = useState(false);
  const [fornecedores, setFornecedores] = useState<Array<{ id: string; nome: string }>>([]);
  const [produtos, setProdutos] = useState<Array<{ id: string; codigo: string; descricao: string }>>([]);
  const [mapaEntregasOpen, setMapaEntregasOpen] = useState(false);

  const filtrosRef = useRef({ dataInicio, dataFim, clienteNome, statusFiltro, fornecedorId, produtoId, incluirCancelados });
  filtrosRef.current = { dataInicio, dataFim, clienteNome, statusFiltro, fornecedorId, produtoId, incluirCancelados };

  const syncFiltro = (k: keyof typeof filtrosRef.current, v: string | boolean) => {
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
    async (overrides?: Partial<typeof filtrosRef.current>) => {
      if (!token) return;
      setLoading(true);
      setError(null);
      const d = overrides ?? filtrosRef.current;
      try {
        const params: vendasService.ListPedidosVendaParams = {};
        if (d.dataInicio?.trim()) params.data_inicio = d.dataInicio.trim();
        if (d.dataFim?.trim()) params.data_fim = d.dataFim.trim();
        if (d.clienteNome?.trim()) params.cliente_nome = d.clienteNome.trim();
        if (d.statusFiltro?.trim()) params.status = d.statusFiltro.trim();
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
    fetchPedidos({ dataInicio, dataFim, clienteNome: clienteNomeDebounced, statusFiltro, fornecedorId, produtoId, incluirCancelados });
  }, [token, dataInicio, dataFim, clienteNomeDebounced, statusFiltro, fornecedorId, produtoId, incluirCancelados, fetchPedidos]);

  useEffect(() => {
    if (!token) return;
    fornecedoresService.listFornecedores(token).then(
      (list) => setFornecedores(list.map((f) => ({ id: f.id, nome: formatNomeFornecedor(f.nome) || f.nome }))),
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
            .map((p) => ({ id: p.id, codigo: p.codigo ?? '', descricao: p.descricao ?? '' }))
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

  const limparFiltros = () => {
    setDataInicio('');
    setDataFim('');
    setClienteNome('');
    setStatusFiltro('');
    setFornecedorId('');
    setProdutoId('');
    setIncluirCancelados(false);
  };

  const ativos = pedidos.filter((p) => p.status !== 'cancelado');
  const cancelados = pedidos.filter((p) => p.status === 'cancelado');
  const totalAtivos = ativos.reduce((s, p) => s + Number(p.total ?? 0), 0);

  if (loading && pedidos.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[280px]">
        <p className="text-gray-500">Carregando vendas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          Erro: {error}
        </div>
        <Button onClick={() => fetchPedidos()}>Tentar novamente</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header: título + ações principais */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Histórico de Vendas</h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setMapaEntregasOpen(true)} className="min-h-[44px] touch-manipulation">
            Mapa de Entregas
          </Button>
          <Link to="/vendas/caixa">
            <Button className="min-h-[44px] touch-manipulation w-full sm:w-auto">Abrir caixa</Button>
          </Link>
        </div>
      </div>

      <MapaEntregasModal isOpen={mapaEntregasOpen} onClose={() => setMapaEntregasOpen(false)} token={token} />

      {/* Totais: cards compactos, touch-friendly */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 shadow-sm">
          <p className="text-xs sm:text-sm font-medium text-gray-500">Hoje</p>
          <p className="text-lg sm:text-xl font-bold text-gray-900 mt-0.5">
            {loadingTotais ? '...' : formatMoney(totais?.total_dia ?? 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 shadow-sm">
          <p className="text-xs sm:text-sm font-medium text-gray-500">Semana</p>
          <p className="text-lg sm:text-xl font-bold text-gray-900 mt-0.5">
            {loadingTotais ? '...' : formatMoney(totais?.total_semana ?? 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 shadow-sm">
          <p className="text-xs sm:text-sm font-medium text-gray-500">Mês</p>
          <p className="text-lg sm:text-xl font-bold text-gray-900 mt-0.5">
            {loadingTotais ? '...' : formatMoney(totais?.total_mes ?? 0)}
          </p>
        </div>
      </div>

      {/* Filtros: chips rápidos + painel colapsável */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-sm font-medium text-gray-700">Período rápido:</span>
          {(['hoje', 'ontem', 'esta_semana'] as const).map((p) => {
            const { dataInicio: di, dataFim: df } = getFiltroRapido(p);
            const label = p === 'hoje' ? 'Hoje' : p === 'ontem' ? 'Ontem' : 'Esta semana';
            const ativo = dataInicio === di && dataFim === df;
            return (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setDataInicio(di);
                  setDataFim(df);
                  syncFiltro('dataInicio', di);
                  syncFiltro('dataFim', df);
                }}
                className={`min-h-[44px] px-4 rounded-lg text-sm font-medium touch-manipulation transition-colors ${
                  ativo ? 'bg-brand-gold text-gray-900' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setFiltrosAbertos((o) => !o)}
            className="ml-auto min-h-[44px] px-3 text-sm text-brand-gold hover:text-brand-gold-dark font-medium touch-manipulation"
          >
            {filtrosAbertos ? 'Menos filtros' : 'Mais filtros'}
          </button>
        </div>

        {filtrosAbertos && (
          <div className="pt-3 border-t border-gray-100 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Input
                label="Data início"
                type="date"
                value={dataInicio}
                onChange={(e) => {
                  const v = e.target.value;
                  setDataInicio(v);
                  syncFiltro('dataInicio', v);
                }}
                className="min-h-[44px]"
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
                className="min-h-[44px]"
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
                className="min-h-[44px]"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <Select
                  options={STATUS_OPTIONS}
                  value={statusFiltro}
                  onChange={(e) => {
                    const v = e.target.value;
                    setStatusFiltro(v);
                    syncFiltro('statusFiltro', v);
                  }}
                  className="min-h-[44px]"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fornecedor</label>
                <Select
                  options={[{ value: '', label: '— Todos —' }, ...fornecedores.map((f) => ({ value: f.id, label: f.nome }))]}
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
                  options={[{ value: '', label: '— Todos —' }, ...produtos.map((p) => ({ value: p.id, label: `${p.codigo} — ${p.descricao}` }))]}
                  value={produtoId}
                  onChange={(e) => {
                    const v = e.target.value;
                    setProdutoId(v);
                    syncFiltro('produtoId', v);
                  }}
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="secondary" size="sm" onClick={limparFiltros} className="min-h-[44px] touch-manipulation">
                Limpar filtros
              </Button>
              <label className="flex items-center gap-2 cursor-pointer min-h-[44px] touch-manipulation">
                <input
                  type="checkbox"
                  checked={incluirCancelados}
                  onChange={(e) => {
                    const v = e.target.checked;
                    setIncluirCancelados(v);
                    syncFiltro('incluirCancelados', v);
                  }}
                  className="rounded border-gray-300 w-5 h-5"
                />
                <span className="text-sm text-gray-700">Exibir cancelados</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Resumo do período */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div>
            <p className="text-xs sm:text-sm text-gray-500">Vendas no período</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{ativos.length}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-500">Total</p>
            <p className="text-xl sm:text-2xl font-bold text-brand-gold">{formatMoney(totalAtivos)}</p>
          </div>
          {cancelados.length > 0 && (
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Cancelados</p>
              <p className="text-xl font-bold text-red-600">{cancelados.length}</p>
            </div>
          )}
        </div>
      </div>

      {/* Lista: cards em mobile/tablet, tabela em desktop */}
      {pedidos.length === 0 && !loading ? (
        <div className="text-center py-12 sm:py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
          <p className="text-gray-500 mb-2">Nenhuma venda encontrada para os filtros selecionados.</p>
          <p className="text-sm text-gray-400 mb-4">Ajuste os filtros ou registre uma nova venda.</p>
          <Link to="/vendas/caixa">
            <Button className="min-h-[48px] px-6 touch-manipulation">Abrir caixa e registrar venda</Button>
          </Link>
        </div>
      ) : (
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-xl min-h-[120px]">
              <span className="text-gray-600 font-medium">Atualizando...</span>
            </div>
          )}
          <DataTable
            data={pedidos}
            columns={[
              {
                key: 'data_pedido',
                label: 'Data',
                sortable: true,
                render: (p) => <span className="text-xs">{formatDateBR(p.data_pedido)}</span>,
                sortValue: (p) => p.data_pedido,
              },
              {
                key: 'cliente_nome',
                label: 'Cliente',
                sortable: true,
                titleValue: (p) => p.cliente_nome ?? '',
                render: (p) => (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs max-w-[120px] truncate" title={p.cliente_nome ?? undefined}>{p.cliente_nome ?? 'Retirada'}</span>
                    <WhatsAppButton fone={p.cliente_fone} />
                  </div>
                ),
                sortValue: (p) => p.cliente_nome ?? '',
              },
              {
                key: 'tipo_entrega',
                label: 'Ent.',
                render: (p) => (
                  <span className={`text-xs ${p.tipo_entrega === 'entrega' ? 'text-amber-700' : 'text-gray-500'}`}>
                    {p.tipo_entrega === 'entrega' ? 'Sim' : 'Ret.'}
                  </span>
                ),
                sortValue: (p) => p.tipo_entrega,
              },
              {
                key: 'micro_regiao_entrega',
                label: 'Macro',
                sortable: true,
                titleValue: (p) => (p.tipo_entrega === 'entrega' ? (p.micro_regiao_entrega ?? '') : ''),
                render: (p) => {
                  if (p.tipo_entrega !== 'entrega') return <span className="text-xs text-gray-400">—</span>;
                  const macro = p.micro_regiao_entrega?.trim() || '';
                  const zona = p.zona_entrega?.trim() || '';
                  // Se macro === zona (duplicado do Google), não repetir
                  const exibir = macro && macro.toLowerCase() !== zona.toLowerCase() ? macro : '—';
                  return (
                    <span className="block max-w-[90px] truncate text-xs" title={exibir !== '—' ? (p.micro_regiao_entrega ?? undefined) : undefined}>
                      {exibir}
                    </span>
                  );
                },
                sortValue: (p) => (p.tipo_entrega === 'entrega' ? (p.micro_regiao_entrega ?? '') : ''),
              },
              {
                key: 'zona_entrega',
                label: 'Zona',
                sortable: true,
                titleValue: (p) => (p.tipo_entrega === 'entrega' ? (p.zona_entrega ?? '') : ''),
                render: (p) => {
                  if (p.tipo_entrega !== 'entrega') return <span className="text-xs text-gray-400">—</span>;
                  const zona = p.zona_entrega?.trim() || '—';
                  return (
                    <span className="block max-w-[100px] truncate text-xs" title={p.zona_entrega ?? undefined}>
                      {zona}
                    </span>
                  );
                },
                sortValue: (p) => (p.tipo_entrega === 'entrega' ? (p.zona_entrega ?? '') : ''),
              },
              {
                key: 'status',
                label: 'Status',
                render: (p) => (
                  <span
                    className={`inline-flex px-1.5 py-0.5 rounded text-[11px] font-medium ${
                      p.status === 'entregue'
                        ? 'bg-green-100 text-green-800'
                        : p.status === 'confirmado'
                          ? 'bg-blue-100 text-blue-800'
                          : p.status === 'rascunho'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {STATUS_LABEL[p.status] ?? p.status}
                  </span>
                ),
                sortValue: (p) => p.status,
              },
              {
                key: 'total',
                label: 'Total',
                sortable: true,
                render: (p) => <span className="text-xs font-semibold">{formatMoney(Number(p.total ?? 0))}</span>,
                sortValue: (p) => p.total ?? 0,
              },
              {
                key: 'actions',
                label: 'Ações',
                render: (p) => (
                  <div className="flex gap-1 flex-wrap" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/vendas/${p.id}`)}
                      title="Ver"
                      className="min-h-[32px] min-w-[32px] p-1.5 touch-manipulation"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Button>
                    {p.status === 'rascunho' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleConfirmar(p)}
                        title="Confirmar"
                        className="min-h-[32px] min-w-[32px] p-1.5 touch-manipulation"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </Button>
                    )}
                    {p.status === 'confirmado' && p.tipo_entrega === 'entrega' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEntregue(p)}
                        title="Entregue"
                        className="min-h-[32px] min-w-[32px] p-1.5 touch-manipulation"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                      </Button>
                    )}
                    {(p.status === 'confirmado' || p.status === 'entregue') && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleCancelar(p)}
                        title="Cancelar"
                        className="min-h-[32px] min-w-[32px] p-1.5 touch-manipulation"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </Button>
                    )}
                  </div>
                ),
              },
            ]}
            searchPlaceholder="Buscar por cliente, data..."
            emptyMessage="Nenhuma venda"
            onRowClick={(p) => navigate(`/vendas/${p.id}`)}
            mobileTitleColumnKeys={['cliente_nome', 'total']}
            initialSortColumn="data_pedido"
            initialSortDirection="desc"
          />
        </div>
      )}
    </div>
  );
}
