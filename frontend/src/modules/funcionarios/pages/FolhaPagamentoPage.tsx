import { useState, useEffect } from 'react';
import { useFolhaMes } from '../hooks/useFuncionarios';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import type { PagamentoComFuncionario } from '../types/funcionarios.types';
import { Link } from 'react-router-dom';

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export function FolhaPagamentoPage() {
  const now = new Date();
  const [ano, setAno] = useState(now.getFullYear());
  const [mes, setMes] = useState(now.getMonth() + 1);
  const { folha, loading, error, fetchFolha, saveFolha } = useFolhaMes(ano, mes);
  const [values, setValues] = useState<Record<string, { valor_pago: string; observacao: string }>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (folha) {
      setValues((prev) => {
        const next = { ...prev };
        folha.pagamentos.forEach((p) => {
          const key = p.funcionario_id;
          if (!(key in next)) {
            next[key] = { valor_pago: String(p.valor_pago), observacao: p.observacao ?? '' };
          }
        });
        return next;
      });
    }
  }, [folha]);

  const getValue = (funcionarioId: string) => values[funcionarioId] ?? { valor_pago: '', observacao: '' };

  const setValue = (funcionarioId: string, field: 'valor_pago' | 'observacao', value: string) => {
    setValues((prev) => ({
      ...prev,
      [funcionarioId]: { ...getValue(funcionarioId), [field]: value },
    }));
  };

  const handleSave = async () => {
    if (!folha) return;
    setSaveError('');
    setSaveSuccess(false);
    const itens: Array<{ funcionario_id: string; valor_pago: number; observacao: string | null }> = [];
    for (const p of folha.pagamentos) {
      const v = getValue(p.funcionario_id);
      const valorPago = parseFloat(v.valor_pago.replace(',', '.'));
      if (Number.isNaN(valorPago) || valorPago < 0) {
        setSaveError(`Valor inválido para ${p.funcionario_nome}.`);
        return;
      }
      const obs = v.observacao.trim() || null;
      if (valorPago !== p.funcionario_salario && !obs) {
        setSaveError(`Quando o valor for diferente do salário de ${p.funcionario_nome}, preencha a observação (ex.: faltas, horas extras).`);
        return;
      }
      itens.push({ funcionario_id: p.funcionario_id, valor_pago: valorPago, observacao: obs });
    }
    setSaving(true);
    try {
      await saveFolha({ ano, mes, itens });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Folha de pagamento</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Ajuste o valor pago por funcionário (padrão: salário). Se alterar, informe a observação (faltas, horas extras, etc.). O total é lançado automaticamente nos custos do mês.
          </p>
        </div>
        <Link to="/funcionarios">
          <Button variant="secondary">Cadastro de funcionários</Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mês</label>
          <select
            value={mes}
            onChange={(e) => setMes(Number(e.target.value))}
            className="rounded border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-brand-gold"
          >
            {MESES.map((m, i) => (
              <option key={i} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
          <select
            value={ano}
            onChange={(e) => setAno(Number(e.target.value))}
            className="rounded border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-brand-gold"
          >
            {[ano - 1, ano, ano + 1].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {saveError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
          {saveError}
        </div>
      )}
      {saveSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded text-sm">
          Folha salva. O total foi lançado nos custos operacionais do mês.
        </div>
      )}

      {loading && !folha ? (
        <p className="text-gray-500">Carregando...</p>
      ) : folha && folha.pagamentos.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
          Nenhum funcionário ativo. Cadastre funcionários para lançar a folha.
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Funcionário</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salário base</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor pago (R$)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Observação (obrigatório se valor ≠ salário)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {folha?.pagamentos.map((p: PagamentoComFuncionario) => {
                    const v = getValue(p.funcionario_id);
                    const valorPagoNum = parseFloat(v.valor_pago.replace(',', '.'));
                    const diferente = !Number.isNaN(valorPagoNum) && valorPagoNum !== p.funcionario_salario;
                    return (
                      <tr key={p.funcionario_id} className={diferente ? 'bg-amber-50/50' : ''}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.funcionario_nome}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">R$ {Number(p.funcionario_salario).toFixed(2)}</td>
                        <td className="px-4 py-2">
                          <Input
                            type="number"
                            step="0.01"
                            min={0}
                            value={v.valor_pago}
                            onChange={(e) => setValue(p.funcionario_id, 'valor_pago', e.target.value)}
                            className="max-w-[140px] min-h-[40px] py-2"
                            aria-label={`Valor pago ${p.funcionario_nome}`}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={v.observacao}
                            onChange={(e) => setValue(p.funcionario_id, 'observacao', e.target.value)}
                            placeholder={diferente ? 'Obrigatório: ex. faltas, horas extras' : 'Ex.: faltas, horas extras'}
                            className={`w-full min-h-[40px] px-3 py-2 border rounded-lg text-sm ${diferente ? 'border-amber-400 bg-amber-50' : 'border-gray-300'}`}
                            aria-label={`Observação ${p.funcionario_nome}`}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {folha && folha.pagamentos.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-lg font-semibold text-gray-900">
                Total do mês: R$ {folha.pagamentos.reduce((s, p) => { const v = getValue(p.funcionario_id).valor_pago; const n = parseFloat(v.replace(',', '.')); return s + (Number.isNaN(n) ? p.valor_pago : n); }, 0).toFixed(2)}
              </p>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar folha e lançar nos custos'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
