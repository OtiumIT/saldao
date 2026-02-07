import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import * as custosService from '../services/custos-operacionais.service';
import { Button } from '../../../components/ui/Button';
import type { CategoriaCustoOperacional, CustoOperacionalComCategoria } from '../types/custos.types';

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export function CustosMesPage() {
  const { token } = useAuth();
  const now = new Date();
  const [ano, setAno] = useState(now.getFullYear());
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [categorias, setCategorias] = useState<CategoriaCustoOperacional[]>([]);
  const [custos, setCustos] = useState<CustoOperacionalComCategoria[]>([]);
  const [totais, setTotais] = useState<{ total_planejado: number; total_realizado: number | null }>({ total_planejado: 0, total_realizado: null });
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  const loadCategorias = async () => {
    if (!token) return;
    const list = await custosService.listCategoriasAtivas(token);
    setCategorias(list);
  };

  const loadCustos = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await custosService.getCustosMes(ano, mes, token);
      setCustos(res.data);
      setTotais(res.totais);
      setValues((prev) => {
        const v = { ...prev };
        categorias.forEach((c) => {
          if (!(c.id in v)) v[c.id] = 0;
        });
        res.data.forEach((d) => {
          v[d.categoria_id] = d.valor_planejado;
        });
        return v;
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategorias();
  }, [token]);

  useEffect(() => {
    if (token) loadCustos();
  }, [token, ano, mes, categorias.length]);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const itens = categorias.map((cat) => ({
        categoria_id: cat.id,
        valor_planejado: values[cat.id] ?? 0,
      }));
      const res = await custosService.upsertCustosMes({ ano, mes, itens }, token);
      setCustos(res.data);
      setTotais(res.totais);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const setValue = (categoriaId: string, valor: number) => {
    setValues((prev) => ({ ...prev, [categoriaId]: valor }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Custos operacionais do mês</h1>
        <div className="flex items-center gap-2">
          <select
            value={mes}
            onChange={(e) => setMes(Number(e.target.value))}
            className="rounded border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-brand-gold"
          >
            {MESES.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
          <select
            value={ano}
            onChange={(e) => setAno(Number(e.target.value))}
            className="rounded border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-brand-gold"
          >
            {[ano - 1, ano, ano + 1].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && custos.length === 0 ? (
        <p className="text-gray-500">Carregando...</p>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Categoria</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Valor planejado (R$)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {categorias.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-4 py-6 text-center text-gray-500">
                        Cadastre categorias em &quot;Categorias de custo&quot; primeiro.
                      </td>
                    </tr>
                  ) : (
                    categorias.map((cat) => (
                      <tr key={cat.id}>
                        <td className="px-4 py-3 text-gray-900">{cat.nome}</td>
                        <td className="px-4 py-3 text-right">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={values[cat.id] ?? ''}
                            onChange={(e) => setValue(cat.id, parseFloat(e.target.value) || 0)}
                            className="w-full min-w-[100px] min-h-[44px] text-right rounded-lg border border-gray-300 px-3 py-2 touch-manipulation"
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-4">
            <div className="text-base sm:text-lg font-semibold text-gray-700">
              Total planejado: R$ {totais.total_planejado.toFixed(2)}
              {totais.total_realizado != null && (
                <span className="block sm:inline sm:ml-4 text-gray-500">Realizado: R$ {totais.total_realizado.toFixed(2)}</span>
              )}
            </div>
            <Button onClick={handleSave} disabled={saving || categorias.length === 0} className="w-full sm:w-auto">
              {saving ? 'Salvando...' : 'Salvar valores'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
