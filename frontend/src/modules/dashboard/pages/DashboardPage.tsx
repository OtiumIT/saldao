import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { useAvisosCompra } from '../../avisos-compra/hooks/useAvisosCompra';
import { useVendas } from '../../vendas/hooks/useVendas';
import * as vendasService from '../../vendas/services/vendas.service';
import * as roteirizacaoService from '../../roteirizacao/services/roteirizacao.service';
import * as financeiroService from '../../financeiro/services/financeiro.service';
import type { ResumoFinanceiro } from '../../financeiro/types/financeiro.types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { formatNomeFornecedor } from '../../../shared/lib/format-nome';
import * as estoqueService from '../../estoque/services/estoque.service';
import * as comprasService from '../../compras/services/compras.service';
import * as categoriasService from '../../categorias-produto/services/categorias-produto.service';

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function toYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export type PeriodoGraficos = '90dias' | 'mes_atual' | 'mes_passado' | 'trimestre';

function getRangePeriodo(periodo: PeriodoGraficos): { data_inicio: string; data_fim: string; label: string } {
  const now = new Date();
  const ano = now.getFullYear();
  const mes = now.getMonth();

  switch (periodo) {
    case '90dias': {
      const fim = new Date(now);
      const inicio = new Date(fim);
      inicio.setDate(inicio.getDate() - 90);
      return { data_inicio: toYMD(inicio), data_fim: toYMD(fim), label: 'Últimos 90 dias' };
    }
    case 'mes_atual': {
      const m = mes + 1;
      const ultimoDia = new Date(ano, mes + 1, 0).getDate();
      return {
        data_inicio: `${ano}-${String(m).padStart(2, '0')}-01`,
        data_fim: `${ano}-${String(m).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`,
        label: `${MESES[mes]} ${ano}`,
      };
    }
    case 'mes_passado': {
      const mesAnt = mes === 0 ? 11 : mes - 1;
      const anoAnt = mes === 0 ? ano - 1 : ano;
      const ultimoDia = new Date(anoAnt, mesAnt + 1, 0).getDate();
      const m = mesAnt + 1;
      return {
        data_inicio: `${anoAnt}-${String(m).padStart(2, '0')}-01`,
        data_fim: `${anoAnt}-${String(m).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`,
        label: `${MESES[mesAnt]} ${anoAnt}`,
      };
    }
    case 'trimestre': {
      const fim = new Date(now);
      const inicio = new Date(ano, mes - 2, 1);
      return {
        data_inicio: toYMD(inicio),
        data_fim: toYMD(fim),
        label: `Últimos 3 meses`,
      };
    }
    default:
      return getRangePeriodo('90dias');
  }
}

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const PERIODO_OPCOES: { value: PeriodoGraficos; label: string }[] = [
  { value: '90dias', label: '90 dias' },
  { value: 'mes_atual', label: 'Este mês' },
  { value: 'mes_passado', label: 'Mês passado' },
  { value: 'trimestre', label: 'Trimestre' },
];

