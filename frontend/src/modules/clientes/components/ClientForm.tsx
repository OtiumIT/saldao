import { FormEvent, useState, useEffect } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import type { Cliente, CreateClienteRequest, TipoCliente } from '../types/clients.types';

interface ClientFormProps {
  cliente?: Cliente;
  onSubmit: (data: CreateClienteRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const TIPO_OPCOES: { value: TipoCliente; label: string }[] = [
  { value: 'externo', label: 'Cliente (consumidor final)' },
  { value: 'loja', label: 'Loja (unidade própria – transferência fábrica → loja)' },
];

export function ClientForm({ cliente, onSubmit, onCancel, loading = false }: ClientFormProps) {
  const [nome, setNome] = useState('');
  const [fone, setFone] = useState('');
  const [email, setEmail] = useState('');
  const [endereco_entrega, setEnderecoEntrega] = useState('');
  const [tipo, setTipo] = useState<TipoCliente>('externo');
  const [observacoes, setObservacoes] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (cliente) {
      setNome(cliente.nome);
      setFone(cliente.fone ?? '');
      setEmail(cliente.email ?? '');
      setEnderecoEntrega(cliente.endereco_entrega ?? '');
      setTipo(cliente.tipo);
      setObservacoes(cliente.observacoes ?? '');
    } else {
      setNome('');
      setFone('');
      setEmail('');
      setEnderecoEntrega('');
      setTipo('externo');
      setObservacoes('');
    }
  }, [cliente]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!nome.trim()) {
      setError('Nome é obrigatório');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        nome: nome.trim(),
        fone: fone.trim() || undefined,
        email: email.trim() || undefined,
        endereco_entrega: endereco_entrega.trim() || undefined,
        tipo,
        observacoes: observacoes.trim() || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = loading || submitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>
      )}
      <Input label="Nome *" value={nome} onChange={(e) => setNome(e.target.value)} required disabled={isLoading} />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value as TipoCliente)}
          disabled={isLoading}
          className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
        >
          {TIPO_OPCOES.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <Input label="Telefone" value={fone} onChange={(e) => setFone(e.target.value)} disabled={isLoading} />
      <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
      <Input label="Endereço de entrega" value={endereco_entrega} onChange={(e) => setEnderecoEntrega(e.target.value)} disabled={isLoading} />
      <Input label="Observações" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} disabled={isLoading} />
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>Cancelar</Button>
        <Button type="submit" disabled={isLoading}>{isLoading ? 'Salvando...' : cliente ? 'Atualizar' : 'Criar'}</Button>
      </div>
    </form>
  );
}
