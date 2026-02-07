import { useState, useRef, useCallback } from 'react';
import { useProdutos } from '../hooks/useProdutos';
import { useMovimentacoes } from '../hooks/useMovimentacoes';
import { useCategoriasProduto } from '../../categorias-produto/hooks/useCategoriasProduto';
import { Button } from '../../../components/ui/Button';
import { downloadTemplateConferencia, parseConferenciaFile } from '../lib/xlsx-conferencia';
import { DataTable } from '../../../components/ui/DataTable';
import type { ProdutoComSaldo, TipoProduto } from '../types/estoque.types';
import type { FiltrosProduto } from '../services/estoque.service';

const TIPO_LABEL: Record<TipoProduto, string> = { revenda: 'Revenda', insumos: 'Insumo', fabricado: 'Fábrica' };

/** 'all' = todos, null = sem categoria, string = id da categoria */
type FiltroCategoria = 'all' | null | string;

export function ConferenciaEstoquePage() {
  const [filtroTipo, setFiltroTipo] = useState<TipoProduto | 'all'>('all');
  const [filtroCategoria, setFiltroCategoria] = useState<FiltroCategoria>('all');
  const filtrosApi: FiltrosProduto | undefined =
    filtroTipo === 'all' && filtroCategoria === 'all'
      ? undefined
      : {
          ...(filtroTipo !== 'all' ? { tipo: filtroTipo } : {}),
          ...(filtroCategoria !== 'all' ? { categoria_id: filtroCategoria } : {}),
        };
  const { produtos, loading, error, fetchProdutos } = useProdutos(true, filtrosApi);
  const { categorias } = useCategoriasProduto();
  const { conferenciaLote, criarAjuste } = useMovimentacoes();
  const [resultado, setResultado] = useState<{ processados: number; erros: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  /** Valores digitados nos inputs de saldo (antes de salvar) */
  const [localSaldos, setLocalSaldos] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const totalUnidades = produtos.reduce((acc, p) => acc + p.saldo, 0);
  const categoriaPorId = new Map(categorias.map((c) => [c.id, c.nome]));

  const handleBaixar = () => {
    const rows = produtos.map((p) => ({ codigo: p.codigo, descricao: p.descricao, saldo: p.saldo, id: p.id }));
    downloadTemplateConferencia(rows);
  };

  const handleImportClick = () => {
    setResultado(null);
    fileInputRef.current?.click();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const linhas = await parseConferenciaFile(file);
      const byId = new Map(produtos.map((p) => [p.id, p]));
      const byCodigo = new Map(produtos.map((p) => [p.codigo.toLowerCase(), p]));
      const itens: Array<{ produto_id: string; saldo_atual: number }> = [];
      for (const lin of linhas) {
        let id = lin.produto_id;
        if (!id && lin.codigo) {
          const p = byCodigo.get(lin.codigo.toLowerCase());
          id = p?.id ?? '';
        }
        if (id && byId.has(id)) itens.push({ produto_id: id, saldo_atual: Math.round(Number(lin.saldo_atual)) });
      }
      if (itens.length === 0) {
        setResultado({ processados: 0, erros: ['Nenhuma linha válida (produto_id ou código não encontrado).'] });
        return;
      }
      const res = await conferenciaLote(itens);
      setResultado(res);
      await fetchProdutos();
    } catch (err) {
      setResultado({ processados: 0, erros: [err instanceof Error ? err.message : 'Erro ao importar'] });
    }
    e.target.value = '';
  };

  const getSaldoValue = useCallback((p: ProdutoComSaldo) => localSaldos[p.id] ?? String(p.saldo), [localSaldos]);

  const saveEdit = useCallback(
    async (p: ProdutoComSaldo) => {
      const valueStr = localSaldos[p.id] ?? String(p.saldo);
      const parsed = parseInt(valueStr.replace(/\s/g, '').replace(',', '.'), 10);
      if (Number.isNaN(parsed) || parsed < 0) return;
      const diff = Math.round(parsed - p.saldo);
      if (diff === 0) return;
      setSavingId(p.id);
      try {
        await criarAjuste(p.id, diff, 'Conferência rápida');
        await fetchProdutos();
        setLocalSaldos((prev) => {
          const next = { ...prev };
          delete next[p.id];
          return next;
        });
      } catch {
        // erro já tratado no hook
      } finally {
        setSavingId(null);
      }
    },
    [localSaldos, criarAjuste, fetchProdutos]
  );

  const handleSaldoKeyDown = (e: React.KeyboardEvent, p: ProdutoComSaldo) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit(p);
    }
  };

  if (loading && produtos.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Erro: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Conferência de estoque</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {produtos.length} produto(s) · {totalUnidades} unidade(s) no total
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handleBaixar}>
            Baixar planilha (XLS)
          </Button>
          <Button variant="secondary" size="sm" onClick={handleImportClick}>
            Importar planilha
          </Button>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImportFile} />
        </div>
      </div>

      {resultado && (
        <div className={`p-4 rounded ${resultado.erros.length > 0 ? 'bg-amber-50 border border-amber-200' : 'bg-green-50 border border-green-200'}`}>
          <p className="font-medium">Conferência: {resultado.processados} ajuste(s) aplicado(s).</p>
          {resultado.erros.length > 0 && (
            <ul className="mt-2 text-sm list-disc list-inside">
              {resultado.erros.slice(0, 10).map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-4 sm:gap-6 items-center">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-gray-600">Tipo</span>
          {(['all', 'fabricado', 'revenda', 'insumos'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFiltroTipo(t)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filtroTipo === t ? 'bg-brand-gold text-brand-black' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {t === 'all' ? 'Todos' : TIPO_LABEL[t]}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <label htmlFor="filtro-categoria" className="text-sm font-medium text-gray-600 shrink-0">
            Categoria
          </label>
          <select
            id="filtro-categoria"
            value={filtroCategoria === null ? '__null__' : filtroCategoria}
            onChange={(e) => {
              const v = e.target.value;
              setFiltroCategoria(v === '__null__' ? null : v === 'all' ? 'all' : v);
            }}
            className="min-h-[40px] px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-brand-gold focus:border-brand-gold min-w-[160px] max-w-full"
          >
            <option value="all">Todas</option>
            <option value="__null__">Sem categoria</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-gray-600 text-sm">
        Altere o saldo no campo e pressione <strong>Enter</strong> ou clique em <strong>Salvar</strong>. Ou use a planilha para ajustes em lote.
      </p>

      <DataTable
        data={produtos}
        mobileTitleColumnKeys={['codigo', 'descricao']}
        columns={[
          { key: 'codigo', label: 'Código', sortable: true, sortValue: (p: ProdutoComSaldo) => p.codigo },
          { key: 'descricao', label: 'Descrição', sortable: true, sortValue: (p: ProdutoComSaldo) => p.descricao },
          { key: 'tipo', label: 'Tipo', sortable: true, render: (p: ProdutoComSaldo) => TIPO_LABEL[p.tipo], sortValue: (p: ProdutoComSaldo) => p.tipo },
          { key: 'categoria', label: 'Categoria', sortable: true, render: (p: ProdutoComSaldo) => (p.categoria_id ? categoriaPorId.get(p.categoria_id) ?? '-' : '-'), sortValue: (p: ProdutoComSaldo) => (p.categoria_id ? categoriaPorId.get(p.categoria_id) ?? '' : '') },
          {
            key: 'saldo',
            label: 'Saldo atual',
            sortable: true,
            render: (p: ProdutoComSaldo) => {
              const isSaving = savingId === p.id;
              const value = getSaldoValue(p);
              const abaixoMin = p.estoque_minimo > 0 && p.saldo <= p.estoque_minimo;
              return (
                <div className="flex items-center gap-1 flex-wrap" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={value}
                    onChange={(e) => setLocalSaldos((prev) => ({ ...prev, [p.id]: e.target.value }))}
                    onKeyDown={(e) => handleSaldoKeyDown(e, p)}
                    onBlur={() => saveEdit(p)}
                    className={`w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${abaixoMin ? 'text-red-600 font-medium' : ''}`}
                    aria-label="Saldo atual"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => saveEdit(p)}
                    disabled={isSaving}
                  >
                    {isSaving ? '...' : 'Salvar'}
                  </Button>
                </div>
              );
            },
            sortValue: (p: ProdutoComSaldo) => p.saldo,
          },
          { key: 'estoque_minimo', label: 'Mínimo', sortable: true, render: (p: ProdutoComSaldo) => p.estoque_minimo, sortValue: (p: ProdutoComSaldo) => p.estoque_minimo },
        ]}
        searchPlaceholder="Buscar produto..."
        emptyMessage="Nenhum produto"
      />
    </div>
  );
}
