import { FormEvent, useState, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import * as estoqueService from '../services/estoque.service';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import type { ProdutoComSaldo, CreateProdutoRequest, TipoProduto } from '../types/estoque.types';

interface FornecedorOption {
  id: string;
  nome: string;
}

interface CategoriaOption {
  id: string;
  nome: string;
}

interface ProductFormProps {
  produto?: ProdutoComSaldo;
  fornecedores: FornecedorOption[];
  categorias?: CategoriaOption[];
  /** Ao criar novo produto, pré-preenche fornecedores (ex.: ao cadastrar a partir do fornecedor) */
  initialFornecedoresIds?: string[];
  /** Ao criar novo produto, pré-preenche tipo (ex.: insumos/revenda do fornecedor) */
  initialTipo?: TipoProduto;
  onSubmit: (data: CreateProdutoRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const TIPOS: { value: TipoProduto; label: string }[] = [
  { value: 'revenda', label: 'Revenda' },
  { value: 'insumos', label: 'Insumos' },
  { value: 'fabricado', label: 'Fabricado' },
];

export function ProductForm({ produto, fornecedores, categorias = [], initialFornecedoresIds, initialTipo, onSubmit, onCancel, loading = false }: ProductFormProps) {
  const { token } = useAuth();
  const [codigo, setCodigo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [unidade, setUnidade] = useState('UN');
  const [tipo, setTipo] = useState<TipoProduto>('revenda');
  const [preco_compra, setPrecoCompra] = useState('');
  const [preco_venda, setPrecoVenda] = useState('');
  const [estoque_minimo, setEstoqueMinimo] = useState('');
  const [estoque_maximo, setEstoqueMaximo] = useState('');
  const [prazo_medio_entrega_dias, setPrazoMedioEntregaDias] = useState('');
  const [fornecedoresIds, setFornecedoresIds] = useState<string[]>([]);
  const [categoria_id, setCategoriaId] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sugestaoEstoque, setSugestaoEstoque] = useState<estoqueService.SugestaoEstoque | null>(null);
  const [sugestaoLoading, setSugestaoLoading] = useState(false);
  // Dimensões para roteirização (montado / desmontado em caixas)
  const [montado_comprimento_m, setMontadoComprimentoM] = useState('');
  const [montado_largura_m, setMontadoLarguraM] = useState('');
  const [montado_altura_m, setMontadoAlturaM] = useState('');
  const [montado_peso_kg, setMontadoPesoKg] = useState('');
  const [desmontado_comprimento_m, setDesmontadoComprimentoM] = useState('');
  const [desmontado_largura_m, setDesmontadoLarguraM] = useState('');
  const [desmontado_altura_m, setDesmontadoAlturaM] = useState('');
  const [desmontado_peso_kg, setDesmontadoPesoKg] = useState('');

  const numOrNull = (s: string): number | null => (s.trim() === '' ? null : parseFloat(s) || null);

  useEffect(() => {
    if (produto) {
      setCodigo(produto.codigo);
      setDescricao(produto.descricao);
      setUnidade(produto.unidade);
      setTipo(produto.tipo);
      setPrecoCompra(String(produto.preco_compra));
      setPrecoVenda(String(produto.preco_venda));
      setEstoqueMinimo(String(produto.estoque_minimo));
      setEstoqueMaximo(produto.estoque_maximo != null ? String(produto.estoque_maximo) : '');
      setPrazoMedioEntregaDias(produto.prazo_medio_entrega_dias != null ? String(produto.prazo_medio_entrega_dias) : '');
      setFornecedoresIds(produto.fornecedores_ids?.length ? produto.fornecedores_ids : (produto.fornecedor_principal_id ? [produto.fornecedor_principal_id] : []));
      setCategoriaId(produto.categoria_id ?? '');
      setMontadoComprimentoM(produto.montado_comprimento_m != null ? String(produto.montado_comprimento_m) : '');
      setMontadoLarguraM(produto.montado_largura_m != null ? String(produto.montado_largura_m) : '');
      setMontadoAlturaM(produto.montado_altura_m != null ? String(produto.montado_altura_m) : '');
      setMontadoPesoKg(produto.montado_peso_kg != null ? String(produto.montado_peso_kg) : '');
      setDesmontadoComprimentoM(produto.desmontado_comprimento_m != null ? String(produto.desmontado_comprimento_m) : '');
      setDesmontadoLarguraM(produto.desmontado_largura_m != null ? String(produto.desmontado_largura_m) : '');
      setDesmontadoAlturaM(produto.desmontado_altura_m != null ? String(produto.desmontado_altura_m) : '');
      setDesmontadoPesoKg(produto.desmontado_peso_kg != null ? String(produto.desmontado_peso_kg) : '');
    } else {
      setCodigo('');
      setDescricao('');
      setUnidade('UN');
      setTipo(initialTipo ?? 'revenda');
      setPrecoCompra('');
      setPrecoVenda('');
      setEstoqueMinimo('');
      setEstoqueMaximo('');
      setPrazoMedioEntregaDias('');
      setFornecedoresIds(initialFornecedoresIds ?? []);
      setCategoriaId('');
      setMontadoComprimentoM('');
      setMontadoLarguraM('');
      setMontadoAlturaM('');
      setMontadoPesoKg('');
      setDesmontadoComprimentoM('');
      setDesmontadoLarguraM('');
      setDesmontadoAlturaM('');
      setDesmontadoPesoKg('');
    }
  }, [produto, initialFornecedoresIds, initialTipo]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!codigo.trim()) {
      setError('Código é obrigatório');
      return;
    }
    if (!descricao.trim()) {
      setError('Descrição é obrigatória');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        codigo: codigo.trim(),
        descricao: descricao.trim(),
        unidade: unidade.trim() || 'UN',
        tipo,
        preco_compra: parseFloat(preco_compra) || 0,
        preco_venda: parseFloat(preco_venda) || 0,
        estoque_minimo: parseFloat(estoque_minimo) || 0,
        estoque_maximo: estoque_maximo === '' ? null : parseFloat(estoque_maximo) || 0,
        prazo_medio_entrega_dias: prazo_medio_entrega_dias === '' ? null : (parseInt(prazo_medio_entrega_dias, 10) || null),
        fornecedores_ids: fornecedoresIds.length ? fornecedoresIds : null,
        categoria_id: categoria_id || null,
        montado_comprimento_m: numOrNull(montado_comprimento_m),
        montado_largura_m: numOrNull(montado_largura_m),
        montado_altura_m: numOrNull(montado_altura_m),
        montado_peso_kg: numOrNull(montado_peso_kg),
        desmontado_comprimento_m: numOrNull(desmontado_comprimento_m),
        desmontado_largura_m: numOrNull(desmontado_largura_m),
        desmontado_altura_m: numOrNull(desmontado_altura_m),
        desmontado_peso_kg: numOrNull(desmontado_peso_kg),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSugestaoEstoque = async () => {
    if (!produto?.id || !token) return;
    setSugestaoLoading(true);
    setSugestaoEstoque(null);
    try {
      const s = await estoqueService.getSugestaoEstoque(produto.id, token);
      setSugestaoEstoque(s);
    } catch {
      setSugestaoEstoque({ estoque_minimo_sugerido: 0, estoque_maximo_sugerido: null, consumo_medio_diario: 0, dias_historico: 0, mensagem: 'Erro ao carregar' });
    } finally {
      setSugestaoLoading(false);
    }
  };

  const aplicarSugestaoEstoque = () => {
    if (!sugestaoEstoque) return;
    setEstoqueMinimo(String(sugestaoEstoque.estoque_minimo_sugerido));
    if (sugestaoEstoque.estoque_maximo_sugerido != null) setEstoqueMaximo(String(sugestaoEstoque.estoque_maximo_sugerido));
  };

  const isLoading = loading || submitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Código *" value={codigo} onChange={(e) => setCodigo(e.target.value)} required disabled={isLoading} />
        <Input label="Descrição *" value={descricao} onChange={(e) => setDescricao(e.target.value)} required disabled={isLoading} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Unidade" value={unidade} onChange={(e) => setUnidade(e.target.value)} disabled={isLoading} />
        <Select
          label="Tipo"
          options={TIPOS}
          value={tipo}
          onChange={(e) => setTipo(e.target.value as TipoProduto)}
          disabled={isLoading}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Preço compra" type="number" step="0.01" value={preco_compra} onChange={(e) => setPrecoCompra(e.target.value)} disabled={isLoading} />
        <Input label="Preço venda" type="number" step="0.01" value={preco_venda} onChange={(e) => setPrecoVenda(e.target.value)} disabled={isLoading} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Estoque mínimo" type="number" step="0.001" value={estoque_minimo} onChange={(e) => setEstoqueMinimo(e.target.value)} disabled={isLoading} />
        <div>
          <Input label="Estoque máximo" type="number" step="0.001" value={estoque_maximo} onChange={(e) => setEstoqueMaximo(e.target.value)} disabled={isLoading} placeholder="Opcional" />
          <p className="text-xs text-gray-500 mt-1">Máximo evita comprar demais e ficar com estoque parado.</p>
        </div>
      </div>
      <div>
        <Input label="Prazo médio de entrega (dias)" type="number" min={1} step={1} value={prazo_medio_entrega_dias} onChange={(e) => setPrazoMedioEntregaDias(e.target.value)} disabled={isLoading} placeholder="Ex.: 5 ou 7 — quando sem estoque" />
        <p className="text-xs text-gray-500 mt-1">Sugestão ao vender item sem estoque (ex.: entrega em 7 dias).</p>
      </div>
      {produto && token && (
        <div className="border rounded p-3 bg-gray-50 space-y-2">
          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={handleSugestaoEstoque} disabled={sugestaoLoading}>
              {sugestaoLoading ? 'Carregando...' : 'Sugestão de estoque (IA)'}
            </Button>
            {sugestaoEstoque && (
              <Button type="button" size="sm" onClick={aplicarSugestaoEstoque}>
                Usar sugestão
              </Button>
            )}
          </div>
          {sugestaoEstoque?.mensagem && <p className="text-sm text-gray-600">{sugestaoEstoque.mensagem}</p>}
          {sugestaoEstoque && !sugestaoEstoque.mensagem && (
            <p className="text-sm text-gray-600">
              Mínimo sugerido: {sugestaoEstoque.estoque_minimo_sugerido}
              {sugestaoEstoque.estoque_maximo_sugerido != null && ` · Máximo sugerido: ${sugestaoEstoque.estoque_maximo_sugerido}`}
              {' · '}Consumo médio/dia: {sugestaoEstoque.consumo_medio_diario.toFixed(2)} ({sugestaoEstoque.dias_historico} dias)
            </p>
          )}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Fornecedores</label>
        <p className="text-xs text-gray-500 mb-2">Selecione um ou mais fornecedores para este produto.</p>
        <div className="flex flex-wrap gap-2 mb-2">
          {fornecedoresIds.map((fid) => {
            const f = fornecedores.find((x) => x.id === fid);
            return (
              <span
                key={fid}
                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-200 text-gray-800 text-sm"
              >
                {f?.nome ?? fid}
                <button
                  type="button"
                  onClick={() => setFornecedoresIds((prev) => prev.filter((id) => id !== fid))}
                  disabled={isLoading}
                  className="text-gray-500 hover:text-red-600 font-bold leading-none"
                  aria-label="Remover"
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
        <select
          value=""
          onChange={(e) => {
            const id = e.target.value;
            if (id && !fornecedoresIds.includes(id)) setFornecedoresIds((prev) => [...prev, id]);
            e.target.value = '';
          }}
          disabled={isLoading}
          className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-brand-gold"
        >
          <option value="">— Adicionar fornecedor —</option>
          {fornecedores
            .filter((f) => !fornecedoresIds.includes(f.id))
            .map((f) => (
              <option key={f.id} value={f.id}>
                {f.nome}
              </option>
            ))}
        </select>
      </div>
      {categorias.length > 0 && (
        <Select
          label="Categoria"
          options={[{ value: '', label: '— Nenhuma —' }, ...categorias.map((c) => ({ value: c.id, label: c.nome }))]}
          value={categoria_id}
          onChange={(e) => setCategoriaId(e.target.value)}
          disabled={isLoading}
        />
      )}
      <div className="border rounded p-4 bg-gray-50 space-y-4">
        <h3 className="font-medium text-gray-800">Dimensões para roteirização</h3>
        <p className="text-sm text-gray-600">Informe as dimensões montado e desmontado (em caixas) para cálculo de carga na entrega.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Montado</h4>
            <div className="grid grid-cols-2 gap-2">
              <Input label="Comprimento (m)" type="number" step="0.01" min="0" value={montado_comprimento_m} onChange={(e) => setMontadoComprimentoM(e.target.value)} disabled={isLoading} placeholder="—" />
              <Input label="Largura (m)" type="number" step="0.01" min="0" value={montado_largura_m} onChange={(e) => setMontadoLarguraM(e.target.value)} disabled={isLoading} placeholder="—" />
              <Input label="Altura (m)" type="number" step="0.01" min="0" value={montado_altura_m} onChange={(e) => setMontadoAlturaM(e.target.value)} disabled={isLoading} placeholder="—" />
              <Input label="Peso (kg)" type="number" step="0.01" min="0" value={montado_peso_kg} onChange={(e) => setMontadoPesoKg(e.target.value)} disabled={isLoading} placeholder="—" />
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Desmontado (em caixas)</h4>
            <div className="grid grid-cols-2 gap-2">
              <Input label="Comprimento (m)" type="number" step="0.01" min="0" value={desmontado_comprimento_m} onChange={(e) => setDesmontadoComprimentoM(e.target.value)} disabled={isLoading} placeholder="—" />
              <Input label="Largura (m)" type="number" step="0.01" min="0" value={desmontado_largura_m} onChange={(e) => setDesmontadoLarguraM(e.target.value)} disabled={isLoading} placeholder="—" />
              <Input label="Altura (m)" type="number" step="0.01" min="0" value={desmontado_altura_m} onChange={(e) => setDesmontadoAlturaM(e.target.value)} disabled={isLoading} placeholder="—" />
              <Input label="Peso (kg)" type="number" step="0.01" min="0" value={desmontado_peso_kg} onChange={(e) => setDesmontadoPesoKg(e.target.value)} disabled={isLoading} placeholder="—" />
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : produto ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
}
