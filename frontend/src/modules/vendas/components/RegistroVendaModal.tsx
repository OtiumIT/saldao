import { FormEvent, useState, useRef } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useProdutos } from '../../estoque/hooks/useProdutos';
import { useClients } from '../../clientes/hooks/useClients';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import * as vendasService from '../services/vendas.service';
import type { CreatePedidoVendaRequest } from '../types/vendas.types';
import type { ProdutoComSaldo } from '../../estoque/types/estoque.types';

interface ItemRow {
  produto_id: string;
  quantidade: number;
  preco_unitario: number;
}

interface RegistroVendaModalProps {
  onSaved: (data: CreatePedidoVendaRequest) => Promise<void>;
  onCancel: () => void;
}

export function RegistroVendaModal({ onSaved, onCancel }: RegistroVendaModalProps) {
  const { token } = useAuth();
  const { produtos: produtosRaw } = useProdutos(true);
  const { clientes: clientesRaw } = useClients();
  const produtosAll = Array.isArray(produtosRaw) ? produtosRaw : [];
  /** Na venda só entram produtos de revenda ou fabricação; insumos não são vendidos */
  const produtos = produtosAll.filter((p) => p.tipo === 'revenda' || p.tipo === 'fabricado');
  const clientes = Array.isArray(clientesRaw) ? clientesRaw : [];
  const [cliente_id, setClienteId] = useState('');
  const [data_pedido, setDataPedido] = useState('');
  const [tipo_entrega, setTipoEntrega] = useState<'retirada' | 'entrega'>('retirada');
  const [endereco_entrega, setEnderecoEntrega] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [previsao_entrega_em_dias, setPrevisaoEntregaEmDias] = useState('');
  const [distancia_km, setDistanciaKm] = useState('');
  const [valor_frete_manual, setValorFreteManual] = useState('');
  const [itens, setItens] = useState<ItemRow[]>([{ produto_id: '', quantidade: 0, preco_unitario: 0 }]);
  const [loading, setLoading] = useState(false);
  const [extractLoading, setExtractLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addItem = () => setItens((prev) => [...prev, { produto_id: '', quantidade: 0, preco_unitario: 0 }]);
  const removeItem = (i: number) => setItens((prev) => prev.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof ItemRow, value: string | number) => {
    setItens((prev) => prev.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));
  };

  const getSaldo = (produtoId: string): number => {
    const p = produtos.find((x) => x.id === produtoId);
    return p && 'saldo' in p ? (p as ProdutoComSaldo).saldo : 0;
  };

  /** Tabela de frete por distância (km). Até 2 grátis; 2-5 R$20; 5-7 R$30; 7-10 R$40; 10-13 R$60; acima de 13 verificar na hora. */
  const calcularFretePorKm = (km: number): number | null => {
    if (km <= 0) return 0;
    if (km <= 2) return 0;
    if (km <= 5) return 20;
    if (km <= 7) return 30;
    if (km <= 10) return 40;
    if (km <= 13) return 60;
    return null;
  };

  const validItens = itens.filter((r) => r.produto_id && r.quantidade > 0);
  const subtotal = itens.reduce((s, r) => s + (r.quantidade || 0) * (r.preco_unitario || 0), 0);
  const kmNum = distancia_km.trim() ? parseFloat(distancia_km) : NaN;
  const freteTabela = !Number.isNaN(kmNum) && kmNum > 0 ? calcularFretePorKm(kmNum) : null;
  const acimaDe13 = !Number.isNaN(kmNum) && kmNum > 13;
  const freteManualNum = valor_frete_manual.trim() ? parseFloat(valor_frete_manual) : NaN;
  const valorFrete =
    tipo_entrega !== 'entrega'
      ? 0
      : acimaDe13
        ? (Number.isNaN(freteManualNum) ? 0 : Math.max(0, freteManualNum))
        : (freteTabela ?? 0);
  const totalGeral = subtotal + valorFrete;

  const itensSemEstoque = validItens.filter((r) => getSaldo(r.produto_id) < r.quantidade);
  const hasInsuficiente = itensSemEstoque.length > 0;
  const itensSemEstoqueNaoFabricados = itensSemEstoque.filter((r) => {
    const p = produtos.find((x) => x.id === r.produto_id);
    return p && p.tipo !== 'fabricado';
  });
  const soFabricadosSemEstoque = hasInsuficiente && itensSemEstoqueNaoFabricados.length === 0;
  const sugestaoPrazo = (() => {
    if (!soFabricadosSemEstoque) return null;
    const dias = itensSemEstoque
      .map((r) => {
        const p = produtos.find((x) => x.id === r.produto_id);
        return p?.prazo_medio_entrega_dias;
      })
      .filter((d): d is number => d != null && d >= 1);
    return dias.length ? Math.max(...dias) : null;
  })();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (validItens.length === 0) {
      setError('Adicione pelo menos um item');
      return;
    }
    if (itensSemEstoqueNaoFabricados.length > 0) {
      const codigos = itensSemEstoqueNaoFabricados
        .map((r) => produtos.find((x) => x.id === r.produto_id)?.codigo ?? r.produto_id)
        .join(', ');
      setError(`Apenas produtos fabricados podem ser vendidos sem estoque. Ajuste as quantidades ou remova: ${codigos}`);
      return;
    }
    if (soFabricadosSemEstoque) {
      const dias = previsao_entrega_em_dias.trim() ? parseInt(previsao_entrega_em_dias, 10) : 0;
      if (!dias || dias < 1) {
        setError('Há itens fabricados sem estoque. Informe a previsão de entrega em dias (ex.: 7) para registrar a venda.');
        return;
      }
    }
    if (tipo_entrega === 'entrega' && !endereco_entrega.trim()) {
      setError('Informe o endereço de entrega');
      return;
    }
    if (tipo_entrega === 'entrega') {
      if (Number.isNaN(kmNum) || kmNum < 0) {
        setError('Informe a distância em km para calcular o frete');
        return;
      }
      if (kmNum > 13 && (Number.isNaN(freteManualNum) || freteManualNum < 0)) {
        setError('Acima de 13 km informe o valor do frete (verificar na hora)');
        return;
      }
    }
    setLoading(true);
    try {
      const previsaoNum = previsao_entrega_em_dias.trim() ? parseInt(previsao_entrega_em_dias, 10) : null;
      await onSaved({
        cliente_id: cliente_id || null,
        data_pedido: data_pedido?.trim() || undefined,
        tipo_entrega,
        endereco_entrega: tipo_entrega === 'entrega' ? endereco_entrega.trim() : null,
        observacoes: observacoes.trim() || null,
        previsao_entrega_em_dias: previsaoNum && previsaoNum >= 1 ? previsaoNum : null,
        distancia_km: tipo_entrega === 'entrega' && !Number.isNaN(kmNum) ? kmNum : null,
        valor_frete: tipo_entrega === 'entrega' ? valorFrete : null,
        itens: validItens.map((r) => ({ produto_id: r.produto_id, quantidade: r.quantidade, preco_unitario: r.preco_unitario })),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  const matchProduto = (codigo?: string, descricao?: string, precoFallback = 0): { id: string; preco: number } | null => {
    if (!produtos.length) return null;
    const cod = (codigo ?? '').trim();
    const desc = (descricao ?? '').trim().toLowerCase();
    const byCodigo = cod ? produtos.find((p) => p.codigo?.toLowerCase() === cod.toLowerCase()) : null;
    if (byCodigo) return { id: byCodigo.id, preco: byCodigo.preco_venda ?? precoFallback };
    const byDesc = desc ? produtos.find((p) => p.descricao?.toLowerCase().includes(desc) || desc.includes(p.descricao?.toLowerCase() ?? '')) : null;
    if (byDesc) return { id: byDesc.id, preco: byDesc.preco_venda ?? precoFallback };
    return null;
  };

  const handlePreencherPorFoto = () => {
    fileInputRef.current?.click();
  };

  const onFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !token) return;
    setError('');
    setExtractLoading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result);
        };
        reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
        reader.readAsDataURL(file);
      });
      const extracted = await vendasService.extractVendaFromImage(base64, token);
      if (extracted.cliente_nome) {
        const c = clientes.find((x) => x.nome?.toLowerCase().includes(extracted.cliente_nome!.toLowerCase()));
        if (c) setClienteId(c.id);
      }
      if (extracted.data_pedido) setDataPedido(extracted.data_pedido.slice(0, 10));
      if (extracted.observacoes) setObservacoes(extracted.observacoes);
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
  };

  const produtoOptions = produtos.map((p) => {
    const saldo = (p as ProdutoComSaldo).saldo ?? 0;
    const semEstoque = saldo <= 0;
    const codigo = p.codigo ?? '';
    const descricao = p.descricao ?? '';
    const preco = p.preco_venda != null ? Number(p.preco_venda) : 0;
    const label = semEstoque
      ? `${codigo} - ${descricao} — Sem estoque`
      : `${codigo} - ${descricao} — Saldo: ${saldo} (R$ ${preco.toFixed(2)})`;
    return { value: p.id, label, disabled: semEstoque };
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFileSelect} />
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

      {/* Itens primeiro (P3: ordem dos campos) */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">Itens da venda</label>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={handlePreencherPorFoto} disabled={!token || extractLoading}>
              {extractLoading ? 'Analisando...' : 'Preencher por foto'}
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={addItem}>+ Item</Button>
          </div>
        </div>
        {extractLoading && <p className="text-sm text-blue-600 mb-1">Revise os dados abaixo antes de salvar.</p>}
        <div className="space-y-2 max-h-52 overflow-y-auto">
          {itens.map((row, i) => {
            const saldo = row.produto_id ? getSaldo(row.produto_id) : 0;
            const insuficiente = row.produto_id && row.quantidade > 0 && saldo < row.quantidade;
            return (
              <div key={i} className="grid grid-cols-12 gap-2 items-end border-b pb-2 border-gray-100">
                <div className="col-span-5">
                  <Select
                    options={[{ value: '', label: '— Produto —' }, ...produtoOptions]}
                    value={produtoOptions.some((o) => o.value === row.produto_id) ? row.produto_id : ''}
                    onChange={async (e) => {
                      const prodId = e.target.value;
                      updateItem(i, 'produto_id', prodId);
                      const p = produtos.find((x) => x.id === prodId);
                      if (p) updateItem(i, 'preco_unitario', p.preco_venda ?? 0);
                      if (token && prodId) {
                        try {
                          const sug = await vendasService.getSugestaoPreco(prodId, token);
                          if (sug.preco_sugerido > 0) updateItem(i, 'preco_unitario', sug.preco_sugerido);
                        } catch {
                          // keep current price
                        }
                      }
                    }}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    step="0.001"
                    placeholder="Qtd"
                    value={row.quantidade || ''}
                    onChange={(e) => updateItem(i, 'quantidade', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-2">
                  <Input type="number" step="0.01" placeholder="Preço" value={row.preco_unitario || ''} onChange={(e) => updateItem(i, 'preco_unitario', parseFloat(e.target.value) || 0)} />
                </div>
                <div className="col-span-2 text-sm">
                  {row.produto_id ? (
                    <>
                      <span className="text-gray-500">Saldo: {saldo}</span>
                      {insuficiente && <span className="block text-red-600 font-medium">Saldo insuficiente</span>}
                    </>
                  ) : null}
                </div>
                <div className="col-span-1 text-sm">R$ {((row.quantidade || 0) * (row.preco_unitario || 0)).toFixed(2)}</div>
                <div className="col-span-1">
                  <Button type="button" variant="danger" size="sm" onClick={() => removeItem(i)} disabled={itens.length <= 1}>×</Button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="text-sm mt-2 space-y-0.5">
          <p className="text-gray-600">Subtotal: R$ {subtotal.toFixed(2)}</p>
          {tipo_entrega === 'entrega' && valorFrete > 0 && <p className="text-gray-600">Frete: R$ {valorFrete.toFixed(2)}</p>}
          <p className="font-semibold text-gray-900">Total: R$ {totalGeral.toFixed(2)}</p>
        </div>
        {itensSemEstoqueNaoFabricados.length > 0 && (
          <p className="text-sm text-red-600 font-medium mt-1">Apenas produtos fabricados podem ser vendidos sem estoque. Ajuste as quantidades dos itens de revenda acima.</p>
        )}
        {soFabricadosSemEstoque && (
          <div className="mt-2 p-2 rounded bg-amber-50 border border-amber-200">
            <p className="text-sm text-amber-800 font-medium">Itens fabricados sem estoque. Informe a previsão de entrega em dias para registrar a venda (ex.: 7 dias).</p>
            <div className="mt-2 flex items-center gap-2">
              <Input
                type="number"
                min={1}
                placeholder={sugestaoPrazo ? `Sugestão: ${sugestaoPrazo}` : 'Ex.: 7'}
                value={previsao_entrega_em_dias}
                onChange={(e) => setPrevisaoEntregaEmDias(e.target.value)}
                className="w-24"
              />
              <span className="text-sm text-gray-600">dias</span>
              {sugestaoPrazo && !previsao_entrega_em_dias && (
                <Button type="button" variant="secondary" size="sm" onClick={() => setPrevisaoEntregaEmDias(String(sugestaoPrazo))}>
                  Usar {sugestaoPrazo} dias
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <Select
        label="Cliente (opcional para retirada)"
        options={[{ value: '', label: '— Nenhum / Retirada —' }, ...clientes.map((c) => ({ value: c.id, label: c.nome ?? '' }))]}
        value={cliente_id}
        onChange={(e) => setClienteId(e.target.value)}
      />
      <Select
        label="Tipo"
        options={[{ value: 'retirada', label: 'Retirada' }, { value: 'entrega', label: 'Entrega' }]}
        value={tipo_entrega}
        onChange={(e) => setTipoEntrega(e.target.value as 'retirada' | 'entrega')}
      />
      {tipo_entrega === 'entrega' && (
        <>
          <Input
            label="Endereço completo de entrega *"
            value={endereco_entrega}
            onChange={(e) => setEnderecoEntrega(e.target.value)}
            placeholder="Logradouro, número, bairro, cidade, CEP, referência"
          />
          <div className="rounded border border-gray-200 bg-gray-50 p-3 space-y-2">
            <p className="text-sm font-medium text-gray-800">Frete por distância</p>
            <p className="text-xs text-gray-600">Até 2 km grátis · 2 a 5 km R$ 20 · 5 a 7 km R$ 30 · 7 a 10 km R$ 40 · 10 a 13 km R$ 60 · Acima de 13 km verificar na hora</p>
            <div className="flex flex-wrap items-end gap-3">
              <Input
                label="Distância (km) *"
                type="number"
                min={0}
                step={0.1}
                value={distancia_km}
                onChange={(e) => setDistanciaKm(e.target.value)}
                placeholder="Ex.: 4.5"
                className="w-28"
              />
              {!Number.isNaN(kmNum) && kmNum > 0 && freteTabela !== null && (
                <p className="text-sm text-gray-700 pb-1">Frete: <strong>R$ {freteTabela.toFixed(2)}</strong></p>
              )}
              {acimaDe13 && (
                <div className="flex items-end gap-2">
                  <Input
                    label="Valor do frete (acima de 13 km)"
                    type="number"
                    min={0}
                    step={0.01}
                    value={valor_frete_manual}
                    onChange={(e) => setValorFreteManual(e.target.value)}
                    placeholder="Verificar na hora"
                    className="w-36"
                  />
                </div>
              )}
            </div>
          </div>
        </>
      )}
      <Input label="Observações" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>Cancelar</Button>
        <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Registrar venda'}</Button>
      </div>
    </form>
  );
}
