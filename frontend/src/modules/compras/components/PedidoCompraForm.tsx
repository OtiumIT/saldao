import { FormEvent, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import * as comprasService from '../services/compras.service';
import * as estoqueService from '../../estoque/services/estoque.service';
import { useFornecedores } from '../../fornecedores/hooks/useFornecedores';
import { useProdutos } from '../../estoque/hooks/useProdutos';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import type { CreatePedidoCompraRequest } from '../types/compras.types';
import type { Produto } from '../../estoque/types/estoque.types';

interface PedidoCompraFormProps {
  pedidoId: string | null;
  initialItens?: Array<{ produto_id: string; quantidade: number; preco_unitario: number }>;
  initialFornecedorId?: string;
  onSaved: () => void;
  onCancel: () => void;
  createPedido: (data: CreatePedidoCompraRequest) => Promise<unknown>;
  updatePedido: (id: string, data: Partial<CreatePedidoCompraRequest> & { itens: Array<{ produto_id: string; quantidade: number; preco_unitario: number }> }) => Promise<unknown>;
}

interface ItemRow {
  produto_id: string;
  quantidade: number;
  preco_unitario: number;
}

export function PedidoCompraForm({ pedidoId, initialItens, initialFornecedorId, onSaved, onCancel, createPedido, updatePedido }: PedidoCompraFormProps) {
  const { token } = useAuth();
  const { fornecedores } = useFornecedores();
  const { produtos } = useProdutos(true);
  const [fornecedor_id, setFornecedorId] = useState(initialFornecedorId ?? '');
  const [data_pedido, setDataPedido] = useState('');
  const [tipo, setTipo] = useState<'pedido' | 'recepcao'>('pedido');
  const [data_prevista_entrega, setDataPrevistaEntrega] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [itens, setItens] = useState<ItemRow[]>(
    initialItens?.length ? initialItens.map((i) => ({ produto_id: i.produto_id, quantidade: i.quantidade, preco_unitario: i.preco_unitario })) : [{ produto_id: '', quantidade: 0, preco_unitario: 0 }]
  );
  const [loading, setLoading] = useState(false);
  const [loadingProdutosFornecedor, setLoadingProdutosFornecedor] = useState(false);
  const [extractLoading, setExtractLoading] = useState(false);
  const [error, setError] = useState('');
  const [produtosDoFornecedor, setProdutosDoFornecedor] = useState<Produto[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const hoje = new Date().toISOString().slice(0, 10);
    setDataPedido(hoje);
  }, []);

  useEffect(() => {
    if (initialFornecedorId) setFornecedorId(initialFornecedorId);
    if (initialItens?.length) setItens(initialItens.map((i) => ({ produto_id: i.produto_id, quantidade: i.quantidade, preco_unitario: i.preco_unitario })));
  }, [initialFornecedorId, initialItens]);

  useEffect(() => {
    if (!pedidoId || !token) return;
    let cancelled = false;
    setLoading(true);
    comprasService.getPedidoCompra(pedidoId, token).then((ped) => {
      if (cancelled) return;
      setFornecedorId(ped.fornecedor_id);
      setDataPedido(ped.data_pedido?.slice(0, 10) ?? '');
      setTipo((ped as { tipo?: 'pedido' | 'recepcao' }).tipo ?? 'pedido');
      setDataPrevistaEntrega((ped as { data_prevista_entrega?: string | null }).data_prevista_entrega?.slice(0, 10) ?? '');
      setObservacoes(ped.observacoes ?? '');
      if (ped.itens?.length) {
        setItens(ped.itens.map((i) => ({ produto_id: i.produto_id, quantidade: i.quantidade, preco_unitario: i.preco_unitario })));
      }
      setLoading(false);
    }).catch(() => setLoading(false));
    return () => { cancelled = true; };
  }, [pedidoId, token]);

  // Ao limpar fornecedor (novo pedido), voltar a uma linha vazia
  useEffect(() => {
    if (!fornecedor_id && !pedidoId) {
      setProdutosDoFornecedor([]);
      setItens([{ produto_id: '', quantidade: 0, preco_unitario: 0 }]);
    }
  }, [fornecedor_id, pedidoId]);

  // Ao selecionar fornecedor (novo pedido), carregar produtos desse fornecedor e últimos preços
  useEffect(() => {
    if (!token || !fornecedor_id || pedidoId) return;
    let cancelled = false;
    setLoadingProdutosFornecedor(true);
    Promise.all([
      estoqueService.listProdutos(token, false, { fornecedor_id }),
      comprasService.getUltimosPrecos(fornecedor_id, token),
    ]).then(([prods, ultimosPrecos]) => {
      if (cancelled) return;
      const list = prods as Produto[];
      setProdutosDoFornecedor(list);
      setItens(
        list.map((p) => ({
          produto_id: p.id,
          quantidade: 0,
          preco_unitario: ultimosPrecos[p.id] ?? p.preco_compra ?? 0,
        }))
      );
      setLoadingProdutosFornecedor(false);
    }).catch(() => setLoadingProdutosFornecedor(false));
    return () => { cancelled = true; };
  }, [fornecedor_id, token, pedidoId]);

  const addItem = () => {
    setItens((prev) => [...prev, { produto_id: '', quantidade: 0, preco_unitario: 0 }]);
  };

  const removeItem = (index: number) => {
    setItens((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof ItemRow, value: string | number) => {
    setItens((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  const matchProduto = (codigo?: string, descricao?: string, precoFallback = 0): { id: string; preco: number } | null => {
    if (!produtos.length) return null;
    const cod = (codigo ?? '').trim();
    const desc = (descricao ?? '').trim().toLowerCase();
    const byCodigo = cod ? produtos.find((p) => p.codigo?.toLowerCase() === cod.toLowerCase()) : null;
    if (byCodigo) return { id: byCodigo.id, preco: byCodigo.preco_compra ?? precoFallback };
    const byDesc = desc ? produtos.find((p) => p.descricao?.toLowerCase().includes(desc) || desc.includes(p.descricao?.toLowerCase() ?? '')) : null;
    if (byDesc) return { id: byDesc.id, preco: byDesc.preco_compra ?? precoFallback };
    return null;
  };

  const processFile = useCallback(
    async (file: File) => {
      if (!token) return;
      setError('');
      setExtractLoading(true);
      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
          reader.readAsDataURL(file);
        });
        const extracted = await comprasService.extractCompraFromImage(base64, token);
        if (extracted.fornecedor_nome) {
          const f = fornecedores.find((x) => x.nome?.toLowerCase().includes(extracted.fornecedor_nome!.toLowerCase()));
          if (f) setFornecedorId(f.id);
        }
        if (extracted.data_pedido) setDataPedido(extracted.data_pedido.slice(0, 10));
        if (extracted.observacoes) setObservacoes(extracted.observacoes ?? '');
        if (extracted.itens?.length) {
          const rows: ItemRow[] = extracted.itens.map((item) => {
            const matched = matchProduto(item.codigo, item.descricao, item.preco_unitario);
            return {
              produto_id: matched?.id ?? '',
              quantidade: item.quantidade || 0,
              preco_unitario: matched ? matched.preco : item.preco_unitario || 0,
            };
          });
          setItens(rows);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao extrair dados da foto');
      } finally {
        setExtractLoading(false);
      }
    },
    [token, fornecedores, matchProduto]
  );

  const handlePreencherPorFoto = () => fileInputRef.current?.click();

  const onFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) await processFile(file);
  };

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith('image/')) processFile(file);
    },
    [processFile]
  );
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);
  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!fornecedor_id) {
      setError('Selecione o fornecedor');
      return;
    }
    const validItens = itens.filter((i) => i.produto_id && i.quantidade > 0);
    if (validItens.length === 0) {
      setError('Adicione pelo menos um item');
      return;
    }
    const data: CreatePedidoCompraRequest = {
      fornecedor_id,
      data_pedido: data_pedido || undefined,
      observacoes: observacoes.trim() || undefined,
      tipo,
      data_prevista_entrega: tipo === 'pedido' && data_prevista_entrega ? data_prevista_entrega : null,
      itens: validItens.map((i) => ({ produto_id: i.produto_id, quantidade: i.quantidade, preco_unitario: i.preco_unitario })),
    };
    setLoading(true);
    try {
      if (pedidoId) {
        await updatePedido(pedidoId, data);
      } else {
        await createPedido(data);
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  const produtoOptions = produtos.map((p) => ({ value: p.id, label: `${p.codigo} - ${p.descricao}` }));
  const produtoLabel = (produtoId: string): string => {
    const p = produtosDoFornecedor.find((x) => x.id === produtoId) ?? produtos.find((x) => x.id === produtoId);
    return p ? `${p.codigo} - ${p.descricao}` : produtoId;
  };
  const modoListaPorFornecedor = !pedidoId && fornecedor_id && produtosDoFornecedor.length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFileSelect} />
      {!pedidoId && (
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          onClick={() => !extractLoading && fileInputRef.current?.click()}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
            isDragOver ? 'border-brand-gold bg-amber-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
          } ${extractLoading ? 'pointer-events-none opacity-80' : 'cursor-pointer'}`}
        >
          {extractLoading ? (
            <p className="text-gray-600 font-medium">Analisando foto... Aguarde.</p>
          ) : (
            <>
              <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-2 text-sm font-medium text-gray-700">Enviar foto do pedido ou documento</p>
              <p className="mt-1 text-xs text-gray-500">Clique aqui ou arraste a imagem. A IA preenche o formulário.</p>
            </>
          )}
        </div>
      )}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}
      <Select
        label="Fornecedor *"
        options={[{ value: '', label: '— Selecione —' }, ...fornecedores.map((f) => ({ value: f.id, label: f.nome }))]}
        value={fornecedor_id}
        onChange={(e) => setFornecedorId(e.target.value)}
        required
        disabled={loading}
      />
      {fornecedor_id && loadingProdutosFornecedor && !pedidoId && (
        <p className="text-sm text-gray-600">Carregando produtos do fornecedor e últimos preços...</p>
      )}
      <div className="flex gap-4 border-b pb-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="radio" name="tipo" checked={tipo === 'pedido'} onChange={() => setTipo('pedido')} disabled={!!pedidoId} />
          Pedido com prazo de entrega
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="radio" name="tipo" checked={tipo === 'recepcao'} onChange={() => setTipo('recepcao')} disabled={!!pedidoId} />
          Recepção (já comprei, só lançar entrada)
        </label>
      </div>
      {tipo === 'recepcao' && !pedidoId && (
        <p className="text-sm text-amber-700">Ao salvar, a entrada em estoque será registrada automaticamente.</p>
      )}
      <Input label="Data do pedido" type="date" value={data_pedido} onChange={(e) => setDataPedido(e.target.value)} disabled={loading} />
      {tipo === 'pedido' && (
        <Input label="Data prevista de entrega" type="date" value={data_prevista_entrega} onChange={(e) => setDataPrevistaEntrega(e.target.value)} disabled={loading} />
      )}
      <Input label="Observações" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} disabled={loading} />

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">Itens</label>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={handlePreencherPorFoto} disabled={!token || extractLoading || loading}>
              {extractLoading ? 'Analisando...' : 'Preencher por foto'}
            </Button>
            {!modoListaPorFornecedor && (
              <Button type="button" variant="secondary" size="sm" onClick={addItem} disabled={loading}>+ Item</Button>
            )}
          </div>
        </div>
        {modoListaPorFornecedor && (
          <p className="text-sm text-gray-600 mb-1">Preencha a quantidade; o valor vem da última compra e pode ser editado.</p>
        )}
        {extractLoading && <p className="text-sm text-blue-600 mb-1">Revise os dados antes de salvar.</p>}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {itens.map((row, index) => (
            <div key={row.produto_id || index} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-5">
                {modoListaPorFornecedor && row.produto_id ? (
                  <span className="block text-sm py-2 text-gray-800">{produtoLabel(row.produto_id)}</span>
                ) : (
                  <Select
                    options={[{ value: '', label: '— Produto —' }, ...produtoOptions]}
                    value={row.produto_id}
                    onChange={(e) => updateItem(index, 'produto_id', e.target.value)}
                    disabled={loading}
                  />
                )}
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  step="0.001"
                  placeholder="Qtd"
                  value={row.quantidade || ''}
                  onChange={(e) => updateItem(index, 'quantidade', parseFloat(e.target.value) || 0)}
                  disabled={loading}
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Preço"
                  value={row.preco_unitario || ''}
                  onChange={(e) => updateItem(index, 'preco_unitario', parseFloat(e.target.value) || 0)}
                  disabled={loading}
                />
              </div>
              <div className="col-span-2 text-sm text-gray-500">
                R$ {((row.quantidade || 0) * (row.preco_unitario || 0)).toFixed(2)}
              </div>
              <div className="col-span-1">
                <Button type="button" variant="danger" size="sm" onClick={() => removeItem(index)} disabled={loading || itens.length <= 1}>×</Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>Cancelar</Button>
        <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : pedidoId ? 'Atualizar' : 'Criar'}</Button>
      </div>
    </form>
  );
}
