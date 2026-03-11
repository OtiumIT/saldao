import type { EntregaComPedido } from '../types/roteirizacao.types';
import { formatDateBR } from '../../../shared/lib/format-date';

/** Coordenadas para desenho simplificado do mapa (SVG estático, mínimo de riscos na impressão). */
interface PontoMapa {
  lat: number;
  lon: number;
  label: string;
}

/** Gera SVG simplificado da rota para impressão (sem Leaflet, sem APIs externas). */
function buildMapaSvg(pontos: PontoMapa[], width: number, height: number): string {
  if (pontos.length === 0) return '';
  if (pontos.length === 1) {
    const p = pontos[0];
    const cx = width / 2;
    const cy = height / 2;
    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="#f8fafc"/>
  <circle cx="${cx}" cy="${cy}" r="12" fill="#ea580c" stroke="#fff" stroke-width="2"/>
  <text x="${cx}" y="${cy - 18}" text-anchor="middle" font-size="12" font-weight="600" fill="#333">1</text>
</svg>`;
  }
  const lats = pontos.map((p) => p.lat);
  const lons = pontos.map((p) => p.lon);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const padLat = (maxLat - minLat) * 0.1 || 0.01;
  const padLon = (maxLon - minLon) * 0.1 || 0.01;
  const rangeLat = maxLat - minLat + padLat * 2 || 0.02;
  const rangeLon = maxLon - minLon + padLon * 2 || 0.02;
  const margin = 24;
  const w = width - margin * 2;
  const h = height - margin * 2;

  const toX = (lon: number) => margin + ((lon - minLon + padLon) / rangeLon) * w;
  const toY = (lat: number) => height - margin - ((lat - minLat + padLat) / rangeLat) * h;

  const pathD = pontos
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.lon)} ${toY(p.lat)}`)
    .join(' ');
  const circles = pontos
    .map(
      (p, i) =>
        `<circle cx="${toX(p.lon)}" cy="${toY(p.lat)}" r="6" fill="#ea580c" stroke="#fff" stroke-width="2"/>
         <text x="${toX(p.lon)}" y="${toY(p.lat) - 10}" text-anchor="middle" font-size="10" font-weight="600" fill="#333">${i + 1}</text>`
    )
    .join('');

  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="#f8fafc"/>
  <path d="${pathD}" fill="none" stroke="#ea580c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  ${circles}
</svg>`;
}

function escapeHtml(s: string): string {
  const el = document.createElement('div');
  el.textContent = s;
  return el.innerHTML;
}

/**
 * Monta o HTML da rota de entrega para impressão.
 * Economia de tinta: sem preenchimento preto, fontes finas (300/400).
 * Inclui mapa SVG simplificado quando há coordenadas (mínimo de riscos).
 */
function buildRotaHtml(
  dataEntrega: string,
  nomeVeiculo: string,
  lista: EntregaComPedido[],
  incluirMapa = true
): string {
  const paradas = lista
    .map(
      (e, i) => `
    <tr>
      <td class="num parada">${i + 1}ª</td>
      <td>
        <span class="cliente">${escapeHtml(e.cliente_nome ?? '—')}</span><br>
        <span class="endereco">${escapeHtml(e.endereco_entrega ?? '—')}</span><br>
        <span class="valor">R$ ${(e.total ?? 0).toFixed(2)}</span>
      </td>
    </tr>`
    )
    .join('');

  const pontosComCoords = lista
    .filter((e) => e.endereco_lat != null && e.endereco_lon != null && !Number.isNaN(e.endereco_lat!) && !Number.isNaN(e.endereco_lon!))
    .map((e, i) => ({
      lat: e.endereco_lat!,
      lon: e.endereco_lon!,
      label: String(i + 1),
    }));
  const mapaSvg = incluirMapa && pontosComCoords.length >= 1 ? buildMapaSvg(pontosComCoords, 400, 180) : '';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Rota de entrega — ${formatDateBR(dataEntrega)} — Saldão de Móveis Jerusalém</title>
  <style>
    /* Economia de tinta: sem preenchimento preto, fontes finas */
    * { box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      font-weight: 300;
      font-size: 11pt;
      line-height: 1.4;
      color: #333;
      max-width: 210mm;
      margin: 0 auto;
      padding: 12mm 15mm;
      background: #fff;
    }
    .header {
      border-bottom: 1px solid #999;
      padding-bottom: 10px;
      margin-bottom: 16px;
    }
    .empresa { font-size: 16pt; font-weight: 400; margin: 0 0 4px 0; }
    .doc-title { font-size: 12pt; font-weight: 400; text-transform: uppercase; letter-spacing: 0.05em; color: #555; margin: 0 0 6px 0; }
    .doc-meta { font-size: 10pt; color: #555; font-weight: 300; }
    .doc-meta strong { font-weight: 400; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 10pt; font-weight: 300; }
    thead th { text-align: left; padding: 8px 10px; border-bottom: 1px solid #333; font-weight: 400; }
    thead th:first-child { width: 72px; }
    tbody td { padding: 10px 12px; border-bottom: 1px solid #ddd; vertical-align: top; }
    tbody td.parada { font-weight: 400; color: #555; }
    .cliente { font-weight: 400; }
    .endereco { color: #555; font-size: 9.5pt; }
    .valor { font-size: 9.5pt; color: #666; }
    .num { font-variant-numeric: tabular-nums; }
    .footer { margin-top: 24px; padding-top: 10px; border-top: 1px solid #ccc; font-size: 9pt; color: #666; text-align: center; font-weight: 300; }
    .mapa-print { margin: 12px 0; border: 1px solid #ddd; border-radius: 4px; overflow: hidden; }
    .mapa-print svg { display: block; width: 100%; height: auto; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <header class="header">
    <p class="empresa">Saldão de Móveis Jerusalém</p>
    <p class="doc-title">Rota de entrega</p>
    <div class="doc-meta">
      <strong>Data:</strong> ${formatDateBR(dataEntrega)} &nbsp;|&nbsp; <strong>Veículo:</strong> ${escapeHtml(nomeVeiculo)} &nbsp;|&nbsp; <strong>Paradas:</strong> ${lista.length}
    </div>
  </header>
  ${mapaSvg ? `<div class="mapa-print">${mapaSvg}</div>` : ''}

  <table>
    <thead>
      <tr>
        <th>Parada</th>
        <th>Cliente / Endereço / Valor</th>
      </tr>
    </thead>
    <tbody>${paradas}</tbody>
  </table>

  <footer class="footer">
    Saldão de Móveis Jerusalém — Rota ${formatDateBR(dataEntrega)} — ${escapeHtml(nomeVeiculo)} — ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
  </footer>
</body>
</html>`;
}

/**
 * Abre a rota de entrega em nova janela e aciona a impressão.
 * Lista deve estar na ordem da rota (1ª parada, 2ª parada, etc.).
 * Usa Blob + object URL para o conteúdo ser carregado como documento e evitar tela em branco.
 */
export function imprimirRota(
  dataEntrega: string,
  nomeVeiculo: string,
  lista: EntregaComPedido[]
): void {
  if (lista.length === 0) {
    return;
  }
  const html = buildRotaHtml(dataEntrega, nomeVeiculo, lista, true);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, '_blank', 'noopener,noreferrer');
  if (!w) {
    URL.revokeObjectURL(url);
    alert('Permita pop-ups para imprimir a rota.');
    return;
  }
  w.addEventListener('load', () => {
    URL.revokeObjectURL(url);
    try {
      w.print();
    } catch {
      // janela pode ter sido fechada
    }
  });
}

/**
 * Imprime rota com mapa SVG simplificado (mesmo que imprimirRota, alias para compatibilidade).
 */
export function imprimirRotaComMapa(
  dataEntrega: string,
  nomeVeiculo: string,
  lista: EntregaComPedido[]
): void {
  imprimirRota(dataEntrega, nomeVeiculo, lista);
}
