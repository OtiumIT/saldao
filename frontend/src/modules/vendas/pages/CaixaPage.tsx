import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { useProdutos } from '../../estoque/hooks/useProdutos';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Combobox, type ComboboxOption } from '../../../components/ui/Combobox';
import * as vendasService from '../services/vendas.service';
import * as parcelamentoService from '../../parcelamento/services/parcelamento.service';
import * as opcoesEntregaService from '../../opcoes-entrega/services/opcoes-entrega.service';
import { baixarPdfPedido, abrirWhatsAppPedido } from '../lib/pedido-print-whatsapp';
import * as clientesService from '../../clientes/services/clientes.service';
import type { Cliente, CreateClienteRequest } from '../../clientes/types/clients.types';
import type { CreatePedidoVendaRequest, OpcaoEntregaSelecionada } from '../types/vendas.types';
import type { ProdutoComSaldo } from '../../estoque/types/estoque.types';
import type { OpcaoParcelamento } from '../../parcelamento/types/parcelamento.types';
import type { OpcaoEntrega } from '../../opcoes-entrega/types/opcoes-entrega.types';

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
  const { produtos: produtosRaw, loading: loadingProdutos, error: errorProdutos, fetchProdutos } = useProdutos(true);
  const produtosAll = Array.isArray(produtosRaw) ? produtosRaw : [];
  const produtos = useMemo(
    () => produtosAll.filter((p) => p.tipo === 'revenda' || p.tipo === 'fabricado'),
    [produtosAll]
  );

  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [quantityToAdd, setQuantityToAdd] = useState(1);
  const [cliente_id, setClienteId] = useState('');
  const [clienteNome, setClienteNome] = useState('');
  const [identificadorCliente, setIdentificadorCliente] = useState('');
  const [loadingCliente, setLoadingCliente] = useState(false);
  const [errorCliente, setErrorCliente] = useState('');
  const [showCadastroRapido, setShowCadastroRapido] = useState(false);
  const [novoClienteNome, setNovoClienteNome] = useState('');
  const [searchResults, setSearchResults] = useState<Cliente[] | null>(null);
  const [loadingAcoesPedido, setLoadingAcoesPedido] = useState(false);
  const [tipo_entrega, setTipoEntrega] = useState<'retirada' | 'entrega'>('entrega');
  const [endereco_entrega, setEnderecoEntrega] = useState('');
  const [distancia_km, setDistanciaKm] = useState('');
  const [valor_frete_manual, setValorFreteManual] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [previsao_entrega_em_dias, setPrevisaoEntregaEmDias] = useState('');
  const [descontoValor, setDescontoValor] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successId, setSuccessId] = useState<string | null>(null);
  const [cep, setCep] = useState('');
  const [loadingDistancia, setLoadingDistancia] = useState(false);
  const [errorDistancia, setErrorDistancia] = useState('');
  const [parcelasSelected, setParcelasSelected] = useState<number | null>(null);
  const [opcoesParcelamento, setOpcoesParcelamento] = useState<OpcaoParcelamento[]>([]);
  const [opcoesEntrega, setOpcoesEntrega] = useState<OpcaoEntrega[]>([]);
  const [extrasLivreLabel, setExtrasLivreLabel] = useState('Outros extras');
  const [opcoesEntregaSelecionadas, setOpcoesEntregaSelecionadas] = useState<OpcaoEntregaSelecionada[]>([]);
  const [andarPorOpcao, setAndarPorOpcao] = useState<Record<string, number>>({});
  const [valorExtrasLivre, setValorExtrasLivre] = useState('');

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
  const descontoNum = descontoValor.trim() ? parseFloat(descontoValor.replace(',', '.')) : 0;
  const desconto = !Number.isNaN(descontoNum) && descontoNum > 0 ? Math.min(descontoNum, subtotal) : 0;
  const subtotalComDesconto = subtotal - desconto;
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
  const valorExtras = useMemo(() => {
    if (tipo_entrega !== 'entrega' || opcoesEntregaSelecionadas.length === 0) return 0;
    let s = 0;
    for (const sel of opcoesEntregaSelecionadas) {
      const opcao = opcoesEntrega.find((o) => o.id === sel.opcao_id);
      if (!opcao) continue;
      if (opcao.tipo === 'fixo' && opcao.valor_fixo != null) s += Number(opcao.valor_fixo);
      else if (opcao.tipo === 'por_andar' && opcao.valor_por_andar != null) {
        const andar = sel.andar ?? andarPorOpcao[sel.opcao_id] ?? 0;
        s += Number(opcao.valor_por_andar) * Math.max(0, andar);
      }
    }
    return Math.round(s * 100) / 100;
  }, [tipo_entrega, opcoesEntregaSelecionadas, opcoesEntrega, andarPorOpcao]);
  const valorExtrasLivreNum =
    tipo_entrega === 'entrega' && valorExtrasLivre.trim()
      ? Math.max(0, parseFloat(valorExtrasLivre.replace(',', '.')) || 0)
      : 0;
  const baseTotal = Math.max(0, subtotalComDesconto + valorFrete + valorExtras + valorExtrasLivreNum);
  const opcaoParcelas =
    parcelasSelected != null && parcelasSelected > 1
      ? opcoesParcelamento.find((o) => o.parcelas === parcelasSelected)
      : undefined;
  const totalGeral =
    opcaoParcelas && opcaoParcelas.taxa_percentual > 0
      ? Math.round(baseTotal * (1 + opcaoParcelas.taxa_percentual / 100) * 100) / 100
      : baseTotal;

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

  const clientePreenchido = cliente_id.trim() !== '';
  const cepValido = cep.replace(/\D/g, '').length === 8;
  const canFinalize =
    validCart.length > 0 &&
    clientePreenchido &&
    itensSemEstoqueNaoFabricados.length === 0 &&
    (!soFabricadosSemEstoque || (previsaoNum >= 1)) &&
    (tipo_entrega !== 'entrega' || !endereco_entrega.trim() || cepValido) &&
    (tipo_entrega !== 'entrega' || (endereco_entrega.trim() && !Number.isNaN(kmNum) && kmNum >= 0)) &&
    (tipo_entrega !== 'entrega' || kmNum <= 13 || (!Number.isNaN(freteManualNum) && freteManualNum >= 0));

  const handleFinalize = async () => {
    if (!token) return;
    if (!clientePreenchido) {
      setError('Informe o cliente: busque por CPF, CNPJ ou WhatsApp e vincule ou cadastre um novo.');
      return;
    }
    if (tipo_entrega === 'entrega' && endereco_entrega.trim() && !cepValido) {
      setError('CEP é obrigatório quando há endereço. Informe o CEP com 8 dígitos.');
      return;
    }
    const comQuantidadeInvalida = validCart.some((i) => !(i.quantidade >= 1));
    if (comQuantidadeInvalida) {
      setError('Cada item precisa ter quantidade pelo menos 1. Ajuste as quantidades no carrinho.');
      return;
    }
    if (!canFinalize) return;
    setError('');
    setLoading(true);
    try {
      const obsFinal = [
        observacoes.trim(),
        desconto > 0 ? `Desconto R$ ${desconto.toFixed(2)} aplicado` : '',
      ].filter(Boolean).join(' · ') || null;

      const itensParaEnvio =
        desconto > 0 && subtotal > 0
          ? validCart.map((i) => {
              const totalItem = i.quantidade * i.preco_unitario;
              const fator = (subtotal - desconto) / subtotal;
              const novoPrecoUnitario = (totalItem * fator) / i.quantidade;
              return {
                produto_id: i.produto_id,
                quantidade: i.quantidade,
                preco_unitario: Math.round(novoPrecoUnitario * 100) / 100,
              };
            })
          : validCart.map((i) => ({
              produto_id: i.produto_id,
              quantidade: i.quantidade,
              preco_unitario: i.preco_unitario,
            }));

      const taxaParaEnvio =
        parcelasSelected != null && parcelasSelected > 1 && opcaoParcelas
          ? opcaoParcelas.taxa_percentual
          : null;
      const payload: CreatePedidoVendaRequest = {
        cliente_id: cliente_id || null,
        tipo_entrega,
        endereco_entrega: tipo_entrega === 'entrega' ? endereco_entrega.trim() : null,
        cliente_cep: tipo_entrega === 'entrega' && cliente_id && cep.trim() ? cep.replace(/\D/g, '').slice(0, 8) : undefined,
        observacoes: obsFinal,
        previsao_entrega_em_dias: soFabricadosSemEstoque && previsaoNum >= 1 ? previsaoNum : null,
        distancia_km: tipo_entrega === 'entrega' && !Number.isNaN(kmNum) ? kmNum : null,
        valor_frete: tipo_entrega === 'entrega' ? valorFrete : null,
        opcoes_entrega_selecionadas:
          tipo_entrega === 'entrega' && opcoesEntregaSelecionadas.length > 0
            ? opcoesEntregaSelecionadas.map((s) => ({
                opcao_id: s.opcao_id,
                andar: s.andar ?? andarPorOpcao[s.opcao_id],
              }))
            : undefined,
        valor_extras_livre: tipo_entrega === 'entrega' && valorExtrasLivreNum > 0 ? valorExtrasLivreNum : null,
        parcelas: parcelasSelected ?? null,
        taxa_parcelamento_percentual: taxaParaEnvio,
        itens: itensParaEnvio,
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
      setClienteNome('');
      setIdentificadorCliente('');
      setErrorCliente('');
      setShowCadastroRapido(false);
      setNovoClienteNome('');
      setSearchResults(null);
      setCep('');
      setEnderecoEntrega('');
      setDistanciaKm('');
      setValorFreteManual('');
      setErrorDistancia('');
      setObservacoes('');
      setPrevisaoEntregaEmDias('');
      setDescontoValor('');
      setParcelasSelected(null);
      setOpcoesEntregaSelecionadas([]);
      setAndarPorOpcao({});
      setValorExtrasLivre('');
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

  const cepDigits = cep.replace(/\D/g, '');
  useEffect(() => {
    if (cepDigits.length !== 8) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`);
        const data = await res.json();
        if (cancelled || data.erro) return;
        const partes = [data.logradouro, data.bairro, data.localidade, data.uf].filter(Boolean);
        if (partes.length) setEnderecoEntrega(partes.join(', '));
      } catch {
        // silencioso
      }
    })();
    return () => { cancelled = true; };
  }, [cepDigits]);

  useEffect(() => {
    if (!token) return;
    parcelamentoService.listOpcoesParcelamento(token).then(setOpcoesParcelamento).catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!token) return;
    opcoesEntregaService.list(token).then((list) => setOpcoesEntrega(list.filter((o) => o.ativo))).catch(() => {});
    opcoesEntregaService.getConfig('extras_livre_label', token).then((v) => v && setExtrasLivreLabel(v)).catch(() => {});
  }, [token]);

  // Ao mudar para Entrega com cliente selecionado, preencher endereço do cadastro
  useEffect(() => {
    if (tipo_entrega !== 'entrega' || !cliente_id || !token) return;
    let cancelled = false;
    clientesService.getCliente(cliente_id, token).then((c) => {
      if (cancelled) return;
      const endereco = c.endereco_entrega?.trim() ?? '';
      if (endereco) {
        setEnderecoEntrega(endereco);
        setCep(c.cep?.replace(/\D/g, '').slice(0, 8) ?? '');
        setErrorDistancia('');
        vendasService.getCalcularDistancia(endereco, token).then(
          (r) => {
            setDistanciaKm(String(r.km));
            if (r.cep) setCep(r.cep);
            if (r.endereco_formatado) setEnderecoEntrega(r.endereco_formatado);
          },
          () => setErrorDistancia('Endereço preenchido. Distância pode ser calculada manualmente ou pelo botão "Calcular km".')
        );
      }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [tipo_entrega, cliente_id, token]);

  const digitsOnly = (s: string) => s.replace(/\D/g, '');

  const applyCliente = (cliente: Cliente) => {
    setClienteId(cliente.id);
    setClienteNome(cliente.nome ?? '');
    setNovoClienteNome('');
    setSearchResults(null);
    setShowCadastroRapido(false);
    const endereco = cliente.endereco_entrega?.trim() ?? '';
    setEnderecoEntrega(endereco);
    setCep(cliente.cep?.replace(/\D/g, '').slice(0, 8) ?? '');
    setErrorDistancia('');
    if (endereco && token) {
      vendasService.getCalcularDistancia(endereco, token).then(
        (r) => {
          setDistanciaKm(String(r.km));
          if (r.cep) setCep(r.cep);
          if (r.endereco_formatado) setEnderecoEntrega(r.endereco_formatado);
        },
        () => setErrorDistancia('Endereço preenchido. Distância pode ser calculada manualmente ou pelo botão "Calcular km".')
      );
    } else if (!endereco) {
      setDistanciaKm('');
    }
  };

  const handleBuscarCliente = async () => {
    const q = identificadorCliente.trim();
    if (!q) {
      setErrorCliente('Digite nome, CPF, CNPJ ou WhatsApp para buscar.');
      return;
    }
    if (!token) return;
    setErrorCliente('');
    setLoadingCliente(true);
    setShowCadastroRapido(false);
    setSearchResults(null);
    try {
      const digits = digitsOnly(q);
      // Busca exata por CPF/CNPJ/WhatsApp (só números, 10+ dígitos)
      if (digits.length >= 10) {
        const cliente = await clientesService.getClienteByIdentificador(identificadorCliente, token);
        if (cliente) {
          applyCliente(cliente);
          setLoadingCliente(false);
          return;
        }
        setShowCadastroRapido(true);
        setNovoClienteNome('');
        setLoadingCliente(false);
        return;
      }
      // Busca por qualquer texto (nome, etc.)
      const list = await clientesService.searchClientes(q, token);
      if (list.length === 0) {
        setShowCadastroRapido(true);
        setNovoClienteNome(q);
      } else if (list.length === 1) {
        applyCliente(list[0]);
      } else {
        setSearchResults(list);
      }
    } catch {
      setShowCadastroRapido(true);
      setNovoClienteNome(q);
    } finally {
      setLoadingCliente(false);
    }
  };

  const handleCadastrarCliente = async () => {
    const nome = novoClienteNome.trim();
    if (!nome || !token) {
      setErrorCliente('Informe o nome do cliente.');
      return;
    }
    const digits = digitsOnly(identificadorCliente);
    const payload: CreateClienteRequest = { nome };
    if (digits.length === 11) payload.cpf = identificadorCliente;
    else if (digits.length === 14) payload.cnpj = identificadorCliente;
    else payload.fone = identificadorCliente;
    setLoadingCliente(true);
    setErrorCliente('');
    try {
      const created = await clientesService.createCliente(payload, token);
      setClienteId(created.id);
      setClienteNome(created.nome ?? '');
      setShowCadastroRapido(false);
      setNovoClienteNome('');
    } catch (e) {
      setErrorCliente(e instanceof Error ? e.message : 'Erro ao cadastrar');
    } finally {
      setLoadingCliente(false);
    }
  };

  const handleCalcularDistancia = async () => {
    const end = endereco_entrega.trim();
    if (!end) {
      setErrorDistancia('Informe o endereço de entrega.');
      return;
    }
    if (!token) return;
    setErrorDistancia('');
    setLoadingDistancia(true);
    try {
      const result = await vendasService.getCalcularDistancia(end, token);
      setDistanciaKm(String(result.km));
      if (result.cep) setCep(result.cep);
      if (result.endereco_formatado) setEnderecoEntrega(result.endereco_formatado);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao calcular distância';
      setErrorDistancia(msg);
    } finally {
      setLoadingDistancia(false);
    }
  };

  const handleEnriquecerEndereco = async () => {
    const end = endereco_entrega.trim();
    if (!end) {
      setErrorDistancia('Informe o endereço de entrega.');
      return;
    }
    if (!token) return;
    setErrorDistancia('');
    setLoadingDistancia(true);
    try {
      const result = await vendasService.getEnriquecerEndereco(end, token);
      setEnderecoEntrega(result.endereco_formatado);
      if (result.cep) setCep(result.cep);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao enriquecer endereço';
      setErrorDistancia(msg);
    } finally {
      setLoadingDistancia(false);
    }
  };

  const handleImprimirPedido = async () => {
    if (!successId || !token) return;
    setLoadingAcoesPedido(true);
    try {
      const pedido = await vendasService.getPedidoVenda(successId, token);
      await baixarPdfPedido(pedido);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível gerar o PDF.');
    } finally {
      setLoadingAcoesPedido(false);
    }
  };

  const handleWhatsAppPedido = async () => {
    if (!successId || !token) return;
    setLoadingAcoesPedido(true);
    try {
      const pedido = await vendasService.getPedidoVenda(successId, token);
      const ok = abrirWhatsAppPedido(pedido);
      if (!ok) setError('Cliente sem telefone cadastrado. Cadastre o WhatsApp do cliente para enviar.');
    } catch {
      setError('Não foi possível carregar o pedido.');
    } finally {
      setLoadingAcoesPedido(false);
    }
  };

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
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2 justify-center">
              <Button variant="secondary" onClick={handleImprimirPedido} disabled={loadingAcoesPedido} className="flex-1 min-w-[140px]">
                {loadingAcoesPedido ? '...' : 'Baixar PDF'}
              </Button>
              <Button variant="secondary" onClick={handleWhatsAppPedido} disabled={loadingAcoesPedido} className="flex-1 min-w-[140px]">
                {loadingAcoesPedido ? '...' : 'Enviar por WhatsApp'}
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button onClick={() => { setSuccessId(null); setError(''); }} className="w-full sm:w-auto">
                Nova venda
              </Button>
              <Button variant="secondary" onClick={() => navigate('/vendas')} className="w-full sm:w-auto">
                Ver vendas
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            to="/vendas"
            className="text-slate-600 hover:text-slate-900 text-sm font-medium flex items-center gap-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Vendas
          </Link>
          <span className="text-slate-400 text-sm">|</span>
          <h1 className="text-lg font-semibold text-slate-900">Caixa</h1>
        </div>
        <span className="text-slate-500 text-sm tabular-nums">
          {new Date().toLocaleDateString('pt-BR')} {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Coluna esquerda: Produtos (mais estreita) */}
        <section className="flex-1 flex flex-col min-w-0 max-w-xl min-h-0 p-4 lg:p-6 bg-slate-50 lg:border-r border-slate-200">
          <h2 className="text-slate-900 font-semibold mb-3">Produtos</h2>
          {errorProdutos && (
            <div className="mb-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between gap-2 flex-wrap">
              <span>Erro ao carregar produtos: {errorProdutos.message}</span>
              <Button type="button" variant="secondary" size="sm" onClick={() => fetchProdutos()}>
                Tentar novamente
              </Button>
            </div>
          )}
          <div className="space-y-3 shrink-0">
            <label className="block text-sm font-medium text-slate-700">Buscar produto (código ou nome)</label>
            <div>
              <Combobox
                value={search}
                onChange={setSearch}
                onSelect={(produtoId) => addToCart(produtoId, quantityToAdd)}
                options={produtoOptions}
                filterOption={comboboxFilterOption}
                maxOptions={14}
                placeholder={loadingProdutos ? 'Carregando produtos...' : 'Digite para buscar · ↑↓ navegar · Enter selecionar'}
                aria-label="Buscar produto por código ou descrição"
                inputClassName="w-full h-14 px-5 text-lg bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-600 text-sm">Quantidade ao adicionar:</span>
              {[1, 2, 5, 10].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setQuantityToAdd(n)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    quantityToAdd === n
                      ? 'bg-amber-500 text-slate-900'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 flex-1 min-h-0 flex flex-col">
            <p className="text-slate-600 text-sm font-medium mb-2">Itens adicionados ({validCart.length})</p>
            <div className="flex-1 overflow-y-auto space-y-2 min-h-0 rounded-xl border border-slate-200 bg-white p-2">
              {validCart.length === 0 ? (
                <p className="text-slate-500 text-sm py-4 text-center">Nenhum item. Busque e adicione produtos acima.</p>
              ) : (
                validCart.map((item, idx) => (
                  <div
                    key={`${item.produto_id}-${idx}`}
                    className="flex items-start gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-900 font-medium text-sm break-words leading-snug">{item.descricao}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{item.codigo}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => updateCartItemQty(idx, -1)}
                        className="w-9 h-9 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold"
                      >
                        −
                      </button>
                      <span className="w-10 text-center text-slate-900 font-semibold tabular-nums text-sm">{item.quantidade}</span>
                      <button
                        type="button"
                        onClick={() => updateCartItemQty(idx, 1)}
                        className="w-9 h-9 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-amber-700 font-semibold tabular-nums text-sm w-20 text-right shrink-0">
                      R$ {(item.quantidade * item.preco_unitario).toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFromCart(idx)}
                      className="text-slate-400 hover:text-red-600 p-1 shrink-0"
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
          </div>
        </section>

        {/* Coluna direita: Cliente e Entrega (mais larga) */}
        <aside className="w-full flex-1 flex flex-col min-w-0 min-h-0 bg-white border-t lg:border-l border-slate-200 shadow-lg lg:min-w-[520px]">
          <div className="p-4 flex-1 flex flex-col min-h-0 overflow-y-auto">
            <h2 className="text-slate-900 font-semibold mb-4 text-lg">Cliente e Entrega</h2>

            {/* Cliente — obrigatório */}
            <div className="mt-4 pt-4 border-t border-slate-200">
              <h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-800 text-xs">1</span>
                Cliente *
              </h3>
              <p className="text-xs text-slate-500 mb-2">Busque por nome, CPF, CNPJ ou WhatsApp; se não achar, cadastre e use.</p>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={identificadorCliente}
                    onChange={(e) => { setIdentificadorCliente(e.target.value); setErrorCliente(''); setSearchResults(null); }}
                    placeholder="Nome, CPF, CNPJ ou WhatsApp"
                    className="flex-1"
                    disabled={!!cliente_id}
                    aria-label="Buscar cliente"
                  />
                  {!cliente_id ? (
                    <Button type="button" variant="secondary" size="sm" onClick={handleBuscarCliente} disabled={loadingCliente}>
                      {loadingCliente ? '...' : 'Buscar'}
                    </Button>
                  ) : (
                    <Button type="button" variant="secondary" size="sm" onClick={() => { setClienteId(''); setClienteNome(''); setIdentificadorCliente(''); setShowCadastroRapido(false); setSearchResults(null); }}>
                      Limpar
                    </Button>
                  )}
                </div>
                <Input
                  label={cliente_id ? 'Nome (do cadastro)' : undefined}
                  value={cliente_id ? clienteNome : novoClienteNome}
                  onChange={(e) => setNovoClienteNome(e.target.value)}
                  placeholder="Nome (para buscar ou cadastrar)"
                  disabled={!!cliente_id}
                  readOnly={!!cliente_id}
                  aria-label="Nome do cliente"
                />
                {cliente_id ? (
                  <p className="text-sm text-emerald-700 font-medium flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" aria-hidden /> {clienteNome}
                  </p>
                ) : searchResults && searchResults.length > 1 ? (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 space-y-1 max-h-40 overflow-y-auto">
                    <p className="text-xs font-medium text-slate-600 mb-1">Escolha o cliente:</p>
                    {searchResults.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => applyCliente(c)}
                        className="w-full text-left px-3 py-2 rounded-lg bg-white border border-slate-200 hover:bg-amber-50 hover:border-amber-300 text-sm text-slate-900"
                      >
                        {c.nome}{c.fone ? ` · ${c.fone}` : ''}
                      </button>
                    ))}
                  </div>
                ) : showCadastroRapido && (
                  <Button type="button" size="sm" onClick={handleCadastrarCliente} disabled={loadingCliente || !novoClienteNome.trim()}>
                    {loadingCliente ? '...' : 'Cadastrar e usar'}
                  </Button>
                )}
                {errorCliente && <p className="text-red-600 text-sm">{errorCliente}</p>}
                {!clientePreenchido && validCart.length > 0 && (
                  <p className="text-amber-700 text-xs">Informe o cliente para poder finalizar a venda.</p>
                )}
              </div>
            </div>

            {/* Entrega */}
            <div className="mt-4 pt-4 border-t border-slate-200">
              <h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-slate-700 text-xs">2</span>
                Entrega
              </h3>
              <div className="flex gap-2 mb-3">
                {TIPO_ENTREGA_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => setTipoEntrega(o.value)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      tipo_entrega === o.value
                        ? 'bg-amber-500 text-slate-900 shadow-sm'
                        : 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              {tipo_entrega === 'entrega' && (
                <div className="space-y-3 rounded-xl bg-slate-50 border border-slate-200 p-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Input
                      label={endereco_entrega.trim() ? 'CEP *' : 'CEP'}
                      value={cep}
                      onChange={(e) => setCep(e.target.value.replace(/\D/g, '').slice(0, 8))}
                      placeholder="00000000"
                      className="sm:col-span-1"
                      required={!!endereco_entrega.trim()}
                    />
                    <div className="sm:col-span-2 flex items-end gap-2 flex-wrap">
                      <Input
                        label="Endereço"
                        value={endereco_entrega}
                        onChange={(e) => { setEnderecoEntrega(e.target.value); setErrorDistancia(''); }}
                        placeholder="Ou endereço completo"
                        className="flex-1 min-w-[180px]"
                      />
                      <div className="flex gap-1 shrink-0 mb-0.5">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={handleEnriquecerEndereco}
                          disabled={loadingDistancia || !endereco_entrega.trim()}
                          title="Preencher endereço completo e CEP via Google"
                        >
                          {loadingDistancia ? '...' : 'Enriquecer'}
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={handleCalcularDistancia}
                          disabled={loadingDistancia || !endereco_entrega.trim()}
                        >
                          {loadingDistancia ? '...' : 'Calcular km'}
                        </Button>
                      </div>
                    </div>
                  </div>
                  {errorDistancia && <p className="text-red-600 text-sm">{errorDistancia}</p>}
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Distância (km)"
                      type="number"
                      min={0}
                      step={0.1}
                      value={distancia_km}
                      onChange={(e) => setDistanciaKm(e.target.value)}
                      placeholder="Ex: 5"
                    />
                    {acimaDe13 && (
                      <Input
                        label="Frete (R$)"
                        type="number"
                        min={0}
                        step={0.01}
                        value={valor_frete_manual}
                        onChange={(e) => setValorFreteManual(e.target.value)}
                      />
                    )}
                  </div>
                  {!Number.isNaN(kmNum) && kmNum > 0 && freteTabela !== null && kmNum <= 13 && (
                    <p className="text-amber-700 text-sm font-medium">Frete: R$ {freteTabela.toFixed(2)}</p>
                  )}
                </div>
              )}
              {opcoesEntrega.length > 0 && (
                <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-sm font-medium text-slate-700 mb-2">Preços extras da entrega</p>
                  <div className="space-y-2">
                    {opcoesEntrega.map((o) => {
                      const isSelected = opcoesEntregaSelecionadas.some((s) => s.opcao_id === o.id);
                      const andar = andarPorOpcao[o.id] ?? 0;
                      return (
                        <div key={o.id} className="flex flex-wrap items-center gap-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setOpcoesEntregaSelecionadas((prev) => [...prev, { opcao_id: o.id, andar: o.tipo === 'por_andar' ? andar : undefined }]);
                                } else {
                                  setOpcoesEntregaSelecionadas((prev) => prev.filter((s) => s.opcao_id !== o.id));
                                  setAndarPorOpcao((p) => {
                                    const next = { ...p };
                                    delete next[o.id];
                                    return next;
                                  });
                                }
                              }}
                              className="rounded border-slate-300"
                            />
                            <span className="text-sm text-slate-800">
                              {o.nome}
                              {o.tipo === 'fixo' && o.valor_fixo != null && (
                                <span className="text-amber-700 font-medium ml-1">R$ {Number(o.valor_fixo).toFixed(2)}</span>
                              )}
                              {o.tipo === 'por_andar' && o.valor_por_andar != null && (
                                <span className="text-amber-700 font-medium ml-1">R$ {Number(o.valor_por_andar).toFixed(2)}/andar</span>
                              )}
                            </span>
                          </label>
                          {o.tipo === 'por_andar' && isSelected && (
                            <div className="flex items-center gap-1 ml-4">
                              <label className="text-xs text-slate-600">Andares:</label>
                              <input
                                type="number"
                                min={0}
                                value={andar}
                                onChange={(e) => {
                                  const v = Math.max(0, parseInt(e.target.value, 10) || 0);
                                  setAndarPorOpcao((p) => ({ ...p, [o.id]: v }));
                                  setOpcoesEntregaSelecionadas((prev) =>
                                    prev.map((s) => (s.opcao_id === o.id ? { ...s, andar: v } : s))
                                  );
                                }}
                                className="w-16 h-8 px-2 rounded border border-slate-300 text-slate-900 text-sm"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">{extrasLivreLabel} (R$)</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={valorExtrasLivre}
                      onChange={(e) => setValorExtrasLivre(e.target.value.replace(/[^0-9,.]/g, ''))}
                      placeholder="0,00"
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm"
                    />
                  </div>
                </div>
              )}
              <Input
                label="Observações"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Opcional"
                className="mt-2"
              />
              {soFabricadosSemEstoque && (
                <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <label className="block text-amber-800 text-sm font-medium mb-1">Previsão de entrega (dias)</label>
                  <input
                    type="number"
                    min={1}
                    value={previsao_entrega_em_dias}
                    onChange={(e) => setPrevisaoEntregaEmDias(e.target.value)}
                    placeholder="Ex: 7"
                    className="w-full h-10 px-3 rounded-lg border border-amber-300 bg-white text-slate-900"
                  />
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
              <h3 className="text-sm font-semibold text-slate-800 mb-1 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-slate-700 text-xs">3</span>
                Resumo
              </h3>
              <div className="flex justify-between text-slate-600 text-sm">
                <span>Subtotal</span>
                <span className="tabular-nums">R$ {subtotal.toFixed(2)}</span>
              </div>
              {desconto > 0 && (
                <div className="flex justify-between text-emerald-700 text-sm">
                  <span>Desconto</span>
                  <span className="tabular-nums">− R$ {desconto.toFixed(2)}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <label className="text-slate-600 text-sm">Aplicar desconto (R$)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={descontoValor}
                  onChange={(e) => setDescontoValor(e.target.value.replace(/[^0-9,.]/g, ''))}
                  placeholder="0,00"
                  className="w-24 h-9 px-2 rounded border border-slate-300 text-slate-900 text-sm"
                />
              </div>
              {tipo_entrega === 'entrega' && valorFrete > 0 && (
                <div className="flex justify-between text-slate-600 text-sm">
                  <span>Frete</span>
                  <span className="tabular-nums">R$ {valorFrete.toFixed(2)}</span>
                </div>
              )}
              {(tipo_entrega === 'entrega' && (valorExtras > 0 || valorExtrasLivreNum > 0)) && (
                <div className="flex justify-between text-slate-600 text-sm">
                  <span>Extras entrega</span>
                  <span className="tabular-nums">R$ {(valorExtras + valorExtrasLivreNum).toFixed(2)}</span>
                </div>
              )}
              <div className="space-y-1">
                <label className="text-slate-600 text-sm block">Pagamento / Parcelamento</label>
                <Select
                  options={[
                    { value: '', label: '— À vista (outro meio) —' },
                    { value: '1', label: '1x no cartão (sem taxa)' },
                    ...opcoesParcelamento
                      .filter((o) => o.parcelas > 1)
                      .map((o) => ({ value: String(o.parcelas), label: `${o.parcelas}x no cartão (${Number(o.taxa_percentual).toFixed(2)}%)` })),
                  ]}
                  value={parcelasSelected != null ? String(parcelasSelected) : ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    setParcelasSelected(v === '' ? null : parseInt(v, 10));
                  }}
                />
                <p className="text-xs text-slate-500">Se parcelado, o total já inclui a taxa sobre (itens + frete).</p>
              </div>
              {parcelasSelected != null && parcelasSelected > 1 && opcaoParcelas && opcaoParcelas.taxa_percentual > 0 && (
                <div className="flex justify-between text-slate-600 text-sm">
                  <span>Taxa parcelamento ({parcelasSelected}x)</span>
                  <span className="tabular-nums">{opcaoParcelas.taxa_percentual.toFixed(2)}%</span>
                </div>
              )}
              <div className="flex justify-between text-slate-900 font-bold text-lg pt-1">
                <span>Total</span>
                <span className="tabular-nums text-amber-700">R$ {totalGeral.toFixed(2)}</span>
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              {itensSemEstoqueNaoFabricados.length > 0 && (
                <p className="text-amber-700 text-sm">Ajuste quantidades: apenas fabricados podem vender sem estoque.</p>
              )}
              {validCart.length > 0 && !clientePreenchido && (
                <p className="text-slate-500 text-xs">Informe o cliente acima para habilitar o botão.</p>
              )}
              <Button
                onClick={handleFinalize}
                disabled={!canFinalize || loading}
                className="w-full h-14 text-lg font-bold mt-2 bg-amber-500 hover:bg-amber-400 text-slate-900 disabled:opacity-60"
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
