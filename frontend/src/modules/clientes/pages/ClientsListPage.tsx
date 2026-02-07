import { useState } from 'react';
import { useClients } from '../hooks/useClients';
import { ClientForm } from '../components/ClientForm';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { DataTable } from '../../../components/ui/DataTable';
import type { Cliente, CreateClienteRequest, UpdateClienteRequest } from '../types/clients.types';

export function ClientsListPage() {
  const { clientes, loading, error, createCliente, updateCliente, deleteCliente } = useClients();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | undefined>();
  const [deletingCliente, setDeletingCliente] = useState<Cliente | null>(null);

  const handleCreate = () => {
    setEditingCliente(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (c: Cliente) => {
    setEditingCliente(c);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: CreateClienteRequest | UpdateClienteRequest) => {
    if (editingCliente) {
      await updateCliente(editingCliente.id, data as UpdateClienteRequest);
    } else {
      await createCliente(data as CreateClienteRequest);
    }
    setIsModalOpen(false);
    setEditingCliente(undefined);
  };

  const handleDelete = async () => {
    if (deletingCliente) {
      await deleteCliente(deletingCliente.id);
      setDeletingCliente(null);
    }
  };

  if (loading && clientes.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Carregando clientes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Erro ao carregar clientes: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <Button onClick={handleCreate}>Novo Cliente</Button>
      </div>

      {clientes.length === 0 && !loading ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">Nenhum cliente cadastrado</p>
          <Button onClick={handleCreate}>Criar primeiro cliente</Button>
        </div>
      ) : (
        <DataTable
          data={clientes}
          columns={[
            { key: 'nome', label: 'Nome', sortable: true, filterable: true, sortValue: (c) => c.nome.toLowerCase() },
            { key: 'tipo', label: 'Tipo', sortable: true, filterable: true, render: (c) => c.tipo === 'loja' ? 'Loja' : 'Cliente', sortValue: (c) => c.tipo },
            { key: 'fone', label: 'Telefone', sortable: true, filterable: true, render: (c) => c.fone ?? '-', sortValue: (c) => c.fone ?? '' },
            { key: 'email', label: 'Email', sortable: true, filterable: true, render: (c) => c.email ?? '-', sortValue: (c) => c.email ?? '' },
            {
              key: 'actions',
              label: 'Ações',
              sortable: false,
              filterable: false,
              render: (c) => (
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => handleEdit(c)}>Editar</Button>
                  <Button variant="danger" size="sm" onClick={() => setDeletingCliente(c)}>Excluir</Button>
                </div>
              ),
            },
          ]}
          searchPlaceholder="Buscar clientes..."
          emptyMessage="Nenhum cliente encontrado"
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingCliente(undefined); }}
        title={editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
      >
        <ClientForm
          cliente={editingCliente}
          onSubmit={handleSubmit}
          onCancel={() => { setIsModalOpen(false); setEditingCliente(undefined); }}
        />
      </Modal>

      <Modal isOpen={!!deletingCliente} onClose={() => setDeletingCliente(null)} title="Confirmar exclusão">
        <div className="space-y-4">
          <p>
            Tem certeza que deseja excluir o cliente <strong>{deletingCliente?.nome}</strong>?
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setDeletingCliente(null)}>Cancelar</Button>
            <Button variant="danger" onClick={handleDelete}>Excluir</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
