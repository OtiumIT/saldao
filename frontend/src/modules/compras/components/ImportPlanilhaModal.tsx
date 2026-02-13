import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Select } from '../../../components/ui/Select';
import { useFornecedores } from '../../fornecedores/hooks/useFornecedores';
import * as comprasService from '../services/compras.service';
import type { ImportExcelRow } from '../services/compras.service';

interface ImportPlanilhaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  rows: ImportExcelRow[];
  token: string | null;
}

export function ImportPlanilhaModal({ isOpen, onClose, onSuccess, rows, token }: ImportPlanilhaModalProps) {
  const { fornecedores } = useFornecedores();
  const [fornecedorId, setFornecedorId] = useState('');
  const [dataPedido] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImport = async () => {
    if (!token || !fornecedorId) {
      setError('Selecione o fornecedor');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await comprasService.importFromExcel(
        {
          fornecedor_id: fornecedorId,
          data_pedido: dataPedido,
          rows,
        },
        token
      );
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao importar');
    } finally {
      setLoading(false);
    }
  };

  const total = rows.reduce((s, r) => s + r.quantidade * (r.valor_unitario || 0), 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Importar planilha" size="2xl">
      <p className="text-sm text-gray-600 mb-4">
        Será criado um pedido de compra (recepção) com os itens abaixo. Produtos que não existirem serão cadastrados e vinculados ao fornecedor.
      </p>
      <div className="space-y-4">
        <Select
          label="Fornecedor *"
          options={[{ value: '', label: '— Selecione —' }, ...fornecedores.map((f) => ({ value: f.id, label: f.nome }))]}
          value={fornecedorId}
          onChange={(e) => setFornecedorId(e.target.value)}
          required
          disabled={loading}
        />
        <div className="overflow-x-auto max-h-60 overflow-y-auto rounded-lg border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-700">COD</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700">Descrição</th>
                <th className="px-3 py-2 text-right font-medium text-gray-700">Qtd</th>
                <th className="px-3 py-2 text-right font-medium text-gray-700">Valor un.</th>
                <th className="px-3 py-2 text-right font-medium text-gray-700">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 50).map((r, i) => (
                <tr key={i} className="border-t border-gray-100">
                  <td className="px-3 py-1.5 text-gray-600">{r.codigo || '—'}</td>
                  <td className="px-3 py-1.5 text-gray-900">{r.descricao}</td>
                  <td className="px-3 py-1.5 text-right">{r.quantidade}</td>
                  <td className="px-3 py-1.5 text-right">R$ {Number(r.valor_unitario).toFixed(2)}</td>
                  <td className="px-3 py-1.5 text-right">R$ {(r.quantidade * (r.valor_unitario || 0)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length > 50 && (
            <p className="text-xs text-gray-500 px-3 py-2 bg-gray-50">Exibindo 50 de {rows.length} itens. Todos serão importados.</p>
          )}
        </div>
        <p className="text-sm font-medium text-gray-700">Total estimado: R$ {total.toFixed(2)}</p>
      </div>
      {error && <div className="mt-2 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">{error}</div>}
      <div className="mt-4 flex gap-2 justify-end">
        <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button type="button" onClick={handleImport} disabled={loading || !fornecedorId}>
          {loading ? 'Importando...' : `Importar ${rows.length} item(ns)`}
        </Button>
      </div>
    </Modal>
  );
}
