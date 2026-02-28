import type { EntregaComPedido } from '../types/roteirizacao.types';
import { formatDateBR } from '../../../shared/lib/format-date';

function escapeHtml(s: string): string {
  const el = document.createElement('div');
  el.textContent = s;
  return el.innerHTML;
}

/**
 * Monta o HTML da rota de entrega para impressão.
 * Economia de tinta: sem preenchimento preto, fontes finas (300/400).
 */
function buildRotaHtml(
  dataEntrega: string,
  nomeVeiculo: string,
  lista: EntregaComPedido[]
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
  const html = buildRotaHtml(dataEntrega, nomeVeiculo, lista);
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
