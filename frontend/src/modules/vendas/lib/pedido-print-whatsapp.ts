import type { PedidoVendaComItens } from '../types/vendas.types';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/** Normaliza fone para link WhatsApp Brasil (55 + DDD + número) */
export function whatsappNumber(fone: string | null | undefined): string | null {
  if (!fone || typeof fone !== 'string') return null;
  let d = fone.replace(/\D/g, '');
  if (d.length < 10) return null;
  if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  if (d.length === 10 || d.length === 11) return '55' + d;
  if (d.startsWith('55') && d.length >= 12) return d.slice(0, 13);
  return '55' + d;
}

/** Monta mensagem de resumo do pedido para WhatsApp */
export function mensagemResumoPedido(p: PedidoVendaComItens): string {
  const linhas: string[] = ['*Resumo do pedido*', ''];
  linhas.push(`Cliente: ${p.cliente_nome ?? '—'}`);
  linhas.push(`Data: ${p.data_pedido}`);
  linhas.push(`Entrega: ${p.tipo_entrega === 'entrega' ? 'Sim' : 'Retirada'}`);
  if (p.endereco_entrega) linhas.push(`Endereço: ${p.endereco_entrega}`);
  linhas.push('');
  linhas.push('*Itens:*');
  (p.itens ?? []).forEach((i) => {
    linhas.push(`• ${i.produto_descricao ?? i.produto_codigo ?? ''} — ${i.quantidade} x R$ ${Number(i.preco_unitario).toFixed(2)} = R$ ${Number(i.total_item).toFixed(2)}`);
  });
  linhas.push('');
  if (p.valor_frete != null && Number(p.valor_frete) > 0) {
    linhas.push(`Frete: R$ ${Number(p.valor_frete).toFixed(2)}`);
  }
  linhas.push(`*Total: R$ ${Number(p.total).toFixed(2)}*`);
  if (p.observacoes) linhas.push('', `Obs: ${p.observacoes}`);
  return linhas.join('\n');
}

/** Abre WhatsApp com número e mensagem (abre em nova aba) */
export function abrirWhatsAppPedido(pedido: PedidoVendaComItens): boolean {
  const fone = (pedido as { cliente_fone?: string | null }).cliente_fone;
  const num = whatsappNumber(fone);
  if (!num) return false;
  const msg = mensagemResumoPedido(pedido);
  const url = `https://wa.me/${num}${msg ? `?text=${encodeURIComponent(msg)}` : ''}`;
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}

