import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import * as comprasService from '../services/compras.service';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import type { PedidoCompraComItens, ReceberItemRequest } from '../types/compras.types';

interface ReceberPedidoModalProps {
  pedidoId: string;
  onClose: () => void;
  onRecebido: () => void;
  receberPedido: (id: string, itens: ReceberItemRequest[]) => Promise<unknown>;
}

export function ReceberPedidoModal({ pedidoId, onClose, onRecebido, receberPedido }: ReceberPedidoModalProps) {
  const { token } = useAuth();
  const [pedido, setPedido] = useState<PedidoCompraComItens | null>(null);
  const [quantidades, setQuantidades] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    comprasService.getPedidoCompra(pedidoId, token).then((p) => {
      setPedido(p);
      const q: Record<string, number> = {};
      p.itens?.forEach((i) => {
        q[i.id] = i.quantidade_recebida ?? 0;
      });
      setQuantidades(q);
    });
  }, [pedidoId, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pedido) return;
    setError('');
    setLoading(true);
    try {
      const itens: ReceberItemRequest[] = pedido.itens.map((i) => ({
        item_id: i.id,
        quantidade_recebida: quantidades[i.id] ?? 0,
      }));
      await receberPedido(pedidoId, itens);
      onRecebido();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao receber');
    } finally {
      setLoading(false);
    }
  };

  if (!pedido) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <p className="text-sm text-gray-600 mb-4">Fornecedor: <strong>{pedido.fornecedor_nome}</strong>. Informe a quantidade recebida por item. O estoque será atualizado.</p>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {pedido.itens?.map((i) => (
            <div key={i.id} className="flex items-center gap-4 border-b pb-2">
              <span className="flex-1 text-sm">{i.produto_codigo} – {i.produto_descricao}</span>
              <span className="text-sm text-gray-500">Pedido: {i.quantidade}</span>
              <label className="text-sm">Recebido:</label>
              <Input
                type="number"
                step="0.001"
                className="w-24"
                value={quantidades[i.id] ?? ''}
                onChange={(e) => setQuantidades((prev) => ({ ...prev, [i.id]: parseFloat(e.target.value) || 0 }))}
                disabled={loading}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Confirmar recebimento'}</Button>
        </div>
      </form>
    </div>
  );
}
