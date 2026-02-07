import { useState, useRef, useCallback } from 'react';
import { useProdutos } from '../hooks/useProdutos';
import { useFornecedores } from '../../fornecedores/hooks/useFornecedores';
import { useCategoriasProduto } from '../../categorias-produto/hooks/useCategoriasProduto';
import { useAuth } from '../../auth/hooks/useAuth';
import { ProductForm } from '../components/ProductForm';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { DataTable } from '../../../components/ui/DataTable';
import * as estoqueService from '../services/estoque.service';
import { exportProdutosToXlsx, parseXlsxToProdutos } from '../lib/xlsx-produtos';
import type { ProdutoComSaldo, CreateProdutoRequest, TipoProduto, SaldoPorCor } from '../types/estoque.types';

const TIPO_LABEL: Record<string, string> = { revenda: 'Revenda', insumos: 'Insumos', fabricado: 'Fabricação Própria' };

/** 'all' = todos, null = sem categoria, string = id da categoria */
type FiltroCategoria = 'all' | null | string;
type FiltroTipo = 'all' | TipoProduto;

export function ProductsListPage() {
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>('all');
  const filtroCategoriaState = useState<FiltroCategoria>('all');
  const [filtroCategoria, setFiltroCategoria] = filtroCategoriaState;
  const filtrosApi: { tipo?: TipoProduto; categoria_id?: string | null } | undefined =
    filtroTipo === 'all' && filtroCategoria === 'all'
      ? undefined
      : {
          ...(filtroTipo !== 'all' ? { tipo: filtroTipo } : {}),
          ...(filtroCategoria !== 'all' ? { categoria_id: filtroCategoria } : {}),
        };
  const { token } = useAuth();
  const { produtos, loading, error, createProduto, updateProduto, deleteProduto, importProdutos, fetchProdutos } = useProdutos(true, filtrosApi);
  const { fornecedores } = useFornecedores();
  const { categorias } = useCategoriasProduto();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState<ProdutoComSaldo | undefined>();
  const [deletingProduto, setDeletingProduto] = useState<ProdutoComSaldo | null>(null);
  const [importResult, setImportResult] = useState<{ created: number; errors: string[] } | null>(null);
  const [filterAbaixoMinimo, setFilterAbaixoMinimo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saldosPorCorProduto, setSaldosPorCorProduto] = useState<ProdutoComSaldo | null>(null);
  const [saldosPorCor, setSaldosPorCor] = useState<SaldoPorCor[]>([]);
  const [saldosPorCorLoading, setSaldosPorCorLoading] = useState(false);

  const abrirSaldosPorCor = useCallback(
    async (p: ProdutoComSaldo) => {
      if (!p.controlar_por_cor || !token) return;
      setSaldosPorCorProduto(p);
      setSaldosPorCor([]);
      setSaldosPorCorLoading(true);
      try {
        const list = await estoqueService.getSaldosPorCor(p.id, token);
        setSaldosPorCor(list);
      } catch {
        setSaldosPorCor([]);
      } finally {
        setSaldosPorCorLoading(false);
      }
    },
    [token]
  );

  const categoriaPorId = new Map(categorias.map((c) => [c.id, c.nome]));

  const produtosExibidos = filterAbaixoMinimo
    ? produtos.filter((p) => 'saldo' in p && p.estoque_minimo > 0 && (p as ProdutoComSaldo).saldo <= p.estoque_minimo)
    : produtos;

  const handleCreate = () => {
    setEditingProduto(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (p: ProdutoComSaldo) => {
    setEditingProduto(p);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: CreateProdutoRequest) => {
    if (editingProduto) {
      await updateProduto(editingProduto.id, data);
    } else {
      await createProduto(data);
    }
    setIsModalOpen(false);
    setEditingProduto(undefined);
  };

  const handleDelete = async () => {
    if (deletingProduto) {
      await deleteProduto(deletingProduto.id);
      setDeletingProduto(null);
    }
  };

  const handleExport = () => {
    exportProdutosToXlsx(produtos);
  };

  const handleImportClick = () => {
    setImportResult(null);
    fileInputRef.current?.click();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const items = await parseXlsxToProdutos(file);
      if (items.length === 0) {
        setImportResult({ created: 0, errors: ['Nenhuma linha válida encontrada.'] });
        return;
      }
      const result = await importProdutos(items);
      setImportResult(result);
      await fetchProdutos();
    } catch (err) {
      setImportResult({ created: 0, errors: [err instanceof Error ? err.message : 'Erro ao importar'] });
    }
    e.target.value = '';
  };

  if (loading && produtos.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Carregando produtos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Erro ao carregar produtos: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={handleExport}>
            Exportar XLSX
          </Button>
          <Button variant="secondary" size="sm" onClick={handleImportClick}>
            Importar XLSX
          </Button>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImportFile} />
          <Button onClick={handleCreate}>Novo Produto</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600">Filtro:</span>
          <button
            type="button"
            onClick={() => setFilterAbaixoMinimo(false)}
            className={`px-3 py-1.5 rounded text-sm font-medium ${!filterAbaixoMinimo ? 'bg-brand-gold text-brand-black font-medium' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => setFilterAbaixoMinimo(true)}
            className={`px-3 py-1.5 rounded text-sm font-medium ${filterAbaixoMinimo ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Abaixo do mínimo
          </button>
          <span className="text-sm text-gray-400 mx-1">|</span>
          <span className="text-sm text-gray-600">Tipo:</span>
          <button
            type="button"
            onClick={() => setFiltroTipo('all')}
            className={`px-3 py-1.5 rounded text-sm font-medium ${filtroTipo === 'all' ? 'bg-brand-gold text-brand-black font-medium' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Todos
          </button>
          {(['revenda', 'insumos', 'fabricado'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFiltroTipo(t)}
              className={`px-3 py-1.5 rounded text-sm font-medium ${filtroTipo === t ? 'bg-brand-gold text-brand-black font-medium' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {TIPO_LABEL[t]}
            </button>
          ))}
          <span className="text-sm text-gray-400 mx-1">|</span>
          <span className="text-sm text-gray-600">Categoria:</span>
          <button
            type="button"
            onClick={() => setFiltroCategoria('all')}
            className={`px-3 py-1.5 rounded text-sm font-medium ${filtroCategoria === 'all' ? 'bg-brand-gold text-brand-black font-medium' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Todas
          </button>
          <button
            type="button"
            onClick={() => setFiltroCategoria(null)}
            className={`px-3 py-1.5 rounded text-sm font-medium ${filtroCategoria === null ? 'bg-brand-gold text-brand-black font-medium' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Sem categoria
          </button>
          {categorias.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setFiltroCategoria(c.id)}
              className={`px-3 py-1.5 rounded text-sm font-medium ${filtroCategoria === c.id ? 'bg-brand-gold text-brand-black font-medium' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {c.nome}
            </button>
          ))}
        </div>

      {importResult && (
        <div className={`p-4 rounded ${importResult.errors.length > 0 ? 'bg-amber-50 border border-amber-200' : 'bg-green-50 border border-green-200'}`}>
          <p className="font-medium">Importação: {importResult.created} produto(s) criado(s).</p>
          {importResult.errors.length > 0 && (
            <ul className="mt-2 text-sm list-disc list-inside">
              {importResult.errors.slice(0, 10).map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
              {importResult.errors.length > 10 && <li>... e mais {importResult.errors.length - 10} erros</li>}
            </ul>
          )}
        </div>
      )}

      {produtos.length === 0 && !loading ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">Nenhum produto cadastrado</p>
          <Button onClick={handleCreate}>Criar primeiro produto</Button>
        </div>
      ) : (
        <DataTable
          data={produtosExibidos}
          columns={[
            { key: 'codigo', label: 'Código', sortable: true, filterable: true, sortValue: (p) => p.codigo.toLowerCase() },
            { key: 'descricao', label: 'Descrição', sortable: true, filterable: true, sortValue: (p) => p.descricao.toLowerCase() },
            { key: 'tipo', label: 'Tipo', sortable: true, filterable: true, render: (p) => TIPO_LABEL[p.tipo] ?? p.tipo, sortValue: (p) => p.tipo },
            { key: 'categoria', label: 'Categoria', sortable: true, render: (p) => (p.categoria_id ? categoriaPorId.get(p.categoria_id) ?? '-' : '-'), sortValue: (p) => (p.categoria_id ? categoriaPorId.get(p.categoria_id) ?? '' : '') },
            { key: 'unidade', label: 'Un.', sortable: true, render: (p) => p.unidade, sortValue: (p) => p.unidade },
            {
              key: 'saldo',
              label: 'Saldo',
              sortable: true,
              render: (p) => {
                const saldo = 'saldo' in p ? (p as ProdutoComSaldo).saldo : null;
                const abaixo = p.estoque_minimo > 0 && saldo !== null && saldo <= p.estoque_minimo;
                const texto = p.estoque_maximo != null && saldo !== null ? `${saldo} / ${p.estoque_maximo}` : (saldo != null ? String(saldo) : '-');
                return <span className={abaixo ? 'text-red-600 font-medium' : ''}>{texto}</span>;
              },
              sortValue: (p) => ('saldo' in p ? (p as ProdutoComSaldo).saldo : 0),
            },
            { key: 'preco_venda', label: 'Preço venda', sortable: true, render: (p) => `R$ ${Number(p.preco_venda).toFixed(2)}`, sortValue: (p) => p.preco_venda },
            {
              key: 'actions',
              label: 'Ações',
              sortable: false,
              filterable: false,
              render: (p) => (
                <div className="flex gap-2 flex-wrap">
                  {p.controlar_por_cor && (
                    <Button variant="secondary" size="sm" onClick={() => abrirSaldosPorCor(p)}>Saldos por cor</Button>
                  )}
                  <Button variant="secondary" size="sm" onClick={() => handleEdit(p)}>Editar</Button>
                  <Button variant="danger" size="sm" onClick={() => setDeletingProduto(p)}>Excluir</Button>
                </div>
              ),
            },
          ]}
          searchPlaceholder="Buscar produtos..."
          emptyMessage="Nenhum produto encontrado"
        />
      )}

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingProduto(undefined); }} title={editingProduto ? 'Editar Produto' : 'Novo Produto'}>
        <ProductForm
          produto={editingProduto}
          fornecedores={fornecedores}
          categorias={categorias}
          onSubmit={handleSubmit}
          onCancel={() => { setIsModalOpen(false); setEditingProduto(undefined); }}
        />
      </Modal>

      <Modal isOpen={!!saldosPorCorProduto} onClose={() => setSaldosPorCorProduto(null)} title={saldosPorCorProduto ? `Saldos por cor: ${saldosPorCorProduto.codigo}` : 'Saldos por cor'}>
        {saldosPorCorLoading ? (
          <p className="text-gray-500">Carregando...</p>
        ) : saldosPorCor.length === 0 ? (
          <p className="text-gray-500">Nenhum saldo por cor para este produto.</p>
        ) : (
          <ul className="space-y-1">
            {saldosPorCor.map((s) => (
              <li key={s.cor_id} className="flex justify-between">
                <span>{s.cor_nome}</span>
                <span className="font-medium">{s.quantidade}</span>
              </li>
            ))}
          </ul>
        )}
      </Modal>

      <Modal isOpen={!!deletingProduto} onClose={() => setDeletingProduto(null)} title="Confirmar exclusão">
        <div className="space-y-4">
          <p>
            Tem certeza que deseja excluir o produto <strong>{deletingProduto?.codigo}</strong> – {deletingProduto?.descricao}?
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setDeletingProduto(null)}>Cancelar</Button>
            <Button variant="danger" onClick={handleDelete}>Excluir</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
