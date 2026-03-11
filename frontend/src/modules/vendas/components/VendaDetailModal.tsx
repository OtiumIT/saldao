import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../../../components/ui/Modal';
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

interface VendaDetailModalProps {
  pedidoId: string | null;
  onClose: () => void;
  token: string | null;
}

export function VendaDetailModal({ pedidoId, onClose, token }: VendaDetailModalProps) {
  const navigate = useNavigate();
  const [pedido, setPedido] = useState<PedidoVendaComItens | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!pedidoId || !token) return;
    let cancelled = false;
    setLoading(true);
    vendasService
      .getPedidoVenda(pedidoId, token)
      .then((data) => {
        if (!cancelled) setPedido(data);
      })
      .catch(() => {
        if (!cancelled) setPedido(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pedidoId, token]);

  const handleVerCompleto = () => {
    onClose();
    if (pedidoId) navigate(`/vendas/${pedidoId}`);
  };

  return (
    <Modal isOpen={!!pedidoId} onClose={onClose} title="Detalhe da venda" size="xl">
      {loading ? (
        <p className="text-gray-500 py-8 text-center">Carregando...</p>
      ) : pedido ? (
        <div className="space-y-4">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div><dt className="text-gray-500">Cliente</dt><dd className="font-medium">{pedido.cliente_nome ?? '—'}</dd></div>
            <div><dt className="text-gray-500">Data</dt><dd className="font-medium">{formatDateBR(pedido.data_pedido)}</dd></div>
            <div><dt className="text-gray-500">Status</dt><dd className="font-medium">{STATUS_LABEL[pedido.status] ?? pedido.status}</dd></div>
            {pedido.endereco_entrega && (
              <div className="sm:col-span-2"><dt className="text-gray-500">Endereço</dt><dd className="font-medium">{pedido.endereco_entrega}</dd></div>
            )}
          </dl>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500">
                  <th className="pb-2 pr-4">Produto</th>
                  <th className="pb-2 pr-4 text-right">Qtd</th>
                  <th className="pb-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {(pedido.itens ?? []).map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-2 pr-4">{item.produto_codigo && `${item.produto_codigo} — `}{item.produto_descricao ?? item.produto_id}</td>
                    <td className="py-2 pr-4 text-right">{item.quantidade}</td>
                    <td className="py-2 text-right font-medium">R$ {Number(item.total_item).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-lg font-bold text-gray-900">Total: R$ {Number(pedido.total).toFixed(2)}</p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button onClick={handleVerCompleto}>Ver venda completa</Button>
            <Button variant="secondary" onClick={() => imprimirPedido(pedido)}>Baixar PDF</Button>
            <Button variant="secondary" onClick={() => { if (!abrirWhatsAppPedido(pedido)) alert('Cliente sem telefone.'); }}>WhatsApp</Button>
          </div>
        </div>
      ) : (
        <p className="text-gray-500 py-8 text-center">Venda não encontrada</p>
      )}
    </Modal>
  );
}
