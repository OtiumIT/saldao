import type { PedidoVendaComItens } from '../types/vendas.types';

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

/** Abre janela de impressão com o conteúdo do pedido */
export function imprimirPedido(pedido: PedidoVendaComItens): void {
  const itens = (pedido.itens ?? [])
    .map(
      (i) =>
        `<tr><td>${escapeHtml(i.produto_descricao ?? i.produto_codigo ?? '')}</td><td style="text-align:right">${i.quantidade}</td><td style="text-align:right">R$ ${Number(i.preco_unitario).toFixed(2)}</td><td style="text-align:right">R$ ${Number(i.total_item).toFixed(2)}</td></tr>`
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Pedido ${escapeHtml(pedido.id.slice(0, 8))}</title>
  <style>
    body { font-family: sans-serif; font-size: 12px; padding: 16px; max-width: 600px; margin: 0 auto; }
    h1 { font-size: 16px; margin-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
    th { background: #f5f5f5; }
    .total { font-weight: bold; font-size: 14px; margin-top: 8px; }
    .obs { margin-top: 12px; color: #555; }
  </style>
</head>
<body>
  <h1>Pedido de venda — ${escapeHtml(pedido.data_pedido)}</h1>
  <p><strong>Cliente:</strong> ${escapeHtml(pedido.cliente_nome ?? '—')}</p>
  <p><strong>Entrega:</strong> ${pedido.tipo_entrega === 'entrega' ? 'Sim' : 'Retirada'}</p>
  ${pedido.endereco_entrega ? `<p><strong>Endereço:</strong> ${escapeHtml(pedido.endereco_entrega)}</p>` : ''}
  <table>
    <thead><tr><th>Produto</th><th style="text-align:right">Qtd</th><th style="text-align:right">Preço un.</th><th style="text-align:right">Total</th></tr></thead>
    <tbody>${itens}</tbody>
  </table>
  ${pedido.valor_frete != null && Number(pedido.valor_frete) > 0 ? `<p><strong>Frete:</strong> R$ ${Number(pedido.valor_frete).toFixed(2)}</p>` : ''}
  <p class="total">Total: R$ ${Number(pedido.total).toFixed(2)}</p>
  ${pedido.observacoes ? `<p class="obs"><strong>Observações:</strong> ${escapeHtml(pedido.observacoes)}</p>` : ''}
  <p style="margin-top: 24px; font-size: 10px; color: #888;">Saldão de Móveis Jerusalém — Pedido #${pedido.id.slice(0, 8)}</p>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  win.onload = () => {
    win.print();
    win.onafterprint = () => win.close();
  };
  setTimeout(() => win.print(), 250);
}

function escapeHtml(s: string): string {
  const el = document.createElement('div');
  el.textContent = s;
  return el.innerHTML;
}
