import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import * as categoriasService from '../services/categorias-produto.service';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { DataTable } from '../../../components/ui/DataTable';
import type {
  CategoriaProduto,
  CreateCategoriaProdutoRequest,
  UpdateCategoriaProdutoRequest,
} from '../types/categorias-produto.types';

export function CategoriasProdutoPage() {
  const { token } = useAuth();
  const [categorias, setCategorias] = useState<CategoriaProduto[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CategoriaProduto | undefined>();
  const [nome, setNome] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const list = await categoriasService.listCategoriasProduto(token);
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
    setError('');
    setModalOpen(true);
  };

  const openEdit = (c: CategoriaProduto) => {
    setEditing(c);
    setNome(c.nome);
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError('');
    setSubmitting(true);
    try {
      const data: CreateCategoriaProdutoRequest | UpdateCategoriaProdutoRequest = {
        nome: nome.trim(),
      };
      if (editing) {
        await categoriasService.updateCategoriaProduto(editing.id, data as UpdateCategoriaProdutoRequest, token);
      } else {
        await categoriasService.createCategoriaProduto(data as CreateCategoriaProdutoRequest, token);
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (c: CategoriaProduto) => {
    if (!token || !window.confirm(`Excluir categoria "${c.nome}"? Os produtos ficarão sem categoria.`)) return;
    try {
      await categoriasService.deleteCategoriaProduto(c.id, token);
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
        <h1 className="text-2xl font-bold text-gray-900">Categorias de produto</h1>
        <Button onClick={openCreate}>Nova categoria</Button>
      </div>
      <p className="text-gray-600 text-sm">
        Cozinha, quarto, lavanderia, sala, etc. Use para filtrar produtos na listagem e na conferência de estoque.
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
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} disabled={submitting}>Cancelar</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Salvando...' : editing ? 'Atualizar' : 'Criar'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
