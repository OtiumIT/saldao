import { FormEvent, useState, useEffect } from 'react';
import { useProdutos } from '../hooks/useProdutos';
import { useMovimentacoes } from '../hooks/useMovimentacoes';
import * as coresService from '../../cores/services/cores.service';
import { useAuth } from '../../auth/hooks/useAuth';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import type { Cor } from '../../cores/types/cores.types';

export function AjusteEstoquePage() {
  const { token } = useAuth();
  const { produtos } = useProdutos(true);
  const { criarAjuste, error: errMov, loading } = useMovimentacoes();
  const [produtoId, setProdutoId] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [observacao, setObservacao] = useState('');
  const [corId, setCorId] = useState('');
  const [cores, setCores] = useState<Cor[]>([]);
  const [success, setSuccess] = useState(false);

  const produtoSelecionado = produtos.find((p) => p.id === produtoId);
  const exigeCor = Boolean(produtoSelecionado?.controlar_por_cor);

  useEffect(() => {
    if (!token) return;
    coresService.listCores(token).then(setCores).catch(() => setCores([]));
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    const q = parseInt(quantidade, 10);
    if (!produtoId || Number.isNaN(q) || q === 0) return;
    if (exigeCor && !corId) return;
    try {
      await criarAjuste(produtoId, q, observacao.trim() || undefined, exigeCor ? corId : undefined);
      setQuantidade('');
      setObservacao('');
      setCorId('');
      setSuccess(true);
    } catch {
      // error already in errMov
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Ajuste manual de estoque</h1>

      <form onSubmit={handleSubmit} className="max-w-md space-y-4 bg-white p-6 rounded-lg shadow">
        {errMov && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{errMov.message}</div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">Ajuste registrado.</div>
        )}
        <Select
          label="Produto *"
          options={[{ value: '', label: '— Selecione —' }, ...produtos.map((p) => ({ value: p.id, label: `${p.codigo} - ${p.descricao} (saldo: ${p.saldo})` }))]}
          value={produtoId}
          onChange={(e) => setProdutoId(e.target.value)}
          required
          disabled={loading}
        />
        {exigeCor && (
          <Select
            label="Cor *"
            options={[{ value: '', label: '— Selecione a cor —' }, ...cores.map((c) => ({ value: c.id, label: c.nome }))]}
            value={corId}
            onChange={(e) => setCorId(e.target.value)}
            required
            disabled={loading}
          />
        )}
        <Input
          label="Quantidade (+ entrada, - saída) *"
          type="number"
          step="1"
          value={quantidade}
          onChange={(e) => setQuantidade(e.target.value)}
          required
          disabled={loading}
          placeholder="Ex: 10 ou -5"
        />
        <Input
          label="Observação"
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          disabled={loading}
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Registrar ajuste'}
        </Button>
      </form>
    </div>
  );
}
