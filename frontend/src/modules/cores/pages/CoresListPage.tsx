import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import * as coresService from '../services/cores.service';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { DataTable } from '../../../components/ui/DataTable';
import type { Cor, CreateCorRequest, UpdateCorRequest } from '../types/cores.types';

export function CoresListPage() {
  const { token } = useAuth();
  const [cores, setCores] = useState<Cor[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Cor | undefined>();
  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const list = await coresService.listCores(token);
      setCores(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  const openCreate = () => {
    setEditing(undefined);
    setNome('');
    setCodigo('');
    setError('');
    setModalOpen(true);
  };

  const openEdit = (c: Cor) => {
    setEditing(c);
    setNome(c.nome);
    setCodigo(c.codigo ?? '');
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError('');
    setSubmitting(true);
    try {
      const data: CreateCorRequest | UpdateCorRequest = {
        nome: nome.trim(),
        codigo: codigo.trim() || null,
      };
      if (editing) {
        await coresService.updateCor(token, editing.id, data as UpdateCorRequest);
      } else {
        await coresService.createCor(token, data as CreateCorRequest);
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (c: Cor) => {
    if (!token || !window.confirm(`Excluir cor "${c.nome}"?`)) return;
    try {
      await coresService.deleteCor(token, c.id);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  };

  if (loading && cores.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Carregando cores...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Cores (chapas)</h1>
        <Button onClick={openCreate}>Nova cor</Button>
      </div>
      <p className="text-gray-600 text-sm">
        Cores para controle de estoque de chapas por variação. Use na ordem de produção e nas movimentações.
      </p>
      {cores.length === 0 && !loading ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">Nenhuma cor cadastrada</p>
          <Button onClick={openCreate}>Criar primeira cor</Button>
        </div>
      ) : (
        <DataTable
          data={cores}
          columns={[
            { key: 'nome', label: 'Nome', sortable: true, filterable: true, sortValue: (c) => c.nome.toLowerCase() },
            { key: 'codigo', label: 'Código', render: (c) => c.codigo ?? '—', sortValue: (c) => c.codigo ?? '' },
            {
              key: 'actions',
              label: 'Ações',
              render: (c) => (
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => openEdit(c)}>Editar</Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(c)}>Excluir</Button>
                </div>
              ),
            },
          ]}
          emptyMessage="Nenhuma cor"
        />
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar cor' : 'Nova cor'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Input label="Nome *" value={nome} onChange={(e) => setNome(e.target.value)} required />
          <Input label="Código" value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Ex: BR, MR" />
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={submitting}>{editing ? 'Salvar' : 'Criar'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
