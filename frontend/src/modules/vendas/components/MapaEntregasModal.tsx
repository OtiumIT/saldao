import { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix: Leaflet default icon 404 em builds Vite (evita erro quando ícone padrão é usado)
import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerIconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(L.Icon.Default as any).mergeOptions({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerIconRetinaUrl,
  shadowUrl: markerShadowUrl,
});
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Input } from '../../../components/ui/Input';
import { Combobox } from '../../../components/ui/Combobox';
import * as vendasService from '../services/vendas.service';
import * as clientesService from '../../clientes/services/clientes.service';
import { geocodeAddresses } from '../lib/geocode';
import { VendaDetailModal } from './VendaDetailModal';
import type { PedidoVendaComCliente } from '../types/vendas.types';
import type { Cliente } from '../../clientes/types/clients.types';
import { formatDateBR } from '../../../shared/lib/format-date';

// Ícone entrega (caminhão/entrega, mais chamativo)
const markerIconEntrega = L.divIcon({
  className: 'mapa-entregas-marker mapa-entregas-marker-entrega',
  html: `<div class="mapa-marker-entrega">
    <svg viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="1" y="3" width="15" height="13"></rect>
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
      <circle cx="5.5" cy="18.5" r="2.5"></circle>
      <circle cx="18.5" cy="18.5" r="2.5"></circle>
    </svg>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

// Ícone loja (círculo com logo dentro)
const logoUrl = '/logo.png';
const markerIconLoja = L.divIcon({
  className: 'mapa-entregas-marker mapa-entregas-marker-loja',
  html: `<div class="mapa-marker-loja">
    <img src="${logoUrl}" alt="Loja" onerror="this.style.display='none';this.nextElementSibling?.classList.remove('mapa-marker-loja-fallback');" />
    <span class="mapa-marker-loja-fallback">L</span>
  </div>`,
  iconSize: [44, 44],
  iconAnchor: [22, 22],
  popupAnchor: [0, -22],
});

type FiltroDatas = 'todas' | 'hoje' | '7' | '15' | 'range';

function toYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getDataInicioFim(filtro: FiltroDatas, dataInicio?: string, dataFim?: string): { data_inicio?: string; data_fim?: string } {
  if (filtro === 'todas') return {};
  const hoje = toYMD(new Date());
  if (filtro === 'hoje') return { data_inicio: hoje, data_fim: hoje };
  if (filtro === '7') {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return { data_inicio: toYMD(d), data_fim: hoje };
  }
  if (filtro === '15') {
    const d = new Date();
    d.setDate(d.getDate() - 15);
    return { data_inicio: toYMD(d), data_fim: hoje };
  }
  if (filtro === 'range' && dataInicio && dataFim) {
    return { data_inicio: dataInicio, data_fim: dataFim };
  }
  return {};
}

type Etapa = 'filtros' | 'selecao' | 'mapa';

interface MapaEntregasModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string | null;
}

export function MapaEntregasModal({ isOpen, onClose, token }: MapaEntregasModalProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const clickHandlerRef = useRef<((e: Event) => void) | null>(null);

  const [etapa, setEtapa] = useState<Etapa>('filtros');
  const [filtroDatas, setFiltroDatas] = useState<FiltroDatas>('15');
  const [dataInicio, setDataInicio] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 15);
    return toYMD(d);
  });
  const [dataFim, setDataFim] = useState<string>(() => toYMD(new Date()));
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteIdsSelecionados, setClienteIdsSelecionados] = useState<string[]>([]);
  const [clienteBusca, setClienteBusca] = useState('');

  const [entregas, setEntregas] = useState<PedidoVendaComCliente[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeProgress, setGeocodeProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [pedidoIdModal, setPedidoIdModal] = useState<string | null>(null);
  const [enderecoLoja, setEnderecoLoja] = useState<{ endereco: string | null; lat: number | null; lon: number | null } | null>(null);
  const [enderecosNaoLocalizados, setEnderecosNaoLocalizados] = useState<
    Array<{ id: string; cliente_nome: string | null; endereco_entrega: string; data_pedido: string }>
  >([]);

  const carregarClientes = useCallback(async () => {
    if (!token) return;
    setLoadingClientes(true);
    try {
      const list = await clientesService.listClientes(token);
      setClientes(list);
    } catch {
      setClientes([]);
    } finally {
      setLoadingClientes(false);
    }
  }, [token]);

  useEffect(() => {
    if (isOpen && token) {
      carregarClientes();
      vendasService.getEnderecoLoja(token).then(setEnderecoLoja).catch(() => setEnderecoLoja(null));
    }
  }, [isOpen, token, carregarClientes]);

  const handleBuscarPedidos = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    setEtapa('filtros');

    const { data_inicio, data_fim } = getDataInicioFim(filtroDatas, dataInicio, dataFim);

    const params: vendasService.ListPedidosVendaParams = {
      incluir_cancelados: false,
      data_inicio,
      data_fim,
      cliente_ids: clienteIdsSelecionados.length > 0 ? clienteIdsSelecionados : undefined,
    };

    vendasService
      .listPedidosVenda(token, params)
      .then((list) => {
        const pendentes = list.filter(
          (p) =>
            p.tipo_entrega === 'entrega' &&
            p.endereco_entrega?.trim() &&
            (p.status === 'rascunho' || p.status === 'confirmado')
        );
        setEntregas(pendentes);
        setSelectedIds(new Set(pendentes.map((p) => p.id)));
        setEtapa('selecao');
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Erro ao carregar entregas');
        setEntregas([]);
      })
      .finally(() => setLoading(false));
  }, [token, filtroDatas, dataInicio, dataFim, clienteIdsSelecionados]);

  const handleVerNoMapa = useCallback(() => {
    const selecionados = entregas.filter((p) => selectedIds.has(p.id));
    if (selecionados.length === 0) {
      setError('Selecione pelo menos um pedido para ver no mapa.');
      return;
    }
    setError(null);
    setEtapa('mapa');
  }, [entregas, selectedIds]);

  useEffect(() => {
    if (etapa !== 'mapa' || !token) return;

    const selecionados = entregas.filter((p) => selectedIds.has(p.id));
    const addresses = selecionados.map((e) => e.endereco_entrega!).filter(Boolean);
    if (addresses.length === 0) return;

    const storeAddr = enderecoLoja?.endereco?.trim() ?? null;
    const storeLat = enderecoLoja?.lat;
    const storeLon = enderecoLoja?.lon;
    const storeTemCoords = storeLat != null && storeLon != null && !Number.isNaN(storeLat) && !Number.isNaN(storeLon);

    const pedidosSemCoords = selecionados.filter(
      (p) =>
        p.endereco_entrega &&
        (p.endereco_lat == null || p.endereco_lon == null || Number.isNaN(p.endereco_lat) || Number.isNaN(p.endereco_lon))
    );
    const addressesToGeocode = pedidosSemCoords.map((p) => p.endereco_entrega!);
    if (storeAddr && !storeTemCoords) addressesToGeocode.push(storeAddr);

    let cancelled = false;
    setEnderecosNaoLocalizados([]);

    const renderMap = (results: Map<string, { lat: number; lon: number }> = new Map()) => {
      if (cancelled || !mapRef.current) return;

      let storeGeo: { lat: number; lon: number } | null = null;
      if (storeAddr) {
        if (storeTemCoords) {
          storeGeo = { lat: Number(storeLat), lon: Number(storeLon) };
        } else {
          const geo = results.get(storeAddr) ?? results.get(storeAddr);
          if (geo) storeGeo = { lat: geo.lat, lon: geo.lon };
        }
      }

      setTimeout(() => {
        if (cancelled || !mapRef.current) return;
        const map = L.map(mapRef.current, { maxZoom: 15 }).setView([-23.5505, -46.6333], 12);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap © CARTO',
          maxZoom: 15,
        }).addTo(map);

        mapInstanceRef.current = map;
        const markers: L.Marker[] = [];
        const naoLocalizados: Array<{ id: string; cliente_nome: string | null; endereco_entrega: string; data_pedido: string }> = [];

        if (storeGeo) {
          const storeMarker = L.marker([storeGeo.lat, storeGeo.lon], { icon: markerIconLoja })
            .addTo(map)
            .bindPopup(
              `<div class="min-w-[200px] p-2"><p class="font-semibold text-gray-900">Loja</p><p class="text-xs text-gray-500 mt-1">${escapeHtml(storeAddr ?? '')}</p></div>`,
              { className: 'mapa-entregas-popup' }
            );
          markers.push(storeMarker);
        }

        selecionados.forEach((pedido) => {
          const lat = pedido.endereco_lat != null ? Number(pedido.endereco_lat) : null;
          const lon = pedido.endereco_lon != null ? Number(pedido.endereco_lon) : null;
          let geo: { lat: number; lon: number } | null = null;
          if (lat != null && lon != null && !Number.isNaN(lat) && !Number.isNaN(lon)) {
            geo = { lat, lon };
          } else {
            const addr = pedido.endereco_entrega!;
            geo = results.get(addr) ?? results.get(addr.trim()) ?? null;
          }
          if (!geo) {
            naoLocalizados.push({
              id: pedido.id,
              cliente_nome: pedido.cliente_nome ?? null,
              endereco_entrega: pedido.endereco_entrega ?? '',
              data_pedido: pedido.data_pedido,
            });
            return;
          }

          const marker = L.marker([geo.lat, geo.lon], { icon: markerIconEntrega })
            .addTo(map)
            .bindPopup(
              `
              <div class="min-w-[200px] p-2">
                <p class="font-semibold text-gray-900">${escapeHtml(pedido.cliente_nome ?? 'Cliente')}</p>
                <p class="text-sm text-gray-600">${escapeHtml(formatDateBR(pedido.data_pedido))}</p>
                <p class="text-xs text-gray-500 mt-1">${escapeHtml(pedido.endereco_entrega ?? '')}</p>
                <button
                  data-pedido-id="${pedido.id}"
                  class="mt-2 w-full py-2 px-3 bg-amber-500 hover:bg-amber-600 text-gray-900 font-medium rounded text-sm"
                >
                  Ver compra
                </button>
              </div>
            `,
              { className: 'mapa-entregas-popup' }
            );
          markers.push(marker);
        });

        if (!cancelled) setEnderecosNaoLocalizados(naoLocalizados);
        markersRef.current = markers;

          if (markers.length > 0) {
            try {
              const group = L.featureGroup(markers);
              const bounds = group.getBounds();
              if (bounds.isValid()) {
                map.fitBounds(bounds.pad(0.15));
              }
            } catch {
              // fallback: zoom manual se fitBounds falhar
              map.setView([-23.5505, -46.6333], 12);
            }
          } else if (!cancelled) {
            setError('Nenhum endereço foi localizado no mapa.');
          }

          map.invalidateSize();
          setTimeout(() => map.invalidateSize(), 100);

          clickHandlerRef.current = (e: Event) => {
            const target = (e.target as HTMLElement).closest('[data-pedido-id]');
            if (target) {
              const id = (target as HTMLElement).dataset.pedidoId;
              if (id) setPedidoIdModal(id);
            }
          };
          mapRef.current.addEventListener('click', clickHandlerRef.current);
        }, 150);
    };

    if (addressesToGeocode.length === 0) {
      renderMap();
    } else {
      setGeocoding(true);
      geocodeAddresses(addressesToGeocode, (done, total) => setGeocodeProgress({ done, total }), token)
        .then(renderMap)
        .catch(() => {
          if (!cancelled) setError('Erro ao localizar endereços no mapa');
        })
        .finally(() => {
          if (!cancelled) setGeocoding(false);
        });
    }

    return () => {
      cancelled = true;
      if (clickHandlerRef.current && mapRef.current) {
        mapRef.current.removeEventListener('click', clickHandlerRef.current);
        clickHandlerRef.current = null;
      }
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, [etapa, entregas, selectedIds, token, enderecoLoja]);

  const adicionarCliente = useCallback((id: string) => {
    setClienteIdsSelecionados((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setClienteBusca('');
  }, []);

  const removerCliente = useCallback((id: string) => {
    setClienteIdsSelecionados((prev) => prev.filter((x) => x !== id));
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedIds(new Set(entregas.map((p) => p.id)));
  const selectNone = () => setSelectedIds(new Set());

  const clientesOptions = clientes.map((c) => ({ value: c.id, label: c.nome }));
  const clientesSelecionados = clientes.filter((c) => clienteIdsSelecionados.includes(c.id));
  const clientesDisponiveis = clientesOptions.filter((o) => !clienteIdsSelecionados.includes(o.value));

  const selecionadosCount = selectedIds.size;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Mapa de Entregas" size="2xl">
        <div className="flex flex-col gap-4">
          {etapa === 'filtros' && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-4">
              <p className="text-sm font-medium text-gray-700">Filtros (só entregas pendentes com endereço)</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
                  <Select
                    value={filtroDatas}
                    onChange={(e) => setFiltroDatas(e.target.value as FiltroDatas)}
                    options={[
                      { value: 'todas', label: 'Todas' },
                      { value: 'hoje', label: 'Só de hoje' },
                      { value: '15', label: 'Últimos 15 dias' },
                      { value: '7', label: 'Últimos 7 dias' },
                      { value: 'range', label: 'Período (data início e fim)' },
                    ]}
                    className="w-full"
                  />
                </div>

                {filtroDatas === 'range' && (
                  <div className="sm:col-span-2 grid grid-cols-2 gap-3">
                    <Input
                      type="date"
                      label="Data início"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                    />
                    <Input
                      type="date"
                      label="Data fim"
                      value={dataFim}
                      onChange={(e) => setDataFim(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Clientes (opcional)</label>
                <p className="text-xs text-gray-500 mb-2">Selecione um ou mais clientes para filtrar. Deixe vazio para todos.</p>
                {loadingClientes ? (
                  <p className="text-sm text-gray-500">Carregando clientes...</p>
                ) : (
                  <>
                    <Combobox
                      options={clientesDisponiveis}
                      value={clienteBusca}
                      onChange={setClienteBusca}
                      onSelect={adicionarCliente}
                      placeholder="Buscar cliente para adicionar..."
                      filterOption={(opt, search) => {
                        const s = search.trim().toLowerCase();
                        if (!s) return true;
                        return opt.label.toLowerCase().includes(s);
                      }}
                      className="mb-2"
                      inputClassName="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    {clientesSelecionados.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {clientesSelecionados.map((c) => (
                          <span
                            key={c.id}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-900 rounded text-sm"
                          >
                            {c.nome}
                            <button
                              type="button"
                              onClick={() => removerCliente(c.id)}
                              className="hover:bg-amber-200 rounded p-0.5"
                              aria-label={`Remover ${c.nome}`}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              <Button onClick={handleBuscarPedidos} disabled={loading}>
                {loading ? 'Carregando...' : 'Buscar pedidos'}
              </Button>
            </div>
          )}

          {etapa === 'selecao' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-gray-700">
                  {entregas.length} pedido(s) encontrado(s). Selecione os que deseja ver no mapa.
                </p>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={selectAll}>
                    Selecionar todos
                  </Button>
                  <Button variant="secondary" size="sm" onClick={selectNone}>
                    Desmarcar todos
                  </Button>
                  <Button
                    onClick={handleVerNoMapa}
                    disabled={selecionadosCount === 0}
                  >
                    Ver no mapa ({selecionadosCount})
                  </Button>
                  <Button variant="secondary" onClick={() => setEtapa('filtros')}>
                    Voltar
                  </Button>
                </div>
              </div>

              <div className="max-h-[280px] overflow-y-auto border border-gray-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="w-10 px-3 py-2 text-left"></th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Data</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Cliente</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Endereço</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entregas.map((p) => (
                      <tr
                        key={p.id}
                        className={`border-t border-gray-100 hover:bg-gray-50 ${selectedIds.has(p.id) ? 'bg-amber-50/50' : ''}`}
                      >
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(p.id)}
                            onChange={() => toggleSelect(p.id)}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="px-3 py-2">{formatDateBR(p.data_pedido)}</td>
                        <td className="px-3 py-2 font-medium">{p.cliente_nome ?? '—'}</td>
                        <td className="px-3 py-2 text-gray-600 truncate max-w-[200px]" title={p.endereco_entrega ?? ''}>
                          {p.endereco_entrega ?? '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {etapa === 'mapa' && (
            <div className="space-y-3">
              {geocoding && (
                <p className="text-amber-700 text-sm">
                  Localizando endereços... {geocodeProgress.done}/{geocodeProgress.total}
                </p>
              )}
              <div className="flex gap-2 flex-wrap items-center">
                <Button variant="secondary" size="sm" onClick={() => setEtapa('selecao')}>
                  Voltar à seleção
                </Button>
                {enderecoLoja?.endereco && (
                  <span className="text-xs text-gray-500 self-center">
                    Loja: {enderecoLoja.endereco}
                  </span>
                )}
              </div>
              {enderecosNaoLocalizados.length > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <p className="text-sm font-medium text-amber-900 mb-2">
                    {enderecosNaoLocalizados.length} endereço(s) não localizado(s) — revise o cadastro
                  </p>
                  <div className="max-h-[140px] overflow-y-auto space-y-2">
                    {enderecosNaoLocalizados.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between gap-2 text-sm bg-white rounded border border-amber-100 p-2"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 truncate" title={item.cliente_nome ?? undefined}>{item.cliente_nome ?? 'Cliente'}</p>
                          <p className="text-xs text-gray-600 truncate" title={item.endereco_entrega}>
                            {item.endereco_entrega}
                          </p>
                          <p className="text-xs text-gray-500">{formatDateBR(item.data_pedido)}</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <a
                            href={`/vendas/${item.id}?editar=endereco`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-lg border border-amber-600 text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors"
                          >
                            Edite o Endereço
                          </a>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setPedidoIdModal(item.id)}
                          >
                            Ver compra
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {loading && etapa === 'filtros' && (
            <p className="text-gray-500 text-sm">Carregando pedidos...</p>
          )}
          {etapa === 'filtros' && entregas.length === 0 && !loading && !error && (
            <p className="text-gray-500 text-sm">Clique em &quot;Buscar pedidos&quot; para listar as entregas.</p>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}

          <div
            ref={mapRef}
            className={`w-full rounded-lg border border-gray-200 bg-gray-100 ${etapa === 'mapa' ? 'h-[420px]' : 'h-0 overflow-hidden'}`}
            style={etapa === 'mapa' ? { minHeight: 420 } : { minHeight: 0, height: 0 }}
          />
        </div>
      </Modal>
      <VendaDetailModal
        pedidoId={pedidoIdModal}
        onClose={() => setPedidoIdModal(null)}
        token={token}
      />
    </>
  );
}

function escapeHtml(s: string): string {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}
