import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import * as custosService from '../services/custos-operacionais.service';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { DataTable } from '../../../components/ui/DataTable';
import type { CategoriaCustoOperacional, CreateCategoriaRequest, UpdateCategoriaRequest, LocalCusto } from '../types/custos.types';

const LOCAL_LABELS: Record<LocalCusto, string> = {
  fabrica: 'Fábrica',
  loja: 'Loja',
  comum: 'Comum',
};

export function CategoriasCustoPage() {
  const { token } = useAuth();
  const [categorias, setCategorias] = useState<CategoriaCustoOperacional[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CategoriaCustoOperacional | undefined>();
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [local, setLocal] = useState<LocalCusto>('comum');
  const [ativo, setAtivo] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const list = await custosService.listCategorias(token);
      setCategorias(list);
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
    setDescricao('');
    setLocal('comum');
    setAtivo(true);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (c: CategoriaCustoOperacional) => {
    setEditing(c);
    setNome(c.nome);
    setDescricao(c.descricao ?? '');
    setLocal(c.local);
    setAtivo(c.ativo);
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError('');
    setSubmitting(true);
    try {
      const data: CreateCategoriaRequest | UpdateCategoriaRequest = {
        nome: nome.trim(),
        descricao: descricao.trim() || null,
        local,
        ativo,
      };
      if (editing) {
        await custosService.updateCategoria(editing.id, data as UpdateCategoriaRequest, token);
      } else {
        await custosService.createCategoria(data as CreateCategoriaRequest, token);
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (c: CategoriaCustoOperacional) => {
    if (!token || !window.confirm(`Excluir categoria "${c.nome}"?`)) return;
    try {
      await custosService.deleteCategoria(c.id, token);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  };

  if (loading && categorias.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Carregando categorias...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Categorias de custo operacional</h1>
        <Button onClick={openCreate}>Nova categoria</Button>
      </div>
      <p className="text-gray-600 text-sm">
        Aluguel, luz, salários, gasolina, etc. Use o local para viabilidade Fábrica vs Loja.
      </p>
      {categorias.length === 0 && !loading ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">Nenhuma categoria cadastrada</p>
          <Button onClick={openCreate}>Criar primeira categoria</Button>
        </div>
      ) : (
        <DataTable
          data={categorias}
          columns={[
            { key: 'nome', label: 'Nome', sortable: true, filterable: true, sortValue: (c) => c.nome.toLowerCase() },
            { key: 'local', label: 'Local', sortable: true, render: (c) => LOCAL_LABELS[c.local], sortValue: (c) => c.local },
            { key: 'ativo', label: 'Ativo', render: (c) => (c.ativo ? 'Sim' : 'Não'), sortValue: (c) => (c.ativo ? 1 : 0) },
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
          searchPlaceholder="Buscar categorias..."
          emptyMessage="Nenhuma categoria"
        />
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar categoria' : 'Nova categoria'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">{error}</div>}
          <Input label="Nome *" value={nome} onChange={(e) => setNome(e.target.value)} required disabled={submitting} />
          <Input label="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} disabled={submitting} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Local (viabilidade)</label>
            <select
              value={local}
              onChange={(e) => setLocal(e.target.value as LocalCusto)}
              disabled={submitting}
              className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-brand-gold"
            >
              {(Object.keys(LOCAL_LABELS) as LocalCusto[]).map((k) => (
                <option key={k} value={k}>{LOCAL_LABELS[k]}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="ativo" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} disabled={submitting} />
            <label htmlFor="ativo">Ativo</label>
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} disabled={submitting}>Cancelar</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Salvando...' : editing ? 'Atualizar' : 'Criar'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
