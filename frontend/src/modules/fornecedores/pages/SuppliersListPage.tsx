import { useState } from 'react';
import { useFornecedores } from '../hooks/useFornecedores';
import { SupplierForm } from '../components/SupplierForm';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { DataTable } from '../../../components/ui/DataTable';
import type { Fornecedor, CreateFornecedorRequest, UpdateFornecedorRequest, TipoFornecedor } from '../types/suppliers.types';

const TIPO_LABEL: Record<TipoFornecedor, string> = { insumos: 'Insumos', revenda: 'Revenda' };

export function SuppliersListPage() {
  const [filtroTipo, setFiltroTipo] = useState<TipoFornecedor | ''>('');
  const { fornecedores, loading, error, createFornecedor, updateFornecedor, deleteFornecedor } = useFornecedores(
    filtroTipo === '' ? undefined : filtroTipo
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFornecedor, setEditingFornecedor] = useState<Fornecedor | undefined>();
  const [deletingFornecedor, setDeletingFornecedor] = useState<Fornecedor | null>(null);

  const handleCreate = () => {
    setEditingFornecedor(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (f: Fornecedor) => {
    setEditingFornecedor(f);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: CreateFornecedorRequest | UpdateFornecedorRequest) => {
    if (editingFornecedor) {
      await updateFornecedor(editingFornecedor.id, data as UpdateFornecedorRequest);
    } else {
      await createFornecedor(data as CreateFornecedorRequest);
    }
    setIsModalOpen(false);
    setEditingFornecedor(undefined);
  };

  const handleDelete = async () => {
    if (deletingFornecedor) {
      await deleteFornecedor(deletingFornecedor.id);
      setDeletingFornecedor(null);
    }
  };

  if (loading && fornecedores.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Carregando fornecedores...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Erro ao carregar fornecedores: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Fornecedores</h1>
        <Button onClick={handleCreate}>Novo Fornecedor</Button>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm text-gray-600">Tipo:</span>
        <button
          type="button"
          onClick={() => setFiltroTipo('')}
          className={`px-3 py-1.5 rounded text-sm font-medium ${filtroTipo === '' ? 'bg-brand-gold text-brand-black font-medium' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Todos
        </button>
        {(Object.keys(TIPO_LABEL) as TipoFornecedor[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setFiltroTipo(t)}
            className={`px-3 py-1.5 rounded text-sm font-medium ${filtroTipo === t ? 'bg-brand-gold text-brand-black font-medium' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            {TIPO_LABEL[t]}
          </button>
        ))}
      </div>

      {fornecedores.length === 0 && !loading ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">Nenhum fornecedor cadastrado</p>
          <Button onClick={handleCreate}>Criar primeiro fornecedor</Button>
        </div>
      ) : (
        <DataTable
          data={fornecedores}
          columns={[
            { key: 'nome', label: 'Nome', sortable: true, filterable: true, sortValue: (f) => f.nome.toLowerCase() },
            { key: 'tipo', label: 'Tipo', sortable: true, render: (f) => (f.tipo ? TIPO_LABEL[f.tipo] : '-'), sortValue: (f) => f.tipo ?? '' },
            { key: 'fone', label: 'Telefone', sortable: true, filterable: true, render: (f) => f.fone ?? '-', sortValue: (f) => f.fone ?? '' },
            { key: 'email', label: 'Email', sortable: true, filterable: true, render: (f) => f.email ?? '-', sortValue: (f) => f.email ?? '' },
            { key: 'contato', label: 'Contato', sortable: true, filterable: true, render: (f) => f.contato ?? '-', sortValue: (f) => f.contato ?? '' },
            {
              key: 'actions',
              label: 'Ações',
              sortable: false,
              filterable: false,
              render: (f) => (
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => handleEdit(f)}>Editar</Button>
                  <Button variant="danger" size="sm" onClick={() => setDeletingFornecedor(f)}>Excluir</Button>
                </div>
              ),
            },
          ]}
          searchPlaceholder="Buscar fornecedores..."
          emptyMessage="Nenhum fornecedor encontrado"
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingFornecedor(undefined); }}
        title={editingFornecedor ? 'Editar Fornecedor' : 'Novo Fornecedor'}
      >
        <SupplierForm
          fornecedor={editingFornecedor}
          onSubmit={handleSubmit}
          onCancel={() => { setIsModalOpen(false); setEditingFornecedor(undefined); }}
        />
      </Modal>

      <Modal isOpen={!!deletingFornecedor} onClose={() => setDeletingFornecedor(null)} title="Confirmar exclusão">
        <div className="space-y-4">
          <p>
            Tem certeza que deseja excluir o fornecedor <strong>{deletingFornecedor?.nome}</strong>?
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setDeletingFornecedor(null)}>Cancelar</Button>
            <Button variant="danger" onClick={handleDelete}>Excluir</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
