import { useState } from 'react';
import { useClients } from '../hooks/useClients';
import { ClientForm } from '../components/ClientForm';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { DataTable } from '../../../components/ui/DataTable';
import { formatDateBR } from '../../../shared/lib/format-date';
import type { Cliente, ClienteCompleto, CreateClienteRequest, UpdateClienteRequest } from '../types/clients.types';

function formatCpfCnpj(c: Cliente): string {
  if (c.cnpj && c.cnpj.trim()) return c.cnpj;
  if (c.cpf && c.cpf.trim()) return c.cpf;
  return '-';
}

function getWhatsAppUrl(fone: string | null): string | null {
  if (!fone?.trim()) return null;
  const digits = fone.replace(/\D/g, '');
  if (digits.length < 10) return null;
  const num = digits.startsWith('55') ? digits : `55${digits}`;
  return `https://wa.me/${num}`;
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function ClientsListPage() {
  const { clientes, modoCompleto, loading, loadingCompleto, error, fetchClientes, fetchClientesCompleto, createCliente, updateCliente, deleteCliente } = useClients();
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
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {clientes.length} clientes
            {modoCompleto && ' (dados completos)'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={fetchClientesCompleto}
            disabled={loadingCompleto || modoCompleto}
            title="Carrega dados de última compra, total de compras e total gasto (mais lento)"
          >
            {loadingCompleto ? 'Carregando...' : modoCompleto ? 'Dados completos' : 'Carregar dados completos'}
          </Button>
          {modoCompleto && (
            <Button variant="secondary" onClick={fetchClientes} disabled={loading}>
              Voltar ao modo rápido
            </Button>
          )}
          <Button onClick={handleCreate}>
            Novo Cliente
          </Button>
        </div>
      </div>

      {clientes.length === 0 && !loading ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">Nenhum cliente cadastrado</p>
          <Button onClick={handleCreate}>
            Criar primeiro cliente
          </Button>
        </div>
      ) : (
        <DataTable
          data={clientes}
          columns={[
            { key: 'nome', label: 'Nome', sortable: true, filterable: true, sortValue: (c) => c.nome.toLowerCase() },
            {
              key: 'cpf_cnpj',
              label: 'CPF/CNPJ',
              sortable: true,
              filterable: true,
              render: (c) => formatCpfCnpj(c),
              sortValue: (c) => formatCpfCnpj(c).toLowerCase(),
              filterValue: (c) => formatCpfCnpj(c).toLowerCase(),
            },
            { key: 'tipo', label: 'Tipo', sortable: true, filterable: true, render: (c) => c.tipo === 'loja' ? 'Loja' : 'Cliente', sortValue: (c) => c.tipo },
            {
              key: 'fone',
              label: 'Telefone',
              sortable: true,
              filterable: true,
              render: (c) => {
                const fone = c.fone ?? '';
                const waUrl = getWhatsAppUrl(c.fone);
                return (
                  <div className="flex items-center gap-1.5">
                    <span>{fone || '-'}</span>
                    {waUrl && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors"
                        title="Abrir WhatsApp"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <WhatsAppIcon className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                );
              },
              sortValue: (c) => c.fone ?? '',
            },
            { key: 'email', label: 'Email', sortable: true, filterable: true, render: (c) => c.email ?? '-', sortValue: (c) => c.email ?? '' },
            {
              key: 'created_at',
              label: 'Data cadastro',
              sortable: true,
              filterable: true,
              filterType: 'date',
              render: (c) => formatDateBR(c.created_at),
              sortValue: (c) => c.created_at ?? '',
              filterValue: (c) => {
                const d = c.created_at;
                if (!d) return '';
                return d.slice(0, 10);
              },
            },
            ...(modoCompleto
              ? [
                  {
                    key: 'data_ultima_compra',
                    label: 'Última compra',
                    sortable: true,
                    filterable: true,
                    filterType: 'date' as const,
                    render: (c: Cliente | ClienteCompleto) => formatDateBR((c as ClienteCompleto).data_ultima_compra),
                    sortValue: (c: Cliente | ClienteCompleto) => (c as ClienteCompleto).data_ultima_compra ?? '',
                    filterValue: (c: Cliente | ClienteCompleto) => {
                      const d = (c as ClienteCompleto).data_ultima_compra;
                      return d ? d.slice(0, 10) : '';
                    },
                  },
                  {
                    key: 'total_compras',
                    label: 'Total compras',
                    sortable: true,
                    filterable: false,
                    render: (c: Cliente | ClienteCompleto) => (c as ClienteCompleto).total_compras ?? 0,
                    sortValue: (c: Cliente | ClienteCompleto) => (c as ClienteCompleto).total_compras ?? 0,
                  },
                  {
                    key: 'total_gasto',
                    label: 'Total gasto',
                    sortable: true,
                    filterable: false,
                    render: (c: Cliente | ClienteCompleto) => formatCurrency((c as ClienteCompleto).total_gasto ?? 0),
                    sortValue: (c: Cliente | ClienteCompleto) => (c as ClienteCompleto).total_gasto ?? 0,
                  },
                ]
              : []),
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
          initialSortColumn="created_at"
          initialSortDirection="desc"
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
