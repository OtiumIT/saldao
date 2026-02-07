import { FormEvent, useState, useEffect } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { useUsers } from '../hooks/useUsers';
import { useAuth } from '../hooks/useAuth';
import type { User, CreateUserRequest, UpdateUserRequest, Company } from '../types/users.types';

interface UserManagementFormProps {
  user?: User;
  companies?: Company[];
  onSubmit: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const ROLE_OPTIONS = [
  { value: 'partner', label: 'Sócio/Usuário' },
  { value: 'admin', label: 'Administrador' },
  { value: 'viewer', label: 'Visualizador' },
];

export function UserManagementForm({ user: editingUser, companies = [], onSubmit, onCancel, loading = false }: UserManagementFormProps) {
  const { user: currentUser } = useAuth();
  const { createUser, updateUser } = useUsers();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('partner');
  const [canCreateUsers, setCanCreateUsers] = useState(false);
  const [companyId, setCompanyId] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isEditMode = !!editingUser;
  const isSuperAdmin = currentUser?.is_super_admin;

  useEffect(() => {
    if (editingUser) {
      setName(editingUser.name);
      setEmail(editingUser.email);
      setRole(editingUser.role);
      setCanCreateUsers(editingUser.can_create_users);
      setCompanyId(editingUser.company_id || '');
      setPassword('');
    } else {
      setName('');
      setEmail('');
      setPassword('');
      setRole('partner');
      setCanCreateUsers(false);
      setCompanyId('');
    }
  }, [editingUser]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Nome é obrigatório');
      return;
    }
    if (!email.trim()) {
      setError('Email é obrigatório');
      return;
    }
    if (!isEditMode && (!password || password.length < 6)) {
      setError('Senha deve ter pelo menos 6 caracteres');
      return;
    }
    if (isEditMode && password && password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres');
      return;
    }
    if (isSuperAdmin && !isEditMode && !companyId) {
      setError('Selecione uma empresa');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditMode && editingUser) {
        const updateData: UpdateUserRequest = {
          name: name.trim(),
          email: email.trim(),
          role,
          can_create_users: canCreateUsers,
          ...(isSuperAdmin && companyId ? { company_id: companyId } : {}),
        };
        await updateUser(editingUser.id, updateData);
      } else {
        const createData: CreateUserRequest = {
          name: name.trim(),
          email: email.trim(),
          password,
          role,
          can_create_users: canCreateUsers,
          ...(isSuperAdmin && companyId ? { company_id: companyId } : {}),
        };
        await createUser(createData);
      }
      onSubmit();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar usuário');
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = loading || submitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {!isEditMode && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded text-sm">
          <p className="font-semibold">Nome</p>
          <p className="mt-1">{currentUser?.name || ''}</p>
        </div>
      )}

      <Input label="Nome *" value={name} onChange={(e) => setName(e.target.value)} required disabled={isLoading} />
      <Input label="Email *" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
      <Input
        label={isEditMode ? 'Senha (deixe em branco para manter)' : 'Senha *'}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required={!isEditMode}
        disabled={isLoading}
        minLength={6}
        placeholder={isEditMode ? '••••••••' : ''}
      />

      <Select label="Função" value={role} onChange={(e) => setRole(e.target.value)} options={ROLE_OPTIONS} disabled={isLoading} />

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="canCreateUsers"
          checked={canCreateUsers}
          onChange={(e) => setCanCreateUsers(e.target.checked)}
          disabled={isLoading}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="canCreateUsers" className="text-sm font-medium text-gray-700">
          Pode criar outros usuários
        </label>
      </div>

      {isSuperAdmin && companies.length > 0 && (
        <Select
          label="Empresa *"
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          options={[
            { value: '', label: 'Selecione uma empresa' },
            ...companies.map(c => ({ value: c.id, label: c.name })),
          ]}
          disabled={isLoading}
          required={!isEditMode}
        />
      )}

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>Cancelar</Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : isEditMode ? 'Atualizar' : 'Criar Usuário'}
        </Button>
      </div>
    </form>
  );
}
