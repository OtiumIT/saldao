import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import * as financeiroService from '../services/financeiro.service';
import type { ResumoFinanceiro } from '../types/financeiro.types';

export function ResumoFinanceiroPage() {
  const { token } = useAuth();
  const [resumo, setResumo] = useState<ResumoFinanceiro | null>(null);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  useEffect(() => {
    const hoje = new Date();
    const primeiro = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    setDataInicio(primeiro.toISOString().slice(0, 10));
    setDataFim(hoje.toISOString().slice(0, 10));
  }, []);

  useEffect(() => {
    if (!token || !dataInicio || !dataFim) return;
    financeiroService.getResumo(token, dataInicio, dataFim).then(setResumo);
  }, [token, dataInicio, dataFim]);

  if (!resumo) {
    return <p className="text-gray-500">Carregando resumo...</p>;
  }

  const fluxo = resumo.total_recebido - resumo.total_pago;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Resumo financeiro</h1>
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data início</label>
          <input type="date" className="px-3 py-2 border border-gray-300 rounded-lg" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data fim</label>
          <input type="date" className="px-3 py-2 border border-gray-300 rounded-lg" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Pendente a pagar</p>
          <p className="text-xl font-bold text-red-600">R$ {resumo.pendente_pagar.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Pendente a receber</p>
          <p className="text-xl font-bold text-green-600">R$ {resumo.pendente_receber.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">No período: Pago</p>
          <p className="text-xl font-bold">R$ {resumo.total_pago.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">No período: Recebido</p>
          <p className="text-xl font-bold">R$ {resumo.total_recebido.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow md:col-span-2">
          <p className="text-sm text-gray-500">Fluxo do período (recebido − pago)</p>
          <p className={`text-xl font-bold ${fluxo >= 0 ? 'text-green-600' : 'text-red-600'}`}>R$ {fluxo.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
