import { FormEvent, useState, useEffect } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import type { Funcionario, CreateFuncionarioRequest, UpdateFuncionarioRequest } from '../types/funcionarios.types';

interface FuncionarioFormProps {
  funcionario?: Funcionario;
  onSubmit: (data: CreateFuncionarioRequest | UpdateFuncionarioRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const DIAS = Array.from({ length: 28 }, (_, i) => i + 1);

export function FuncionarioForm({ funcionario, onSubmit, onCancel, loading = false }: FuncionarioFormProps) {
  const [nome, setNome] = useState('');
  const [salario, setSalario] = useState('');
  const [dia_pagamento, setDiaPagamento] = useState(5);
  const [ativo, setAtivo] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (funcionario) {
      setNome(funcionario.nome);
      setSalario(String(funcionario.salario));
      setDiaPagamento(funcionario.dia_pagamento);
      setAtivo(funcionario.ativo);
    } else {
      setNome('');
      setSalario('');
      setDiaPagamento(5);
      setAtivo(true);
    }
  }, [funcionario]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const salarioN = parseFloat(salario.replace(',', '.'));
    if (Number.isNaN(salarioN) || salarioN < 0) {
      setError('Salário inválido.');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        nome: nome.trim(),
        salario: salarioN,
        dia_pagamento,
        ativo,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">
          {error}
        </div>
      )}
      <Input
        label="Nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        required
        disabled={loading}
      />
      <Input
        label="Salário (R$)"
        type="number"
        step="0.01"
        min={0}
        value={salario}
        onChange={(e) => setSalario(e.target.value)}
        required
        disabled={loading}
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Dia do pagamento (1 a 28)</label>
        <select
          value={dia_pagamento}
          onChange={(e) => setDiaPagamento(Number(e.target.value))}
          className="w-full min-h-[44px] px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-gold"
          disabled={loading}
        >
          {DIAS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
      {funcionario && (
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={ativo}
            onChange={(e) => setAtivo(e.target.checked)}
            disabled={loading}
            className="rounded border-gray-300"
          />
          <span className="text-sm font-medium text-gray-700">Ativo</span>
        </label>
      )}
      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading || submitting}>
          {submitting ? 'Salvando...' : funcionario ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
}
