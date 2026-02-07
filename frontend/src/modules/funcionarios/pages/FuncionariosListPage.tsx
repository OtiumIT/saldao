import { useState } from 'react';
import { useFuncionarios } from '../hooks/useFuncionarios';
import { FuncionarioForm } from '../components/FuncionarioForm';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { DataTable } from '../../../components/ui/DataTable';
import type { Funcionario, CreateFuncionarioRequest, UpdateFuncionarioRequest } from '../types/funcionarios.types';
import { Link } from 'react-router-dom';

export function FuncionariosListPage() {
  const { funcionarios, loading, error, createFuncionario, updateFuncionario, deleteFuncionario } = useFuncionarios();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Funcionario | undefined>();
  const [deleting, setDeleting] = useState<Funcionario | null>(null);

  const handleCreate = () => {
    setEditing(undefined);
    setModalOpen(true);
  };

  const handleEdit = (f: Funcionario) => {
    setEditing(f);
    setModalOpen(true);
  };

  const handleSubmit = async (data: CreateFuncionarioRequest | UpdateFuncionarioRequest) => {
    if (editing) {
      await updateFuncionario(editing.id, data as UpdateFuncionarioRequest);
    } else {
      await createFuncionario(data as CreateFuncionarioRequest);
    }
    setModalOpen(false);
    setEditing(undefined);
  };

  const handleDelete = async () => {
    if (deleting) {
      await deleteFuncionario(deleting.id);
      setDeleting(null);
    }
  };

  if (loading && funcionarios.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Carregando funcionários...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Erro: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Funcionários</h1>
        <div className="flex gap-2">
          <Link to="/funcionarios/folha">
            <Button variant="secondary">Folha de pagamento</Button>
          </Link>
          <Button onClick={handleCreate}>Novo funcionário</Button>
        </div>
      </div>
      <p className="text-gray-600 text-sm">
        Cadastre nome, salário e dia de pagamento. O total da folha é lançado automaticamente nos custos operacionais.
      </p>

      {funcionarios.length === 0 && !loading ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">Nenhum funcionário cadastrado</p>
          <Button onClick={handleCreate}>Cadastrar primeiro funcionário</Button>
        </div>
      ) : (
        <DataTable
          data={funcionarios}
          columns={[
            { key: 'nome', label: 'Nome', sortable: true, sortValue: (f: Funcionario) => f.nome.toLowerCase() },
            {
              key: 'salario',
              label: 'Salário',
              sortable: true,
              render: (f: Funcionario) => `R$ ${Number(f.salario).toFixed(2)}`,
              sortValue: (f: Funcionario) => f.salario,
            },
            { key: 'dia_pagamento', label: 'Dia pagamento', sortable: true, render: (f: Funcionario) => f.dia_pagamento, sortValue: (f: Funcionario) => f.dia_pagamento },
            {
              key: 'ativo',
              label: 'Status',
              sortable: true,
              render: (f: Funcionario) => (f.ativo ? <span className="text-green-600">Ativo</span> : <span className="text-gray-500">Inativo</span>),
              sortValue: (f: Funcionario) => (f.ativo ? 1 : 0),
            },
            {
              key: 'actions',
              label: 'Ações',
              render: (f: Funcionario) => (
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => handleEdit(f)}>
                    Editar
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => setDeleting(f)}>
                    Excluir
                  </Button>
                </div>
              ),
            },
          ]}
          searchPlaceholder="Buscar funcionário..."
          emptyMessage="Nenhum funcionário"
        />
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar funcionário' : 'Novo funcionário'}>
        <FuncionarioForm
          funcionario={editing}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      <Modal isOpen={!!deleting} onClose={() => setDeleting(null)} title="Confirmar exclusão">
        {deleting && (
          <div className="space-y-4">
            <p>
              Excluir o funcionário <strong>{deleting.nome}</strong>? Os pagamentos já lançados não são removidos.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setDeleting(null)}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Excluir
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
