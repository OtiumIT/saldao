import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { useProdutos } from '../../estoque/hooks/useProdutos';
import { useClients } from '../../clientes/hooks/useClients';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Combobox, type ComboboxOption } from '../../../components/ui/Combobox';
import * as vendasService from '../services/vendas.service';
import type { CreatePedidoVendaRequest } from '../types/vendas.types';
import type { ProdutoComSaldo } from '../../estoque/types/estoque.types';

interface CartItem {
  produto_id: string;
  codigo: string;
  descricao: string;
  quantidade: number;
  preco_unitario: number;
}

const TIPO_ENTREGA_OPTIONS = [
  { value: 'retirada' as const, label: 'Retirada' },
  { value: 'entrega' as const, label: 'Entrega' },
];

function calcularFretePorKm(km: number): number | null {
  if (km <= 0) return 0;
  if (km <= 2) return 0;
  if (km <= 5) return 20;
  if (km <= 7) return 30;
  if (km <= 10) return 40;
  if (km <= 13) return 60;
  return null;
}

export function CaixaPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { produtos: produtosRaw } = useProdutos(true);
  const { clientes: clientesRaw } = useClients();
  const produtosAll = Array.isArray(produtosRaw) ? produtosRaw : [];
  const produtos = useMemo(
    () => produtosAll.filter((p) => p.tipo === 'revenda' || p.tipo === 'fabricado'),
    [produtosAll]
  );
  const clientes = Array.isArray(clientesRaw) ? clientesRaw : [];

  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [quantityToAdd, setQuantityToAdd] = useState(1);
  const [cliente_id, setClienteId] = useState('');
  const [tipo_entrega, setTipoEntrega] = useState<'retirada' | 'entrega'>('retirada');
  const [endereco_entrega, setEnderecoEntrega] = useState('');
  const [distancia_km, setDistanciaKm] = useState('');
  const [valor_frete_manual, setValorFreteManual] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [previsao_entrega_em_dias, setPrevisaoEntregaEmDias] = useState('');
  const [showClienteEntrega, setShowClienteEntrega] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successId, setSuccessId] = useState<string | null>(null);

  const produtoOptions: ComboboxOption[] = useMemo(() => {
    return produtos.map((p) => {
      const saldo = (p as ProdutoComSaldo).saldo ?? 0;
      const preco = p.preco_venda != null ? Number(p.preco_venda) : 0;
      const semEstoque = saldo <= 0;
      const label = `${p.codigo ?? ''} — ${p.descricao ?? ''} · R$ ${preco.toFixed(2)}${semEstoque ? ' (sem estoque)' : ''}`;
      return { value: p.id, label, disabled: false };
    });
  }, [produtos]);

  const getSaldo = (produtoId: string): number => {
    const p = produtos.find((x) => x.id === produtoId);
    return p && 'saldo' in p ? (p as ProdutoComSaldo).saldo : 0;
  };

  const addToCart = (produtoId: string, qty: number = quantityToAdd) => {
    const p = produtos.find((x) => x.id === produtoId);
    if (!p) return;
    const saldo = (p as ProdutoComSaldo).saldo ?? 0;
    const preco = p.preco_venda != null ? Number(p.preco_venda) : 0;
    setCart((prev) => {
      const existing = prev.find((i) => i.produto_id === produtoId);
      if (existing) {
        return prev.map((i) =>
          i.produto_id === produtoId ? { ...i, quantidade: i.quantidade + qty } : i
        );
      }
      return [
        ...prev,
        {
          produto_id: p.id,
          codigo: p.codigo ?? '',
          descricao: p.descricao ?? '',
          quantidade: qty,
          preco_unitario: preco,
        },
      ];
    });
    setSearch('');
    setQuantityToAdd(1);
    setTimeout(() => (document.getElementById('combobox-input') as HTMLInputElement)?.focus(), 0);
  };

  const updateCartItemQty = (index: number, delta: number) => {
    setCart((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const newQty = Math.max(0, item.quantidade + delta);
        if (newQty === 0) return null;
        return { ...item, quantidade: newQty };
      }).filter((x): x is CartItem => x !== null)
    );
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const subtotal = cart.reduce((s, i) => s + i.quantidade * i.preco_unitario, 0);
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

  const validCart = cart.filter((i) => i.quantidade > 0);
  const itensSemEstoque = validCart.filter((i) => getSaldo(i.produto_id) < i.quantidade);
  const itensSemEstoqueNaoFabricados = itensSemEstoque.filter((i) => {
    const p = produtos.find((x) => x.id === i.produto_id);
    return p && p.tipo !== 'fabricado';
  });
  const soFabricadosSemEstoque =
    itensSemEstoque.length > 0 && itensSemEstoqueNaoFabricados.length === 0;
  const previsaoNum = previsao_entrega_em_dias.trim() ? parseInt(previsao_entrega_em_dias, 10) : 0;

  const comboboxFilterOption = useCallback((opt: ComboboxOption, searchTrim: string) => {
    const s = searchTrim.trim().toLowerCase();
    if (!s) return true;
    return opt.label.toLowerCase().includes(s);
  }, []);

  const canFinalize =
    validCart.length > 0 &&
    itensSemEstoqueNaoFabricados.length === 0 &&
    (!soFabricadosSemEstoque || (previsaoNum >= 1)) &&
    (tipo_entrega !== 'entrega' || (endereco_entrega.trim() && !Number.isNaN(kmNum) && kmNum >= 0)) &&
    (tipo_entrega !== 'entrega' || kmNum <= 13 || (!Number.isNaN(freteManualNum) && freteManualNum >= 0));

  const handleFinalize = async () => {
    if (!canFinalize || !token) return;
    setError('');
    setLoading(true);
    try {
      const payload: CreatePedidoVendaRequest = {
        cliente_id: cliente_id || null,
        tipo_entrega,
        endereco_entrega: tipo_entrega === 'entrega' ? endereco_entrega.trim() : null,
        observacoes: observacoes.trim() || null,
        previsao_entrega_em_dias: soFabricadosSemEstoque && previsaoNum >= 1 ? previsaoNum : null,
        distancia_km: tipo_entrega === 'entrega' && !Number.isNaN(kmNum) ? kmNum : null,
        valor_frete: tipo_entrega === 'entrega' ? valorFrete : null,
        itens: validCart.map((i) => ({
          produto_id: i.produto_id,
          quantidade: i.quantidade,
          preco_unitario: i.preco_unitario,
        })),
      };
      const created = await vendasService.createPedidoVenda(payload, token);
      try {
        await vendasService.confirmarPedidoVenda(
          created.id,
          token,
          soFabricadosSemEstoque ? { previsao_entrega_em_dias: previsaoNum } : undefined
        );
      } catch (confirmErr) {
        setError(confirmErr instanceof Error ? confirmErr.message : 'Venda criada mas falha ao confirmar.');
        setSuccessId(created.id);
        setLoading(false);
        return;
      }
      setSuccessId(created.id);
      setCart([]);
      setClienteId('');
      setEnderecoEntrega('');
      setDistanciaKm('');
      setValorFreteManual('');
      setObservacoes('');
      setPrevisaoEntregaEmDias('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao finalizar venda');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const el = document.getElementById('combobox-input');
    if (el) (el as HTMLInputElement).focus();
  }, [successId]);

  if (successId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-emerald-200 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Venda registrada</h2>
          <p className="text-gray-600 mb-6">Pedido confirmado e baixa no estoque realizada.</p>
          {error && <p className="text-sm text-amber-700 mb-4">{error}</p>}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => { setSuccessId(null); setError(''); }} className="w-full sm:w-auto">
              Nova venda
            </Button>
            <Button variant="secondary" onClick={() => navigate('/vendas')} className="w-full sm:w-auto">
              Ver vendas
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0f0f0f]">
      {/* Barra superior tipo terminal */}
      <header className="flex items-center justify-between px-4 py-3 bg-[#0a0a0a] border-b border-white/10 shrink-0">
        <div className="flex items-center gap-4">
          <Link
            to="/vendas"
            className="text-white/70 hover:text-white text-sm font-medium flex items-center gap-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Vendas
          </Link>
          <span className="text-white/50 text-sm">|</span>
          <h1 className="text-lg font-semibold text-white">Caixa</h1>
        </div>
        <span className="text-white/40 text-sm tabular-nums">
          {new Date().toLocaleDateString('pt-BR')} {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Área de busca e produtos */}
        <section className="flex-1 flex flex-col p-4 lg:p-6 overflow-hidden">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-white/80">Buscar produto (código ou nome)</label>
            <div>
              <Combobox
                value={search}
                onChange={setSearch}
                onSelect={(produtoId) => addToCart(produtoId, quantityToAdd)}
                options={produtoOptions}
                filterOption={comboboxFilterOption}
                maxOptions={14}
                placeholder="Digite para buscar · ↑↓ navegar · Enter selecionar"
                aria-label="Buscar produto por código ou descrição"
                inputClassName="w-full h-14 px-5 text-lg bg-[#1a1a1a] border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-white/60 text-sm">Quantidade ao adicionar:</span>
              {[1, 2, 5, 10].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setQuantityToAdd(n)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    quantityToAdd === n
                      ? 'bg-amber-500 text-black'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Carrinho e total */}
        <aside className="w-full lg:w-[420px] lg:min-w-[420px] flex flex-col bg-[#161616] border-t lg:border-t-0 lg:border-l border-white/10">
          <div className="p-4 flex-1 flex flex-col min-h-0">
            <h2 className="text-white font-semibold mb-3">Itens ({validCart.length})</h2>
            <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
              {validCart.length === 0 ? (
                <p className="text-white/50 text-sm">Nenhum item. Busque e adicione produtos acima.</p>
              ) : (
                validCart.map((item, idx) => (
                  <div
                    key={`${item.produto_id}-${idx}`}
                    className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{item.descricao}</p>
                      <p className="text-white/50 text-sm">{item.codigo}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => updateCartItemQty(idx, -1)}
                        className="w-9 h-9 rounded-lg bg-white/10 text-white hover:bg-white/20 font-bold"
                      >
                        −
                      </button>
                      <span className="w-10 text-center text-white font-semibold tabular-nums">{item.quantidade}</span>
                      <button
                        type="button"
                        onClick={() => updateCartItemQty(idx, 1)}
                        className="w-9 h-9 rounded-lg bg-white/10 text-white hover:bg-white/20 font-bold"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-amber-400 font-semibold tabular-nums w-20 text-right">
                      R$ {(item.quantidade * item.preco_unitario).toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFromCart(idx)}
                      className="text-white/50 hover:text-red-400 p-1"
                      aria-label="Remover"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Cliente e entrega (expansível) */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowClienteEntrega((v) => !v)}
                className="text-white/80 hover:text-white text-sm font-medium flex items-center gap-2"
              >
                {showClienteEntrega ? '▼' : '▶'} Cliente e entrega
              </button>
              {showClienteEntrega && (
                <div className="mt-3 space-y-3">
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Cliente (opcional)</label>
                    <select
                      value={cliente_id}
                      onChange={(e) => setClienteId(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-[#1a1a1a] border border-white/20 text-white text-sm"
                    >
                      <option value="">— Nenhum —</option>
                      {clientes.map((c) => (
                        <option key={c.id} value={c.id}>{c.nome}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Tipo</label>
                    <div className="flex gap-2">
                      {TIPO_ENTREGA_OPTIONS.map((o) => (
                        <button
                          key={o.value}
                          type="button"
                          onClick={() => setTipoEntrega(o.value)}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                            tipo_entrega === o.value ? 'bg-amber-500 text-black' : 'bg-white/10 text-white'
                          }`}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {tipo_entrega === 'entrega' && (
                    <>
                      <Input
                        label="Endereço"
                        value={endereco_entrega}
                        onChange={(e) => setEnderecoEntrega(e.target.value)}
                        placeholder="Logradouro, número, bairro..."
                        className="bg-[#1a1a1a] border-white/20 text-white"
                        variant="dark"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          label="Distância (km)"
                          type="number"
                          min={0}
                          step={0.1}
                          value={distancia_km}
                          onChange={(e) => setDistanciaKm(e.target.value)}
                          placeholder="Ex: 5"
                          variant="dark"
                        />
                        {acimaDe13 && (
                          <Input
                            label="Frete (R$)"
                            type="number"
                            min={0}
                            step={0.01}
                            value={valor_frete_manual}
                            onChange={(e) => setValorFreteManual(e.target.value)}
                            variant="dark"
                          />
                        )}
                      </div>
                      {!Number.isNaN(kmNum) && kmNum > 0 && freteTabela !== null && kmNum <= 13 && (
                        <p className="text-amber-400 text-sm">Frete: R$ {freteTabela.toFixed(2)}</p>
                      )}
                    </>
                  )}
                  <Input
                    label="Observações"
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Opcional"
                    variant="dark"
                  />
                  {soFabricadosSemEstoque && (
                    <div className="p-3 rounded-lg bg-amber-500/20 border border-amber-500/40">
                      <label className="block text-amber-200 text-sm mb-1">Previsão de entrega (dias)</label>
                      <input
                        type="number"
                        min={1}
                        value={previsao_entrega_em_dias}
                        onChange={(e) => setPrevisaoEntregaEmDias(e.target.value)}
                        placeholder="Ex: 7"
                        className="w-full h-10 px-3 rounded bg-[#1a1a1a] border border-white/20 text-white"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Totais e finalizar */}
            <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
              <div className="flex justify-between text-white/70 text-sm">
                <span>Subtotal</span>
                <span className="tabular-nums">R$ {subtotal.toFixed(2)}</span>
              </div>
              {tipo_entrega === 'entrega' && valorFrete > 0 && (
                <div className="flex justify-between text-white/70 text-sm">
                  <span>Frete</span>
                  <span className="tabular-nums">R$ {valorFrete.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-white font-bold text-lg">
                <span>Total</span>
                <span className="tabular-nums text-amber-400">R$ {totalGeral.toFixed(2)}</span>
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              {itensSemEstoqueNaoFabricados.length > 0 && (
                <p className="text-amber-400 text-sm">Ajuste quantidades: apenas fabricados podem vender sem estoque.</p>
              )}
              <Button
                onClick={handleFinalize}
                disabled={!canFinalize || loading}
                className="w-full h-14 text-lg font-bold mt-2 bg-amber-500 hover:bg-amber-400 text-black"
              >
                {loading ? 'Finalizando...' : 'Finalizar venda'}
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
