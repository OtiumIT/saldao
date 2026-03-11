import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import * as roteirizacaoService from '../services/roteirizacao.service';
import { Button } from '../../../components/ui/Button';
import { imprimirRotaComMapa } from '../lib/rota-print';
import { MapaEntregasEmbed } from '../components/MapaEntregasEmbed';
import type { EntregaComPedido, Veiculo } from '../types/roteirizacao.types';
import { formatDateBR } from '../../../shared/lib/format-date';

export function ResumoEntregaPage() {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const dataParam = searchParams.get('data') ?? '';
  const veiculoParam = searchParams.get('veiculo') ?? '';

  const [entregas, setEntregas] = useState<EntregaComPedido[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [entRes, vecRes] = await Promise.all([
        roteirizacaoService.listEntregas(token, { data: dataParam, veiculo_id: veiculoParam }),
        roteirizacaoService.listVeiculos(token),
      ]);
      setEntregas(entRes.filter((e) => e.status !== 'entregue'));
      setVeiculos(vecRes);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar');
      setEntregas([]);
    } finally {
      setLoading(false);
    }
  }, [token, dataParam, veiculoParam]);

  useEffect(() => {
    load();
  }, [load]);

  const nomeVeiculo = veiculos.find((v) => v.id === veiculoParam)?.nome ?? 'Sem veículo';
  const listaOrdenada = [...entregas].sort((a, b) => (a.ordem_na_rota ?? 999) - (b.ordem_na_rota ?? 999));

  const handleImprimir = () => {
    imprimirRotaComMapa(dataParam, nomeVeiculo, listaOrdenada);
  };

  if (loading) {
    return (
      <div className="w-full max-w-full py-12">
        <p className="text-gray-500 text-center">Carregando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-full py-12">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700">{error}</p>
          <Button variant="secondary" className="mt-4" onClick={load}>
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!dataParam || !veiculoParam) {
    return (
      <div className="w-full max-w-full py-12">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <p className="text-amber-800">Parâmetros inválidos. Volte ao planejamento de entregas.</p>
          <Link to="/roteirizacao/entregas">
            <Button variant="secondary" className="mt-4">
              Voltar
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Resumo da entrega</h1>
          <p className="text-sm text-gray-500 mt-1">
            {formatDateBR(dataParam)} — {nomeVeiculo} — {listaOrdenada.length} parada(s)
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleImprimir} disabled={listaOrdenada.length === 0} className="min-h-[48px]">
            Imprimir rota
          </Button>
          <Link to="/roteirizacao/entregas">
            <Button variant="secondary" className="min-h-[48px]">
              Voltar ao planejamento
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mapa pequeno */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <h2 className="px-4 py-3 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-700">
              Mapa
            </h2>
            <div className="p-2" style={{ minHeight: 240 }}>
              <MapaEntregasEmbed
                token={token}
                onRefresh={load}
                pedidoIdsFilter={listaOrdenada.map((e) => e.pedido_venda_id)}
                compact
              />
            </div>
          </div>
        </div>

        {/* Detalhes dos pedidos */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <h2 className="px-4 py-3 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-700">
              Paradas
            </h2>
            {listaOrdenada.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Nenhuma parada nesta rota.
              </div>
            ) : (
              <ol className="divide-y divide-gray-100">
                {listaOrdenada.map((e, i) => (
                  <li
                    key={e.id}
                    className="px-4 py-4 flex items-start gap-4 hover:bg-gray-50/50"
                  >
                    <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-gold/20 text-brand-black font-bold flex items-center justify-center text-sm">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{e.cliente_nome ?? '—'}</p>
                      <p className="text-sm text-gray-600 break-words mt-0.5">{e.endereco_entrega ?? '—'}</p>
                      <p className="text-sm text-gray-500 mt-1 font-medium">R$ {(e.total ?? 0).toFixed(2)}</p>
                    </div>
                    <Link to={`/vendas/${e.pedido_venda_id}`} className="flex-shrink-0">
                      <Button variant="secondary" size="sm">
                        Ver
                      </Button>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
