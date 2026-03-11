import { FormEvent, useState, useEffect } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { formatDateBR } from '../../../shared/lib/format-date';
import type { Cliente, CreateClienteRequest, TipoCliente } from '../types/clients.types';

/** Apenas dígitos */
function digitsOnly(s: string): string {
  return s.replace(/\D/g, '');
}

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
  const [cpf, setCpf] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [fone, setFone] = useState('');
  const [email, setEmail] = useState('');
  const [cep, setCep] = useState('');
  const [endereco_entrega, setEnderecoEntrega] = useState('');
  const [tipo, setTipo] = useState<TipoCliente>('externo');
  const [observacoes, setObservacoes] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (cliente) {
      setNome(cliente.nome);
      setCpf(cliente.cpf ?? '');
      setCnpj(cliente.cnpj ?? '');
      setFone(cliente.fone ?? '');
      setEmail(cliente.email ?? '');
      setEnderecoEntrega(cliente.endereco_entrega ?? '');
      setCep(cliente.cep ?? '');
      setTipo(cliente.tipo);
      setObservacoes(cliente.observacoes ?? '');
    } else {
      setNome('');
      setCpf('');
      setCnpj('');
      setFone('');
      setEmail('');
      setCep('');
      setEnderecoEntrega('');
      setTipo('externo');
      setObservacoes('');
    }
  }, [cliente]);

  // ViaCEP: ao digitar 8 dígitos no CEP, preenche logradouro, bairro, cidade, UF no endereço
  const cepDigits = digitsOnly(cep);
  useEffect(() => {
    if (cepDigits.length !== 8) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`);
        const data = await res.json();
        if (cancelled || data.erro) return;
        const partes = [data.logradouro, data.bairro, data.localidade, data.uf].filter(Boolean);
        if (partes.length) setEnderecoEntrega(partes.join(', '));
      } catch {
        // silencioso
      }
    })();
    return () => { cancelled = true; };
  }, [cepDigits]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!nome.trim()) {
      setError('Nome é obrigatório');
      return;
    }
    setSubmitting(true);
    try {
      const cpfNorm = digitsOnly(cpf).trim() || null;
      const cnpjNorm = digitsOnly(cnpj).trim() || null;
      const cepNorm = digitsOnly(cep).trim() || null;
      await onSubmit({
        nome: nome.trim(),
        cpf: cpfNorm ?? undefined,
        cnpj: cnpjNorm ?? undefined,
        fone: fone.trim() || undefined,
        email: email.trim() || undefined,
        cep: cepNorm ?? undefined,
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
      {cliente?.created_at && (
        <div className="rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
          <span className="font-medium text-gray-700">Data de cadastro:</span> {formatDateBR(cliente.created_at)}
        </div>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="CPF"
          value={cpf}
          onChange={(e) => setCpf(e.target.value.replace(/\D/g, '').slice(0, 11))}
          placeholder="Apenas números (11 dígitos)"
          disabled={isLoading}
        />
        <Input
          label="CNPJ"
          value={cnpj}
          onChange={(e) => setCnpj(e.target.value.replace(/\D/g, '').slice(0, 14))}
          placeholder="Apenas números (14 dígitos)"
          disabled={isLoading}
        />
      </div>
      <Input label="Telefone / WhatsApp" value={fone} onChange={(e) => setFone(e.target.value)} disabled={isLoading} />
      <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="CEP"
          value={cep}
          onChange={(e) => setCep(e.target.value.replace(/\D/g, '').slice(0, 8))}
          placeholder="00000000"
          disabled={isLoading}
        />
        <div className="sm:col-span-2">
          <Input
            label="Endereço de entrega"
            value={endereco_entrega}
            onChange={(e) => setEnderecoEntrega(e.target.value)}
            placeholder="Ou digite o endereço completo"
            disabled={isLoading}
          />
        </div>
      </div>
      <Input label="Observações" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} disabled={isLoading} />
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>Cancelar</Button>
        <Button type="submit" disabled={isLoading}>{isLoading ? 'Salvando...' : cliente ? 'Atualizar' : 'Criar'}</Button>
      </div>
    </form>
  );
}
