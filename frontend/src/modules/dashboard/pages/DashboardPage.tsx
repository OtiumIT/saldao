import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { useAvisosCompra } from '../../avisos-compra/hooks/useAvisosCompra';
import { useVendas } from '../../vendas/hooks/useVendas';
import * as roteirizacaoService from '../../roteirizacao/services/roteirizacao.service';
import * as financeiroService from '../../financeiro/services/financeiro.service';
import type { ResumoFinanceiro } from '../../financeiro/types/financeiro.types';

function getMesAtual(): { data_inicio: string; data_fim: string } {
  const now = new Date();
  const ano = now.getFullYear();
  const mes = now.getMonth() + 1;
  const data_inicio = `${ano}-${String(mes).padStart(2, '0')}-01`;
  const ultimoDia = new Date(ano, mes, 0).getDate();
  const data_fim = `${ano}-${String(mes).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;
  return { data_inicio, data_fim };
}

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export function DashboardPage() {
  const { token } = useAuth();
  const { data_inicio, data_fim } = useMemo(getMesAtual, []);
  const mesLabel = useMemo(() => {
    const m = new Date().getMonth();
    return `${MESES[m]} ${new Date().getFullYear()}`;
  }, []);

  const { avisos, loading: loadingAvisos } = useAvisosCompra();
  const { pedidos: pedidosMes, loading: loadingVendas } = useVendas({ data_inicio, data_fim });

  const [pendentesEntrega, setPendentesEntrega] = useState<Array<{ id: string; cliente_nome: string | null; endereco_entrega: string | null; total: number }>>([]);
  const [loadingEntregas, setLoadingEntregas] = useState(true);
  const [resumoFinanceiro, setResumoFinanceiro] = useState<ResumoFinanceiro | null>(null);
  const [loadingFinanceiro, setLoadingFinanceiro] = useState(true);

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
      .getResumo(token, data_inicio, data_fim)
      .then(setResumoFinanceiro)
      .catch(() => setResumoFinanceiro(null))
      .finally(() => setLoadingFinanceiro(false));
  }, [token, data_inicio, data_fim]);

  const totalVendasMes = useMemo(
    () => pedidosMes.reduce((s, p) => s + Number(p.total ?? 0), 0),
    [pedidosMes]
  );
  const countVendasMes = pedidosMes.length;
  const countAbaixoMinimo = avisos.length;
  const countPendentesEntrega = pendentesEntrega.length;

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
