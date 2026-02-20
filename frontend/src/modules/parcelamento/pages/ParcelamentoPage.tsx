import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import * as parcelamentoService from '../services/parcelamento.service';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { DataTable } from '../../../components/ui/DataTable';
import type { OpcaoParcelamento } from '../types/parcelamento.types';

export function ParcelamentoPage() {
  const { token } = useAuth();
  const [opcoes, setOpcoes] = useState<OpcaoParcelamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<OpcaoParcelamento | undefined>();
  const [taxaPercentual, setTaxaPercentual] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const list = await parcelamentoService.listOpcoesParcelamento(token);
      setOpcoes(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  const openEdit = (op: OpcaoParcelamento) => {
    setEditing(op);
    setTaxaPercentual(String(op.taxa_percentual));
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editing) return;
    const taxa = parseFloat(taxaPercentual.replace(',', '.'));
    if (Number.isNaN(taxa) || taxa < 0 || taxa > 100) {
      setError('Informe uma taxa entre 0 e 100');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await parcelamentoService.updateTaxaParcelamento(
        editing.id,
        { taxa_percentual: taxa },
        token
      );
      setModalOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && opcoes.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Carregando opções de parcelamento...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Opções de parcelamento</h1>
      </div>
      <p className="text-gray-600 text-sm">
        Taxas de parcelamento no cartão por número de parcelas. <strong>1x no cartão sem taxa.</strong> A partir de 2x, a taxa é aplicada sobre o valor total (itens + frete) na venda. Não esquecer de acrescentar a porcentagem %.
      </p>
      {opcoes.length === 0 && !loading ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">Nenhuma opção cadastrada. Execute a migration 024 para carregar a tabela inicial.</p>
        </div>
      ) : (
        <DataTable
          data={opcoes}
          columns={[
            {
              key: 'parcelas',
              label: 'Parcelas',
              render: (op) => `${op.parcelas}x`,
              sortValue: (op) => op.parcelas,
              sortable: true,
            },
            {
              key: 'taxa_percentual',
              label: 'Taxa (%)',
              render: (op) => (op.parcelas === 1 ? '0 (sem taxa)' : `${Number(op.taxa_percentual).toFixed(2)}%`),
              sortValue: (op) => op.taxa_percentual,
              sortable: true,
            },
            {
              key: 'actions',
              label: 'Ações',
              render: (op) => (
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openEdit(op)}
                    disabled={op.parcelas === 1}
                  >
                    Editar taxa
                  </Button>
                </div>
              ),
            },
          ]}
        />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Editar taxa de parcelamento">
        {editing && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-gray-600">
              Parcelas: <strong>{editing.parcelas}x</strong>
            </p>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}
            <Input
              label="Taxa (%)"
              type="number"
              min={0}
              max={100}
              step={0.01}
              value={taxaPercentual}
              onChange={(e) => setTaxaPercentual(e.target.value)}
              placeholder="Ex.: 4.87"
            />
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} disabled={submitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
