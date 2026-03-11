import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerIconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(L.Icon.Default as any).mergeOptions({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerIconRetinaUrl,
  shadowUrl: markerShadowUrl,
});

import * as roteirizacaoService from '../services/roteirizacao.service';
import * as vendasService from '../../vendas/services/vendas.service';
import { geocodeAddresses } from '../../vendas/lib/geocode';
import { formatDateBR } from '../../../shared/lib/format-date';

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

function escapeHtml(s: string): string {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

interface MapaEntregasEmbedProps {
  token: string | null;
  onRefresh?: () => void;
  /** Quando definido, mostra apenas estes pedidos no mapa (filtro client-side). */
  pedidoIdsFilter?: string[];
  /** Altura reduzida para uso em resumo. */
  compact?: boolean;
}

export function MapaEntregasEmbed({ token, onRefresh, pedidoIdsFilter, compact }: MapaEntregasEmbedProps) {
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const clickHandlerRef = useRef<((e: Event) => void) | null>(null);

  const [pedidos, setPedidos] = useState<roteirizacaoService.PedidoParaMapa[]>([]);
  const [enderecoLoja, setEnderecoLoja] = useState<{ endereco: string | null; lat: number | null; lon: number | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeProgress, setGeocodeProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [naoLocalizados, setNaoLocalizados] = useState<
    Array<{ id: string; cliente_nome: string | null; endereco_entrega: string; data_pedido: string }>
  >([]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    Promise.all([
      roteirizacaoService.listPedidosParaMapa(token),
      vendasService.getEnderecoLoja(token),
    ])
      .then(([list, loja]) => {
        const filtered = pedidoIdsFilter?.length
          ? list.filter((p) => pedidoIdsFilter.includes(p.id))
          : list;
        setPedidos(filtered);
        setEnderecoLoja(loja);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Erro ao carregar');
        setPedidos([]);
      })
      .finally(() => setLoading(false));
  }, [token, onRefresh, pedidoIdsFilter]);

  useEffect(() => {
    if (loading || !token || !mapRef.current) return;

    const storeAddr = enderecoLoja?.endereco?.trim() ?? null;
    const storeLat = enderecoLoja?.lat;
    const storeLon = enderecoLoja?.lon;
    const storeTemCoords = storeLat != null && storeLon != null && !Number.isNaN(storeLat) && !Number.isNaN(storeLon);

    const pedidosSemCoords = pedidos.filter(
      (p) =>
        p.endereco_entrega &&
        (p.endereco_lat == null || p.endereco_lon == null || Number.isNaN(p.endereco_lat) || Number.isNaN(p.endereco_lon))
    );
    const addressesToGeocode = pedidosSemCoords.map((p) => p.endereco_entrega!);
    if (storeAddr && !storeTemCoords) addressesToGeocode.push(storeAddr);

    let cancelled = false;
    setNaoLocalizados([]);

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
        const naoLocalizadosArr: Array<{ id: string; cliente_nome: string | null; endereco_entrega: string; data_pedido: string }> = [];

        if (storeGeo) {
          const storeMarker = L.marker([storeGeo.lat, storeGeo.lon], { icon: markerIconLoja })
            .addTo(map)
            .bindPopup(
              `<div class="min-w-[200px] p-2"><p class="font-semibold text-gray-900">Loja</p><p class="text-xs text-gray-500 mt-1">${escapeHtml(storeAddr ?? '')}</p></div>`,
              { className: 'mapa-entregas-popup' }
            );
          markers.push(storeMarker);
        }

        pedidos.forEach((pedido) => {
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
            naoLocalizadosArr.push({
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
                ${pedido.data_entrega_prevista ? `<p class="text-xs text-amber-700">Entrega: ${escapeHtml(formatDateBR(pedido.data_entrega_prevista))}</p>` : ''}
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

        if (!cancelled) setNaoLocalizados(naoLocalizadosArr);
        markersRef.current = markers;

        if (markers.length > 0) {
          try {
            const group = L.featureGroup(markers);
            const bounds = group.getBounds();
            if (bounds.isValid()) {
              map.fitBounds(bounds.pad(0.15));
            }
          } catch {
            map.setView([-23.5505, -46.6333], 12);
          }
        }

        map.invalidateSize();
        setTimeout(() => map.invalidateSize(), 100);

        clickHandlerRef.current = (e: Event) => {
          const target = (e.target as HTMLElement).closest('[data-pedido-id]');
          if (target) {
            const id = (target as HTMLElement).dataset.pedidoId;
            if (id) navigate(`/vendas/${id}`);
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
  }, [loading, pedidos, token, enderecoLoja, navigate]);

  if (loading) {
    return (
      <div className="min-h-[320px] rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Carregando mapa...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[200px] rounded-xl border border-red-200 bg-red-50 p-4 flex items-center justify-center">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (pedidos.length === 0) {
    return (
      <div className="min-h-[320px] rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Nenhuma entrega pendente ou agendada para exibir no mapa.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {geocoding && (
        <p className="text-amber-700 text-sm">
          Localizando endereços... {geocodeProgress.done}/{geocodeProgress.total}
        </p>
      )}
      {naoLocalizados.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm font-medium text-amber-900 mb-2">
            {naoLocalizados.length} endereço(s) não localizado(s)
          </p>
          <div className="max-h-[100px] overflow-y-auto space-y-2">
            {naoLocalizados.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-2 text-sm bg-white rounded border border-amber-100 p-2">
                <p className="font-medium text-gray-900 truncate" title={item.cliente_nome ?? undefined}>{item.cliente_nome ?? 'Cliente'}</p>
                <a
                  href={`/vendas/${item.id}?editar=endereco`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-700 text-xs font-medium hover:underline shrink-0"
                >
                  Editar
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
      <div
        ref={mapRef}
        className={`w-full rounded-xl border border-gray-200 bg-gray-100 ${compact ? 'min-h-[200px]' : 'min-h-[320px]'}`}
        style={{ minHeight: compact ? 200 : 320 }}
      />
    </div>
  );
}