/** Monta o HTML do pedido (documento completo) e o fragmento para renderização (estilo + corpo). */
function buildPedidoHtml(pedido: PedidoVendaComItens): { html: string; fragment: string } {
  const pedidoNum = pedido.id.slice(0, 8).toUpperCase();
  const clienteFone = (pedido as { cliente_fone?: string | null }).cliente_fone;
  const subtotal = (pedido.valor_frete != null && Number(pedido.valor_frete) > 0)
    ? Number(pedido.total) - Number(pedido.valor_frete)
    : Number(pedido.total);

  const itens = (pedido.itens ?? [])
    .map(
      (i) =>
        `<tr>
          <td>${escapeHtml((i.produto_codigo ? i.produto_codigo + ' — ' : '') + (i.produto_descricao ?? ''))}</td>
          <td class="num">${i.quantidade}</td>
          <td class="num">R$ ${Number(i.preco_unitario).toFixed(2)}</td>
          <td class="num">R$ ${Number(i.total_item).toFixed(2)}</td>
        </tr>`
    )
    .join('');

  const statusLabel: Record<string, string> = { rascunho: 'Rascunho', confirmado: 'Confirmado', entregue: 'Entregue', cancelado: 'Cancelado' };
  const status = statusLabel[pedido.status] ?? pedido.status;

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Pedido ${escapeHtml(pedidoNum)} — Saldão de Móveis Jerusalém</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      font-size: 11pt;
      line-height: 1.35;
      color: #1a1a1a;
      max-width: 210mm;
      margin: 0 auto;
      padding: 12mm 15mm;
      background: #fff;
    }
    .header {
      border-bottom: 2px solid #1a1a1a;
      padding-bottom: 10px;
      margin-bottom: 14px;
    }
    .empresa { font-size: 18pt; font-weight: 700; letter-spacing: 0.02em; margin: 0 0 2px 0; }
    .doc-title { font-size: 11pt; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #444; margin: 0 0 8px 0; }
    .doc-meta { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; font-size: 10pt; color: #555; }
    .section {
      margin-bottom: 14px;
      padding: 10px 12px;
      background: #f8f9fa;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
    }
    .section-title { font-size: 9pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #555; margin: 0 0 8px 0; padding-bottom: 4px; border-bottom: 1px solid #ddd; }
    .section .row { display: flex; gap: 8px; margin-bottom: 4px; }
    .section .row:last-child { margin-bottom: 0; }
    .section .label { min-width: 100px; color: #555; font-weight: 500; }
    .section .value { flex: 1; }
    table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 10pt; }
    thead th { text-align: left; padding: 8px 10px; background: #1a1a1a; color: #fff; font-weight: 600; }
    thead th.num { text-align: right; }
    tbody td { padding: 6px 10px; border-bottom: 1px solid #e5e5e5; }
    tbody td.num { text-align: right; }
    tbody tr:nth-child(even) { background: #fafafa; }
    .totais { margin-top: 12px; text-align: right; }
    .totais p { margin: 4px 0; }
    .total-geral { font-size: 14pt; font-weight: 700; margin-top: 8px; padding-top: 8px; border-top: 2px solid #1a1a1a; }
    .footer { margin-top: 20px; padding-top: 10px; border-top: 1px solid #ddd; font-size: 9pt; color: #666; text-align: center; }
    .num { font-variant-numeric: tabular-nums; }
  </style>
</head>
<body>
  <header class="header">
    <p class="empresa">Saldão de Móveis Jerusalém</p>
    <p class="doc-title">Pedido de venda</p>
    <div class="doc-meta">
      <span><strong>Nº do pedido:</strong> ${escapeHtml(pedidoNum)}</span>
      <span><strong>Data:</strong> ${escapeHtml(pedido.data_pedido)}</span>
      <span><strong>Status:</strong> ${escapeHtml(status)}</span>
    </div>
  </header>

  <section class="section">
    <h2 class="section-title">Dados do cliente</h2>
    <div class="row"><span class="label">Nome</span><span class="value">${escapeHtml(pedido.cliente_nome ?? '—')}</span></div>
    ${clienteFone ? `<div class="row"><span class="label">Telefone</span><span class="value">${escapeHtml(clienteFone)}</span></div>` : ''}
  </section>

  <section class="section">
    <h2 class="section-title">Dados da venda</h2>
    <div class="row"><span class="label">Data do pedido</span><span class="value">${escapeHtml(pedido.data_pedido)}</span></div>
    <div class="row"><span class="label">Status</span><span class="value">${escapeHtml(status)}</span></div>
    ${pedido.observacoes ? `<div class="row"><span class="label">Observações</span><span class="value">${escapeHtml(pedido.observacoes)}</span></div>` : ''}
  </section>

  <section class="section">
    <h2 class="section-title">Entrega</h2>
    <div class="row"><span class="label">Tipo</span><span class="value">${pedido.tipo_entrega === 'entrega' ? 'Entrega' : 'Retirada no local'}</span></div>
    ${pedido.endereco_entrega ? `<div class="row"><span class="label">Endereço</span><span class="value">${escapeHtml(pedido.endereco_entrega)}</span></div>` : ''}
    ${pedido.distancia_km != null && Number(pedido.distancia_km) > 0 ? `<div class="row"><span class="label">Distância</span><span class="value">${Number(pedido.distancia_km)} km</span></div>` : ''}
    ${pedido.valor_frete != null && Number(pedido.valor_frete) > 0 ? `<div class="row"><span class="label">Valor do frete</span><span class="value">R$ ${Number(pedido.valor_frete).toFixed(2)}</span></div>` : ''}
    ${pedido.previsao_entrega_em_dias != null && pedido.previsao_entrega_em_dias > 0 ? `<div class="row"><span class="label">Previsão de entrega</span><span class="value">${pedido.previsao_entrega_em_dias} dia(s)</span></div>` : ''}
  </section>

  <section class="section">
    <h2 class="section-title">Itens do pedido</h2>
    <table>
      <thead>
        <tr>
          <th>Produto</th>
          <th class="num">Qtd</th>
          <th class="num">Preço un.</th>
          <th class="num">Total</th>
        </tr>
      </thead>
      <tbody>${itens}</tbody>
    </table>
    <div class="totais">
      ${pedido.valor_frete != null && Number(pedido.valor_frete) > 0 ? `<p>Subtotal (itens): R$ ${subtotal.toFixed(2)}</p><p>Frete: R$ ${Number(pedido.valor_frete).toFixed(2)}</p>` : ''}
      <p class="total-geral">Total: R$ ${Number(pedido.total).toFixed(2)}</p>
    </div>
  </section>

  <footer class="footer">
    Saldão de Móveis Jerusalém — Pedido ${escapeHtml(pedidoNum)} — ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
  </footer>
</body>
</html>`;

  const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/);
  let styleBlock = styleMatch ? styleMatch[1] : '';
  styleBlock = styleBlock.replace(/\bbody\s*\{/g, '.pedido-pdf-body {');
  const bodyContent = bodyMatch ? bodyMatch[1] : html;
  const fragment = `<style>${styleBlock}</style><div class="pedido-pdf-body">${bodyContent}</div>`;
  return { html, fragment };
}

/** Gera PDF do pedido e inicia o download. Funciona em desktop e mobile. */
export async function baixarPdfPedido(pedido: PedidoVendaComItens): Promise<void> {
  const pedidoNum = pedido.id.slice(0, 8).toUpperCase();
  const { fragment } = buildPedidoHtml(pedido);

  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:fixed;left:-9999px;top:0;width:794px;background:#fff;padding:40px;';
  wrap.innerHTML = fragment;
  document.body.appendChild(wrap);

  try {
    const canvas = await html2canvas(wrap, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.92);
    const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
    const pdfWidth = (pdf as unknown as { internal: { pageSize: { getWidth: () => number } } }).internal.pageSize.getWidth();
    const pdfHeight = (pdf as unknown as { internal: { pageSize: { getHeight: () => number } } }).internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    position -= pdfHeight;

    while (position > -imgHeight) {
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      position -= pdfHeight;
    }

    pdf.save(`pedido-${pedidoNum}.pdf`);
  } finally {
    wrap.remove();
  }
}

/** Gera PDF e inicia download (alias para manter compatibilidade com botão "Imprimir pedido"). */
export function imprimirPedido(pedido: PedidoVendaComItens): void {
  baixarPdfPedido(pedido).catch((err) => {
    alert(err instanceof Error ? err.message : 'Erro ao gerar PDF');
  });
}

function escapeHtml(s: string): string {
  const el = document.createElement('div');
  el.textContent = s;
  return el.innerHTML;
}
