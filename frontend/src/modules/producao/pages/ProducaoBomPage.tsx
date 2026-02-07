import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useProdutos } from '../../estoque/hooks/useProdutos';
import * as producaoService from '../services/producao.service';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { DataTable } from '../../../components/ui/DataTable';
import type { BomComInsumo } from '../types/producao.types';

export function ProducaoBomPage() {
  const { token } = useAuth();
  const { produtos } = useProdutos(true);
  const fabricados = produtos.filter((p) => p.tipo === 'fabricado');
  const insumos = produtos.filter((p) => p.tipo === 'insumos');
  const [fabricadoId, setFabricadoId] = useState('');
  const [bom, setBom] = useState<BomComInsumo[]>([]);
  const [loading, setLoading] = useState(false);
  const [novoInsumoId, setNovoInsumoId] = useState('');
  const [novaQtd, setNovaQtd] = useState('');

  const loadBom = async () => {
    if (!fabricadoId || !token) return;
    setLoading(true);
    try {
      const list = await producaoService.listBom(fabricadoId, token);
      setBom(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBom();
  }, [fabricadoId, token]);

  const addItem = async () => {
    if (!fabricadoId || !novoInsumoId || !token) return;
    const q = parseFloat(novaQtd);
    if (isNaN(q) || q <= 0) return;
    try {
      await producaoService.saveBomItem(token, {
        produto_fabricado_id: fabricadoId,
        produto_insumo_id: novoInsumoId,
        quantidade_por_unidade: q,
      });
      setNovoInsumoId('');
      setNovaQtd('');
      await loadBom();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao adicionar');
    }
  };

  const removeItem = async (insumoId: string) => {
    if (!fabricadoId || !token) return;
    try {
      await producaoService.removeBomItem(token, fabricadoId, insumoId);
      await loadBom();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao remover');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">BOM (receita por fabricado)</h1>
      <p className="text-gray-600">Selecione o produto fabricado e defina os insumos necessários por unidade.</p>

      <div className="flex flex-wrap gap-4 items-end">
        <Select
          label="Produto fabricado"
          options={[{ value: '', label: '— Selecione —' }, ...fabricados.map((p) => ({ value: p.id, label: `${p.codigo} - ${p.descricao}` }))]}
          value={fabricadoId}
          onChange={(e) => setFabricadoId(e.target.value)}
        />
      </div>

      {fabricadoId && (
        <>
          <div className="bg-white p-4 rounded-lg shadow flex flex-wrap gap-4 items-end">
            <Select
              label="Insumo"
              options={[{ value: '', label: '— Insumo —' }, ...insumos.map((p) => ({ value: p.id, label: `${p.codigo} - ${p.descricao}` }))]}
              value={novoInsumoId}
              onChange={(e) => setNovoInsumoId(e.target.value)}
            />
            <Input label="Qtd por unidade" type="number" step="0.001" value={novaQtd} onChange={(e) => setNovaQtd(e.target.value)} placeholder="Ex: 2.5" />
            <Button onClick={addItem} disabled={!novoInsumoId || !novaQtd}>Adicionar</Button>
          </div>

          {loading ? (
            <p className="text-gray-500">Carregando...</p>
          ) : (
            <DataTable
              data={bom}
              columns={[
                { key: 'insumo_codigo', label: 'Código', render: (r: BomComInsumo) => r.insumo_codigo ?? '-', sortValue: (r) => r.insumo_codigo ?? '' },
                { key: 'insumo_descricao', label: 'Insumo', render: (r: BomComInsumo) => r.insumo_descricao ?? '-', sortValue: (r) => r.insumo_descricao ?? '' },
                { key: 'quantidade_por_unidade', label: 'Qtd por unidade', sortable: true, sortValue: (r) => r.quantidade_por_unidade },
                {
                  key: 'actions',
                  label: 'Ações',
                  render: (r: BomComInsumo) => (
                    <Button variant="danger" size="sm" onClick={() => removeItem(r.produto_insumo_id)}>Remover</Button>
                  ),
                },
              ]}
              emptyMessage="Nenhum insumo na receita. Adicione acima."
            />
          )}
        </>
      )}
    </div>
  );
}
