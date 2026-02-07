import { useState } from 'react';
import { useUsers } from '../hooks/useUsers';
import { UserManagementForm } from '../components/UserManagementForm';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { DataTable } from '../../../components/ui/DataTable';
import type { User, CreateUserRequest, UpdateUserRequest } from '../types/users.types';

const ROLES: Record<string, string> = {
  admin: 'Administrador',
  partner: 'Sócio/Usuário',
  viewer: 'Visualizador',
};

export function UsersListPage() {
  const { users, companies, loading, error, createUser, updateUser, deleteUser, fetchUsers } = useUsers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>();
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const handleCreate = () => {
    setEditingUser(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: CreateUserRequest | UpdateUserRequest) => {
    setFormLoading(true);
    try {
      if (editingUser) {
        await updateUser(editingUser.id, data as UpdateUserRequest);
      } else {
        await createUser(data as CreateUserRequest);
      }
      setIsModalOpen(false);
      setEditingUser(undefined);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deletingUser) {
      await deleteUser(deletingUser.id);
      setDeletingUser(null);
    }
  };

  const handleFormSuccess = async () => {
    setIsModalOpen(false);
    setEditingUser(undefined);
    await fetchUsers();
  };

  const getRoleName = (role: string): string => ROLES[role] || role;

  const getCompanyName = (companyId: string | null): string => {
    if (!companyId) return '-';
    const company = companies.find(c => c.id === companyId);
    return company?.name || '-';
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Carregando usuários...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Erro ao carregar usuários: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
        <Button onClick={handleCreate}>Novo Usuário</Button>
      </div>

      {users.length === 0 && !loading ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">Nenhum usuário cadastrado</p>
          <Button onClick={handleCreate}>Criar Primeiro Usuário</Button>
        </div>
      ) : (
        <DataTable
          data={users}
          columns={[
            { key: 'name', label: 'Nome', sortable: true, filterable: true, sortValue: (item) => item.name.toLowerCase() },
            { key: 'email', label: 'Email', sortable: true, filterable: true, sortValue: (item) => item.email.toLowerCase() },
            { key: 'role', label: 'Função', sortable: true, filterable: true, render: (item) => getRoleName(item.role), sortValue: (item) => item.role },
            { key: 'company', label: 'Empresa', sortable: true, filterable: true, render: (item) => getCompanyName(item.company_id), sortValue: (item) => getCompanyName(item.company_id).toLowerCase(), filterValue: (item) => getCompanyName(item.company_id).toLowerCase() },
            {
              key: 'can_create_users',
              label: 'Pode Criar Usuários',
              sortable: true,
              filterable: true,
              render: (item) => (
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.can_create_users ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  {item.can_create_users ? 'Sim' : 'Não'}
                </span>
              ),
              sortValue: (item) => item.can_create_users ? 1 : 0,
              filterValue: (item) => (item.can_create_users ? 'sim' : 'não'),
            },
            {
              key: 'actions',
              label: 'Ações',
              sortable: false,
              filterable: false,
              render: (user) => (
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => handleEdit(user)}>Editar</Button>
                  <Button variant="danger" size="sm" onClick={() => setDeletingUser(user)}>Excluir</Button>
                </div>
              ),
            },
          ]}
          searchPlaceholder="Buscar usuários..."
          emptyMessage="Nenhum usuário encontrado"
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingUser(undefined); }}
        title={editingUser ? 'Editar Usuário' : 'Novo Usuário'}
      >
        <UserManagementForm
          user={editingUser}
          companies={companies}
          onSubmit={handleFormSuccess}
          onCancel={() => { setIsModalOpen(false); setEditingUser(undefined); }}
          loading={formLoading}
        />
      </Modal>

      <Modal isOpen={!!deletingUser} onClose={() => setDeletingUser(null)} title="Confirmar Exclusão">
        <div className="space-y-4">
          <p>
            Tem certeza que deseja excluir o usuário <strong>{deletingUser?.name}</strong>?
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setDeletingUser(null)}>Cancelar</Button>
            <Button variant="danger" onClick={handleDelete}>Excluir</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
