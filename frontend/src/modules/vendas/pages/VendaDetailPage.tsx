import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { Button } from '../../../components/ui/Button';
import * as vendasService from '../services/vendas.service';
import { imprimirPedido, abrirWhatsAppPedido } from '../lib/pedido-print-whatsapp';
import type { PedidoVendaComItens } from '../types/vendas.types';
import { formatDateBR } from '../../../shared/lib/format-date';

const STATUS_LABEL: Record<string, string> = {
  rascunho: 'Rascunho',
  confirmado: 'Confirmado',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
};

export function VendaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [pedido, setPedido] = useState<PedidoVendaComItens | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !token) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await vendasService.getPedidoVenda(id, token);
        if (!cancelled) setPedido(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Erro ao carregar venda');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  if (error || !pedido) {
    return (
      <div className="space-y-4">
        <Link to="/vendas"><Button variant="secondary">← Voltar às vendas</Button></Link>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error ?? 'Venda não encontrada'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link to="/vendas" className="text-sm text-slate-600 hover:underline mb-1 inline-block">← Vendas</Link>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Venda #{pedido.id.slice(0, 8)}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {formatDateBR(pedido.data_pedido)} · {STATUS_LABEL[pedido.status] ?? pedido.status}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Dados do pedido</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div><dt className="text-gray-500">Cliente</dt><dd className="font-medium text-gray-900">{pedido.cliente_nome ?? '—'}</dd></div>
            <div><dt className="text-gray-500">Entrega</dt><dd className="font-medium text-gray-900">{pedido.tipo_entrega === 'entrega' ? 'Sim' : 'Retirada'}</dd></div>
            {pedido.endereco_entrega && (
              <div className="sm:col-span-2">
                <dt className="text-gray-500">Endereço</dt>
                <dd className="font-medium text-gray-900 flex flex-wrap items-center gap-2">
                  <span>{pedido.endereco_entrega}</span>
                  <span className="inline-flex items-center gap-3">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(pedido.endereco_entrega)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 font-medium"
                      aria-label="Abrir rota no Google Maps"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Google Maps
                    </a>
                    <a
                      href={`https://waze.com/ul?q=${encodeURIComponent(pedido.endereco_entrega)}&navigate=yes`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                      aria-label="Abrir rota no Waze"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      Waze
                    </a>
                  </span>
                </dd>
              </div>
            )}
            {pedido.distancia_km != null && pedido.distancia_km > 0 && (
              <div><dt className="text-gray-500">Distância</dt><dd className="font-medium text-gray-900">{Number(pedido.distancia_km)} km</dd></div>
            )}
            {pedido.valor_frete != null && Number(pedido.valor_frete) > 0 && (
              <div><dt className="text-gray-500">Frete</dt><dd className="font-medium text-gray-900">R$ {Number(pedido.valor_frete).toFixed(2)}</dd></div>
            )}
            {pedido.valor_extras_entrega != null && Number(pedido.valor_extras_entrega) > 0 && (
              <div><dt className="text-gray-500">Extras entrega</dt><dd className="font-medium text-gray-900">R$ {Number(pedido.valor_extras_entrega).toFixed(2)}</dd></div>
            )}
            {pedido.valor_extras_livre != null && Number(pedido.valor_extras_livre) > 0 && (
              <div><dt className="text-gray-500">Outros extras</dt><dd className="font-medium text-gray-900">R$ {Number(pedido.valor_extras_livre).toFixed(2)}</dd></div>
            )}
            {pedido.observacoes?.trim() && (
              <div className="sm:col-span-2"><dt className="text-gray-500">Observações</dt><dd className="text-gray-900">{pedido.observacoes.trim()}</dd></div>
            )}
          </dl>
        </div>

        <div className="p-4 sm:p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Itens</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500">
                  <th className="pb-2 pr-4">Produto</th>
                  <th className="pb-2 pr-4 text-right">Qtd</th>
                  <th className="pb-2 pr-4 text-right">Preço un.</th>
                  <th className="pb-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {(pedido.itens ?? []).map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-2 pr-4 text-gray-900">
                      {item.produto_codigo && `${item.produto_codigo} — `}{item.produto_descricao ?? item.produto_id}
                    </td>
                    <td className="py-2 pr-4 text-right">{item.quantidade}</td>
                    <td className="py-2 pr-4 text-right">R$ {Number(item.preco_unitario).toFixed(2)}</td>
                    <td className="py-2 text-right font-medium">R$ {Number(item.total_item).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
            <p className="text-lg font-bold text-gray-900">Total: R$ {Number(pedido.total).toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => imprimirPedido(pedido)}>Baixar PDF</Button>
        <Button variant="secondary" onClick={() => { if (!abrirWhatsAppPedido(pedido)) alert('Cliente sem telefone cadastrado.'); }}>Enviar por WhatsApp</Button>
        <Link to="/vendas"><Button variant="secondary">Voltar às vendas</Button></Link>
      </div>
    </div>
  );
}
