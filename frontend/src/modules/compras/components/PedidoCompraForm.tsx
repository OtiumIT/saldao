import { FormEvent, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import * as comprasService from '../services/compras.service';
import * as estoqueService from '../../estoque/services/estoque.service';
import { useFornecedores } from '../../fornecedores/hooks/useFornecedores';
import { useProdutos } from '../../estoque/hooks/useProdutos';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Modal } from '../../../components/ui/Modal';
import type { CreatePedidoCompraRequest } from '../types/compras.types';
import type { Produto } from '../../estoque/types/estoque.types';
import type { PurchaseOrderExtraction } from '../services/compras.service';

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
  const [unresolvedItems, setUnresolvedItems] = useState<Array<{ index: number; descricao?: string; codigo?: string; quantidade: number; preco_unitario: number }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const supplierProductIds = useMemo(() => new Set(produtosDoFornecedor.map((p) => p.id)), [produtosDoFornecedor]);

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

  const applyExtraction = useCallback(
    (extracted: PurchaseOrderExtraction) => {
      if (extracted.fornecedor_nome) {
        const f = fornecedores.find((x) => x.nome?.toLowerCase().includes(extracted.fornecedor_nome!.toLowerCase()));
        if (f) setFornecedorId(f.id);
      }
      if (extracted.data_pedido) setDataPedido(extracted.data_pedido.slice(0, 10));
      if (extracted.observacoes) setObservacoes(extracted.observacoes ?? '');
      if (extracted.itens?.length) {
        const unresolved: Array<{ index: number; descricao?: string; codigo?: string; quantidade: number; preco_unitario: number }> = [];
        const rows: ItemRow[] = extracted.itens.map((item, idx) => {
          const matched = matchProduto(item.codigo, item.descricao, item.preco_unitario);
          if (!matched) {
            unresolved.push({
              index: idx,
              descricao: item.descricao,
              codigo: item.codigo,
              quantidade: item.quantidade || 0,
              preco_unitario: item.preco_unitario || 0,
            });
          }
          return {
            produto_id: matched?.id ?? '',
            quantidade: item.quantidade || 0,
            preco_unitario: matched ? matched.preco : item.preco_unitario || 0,
          };
        });
        setItens(rows);
        setUnresolvedItems(unresolved);
      }
    },
    [fornecedores, matchProduto]
  );

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
        applyExtraction(extracted);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao extrair dados da foto');
      } finally {
        setExtractLoading(false);
      }
    },
    [token, applyExtraction]
  );

  const processAudioFile = useCallback(
    async (file: File) => {
      if (!token) return;
      setError('');
      setExtractLoading(true);
      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Falha ao ler áudio'));
          reader.readAsDataURL(file);
        });
        const extracted = await comprasService.extractCompraFromAudio(base64, token);
        applyExtraction(extracted);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao extrair dados do áudio');
      } finally {
        setExtractLoading(false);
      }
    },
    [token, applyExtraction]
  );

  const handlePreencherPorFoto = () => fileInputRef.current?.click();
  const handleEnviarAudio = () => audioInputRef.current?.click();

  const onFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) await processFile(file);
  };

  const onAudioSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file && file.type.startsWith('audio/')) await processAudioFile(file);
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
      <input ref={audioInputRef} type="file" accept="audio/*" className="hidden" onChange={onAudioSelect} />
      {!pedidoId && (
        <div className="space-y-3">
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
              <p className="text-gray-600 font-medium">Analisando... Aguarde.</p>
            ) : (
              <>
                <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-2 text-sm font-medium text-gray-700">Enviar foto do pedido ou documento</p>
                <p className="mt-1 text-xs text-gray-500">Clique ou arraste a imagem. OpenAI preenche o formulário.</p>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">ou</span>
            <button
              type="button"
              onClick={handleEnviarAudio}
              disabled={extractLoading}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <svg className="h-5 w-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z" />
              </svg>
              Enviar áudio
            </button>
            <span className="text-xs text-gray-500">Grave no WhatsApp lendo os itens e quantidades; envie o áudio aqui.</span>
          </div>
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
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <label className="block text-sm font-medium text-gray-700">Itens</label>
          <div className="flex flex-wrap gap-2 items-center">
            <Button type="button" variant="secondary" size="sm" onClick={handlePreencherPorFoto} disabled={!token || extractLoading || loading}>
              {extractLoading ? 'Analisando...' : 'Preencher por foto'}
            </Button>
            {modoListaPorFornecedor ? (
              <>
                <Button type="button" variant="secondary" size="sm" onClick={addItem} disabled={loading}>
                  Pesquisar em todos
                </Button>
                <Link
                  to="/produtos"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-brand-gold hover:underline font-medium"
                >
                  Inserir novo produto
                </Link>
              </>
            ) : (
              <Button type="button" variant="secondary" size="sm" onClick={addItem} disabled={loading}>+ Item</Button>
            )}
          </div>
        </div>
        {modoListaPorFornecedor && (
          <p className="text-sm text-gray-600 mb-1">Lista do fornecedor. Use &quot;Pesquisar em todos&quot; para outro produto ou &quot;Inserir novo produto&quot; para cadastrar.</p>
        )}
        {extractLoading && <p className="text-sm text-blue-600 mb-1">Revise os dados antes de salvar.</p>}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {itens.map((row, index) => (
            <div key={`${row.produto_id}-${index}`} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-5">
                {modoListaPorFornecedor && row.produto_id && supplierProductIds.has(row.produto_id) ? (
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

      <Modal
        isOpen={unresolvedItems.length > 0}
        onClose={() => setUnresolvedItems([])}
        title="Produtos não identificados"
        size="2xl"
      >
        <p className="text-sm text-gray-600 mb-4">
          Não foi possível associar os itens abaixo a um produto. Selecione um produto existente ou cadastre um novo.
        </p>
        <div className="space-y-4">
          {unresolvedItems.map((item) => (
            <div key={item.index} className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800 break-words">
                  {item.descricao || item.codigo || 'Item sem descrição'}
                  {item.codigo && item.descricao ? ` (${item.codigo})` : ''}
                </p>
                <p className="text-xs text-gray-500">Qtd: {item.quantidade} · R$ {item.preco_unitario.toFixed(2)}/un</p>
              </div>
              <div className="min-w-[180px]">
                <Select
                  options={[{ value: '', label: '— Selecione um produto —' }, ...produtoOptions]}
                  value={itens[item.index]?.produto_id ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) return;
                    const p = produtos.find((x) => x.id === val);
                    updateItem(item.index, 'produto_id', val);
                    if (p) updateItem(item.index, 'preco_unitario', p.preco_compra ?? itens[item.index]?.preco_unitario ?? 0);
                    setUnresolvedItems((prev) => prev.filter((u) => u.index !== item.index));
                  }}
                  disabled={loading}
                />
              </div>
              <Link
                to="/produtos"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-brand-gold hover:underline whitespace-nowrap"
              >
                Cadastrar novo
              </Link>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <Button type="button" variant="secondary" onClick={() => setUnresolvedItems([])}>
            Fechar
          </Button>
        </div>
      </Modal>
    </form>
  );
}
