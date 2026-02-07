import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useProdutos } from '../../estoque/hooks/useProdutos';
import * as producaoService from '../services/producao.service';
import * as coresService from '../../cores/services/cores.service';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Modal } from '../../../components/ui/Modal';
import { DataTable } from '../../../components/ui/DataTable';
import type { OrdemComProduto, OrdemProducaoItem, CreateOrdemItem, ConferenciaEstoquePorCorResult } from '../types/producao.types';
import type { Cor } from '../../cores/types/cores.types';

type ModoOrdem = 'simples' | 'itens';

export function ProducaoOrdensPage() {
  const { token } = useAuth();
  const { produtos } = useProdutos(true);
  const fabricados = produtos.filter((p) => p.tipo === 'fabricado');
  const [ordens, setOrdens] = useState<OrdemComProduto[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalAberta, setModalAberta] = useState(false);
  const [modo, setModo] = useState<ModoOrdem>('simples');
  const [produtoId, setProdutoId] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [observacao, setObservacao] = useState('');
  const [corId, setCorId] = useState('');
  const [itens, setItens] = useState<Array<CreateOrdemItem>>([{ produto_id: '', tipo: 'fabricado', quantidade: 1 }]);
  const [quantidadePossivel, setQuantidadePossivel] = useState<number | null>(null);
  const [gargalo, setGargalo] = useState<string | null>(null);
  const [cores, setCores] = useState<Cor[]>([]);
  const [conferencia, setConferencia] = useState<ConferenciaEstoquePorCorResult | null>(null);
  const [conferenciaLoading, setConferenciaLoading] = useState(false);
  const [modalItensAberta, setModalItensAberta] = useState(false);
  const [ordemItensId, setOrdemItensId] = useState<string | null>(null);
  const [itensDaOrdem, setItensDaOrdem] = useState<OrdemProducaoItem[]>([]);

  const loadOrdens = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const list = await producaoService.listOrdens(token);
      setOrdens(list);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const loadCores = useCallback(async () => {
    if (!token) return;
    try {
      const list = await coresService.listCores(token);
      setCores(list);
    } catch {
      setCores([]);
    }
  }, [token]);

  useEffect(() => {
    loadOrdens();
    loadCores();
  }, [loadOrdens, loadCores]);

  const loadQuantidadePossivel = async () => {
    if (!produtoId || !token) return;
    try {
      const r = await producaoService.getQuantidadePossivel(produtoId, token);
      setQuantidadePossivel(r.quantidade);
      setGargalo(r.insumo_gargalo_codigo ?? null);
    } catch {
      setQuantidadePossivel(null);
      setGargalo(null);
    }
  };

  useEffect(() => {
    loadQuantidadePossivel();
  }, [produtoId, token]);

  const conferirEstoque = useCallback(async () => {
    if (!token || !corId) return;
    setConferenciaLoading(true);
    setConferencia(null);
    try {
      if (modo === 'simples' && produtoId && quantidade) {
        const q = parseFloat(quantidade);
        if (!isNaN(q) && q > 0) {
          const r = await producaoService.conferirEstoquePorCor(token, {
            cor_id: corId,
            produto_fabricado_id: produtoId,
            quantidade: q,
          });
          setConferencia(r);
        }
      } else if (modo === 'itens') {
        const validItens = itens.filter((i) => i.produto_id && i.quantidade > 0);
        if (validItens.length > 0) {
          const r = await producaoService.conferirEstoquePorCor(token, {
            cor_id: corId,
            itens: validItens.map((i) => ({ produto_id: i.produto_id, quantidade: i.quantidade })),
          });
          setConferencia(r);
        }
      }
    } catch {
      setConferencia(null);
    } finally {
      setConferenciaLoading(false);
    }
  }, [token, corId, modo, produtoId, quantidade, itens]);

  useEffect(() => {
    if (corId && (modo === 'simples' ? produtoId && quantidade : itens.some((i) => i.produto_id && i.quantidade > 0))) {
      const t = setTimeout(conferirEstoque, 400);
      return () => clearTimeout(t);
    } else {
      setConferencia(null);
    }
  }, [corId, modo, produtoId, quantidade, itens, conferirEstoque]);

  const abrirModal = () => {
    setProdutoId('');
    setQuantidade('');
    setObservacao('');
    setCorId('');
    setModo('simples');
    setItens([{ produto_id: '', tipo: 'fabricado', quantidade: 1 }]);
    setQuantidadePossivel(null);
    setGargalo(null);
    setConferencia(null);
    setModalAberta(true);
  };

  const addItem = () => {
    setItens((prev) => [...prev, { produto_id: '', tipo: 'fabricado', quantidade: 1 }]);
  };

  const removeItem = (index: number) => {
    setItens((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const updateItem = (index: number, field: keyof CreateOrdemItem, value: string | number) => {
    setItens((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const criarOrdem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (modo === 'simples') {
      if (!produtoId) return;
      const q = parseFloat(quantidade);
      if (isNaN(q) || q <= 0) return;
      try {
        await producaoService.createOrdem(token, {
          produto_fabricado_id: produtoId,
          quantidade: q,
          observacao: observacao.trim() || null,
          cor_id: corId || null,
        });
        setModalAberta(false);
        await loadOrdens();
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Erro ao criar ordem');
      }
    } else {
      const validItens = itens.filter((i) => i.produto_id && i.quantidade > 0);
      const hasFabricado = validItens.some((i) => i.tipo === 'fabricado');
      if (validItens.length === 0 || !hasFabricado) {
        alert('Adicione pelo menos um item tipo Fabricado.');
        return;
      }
      try {
        await producaoService.createOrdem(token, {
          itens: validItens,
          observacao: observacao.trim() || null,
          cor_id: corId || null,
        });
        setModalAberta(false);
        await loadOrdens();
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Erro ao criar ordem');
      }
    }
  };

  const executar = async (id: string) => {
    if (!token) return;
    if (!confirm('Executar esta ordem? Será feita a baixa dos insumos e entrada do fabricado no estoque.')) return;
    try {
      await producaoService.executarOrdem(token, id);
      await loadOrdens();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao executar');
    }
  };

  const abrirModalItens = async (ordemId: string) => {
    setOrdemItensId(ordemId);
    setModalItensAberta(true);
    setItensDaOrdem([]);
    if (!token) return;
    try {
      const list = await producaoService.listOrdensItens(token, ordemId);
      setItensDaOrdem(list);
    } catch {
      setItensDaOrdem([]);
    }
  };

  const colunas = [
    { key: 'data_ordem', label: 'Data', sortable: true, render: (o: OrdemComProduto) => o.data_ordem, sortValue: (o: OrdemComProduto) => o.data_ordem },
    {
      key: 'produto',
      label: 'Produto',
      render: (o: OrdemComProduto) => `${o.produto_codigo ?? ''} - ${o.produto_descricao ?? ''}`,
      sortValue: (o: OrdemComProduto) => o.produto_codigo ?? '',
    },
    { key: 'quantidade', label: 'Qtd', sortable: true, sortValue: (o: OrdemComProduto) => o.quantidade },
    { key: 'cor', label: 'Cor', render: (o: OrdemComProduto) => o.cor_nome ?? '—', sortValue: (o: OrdemComProduto) => o.cor_nome ?? '' },
    { key: 'status', label: 'Status', sortable: true, render: (o: OrdemComProduto) => (o.status === 'concluida' ? 'Concluída' : 'Pendente'), sortValue: (o: OrdemComProduto) => o.status },
    {
      key: 'actions',
      label: 'Ações',
      render: (o: OrdemComProduto) => (
        <div className="flex gap-2 items-center">
          <Button variant="secondary" size="sm" onClick={() => abrirModalItens(o.id)}>Ver itens</Button>
          {o.status === 'pendente' && (
            <Button variant="secondary" size="sm" onClick={() => executar(o.id)}>Executar</Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Ordens de produção</h1>
        <Button onClick={abrirModal}>Nova ordem</Button>
      </div>

      {loading && ordens.length === 0 ? (
        <p className="text-gray-500">Carregando...</p>
      ) : (
        <DataTable
          data={ordens}
          columns={colunas}
          emptyMessage="Nenhuma ordem"
        />
      )}

      <Modal isOpen={modalAberta} onClose={() => setModalAberta(false)} title="Nova ordem de produção">
        <form onSubmit={criarOrdem} className="space-y-4">
          <div className="flex gap-4 border-b pb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={modo === 'simples'} onChange={() => setModo('simples')} />
              Um produto
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={modo === 'itens'} onChange={() => setModo('itens')} />
              Vários itens (fabricado + kits)
            </label>
          </div>

          {modo === 'simples' && (
            <>
              <Select
                label="Produto fabricado *"
                options={[{ value: '', label: '— Selecione —' }, ...fabricados.map((p) => ({ value: p.id, label: `${p.codigo} - ${p.descricao}` }))]}
                value={produtoId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setProdutoId(e.target.value)}
              />
              {quantidadePossivel !== null && (
                <p className="text-sm text-gray-600">
                  Quantidade que dá para construir agora: <strong>{quantidadePossivel}</strong>
                  {gargalo && ` (gargalo: ${gargalo})`}
                </p>
              )}
              <Input label="Quantidade *" type="number" step="0.001" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} required />
            </>
          )}

          {modo === 'itens' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Itens</span>
                <Button type="button" variant="secondary" size="sm" onClick={addItem}>+ Linha</Button>
              </div>
              {itens.map((item, idx) => (
                <div key={idx} className="flex flex-wrap gap-2 items-end border p-2 rounded">
                  <div className="flex-1 min-w-[200px]">
                    <Select
                      label="Produto"
                      options={[{ value: '', label: '— Selecione —' }, ...fabricados.map((p) => ({ value: p.id, label: `${p.codigo} - ${p.descricao}` }))]}
                      value={item.produto_id}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateItem(idx, 'produto_id', e.target.value)}
                    />
                  </div>
                  <div className="w-28">
                    <Select
                      label="Tipo"
                      options={[
                        { value: 'fabricado', label: 'Fabricado' },
                        { value: 'kit', label: 'Kit' },
                      ]}
                      value={item.tipo}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateItem(idx, 'tipo', e.target.value as 'fabricado' | 'kit')}
                    />
                  </div>
                  <div className="w-24">
                    <Input
                      label="Qtd"
                      type="number"
                      min={0.001}
                      step={0.001}
                      value={item.quantidade}
                      onChange={(e) => updateItem(idx, 'quantidade', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <Button type="button" variant="secondary" size="sm" onClick={() => removeItem(idx)} disabled={itens.length <= 1}>Remover</Button>
                </div>
              ))}
            </div>
          )}

          <Select
            label="Cor (chapas)"
            options={[{ value: '', label: '— Nenhuma —' }, ...cores.map((c) => ({ value: c.id, label: c.codigo ? `${c.nome} (${c.codigo})` : c.nome }))]}
            value={corId}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCorId(e.target.value)}
          />

          {conferenciaLoading && <p className="text-sm text-gray-500">Conferindo estoque na cor...</p>}
          {conferencia && !conferenciaLoading && (
            <div className="rounded border p-3 text-sm">
              {conferencia.disponivel_na_cor ? (
                <p className="text-green-700">Estoque suficiente na cor selecionada.</p>
              ) : (
                <>
                  <p className="text-amber-700">Estoque insuficiente na cor selecionada.</p>
                  {conferencia.insumos_faltando.length > 0 && (
                    <ul className="mt-1 list-disc list-inside">
                      {conferencia.insumos_faltando.map((i) => (
                        <li key={i.produto_id}>{i.codigo ?? i.descricao}: necessário {i.saldo_necessario}, na cor: {i.saldo_na_cor}</li>
                      ))}
                    </ul>
                  )}
                  {conferencia.cores_com_estoque.length > 0 && (
                    <p className="mt-2 text-gray-700">Cores com estoque: {conferencia.cores_com_estoque.map((c) => c.nome).join(', ')}</p>
                  )}
                </>
              )}
            </div>
          )}

          <Input label="Observação" value={observacao} onChange={(e) => setObservacao(e.target.value)} />
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={() => setModalAberta(false)}>Cancelar</Button>
            <Button type="submit">Criar ordem</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={modalItensAberta} onClose={() => setModalItensAberta(false)} title="Itens da ordem">
        {itensDaOrdem.length === 0 ? (
          <p className="text-gray-500">Nenhum item cadastrado para esta ordem (ordem simples).</p>
        ) : (
          <ul className="space-y-1">
            {itensDaOrdem.map((i) => (
              <li key={i.id} className="flex justify-between">
                <span>{i.produto_codigo} - {i.produto_descricao ?? ''}</span>
                <span>{i.tipo} × {i.quantidade}</span>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </div>
  );
}
