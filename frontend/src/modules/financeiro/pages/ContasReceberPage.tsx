import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import * as financeiroService from '../services/financeiro.service';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { DataTable } from '../../../components/ui/DataTable';
import type { ContaReceber } from '../types/financeiro.types';

export function ContasReceberPage() {
  const { token } = useAuth();
  const [contas, setContas] = useState<ContaReceber[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalAberta, setModalAberta] = useState(false);
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [vencimento, setVencimento] = useState('');

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const list = await financeiroService.listContasReceber(token);
      setContas(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      await financeiroService.createContaReceber(token, {
        descricao,
        valor: parseFloat(valor) || 0,
        vencimento,
      });
      setModalAberta(false);
      setDescricao('');
      setValor('');
      setVencimento('');
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro');
    }
  };

  const marcarRecebido = async (id: string) => {
    if (!token) return;
    try {
      await financeiroService.marcarRecebido(token, id);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Contas a receber</h1>
        <Button onClick={() => setModalAberta(true)}>Nova conta</Button>
      </div>
      {loading && contas.length === 0 ? (
        <p className="text-gray-500">Carregando...</p>
      ) : (
        <DataTable
          data={contas}
          columns={[
            { key: 'descricao', label: 'Descrição', sortable: true, sortValue: (c: ContaReceber) => c.descricao },
            { key: 'vencimento', label: 'Vencimento', sortable: true, sortValue: (c: ContaReceber) => c.vencimento },
            { key: 'valor', label: 'Valor', render: (c: ContaReceber) => `R$ ${c.valor.toFixed(2)}`, sortValue: (c: ContaReceber) => c.valor },
            { key: 'status', label: 'Status', render: (c: ContaReceber) => c.status === 'recebido' ? 'Recebido' : 'Pendente', sortValue: (c: ContaReceber) => c.status },
            {
              key: 'actions',
              label: 'Ações',
              render: (c: ContaReceber) =>
                c.status === 'pendente' ? (
                  <Button variant="secondary" size="sm" onClick={() => marcarRecebido(c.id)}>Marcar recebido</Button>
                ) : null,
            },
          ]}
          emptyMessage="Nenhuma conta"
        />
      )}
      <Modal isOpen={modalAberta} onClose={() => setModalAberta(false)} title="Nova conta a receber">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} required />
          <Input label="Valor" type="number" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} required />
          <Input label="Vencimento" type="date" value={vencimento} onChange={(e) => setVencimento(e.target.value)} required />
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={() => setModalAberta(false)}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
