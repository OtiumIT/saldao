import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import * as roteirizacaoService from '../services/roteirizacao.service';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { imprimirRota } from '../lib/rota-print';
import type { EntregaComPedido, Veiculo } from '../types/roteirizacao.types';
import { formatDateBR } from '../../../shared/lib/format-date';

type Pendente = { id: string; cliente_nome: string | null; endereco_entrega: string | null; total: number };

function getRotasPorVeiculo(entregasDoDia: EntregaComPedido[]): Map<string, EntregaComPedido[]> {
  const mapa = new Map<string, EntregaComPedido[]>();
  for (const e of entregasDoDia) {
    const vid = e.veiculo_id ?? 'sem-veiculo';
    if (!mapa.has(vid)) mapa.set(vid, []);
    mapa.get(vid)!.push(e);
  }
  for (const arr of mapa.values()) {
    arr.sort((a, b) => (a.ordem_na_rota ?? 999) - (b.ordem_na_rota ?? 999));
  }
  return mapa;
}

export function EntregasPage() {
  const { token } = useAuth();
  const hoje = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [pendentes, setPendentes] = useState<Pendente[]>([]);
  const [entregas, setEntregas] = useState<EntregaComPedido[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selecionadosPendentes, setSelecionadosPendentes] = useState<Set<string>>(new Set());
  const [agendarVeiculoId, setAgendarVeiculoId] = useState('');
  const [agendarData, setAgendarData] = useState(hoje);
  const [agendando, setAgendando] = useState(false);

  const [reordenando, setReordenando] = useState<string | null>(null);
  const [organizandoTodas, setOrganizandoTodas] = useState(false);
  const [processando, setProcessando] = useState<string | null>(null);

  const [modalReagendar, setModalReagendar] = useState<EntregaComPedido | null>(null);
  const [reagendarData, setReagendarData] = useState(hoje);
  const [reagendarVeiculoId, setReagendarVeiculoId] = useState('');

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    const results = await Promise.allSettled([
      roteirizacaoService.listPendentesEntrega(token),
      roteirizacaoService.listEntregas(token, {}),
      roteirizacaoService.listVeiculos(token),
    ]);
    const [penRes, entRes, vecRes] = results;
    if (penRes.status === 'fulfilled') setPendentes(penRes.value);
    else { setPendentes([]); setError('Erro ao carregar pendentes'); }
    if (entRes.status === 'fulfilled') setEntregas(entRes.value);
    else setEntregas([]);
    if (vecRes.status === 'fulfilled') setVeiculos(vecRes.value);
    else setVeiculos([]);
    setLoading(false);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const entregasAgendadas = useMemo(
    () => entregas.filter((e) => e.status !== 'entregue'),
    [entregas]
  );

  const datasOrdenadas = useMemo(() => {
    const datas = [...new Set(entregasAgendadas.map((e) => e.data_entrega_prevista).filter(Boolean))] as string[];
    return datas.sort();
  }, [entregasAgendadas]);

  const veiculosAtivos = useMemo(
    () => veiculos.filter((v) => !v.inoperante),
    [veiculos]
  );

  useEffect(() => {
    if (veiculosAtivos.length === 1 && !agendarVeiculoId) {
      setAgendarVeiculoId(veiculosAtivos[0].id);
    }
  }, [veiculosAtivos, agendarVeiculoId]);

  const toggleSelecaoPendente = (id: string) => {
    setSelecionadosPendentes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selecionarTodosPendentes = () => {
    setSelecionadosPendentes(new Set(pendentes.map((p) => p.id)));
  };

  const limparSelecao = () => setSelecionadosPendentes(new Set());

  const agendarSelecionados = async () => {
    if (!token || selecionadosPendentes.size === 0 || !agendarVeiculoId) return;
    setAgendando(true);
    try {
      for (const pedidoId of selecionadosPendentes) {
        await roteirizacaoService.createEntrega(token, {
          pedido_venda_id: pedidoId,
          veiculo_id: agendarVeiculoId,
          data_entrega_prevista: agendarData || null,
        });
      }
      setSelecionadosPendentes(new Set());
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao agendar');
    } finally {
      setAgendando(false);
    }
  };

  const sugerirOrdem = async (veiculoId: string, dataEntrega: string) => {
    if (!token) return;
    setReordenando(veiculoId);
    try {
      const { entrega_ids } = await roteirizacaoService.sugerirOrdemRota(
        token,
        veiculoId,
        dataEntrega
      );
      if (entrega_ids.length > 0) {
        await roteirizacaoService.aplicarOrdemRota(token, entrega_ids);
        await load();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao sugerir ordem');
    } finally {
      setReordenando(null);
    }
  };

  /** Aplica "Sugerir ordem" em todas as rotas (cada dia + cada veículo), agrupando por endereço. */
  const sugerirOrdemTodas = async () => {
    if (!token) return;
    const pares: { data: string; veiculoId: string }[] = [];
    for (const data of datasOrdenadas) {
      const entregasDoDia = entregasAgendadas.filter((e) => e.data_entrega_prevista === data);
      const rotasPorVeiculo = getRotasPorVeiculo(entregasDoDia);
      for (const [veiculoId, lista] of rotasPorVeiculo.entries()) {
        if (veiculoId !== 'sem-veiculo' && lista.length >= 2) {
          pares.push({ data, veiculoId });
        }
      }
    }
    if (pares.length === 0) {
      alert('Nenhuma rota com 2 ou mais paradas para organizar.');
      return;
    }
    setOrganizandoTodas(true);
    try {
      for (const { data, veiculoId } of pares) {
        const { entrega_ids } = await roteirizacaoService.sugerirOrdemRota(token, veiculoId, data);
        if (entrega_ids.length > 0) {
          await roteirizacaoService.aplicarOrdemRota(token, entrega_ids);
        }
      }
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao organizar rotas');
    } finally {
      setOrganizandoTodas(false);
    }
  };

  const moverEntrega = async (entrega: EntregaComPedido, direcao: 'cima' | 'baixo') => {
    if (!token) return;
    const entregasDoDia = entregasAgendadas.filter((e) => e.data_entrega_prevista === entrega.data_entrega_prevista);
    const rotasPorVeiculo = getRotasPorVeiculo(entregasDoDia);
    const lista = rotasPorVeiculo.get(entrega.veiculo_id ?? 'sem-veiculo') ?? [];
    const idx = lista.findIndex((x) => x.id === entrega.id);
    if (idx < 0) return;
    const novoIdx = direcao === 'cima' ? idx - 1 : idx + 1;
    if (novoIdx < 0 || novoIdx >= lista.length) return;
    const novaLista = [...lista];
    [novaLista[idx], novaLista[novoIdx]] = [novaLista[novoIdx], novaLista[idx]];
    const ids = novaLista.map((e) => e.id);
    try {
      await roteirizacaoService.aplicarOrdemRota(token, ids);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao reordenar');
    }
  };

  const marcarEntregue = async (entregaId: string) => {
    if (!token) return;
    setProcessando(entregaId);
    try {
      await roteirizacaoService.marcarEntregue(token, entregaId);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro');
    } finally {
      setProcessando(null);
    }
  };

  const removerEntrega = async (entrega: EntregaComPedido) => {
    if (!token) return;
    if (!confirm(`Remover "${entrega.cliente_nome ?? 'esta entrega'}" da rota? O pedido voltará para aguardando agendamento.`)) return;
    setProcessando(entrega.id);
    try {
      await roteirizacaoService.removeEntrega(token, entrega.id);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao remover');
    } finally {
      setProcessando(null);
    }
  };

  const abrirModalReagendar = (entrega: EntregaComPedido) => {
    setModalReagendar(entrega);
    setReagendarData(entrega.data_entrega_prevista ?? hoje);
    setReagendarVeiculoId(entrega.veiculo_id ?? '');
  };

  const confirmarReagendar = async () => {
    if (!token || !modalReagendar) return;
    const novaData = reagendarData?.trim() || null;
    const novoVeiculoId = reagendarVeiculoId?.trim() || null;
    setProcessando(modalReagendar.id);
    try {
      await roteirizacaoService.reagendarEntregas(token, {
        entrega_ids: [modalReagendar.id],
        nova_data: novaData,
        novo_veiculo_id: novoVeiculoId,
      });
      setModalReagendar(null);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao reagendar');
    } finally {
      setProcessando(null);
    }
  };

  const nomeVeiculo = (vid: string) => veiculos.find((v) => v.id === vid)?.nome ?? 'Sem veículo';

  return (
    <div className="w-full max-w-full space-y-6 md:space-y-8 pb-8">
      <h1 className="text-xl md:text-2xl font-bold text-gray-900">Plano de entregas</h1>

      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-center justify-between gap-4">
          <p className="text-amber-800">{error}</p>
          <Button variant="secondary" size="md" onClick={() => load()} className="flex-shrink-0">
            Tentar novamente
          </Button>
        </div>
      )}

      {loading && pendentes.length === 0 && entregas.length === 0 ? (
        <p className="text-gray-500">Carregando...</p>
      ) : (
        <div className="w-full space-y-8">
          {/* Totais — largura total da página */}
          <div className="w-full grid grid-cols-2 gap-4 md:gap-6">
            <div className="min-w-0 bg-amber-50 border border-amber-200 rounded-xl p-5 md:p-6">
              <p className="text-sm font-medium text-amber-800">Sem agendamento</p>
              <p className="text-3xl md:text-4xl font-bold text-amber-900 mt-1">{pendentes.length}</p>
              <p className="text-sm text-amber-700 mt-0.5">entregas</p>
            </div>
            <div className="min-w-0 bg-white border border-gray-200 rounded-xl p-5 md:p-6 shadow-sm">
              <p className="text-sm font-medium text-gray-600">Agendadas</p>
              <p className="text-3xl md:text-4xl font-bold text-gray-900 mt-1">{entregasAgendadas.length}</p>
              <p className="text-sm text-gray-500 mt-0.5">entregas</p>
            </div>
          </div>

          {/* Pendentes de agendamento — cards touch-friendly */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-5 md:px-6 py-5 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                Pedidos aguardando ({pendentes.length})
              </h2>
              <p className="text-sm md:text-base text-gray-500 mt-1">
                Selecione, escolha veículo e data, depois agende
              </p>
            </div>
            {pendentes.length === 0 ? (
              <div className="p-10 text-center text-gray-500">
                <p className="text-base">Nenhum pedido aguardando.</p>
                <Link
                  to="/vendas"
                  className="inline-block mt-4 min-h-[48px] px-6 py-3 text-brand-gold hover:underline font-medium rounded-xl border border-brand-gold/30 touch-manipulation active:bg-amber-50"
                >
                  Ver vendas →
                </Link>
              </div>
            ) : (
              <>
                <div className="p-5 md:p-6 border-b border-gray-200 flex flex-col md:flex-row md:flex-wrap md:items-end gap-4 md:gap-5">
                  <div className="flex items-center gap-3">
                    <Button variant="secondary" size="md" onClick={selecionarTodosPendentes}>
                      Selecionar todos
                    </Button>
                    <Button variant="secondary" size="md" onClick={limparSelecao}>
                      Limpar
                    </Button>
                  </div>
                  <div className="flex flex-col sm:flex-row flex-wrap gap-4 md:gap-5 md:items-end">
                    <div className="min-w-[180px]">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Veículo</label>
                      <select
                        value={agendarVeiculoId}
                        onChange={(e) => setAgendarVeiculoId(e.target.value)}
                        className="w-full min-h-[48px] px-4 py-3 border border-gray-300 rounded-xl text-base touch-manipulation focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                      >
                        <option value="">— Escolha —</option>
                        {veiculosAtivos.map((v) => (
                          <option key={v.id} value={v.id}>{v.nome}</option>
                        ))}
                      </select>
                    </div>
                    <div className="min-w-[160px]">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
                      <input
                        type="date"
                        value={agendarData}
                        onChange={(e) => setAgendarData(e.target.value)}
                        className="w-full min-h-[48px] px-4 py-3 border border-gray-300 rounded-xl text-base touch-manipulation focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                      />
                    </div>
                    <Button
                      size="lg"
                      onClick={agendarSelecionados}
                      disabled={
                        agendando ||
                        selecionadosPendentes.size === 0 ||
                        !agendarVeiculoId
                      }
                      className="min-h-[52px]"
                    >
                      {agendando
                        ? 'Agendando...'
                        : `Agendar ${selecionadosPendentes.size} selecionado(s)`}
                    </Button>
                  </div>
                </div>
                <div className="divide-y divide-gray-100">
                  {pendentes.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggleSelecaoPendente(p.id)}
                      className="w-full px-5 md:px-6 py-4 md:py-5 flex items-center gap-4 md:gap-5 text-left hover:bg-gray-50 active:bg-amber-50/30 touch-manipulation transition-colors"
                    >
                      <span
                        className={`flex-shrink-0 w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-colors ${
                          selecionadosPendentes.has(p.id)
                            ? 'bg-brand-gold border-brand-gold'
                            : 'border-gray-300 bg-white'
                        }`}
                        aria-hidden
                      >
                        {selecionadosPendentes.has(p.id) && (
                          <svg className="w-5 h-5 text-brand-black" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-base md:text-lg">{p.cliente_nome ?? 'Retirada'}</p>
                        <p className="text-sm md:text-base text-gray-600 truncate mt-0.5">{p.endereco_entrega ?? '—'}</p>
                      </div>
                      <span className="font-bold text-gray-800 whitespace-nowrap text-base md:text-lg">
                        R$ {(p.total ?? 0).toFixed(2)}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </section>

          {/* Botão global: sugerir ordem em todas as rotas */}
          {datasOrdenadas.length > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                variant="secondary"
                onClick={sugerirOrdemTodas}
                disabled={organizandoTodas}
                className="min-h-[52px]"
              >
                {organizandoTodas ? 'Organizando...' : 'Sugerir ordem em todas as rotas'}
              </Button>
              <span className="text-sm text-gray-500">
                Ordena todas as paradas por endereço (rotas parecidas juntas)
              </span>
            </div>
          )}

          {/* Rotas por dia — ordem cronológica */}
          {datasOrdenadas.length === 0 ? (
            <section>
              <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-500">
                <p className="text-base">Nenhuma entrega agendada.</p>
                <p className="text-sm mt-2">Agende pedidos acima para ver as rotas por dia.</p>
              </div>
            </section>
          ) : (
            datasOrdenadas.map((data) => {
              const entregasDoDia = entregasAgendadas.filter((e) => e.data_entrega_prevista === data);
              const rotasPorVeiculo = getRotasPorVeiculo(entregasDoDia);
              return (
                <section key={data} className="w-full">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-5">
                    {formatDateBR(data)}
                  </h2>
                  <div className="flex flex-col gap-6 w-full">
                    {Array.from(rotasPorVeiculo.entries()).map(([veiculoId, lista]) => (
                      <div
                        key={`${data}-${veiculoId}`}
                        className="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                      >
                        <div className="px-5 md:px-6 py-5 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <h3 className="font-semibold text-gray-900 text-base md:text-lg">
                            {nomeVeiculo(veiculoId)} — {lista.length} parada(s)
                          </h3>
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              variant="secondary"
                              size="md"
                              onClick={() => imprimirRota(data, nomeVeiculo(veiculoId), lista)}
                              disabled={lista.length === 0}
                              title="Imprimir rota (1ª parada, 2ª parada...)"
                            >
                              Imprimir rota
                            </Button>
                            <Button
                              variant="secondary"
                              size="md"
                              onClick={() => sugerirOrdem(veiculoId, data)}
                              disabled={
                                reordenando === veiculoId ||
                                lista.length < 2 ||
                                veiculoId === 'sem-veiculo'
                              }
                            >
                              {reordenando === veiculoId ? '...' : 'Sugerir ordem'}
                            </Button>
                          </div>
                        </div>
                        <ol className="divide-y divide-gray-100 w-full">
                          {lista.map((e, i) => (
                            <li
                              key={e.id}
                              className="w-full px-5 md:px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6"
                            >
                              <div className="flex items-start gap-4 flex-1 min-w-0">
                                <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-brand-gold/20 text-brand-black font-bold flex items-center justify-center text-base">
                                  {i + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-gray-900 text-base md:text-lg">{e.cliente_nome ?? '—'}</p>
                                  <p className="text-sm md:text-base text-gray-600 break-words mt-0.5">{e.endereco_entrega ?? '—'}</p>
                                  <p className="text-sm text-gray-500 mt-1 font-medium">R$ {(e.total ?? 0).toFixed(2)}</p>
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-3 ml-14 sm:ml-0 sm:flex-shrink-0">
                                <div className="flex gap-2" role="group" aria-label="Ordenar">
                                  <button
                                    onClick={() => moverEntrega(e, 'cima')}
                                    disabled={i === 0}
                                    className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border border-gray-300 bg-white hover:bg-gray-100 active:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation"
                                    title="Subir na rota"
                                    aria-label="Subir na rota"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => moverEntrega(e, 'baixo')}
                                    disabled={i === lista.length - 1}
                                    className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border border-gray-300 bg-white hover:bg-gray-100 active:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation"
                                    title="Descer na rota"
                                    aria-label="Descer na rota"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </button>
                                </div>
                                <div className="flex flex-wrap gap-2 sm:gap-3">
                                  <Button variant="secondary" size="md" onClick={() => abrirModalReagendar(e)} disabled={processando === e.id} title="Reagendar">
                                    Reagendar
                                  </Button>
                                  <Button variant="secondary" size="md" onClick={() => marcarEntregue(e.id)} disabled={processando === e.id}>
                                    {processando === e.id ? '...' : 'Entregue'}
                                  </Button>
                                  <Button variant="danger" size="md" onClick={() => removerEntrega(e)} disabled={processando === e.id} title="Remover da rota">
                                    Remover
                                  </Button>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ol>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })
          )}

          <p className="text-base">
            <Link
              to="/roteirizacao/veiculos"
              className="text-brand-gold hover:underline font-medium min-h-[44px] inline-flex items-center touch-manipulation active:text-brand-gold-dark"
            >
              Gerenciar veículos →
            </Link>
          </p>
        </div>
      )}

      <Modal
        isOpen={!!modalReagendar}
        onClose={() => setModalReagendar(null)}
        title="Reagendar entrega"
        size="md"
      >
        {modalReagendar && (
          <div className="space-y-5 p-1">
            <p className="text-base md:text-lg text-gray-700">
              {modalReagendar.cliente_nome ?? 'Cliente'}{' '}
              <span className="text-gray-500">— {modalReagendar.endereco_entrega?.slice(0, 50)}{modalReagendar.endereco_entrega && modalReagendar.endereco_entrega.length > 50 ? '…' : ''}</span>
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nova data</label>
              <input
                type="date"
                value={reagendarData}
                onChange={(e) => setReagendarData(e.target.value)}
                className="w-full min-h-[48px] px-4 py-3 border border-gray-300 rounded-xl text-base touch-manipulation focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Novo veículo</label>
              <select
                value={reagendarVeiculoId}
                onChange={(e) => setReagendarVeiculoId(e.target.value)}
                className="w-full min-h-[48px] px-4 py-3 border border-gray-300 rounded-xl text-base touch-manipulation focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
              >
                <option value="">— Manter ou escolher —</option>
                {veiculosAtivos.map((v) => (
                  <option key={v.id} value={v.id}>{v.nome}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
              <Button variant="secondary" size="md" onClick={() => setModalReagendar(null)} className="flex-1 sm:flex-none">
                Cancelar
              </Button>
              <Button size="lg" onClick={confirmarReagendar} disabled={!!processando} className="flex-1 sm:flex-none min-h-[52px]">
                {processando ? 'Salvando...' : 'Reagendar'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