export function DashboardPage() {
  const { token } = useAuth();
  const [periodoGraficos, setPeriodoGraficos] = useState<PeriodoGraficos>('90dias');

  const { data_inicio: dataMesInicio, data_fim: dataMesFim } = useMemo(() => getRangePeriodo('mes_atual'), []);
  const mesLabel = useMemo(() => {
    const m = new Date().getMonth();
    return `${MESES[m]} ${new Date().getFullYear()}`;
  }, []);

  const { data_inicio: dataGraficosInicio, data_fim: dataGraficosFim, label: periodoLabel } = useMemo(
    () => getRangePeriodo(periodoGraficos),
    [periodoGraficos]
  );

  const { avisos, loading: loadingAvisos } = useAvisosCompra();
  const { pedidos: pedidosMes, loading: loadingVendas } = useVendas({ data_inicio: dataMesInicio, data_fim: dataMesFim });

  const [pedidosGraficos, setPedidosGraficos] = useState<Array<{ data_pedido: string; total: number; status: string }>>([]);
  const [loadingGraficos, setLoadingGraficos] = useState(true);

  const [relatorioVendas, setRelatorioVendas] = useState<
    Array<{
      fornecedor_nome: string | null;
      total_item: number;
      produto_tipo: string;
      produto_id: string;
      produto_descricao: string;
      cliente_nome: string | null;
      quantidade: number;
      preco_unitario: number;
    }>
  >([]);
  const [loadingRelatorio, setLoadingRelatorio] = useState(true);

  const [produtos, setProdutos] = useState<
    Array<{ id: string; categoria_id: string | null; preco_compra: number; saldo: number }>
  >([]);
  const [categorias, setCategorias] = useState<Array<{ id: string; nome: string }>>([]);
  const [compras, setCompras] = useState<Array<{ data_pedido: string; total: number }>>([]);
  const [pedidosMesPassado, setPedidosMesPassado] = useState<Array<{ total: number }>>([]);
  const [loadingAux, setLoadingAux] = useState(true);

  const [pendentesEntrega, setPendentesEntrega] = useState<Array<{ id: string; cliente_nome: string | null; endereco_entrega: string | null; total: number }>>([]);
  const [loadingEntregas, setLoadingEntregas] = useState(true);
  const [resumoFinanceiro, setResumoFinanceiro] = useState<ResumoFinanceiro | null>(null);
  const [loadingFinanceiro, setLoadingFinanceiro] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoadingGraficos(true);
    vendasService
      .listPedidosVenda(token, { data_inicio: dataGraficosInicio, data_fim: dataGraficosFim })
      .then((list) => setPedidosGraficos(list.map((p) => ({ data_pedido: p.data_pedido, total: Number(p.total ?? 0), status: p.status }))))
      .catch(() => setPedidosGraficos([]))
      .finally(() => setLoadingGraficos(false));
  }, [token, dataGraficosInicio, dataGraficosFim]);

  useEffect(() => {
    if (!token) return;
    vendasService
      .getRelatorioVendas(token, { data_inicio: dataGraficosInicio, data_fim: dataGraficosFim, incluir_rascunho: true })
      .then((res) =>
        setRelatorioVendas(
          res.linhas.map((l) => ({
            fornecedor_nome: l.fornecedor_nome,
            total_item: l.total_item,
            produto_tipo: l.produto_tipo ?? '',
            produto_id: l.produto_id,
            produto_descricao: l.produto_descricao,
            cliente_nome: l.cliente_nome,
            quantidade: l.quantidade,
            preco_unitario: l.preco_unitario,
          }))
        )
      )
      .catch(() => setRelatorioVendas([]))
      .finally(() => setLoadingRelatorio(false));
  }, [token, dataGraficosInicio, dataGraficosFim]);

  const { data_inicio: dataMesPassadoInicio, data_fim: dataMesPassadoFim } = useMemo(() => getRangePeriodo('mes_passado'), []);

  useEffect(() => {
    if (!token) return;
    setLoadingAux(true);
    Promise.all([
      estoqueService.listProdutos(token, true).then((p) =>
        setProdutos(
          (p as Array<{ id: string; categoria_id: string | null; preco_compra: number; saldo?: number }>).map((x) => ({
            id: x.id,
            categoria_id: x.categoria_id,
            preco_compra: Number(x.preco_compra ?? 0),
            saldo: Number(x.saldo ?? 0),
          }))
        )
      ),
      categoriasService.listCategoriasProduto(token).then(setCategorias),
      comprasService.listPedidosCompra(token).then((list) =>
        setCompras(list.map((c) => ({ data_pedido: c.data_pedido, total: Number(c.total ?? 0) })))
      ),
      vendasService.listPedidosVenda(token, { data_inicio: dataMesPassadoInicio, data_fim: dataMesPassadoFim }).then((list) =>
        setPedidosMesPassado(list.filter((p) => p.status !== 'cancelado').map((p) => ({ total: Number(p.total ?? 0) })))
      ),
    ]).catch(() => {}).finally(() => setLoadingAux(false));
  }, [token, dataMesPassadoInicio, dataMesPassadoFim]);

  useEffect(() => {
    if (!token) return;
    roteirizacaoService
      .listPendentesEntrega(token)
      .then(setPendentesEntrega)
      .catch(() => setPendentesEntrega([]))
      .finally(() => setLoadingEntregas(false));
  }, [token]);

  useEffect(() => {
    if (!token) return;
    financeiroService
      .getResumo(token, dataMesInicio, dataMesFim)
      .then(setResumoFinanceiro)
      .catch(() => setResumoFinanceiro(null))
      .finally(() => setLoadingFinanceiro(false));
  }, [token, dataMesInicio, dataMesFim]);

  const vendasNaoCanceladas = useMemo(
    () => pedidosMes.filter((p) => p.status !== 'cancelado'),
    [pedidosMes]
  );

  const vendasGraficosNaoCanceladas = useMemo(
    () => pedidosGraficos.filter((p) => p.status !== 'cancelado'),
    [pedidosGraficos]
  );

  const vendasPorDia = useMemo(() => {
    const map = new Map<string, number>();
    vendasGraficosNaoCanceladas.forEach((p) => {
      const d = p.data_pedido;
      map.set(d, (map.get(d) ?? 0) + Number(p.total ?? 0));
    });
    const dias = [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    return dias.map(([data, total]) => ({
      data: `${data.slice(8, 10)}/${data.slice(5, 7)}`,
      total: Math.round(total * 100) / 100,
    }));
  }, [vendasGraficosNaoCanceladas]);

  const vendasPorFornecedor = useMemo(() => {
    const revendaOuFabricado = relatorioVendas.filter(
      (l) => l.produto_tipo === 'revenda' || l.produto_tipo === 'fabricado'
    );
    const map = new Map<string, number>();
    revendaOuFabricado.forEach((l) => {
      const nome = formatNomeFornecedor(l.fornecedor_nome) || '—';
      map.set(nome, (map.get(nome) ?? 0) + Number(l.total_item ?? 0));
    });
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([fornecedor, total]) => ({
        fornecedor: fornecedor.length > 20 ? fornecedor.slice(0, 18) + '…' : fornecedor,
        total: Math.round(total * 100) / 100,
      }));
  }, [relatorioVendas]);

  const vendasPorDiaSemana = useMemo(() => {
    const pedidosValidos = vendasGraficosNaoCanceladas;
    const map = new Map<number, number>();
    for (let i = 0; i < 7; i++) map.set(i, 0);
    pedidosValidos.forEach((p) => {
      const d = new Date(p.data_pedido + 'T12:00:00');
      const dia = d.getDay();
      map.set(dia, (map.get(dia) ?? 0) + p.total);
    });
    return [...map.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([dia, total]) => ({
        dia: DIAS_SEMANA[dia],
        total: Math.round(total * 100) / 100,
      }));
  }, [vendasGraficosNaoCanceladas]);

  const totalVendasMes = useMemo(
    () => vendasNaoCanceladas.reduce((s, p) => s + Number(p.total ?? 0), 0),
    [vendasNaoCanceladas]
  );
  const countVendasMes = vendasNaoCanceladas.length;
  const countAbaixoMinimo = avisos.length;
  const countPendentesEntrega = pendentesEntrega.length;

  const totalVendasGraficos = useMemo(
    () => vendasGraficosNaoCanceladas.reduce((s, p) => s + p.total, 0),
    [vendasGraficosNaoCanceladas]
  );
  const ticketMedio =
    vendasGraficosNaoCanceladas.length > 0 ? totalVendasGraficos / vendasGraficosNaoCanceladas.length : 0;

  const produtosMaisVendidos = useMemo(() => {
    const map = new Map<string, { descricao: string; total: number }>();
    relatorioVendas.forEach((l) => {
      const cur = map.get(l.produto_id);
      const desc = l.produto_descricao || l.produto_id;
      const tot = (cur?.total ?? 0) + Number(l.total_item ?? 0);
      map.set(l.produto_id, { descricao: desc, total: tot });
    });
    return [...map.entries()]
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 10)
      .map(([, v]) => ({ produto: v.descricao.length > 25 ? v.descricao.slice(0, 23) + '…' : v.descricao, total: Math.round(v.total * 100) / 100 }));
  }, [relatorioVendas]);

  const categoriasMap = useMemo(() => new Map(categorias.map((c) => [c.id, c.nome])), [categorias]);
  const produtosMap = useMemo(() => new Map(produtos.map((p) => [p.id, p])), [produtos]);

  const vendasPorCategoria = useMemo(() => {
    const map = new Map<string, number>();
    relatorioVendas.forEach((l) => {
      const catId = produtosMap.get(l.produto_id)?.categoria_id;
      const nome = catId ? categoriasMap.get(catId) ?? 'Sem categoria' : 'Sem categoria';
      map.set(nome, (map.get(nome) ?? 0) + Number(l.total_item ?? 0));
    });
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([cat, total]) => ({ categoria: cat, total: Math.round(total * 100) / 100 }));
  }, [relatorioVendas, produtosMap, categoriasMap]);

  const totalVendasMesPassado = useMemo(
    () => pedidosMesPassado.reduce((s, p) => s + p.total, 0),
    [pedidosMesPassado]
  );
  const comparativoPeriodos = useMemo(
    () => [
      { periodo: 'Mês passado', total: Math.round(totalVendasMesPassado * 100) / 100 },
      { periodo: mesLabel, total: Math.round(totalVendasMes * 100) / 100 },
    ],
    [totalVendasMesPassado, totalVendasMes, mesLabel]
  );

  const topClientes = useMemo(() => {
    const map = new Map<string, number>();
    relatorioVendas.forEach((l) => {
      const nome = l.cliente_nome?.trim() || '—';
      map.set(nome, (map.get(nome) ?? 0) + Number(l.total_item ?? 0));
    });
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([cliente, total]) => ({
        cliente: cliente.length > 20 ? cliente.slice(0, 18) + '…' : cliente,
        total: Math.round(total * 100) / 100,
      }));
  }, [relatorioVendas]);

  const valorEstoquePorCategoria = useMemo(() => {
    const map = new Map<string, number>();
    produtos.forEach((p) => {
      const valor = p.saldo * p.preco_compra;
      const cat = p.categoria_id ? (categoriasMap.get(p.categoria_id) ?? 'Outros') : 'Sem categoria';
      map.set(cat, (map.get(cat) ?? 0) + valor);
    });
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([categoria, total]) => ({ categoria, total: Math.round(total * 100) / 100 }));
  }, [produtos, categoriasMap]);

  const { data_inicio: dataComprasInicio, data_fim: dataComprasFim } = useMemo(() => getRangePeriodo('mes_atual'), []);
  const totalComprasMes = useMemo(() => {
    return compras
      .filter((c) => c.data_pedido >= dataComprasInicio && c.data_pedido <= dataComprasFim)
      .reduce((s, c) => s + c.total, 0);
  }, [compras, dataComprasInicio, dataComprasFim]);
  const comprasVsVendas = useMemo(
    () => [
      { tipo: 'Compras', total: Math.round(totalComprasMes * 100) / 100 },
      { tipo: 'Vendas', total: Math.round(totalVendasMes * 100) / 100 },
    ],
    [totalComprasMes, totalVendasMes]
  );

  const margemPorTipo = useMemo(() => {
    const map = new Map<string, { receita: number; custo: number }>();
    relatorioVendas.forEach((l) => {
      const tipo = l.produto_tipo || 'outros';
      const prod = produtosMap.get(l.produto_id);
      const custoUnit = prod?.preco_compra ?? 0;
      const receita = Number(l.total_item ?? 0);
      const custo = l.quantidade * custoUnit;
      const cur = map.get(tipo) ?? { receita: 0, custo: 0 };
      map.set(tipo, { receita: cur.receita + receita, custo: cur.custo + custo });
    });
    return [...map.entries()]
      .map(([tipo, { receita, custo }]) => {
        const margem = receita > 0 ? ((receita - custo) / receita) * 100 : 0;
        return { tipo: tipo.charAt(0).toUpperCase() + tipo.slice(1), margem: Math.round(margem * 10) / 10 };
      })
      .filter((x) => x.tipo !== 'Insumos')
      .sort((a, b) => b.margem - a.margem);
  }, [relatorioVendas, produtosMap]);

  const entregasPorStatus = useMemo(() => {
    const map = new Map<string, number>();
    pedidosGraficos.forEach((p) => {
      const s = p.status || 'outros';
      map.set(s, (map.get(s) ?? 0) + 1);
    });
    const labels: Record<string, string> = {
      rascunho: 'Rascunho',
      confirmado: 'Confirmado',
      entregue: 'Entregue',
      cancelado: 'Cancelado',
    };
    return [...map.entries()].map(([status, count]) => ({
      status: labels[status] ?? status,
      count,
    }));
  }, [pedidosGraficos]);

  const CORES_PIE = ['#d97706', '#059669', '#6366f1', '#dc2626', '#94a3b8'];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Início</h1>
        <p className="text-sm text-gray-500 mt-0.5">Visão geral do negócio</p>
      </div>

      {/* Cards de indicadores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/vendas"
          className="block p-5 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-brand-gold/30 transition-all touch-manipulation"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Vendas em {mesLabel}</p>
              {loadingVendas ? (
                <p className="text-lg font-bold text-gray-900 mt-1">...</p>
              ) : (
                <>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    R$ {totalVendasMes.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">{countVendasMes} pedido(s)</p>
                </>
              )}
            </div>
            <span className="p-2 rounded-lg bg-amber-100 text-amber-800" aria-hidden>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-3 font-medium">Ver vendas →</p>
        </Link>

        <Link
          to="/roteirizacao/entregas"
          className="block p-5 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-400 transition-all touch-manipulation"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Entregas pendentes</p>
              {loadingEntregas ? (
                <p className="text-2xl font-bold text-gray-900 mt-1">...</p>
              ) : (
                <p className="text-2xl font-bold text-gray-900 mt-1">{countPendentesEntrega}</p>
              )}
              <p className="text-sm text-gray-500 mt-0.5">pedido(s) para entregar</p>
            </div>
            <span className="p-2 rounded-lg bg-gray-100 text-gray-600" aria-hidden>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-3 font-medium">Ver entregas →</p>
        </Link>

        <Link
          to="/avisos-compra"
          className={`block p-5 rounded-xl shadow-sm border transition-all touch-manipulation ${
            countAbaixoMinimo > 0
              ? 'bg-amber-50 border-amber-200 hover:shadow-md hover:border-amber-300'
              : 'bg-white border-gray-200 hover:shadow-md hover:border-gray-300'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Avisos de compra</p>
              {loadingAvisos ? (
                <p className="text-2xl font-bold text-gray-900 mt-1">...</p>
              ) : (
                <p className="text-2xl font-bold text-gray-900 mt-1">{countAbaixoMinimo}</p>
              )}
              <p className="text-sm text-gray-500 mt-0.5">
                {countAbaixoMinimo > 0 ? 'produto(s) abaixo do mínimo' : 'estoque ok'}
              </p>
            </div>
            <span
              className={`p-2 rounded-lg ${countAbaixoMinimo > 0 ? 'bg-amber-200 text-amber-900' : 'bg-gray-100 text-gray-600'}`}
              aria-hidden
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-3 font-medium">Ver avisos →</p>
        </Link>

        <Link
          to="/financeiro/resumo"
          className="block p-5 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-green-200 transition-all touch-manipulation"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Financeiro ({mesLabel})</p>
              {loadingFinanceiro || !resumoFinanceiro ? (
                <p className="text-lg font-bold text-gray-900 mt-1">...</p>
              ) : (
                <>
                  <p className="text-sm text-green-600 font-semibold mt-1">
                    A receber: R$ {resumoFinanceiro.pendente_receber.toFixed(2)}
                  </p>
                  <p className="text-sm text-red-600 font-semibold">A pagar: R$ {resumoFinanceiro.pendente_pagar.toFixed(2)}</p>
                </>
              )}
            </div>
            <span className="p-2 rounded-lg bg-green-100 text-green-800" aria-hidden>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-3 font-medium">Ver resumo →</p>
        </Link>
      </div>

      {/* Gráficos de vendas */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Período:</span>
          {PERIODO_OPCOES.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setPeriodoGraficos(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                periodoGraficos === opt.value
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Vendas por dia ({periodoLabel})</h2>
          {loadingGraficos ? (
            <div className="h-64 flex items-center justify-center text-gray-500">Carregando...</div>
          ) : vendasPorDia.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500">Nenhuma venda no período</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={vendasPorDia} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="data" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$ ${v}`} />
                <Tooltip formatter={(v: number | undefined) => [`R$ ${(v ?? 0).toFixed(2)}`, 'Total']} />
                <Bar dataKey="total" fill="#d97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Dias da semana mais movimentados ({periodoLabel})</h2>
          {loadingGraficos ? (
            <div className="h-64 flex items-center justify-center text-gray-500">Carregando...</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={vendasPorDiaSemana} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="dia" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$ ${v}`} />
                <Tooltip formatter={(v: number | undefined) => [`R$ ${(v ?? 0).toFixed(2)}`, 'Total']} />
                <Bar dataKey="total" fill="#d97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Vendas por fornecedor ({periodoLabel})</h2>
          <p className="text-xs text-gray-500 mb-2">Revenda e fabricado</p>
          {loadingRelatorio ? (
            <div className="h-64 flex items-center justify-center text-gray-500">Carregando...</div>
          ) : vendasPorFornecedor.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500">Nenhuma venda no período</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={vendasPorFornecedor} layout="vertical" margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `R$ ${v}`} />
                <YAxis type="category" dataKey="fornecedor" width={100} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number | undefined) => [`R$ ${(v ?? 0).toFixed(2)}`, 'Total']} />
                <Bar dataKey="total" fill="#b45309" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Produtos mais vendidos ({periodoLabel})</h2>
          {loadingRelatorio ? (
            <div className="h-64 flex items-center justify-center text-gray-500">Carregando...</div>
          ) : produtosMaisVendidos.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500">Nenhuma venda no período</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={produtosMaisVendidos} layout="vertical" margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `R$ ${v}`} />
                <YAxis type="category" dataKey="produto" width={120} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number | undefined) => [`R$ ${(v ?? 0).toFixed(2)}`, 'Total']} />
                <Bar dataKey="total" fill="#92400e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Ticket médio ({periodoLabel})</h2>
          {loadingGraficos ? (
            <div className="h-64 flex items-center justify-center text-gray-500">Carregando...</div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center">
              <p className="text-3xl font-bold text-amber-600">R$ {ticketMedio.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-2">{vendasGraficosNaoCanceladas.length} pedido(s)</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Vendas por categoria ({periodoLabel})</h2>
          {loadingRelatorio || loadingAux ? (
            <div className="h-64 flex items-center justify-center text-gray-500">Carregando...</div>
          ) : vendasPorCategoria.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500">Nenhuma venda no período</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={vendasPorCategoria} dataKey="total" nameKey="categoria" cx="50%" cy="50%" outerRadius={80}>
                  {vendasPorCategoria.map((_, i) => (
                    <Cell key={i} fill={CORES_PIE[i % CORES_PIE.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number | undefined) => [`R$ ${(v ?? 0).toFixed(2)}`, 'Total']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Comparativo: mês passado vs este mês</h2>
          {loadingVendas || loadingAux ? (
            <div className="h-64 flex items-center justify-center text-gray-500">Carregando...</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={comparativoPeriodos} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$ ${v}`} />
                <Tooltip formatter={(v: number | undefined) => [`R$ ${(v ?? 0).toFixed(2)}`, 'Total']} />
                <Bar dataKey="total" fill="#d97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Top clientes ({periodoLabel})</h2>
          {loadingRelatorio ? (
            <div className="h-64 flex items-center justify-center text-gray-500">Carregando...</div>
          ) : topClientes.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500">Nenhuma venda no período</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topClientes} layout="vertical" margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `R$ ${v}`} />
                <YAxis type="category" dataKey="cliente" width={100} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number | undefined) => [`R$ ${(v ?? 0).toFixed(2)}`, 'Total']} />
                <Bar dataKey="total" fill="#78716c" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Valor do estoque por categoria</h2>
          {loadingAux ? (
            <div className="h-64 flex items-center justify-center text-gray-500">Carregando...</div>
          ) : valorEstoquePorCategoria.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500">Nenhum produto</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={valorEstoquePorCategoria} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="categoria" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$ ${v}`} />
                <Tooltip formatter={(v: number | undefined) => [`R$ ${(v ?? 0).toFixed(2)}`, 'Total']} />
                <Bar dataKey="total" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Compras x Vendas ({mesLabel})</h2>
          {loadingAux || loadingVendas ? (
            <div className="h-64 flex items-center justify-center text-gray-500">Carregando...</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={comprasVsVendas} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="tipo" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$ ${v}`} />
                <Tooltip formatter={(v: number | undefined) => [`R$ ${(v ?? 0).toFixed(2)}`, 'Total']} />
                <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Margem por tipo ({periodoLabel})</h2>
          <p className="text-xs text-gray-500 mb-2">Revenda e fabricado</p>
          {loadingRelatorio || loadingAux ? (
            <div className="h-64 flex items-center justify-center text-gray-500">Carregando...</div>
          ) : margemPorTipo.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500">Nenhuma venda no período</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={margemPorTipo} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="tipo" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(v: number | undefined) => [`${(v ?? 0).toFixed(1)}%`, 'Margem']} />
                <Bar dataKey="margem" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Pedidos por status ({periodoLabel})</h2>
          {loadingGraficos ? (
            <div className="h-64 flex items-center justify-center text-gray-500">Carregando...</div>
          ) : entregasPorStatus.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500">Nenhum pedido</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={entregasPorStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label>
                  {entregasPorStatus.map((_, i) => (
                    <Cell key={i} fill={CORES_PIE[i % CORES_PIE.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Produtos abaixo do mínimo</h2>
          {loadingAvisos ? (
            <div className="h-64 flex items-center justify-center text-gray-500">Carregando...</div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center">
              <p className={`text-4xl font-bold ${countAbaixoMinimo > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                {countAbaixoMinimo}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {countAbaixoMinimo > 0 ? 'produto(s) precisam de compra' : 'Estoque ok'}
              </p>
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Atalhos rápidos */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Ações rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            to="/vendas/caixa"
            className="flex items-center gap-3 p-4 bg-white rounded-lg shadow border border-gray-200 hover:bg-amber-50 hover:border-amber-200 transition-colors touch-manipulation"
          >
            <span className="p-2 rounded-lg bg-brand-gold/20 text-brand-gold">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </span>
            <div>
              <span className="font-medium text-gray-900">Nova venda</span>
              <p className="text-xs text-gray-500">Abrir caixa</p>
            </div>
          </Link>
          <Link
            to="/roteirizacao/entregas"
            className="flex items-center gap-3 p-4 bg-white rounded-lg shadow border border-gray-200 hover:bg-gray-50 transition-colors touch-manipulation"
          >
            <span className="p-2 rounded-lg bg-gray-100 text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </span>
            <div>
              <span className="font-medium text-gray-900">Entregas</span>
              <p className="text-xs text-gray-500">Roteirizar e marcar entregues</p>
            </div>
          </Link>
          <Link
            to="/avisos-compra"
            className="flex items-center gap-3 p-4 bg-white rounded-lg shadow border border-gray-200 hover:bg-amber-50/50 transition-colors touch-manipulation"
          >
            <span className="p-2 rounded-lg bg-amber-100 text-amber-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </span>
            <div>
              <span className="font-medium text-gray-900">Comprar</span>
              <p className="text-xs text-gray-500">Avisos e pedido de compra</p>
            </div>
          </Link>
          <Link
            to="/produtos"
            className="flex items-center gap-3 p-4 bg-white rounded-lg shadow border border-gray-200 hover:bg-gray-50 transition-colors touch-manipulation"
          >
            <span className="p-2 rounded-lg bg-gray-100 text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8 4-8-4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </span>
            <div>
              <span className="font-medium text-gray-900">Produtos</span>
              <p className="text-xs text-gray-500">Cadastro e estoque</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
