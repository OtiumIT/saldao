import { FormEvent, useState, useEffect, useCallback } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Modal } from '../../../components/ui/Modal';
import { useProdutos } from '../../estoque/hooks/useProdutos';
import * as estoqueService from '../../estoque/services/estoque.service';
import { ProductForm } from '../../estoque/components/ProductForm';
import { useAuth } from '../../auth/hooks/useAuth';
import { useFornecedores } from '../hooks/useFornecedores';
import { useCategoriasProduto } from '../../categorias-produto/hooks/useCategoriasProduto';
import type { Fornecedor, CreateFornecedorRequest, TipoFornecedor } from '../types/suppliers.types';
import type { CreateProdutoRequest } from '../../estoque/types/estoque.types';
import type { ProdutoComSaldo } from '../../estoque/types/estoque.types';

const TIPO_OPTIONS: { value: '' | TipoFornecedor; label: string }[] = [
  { value: '', label: '— Selecione —' },
  { value: 'insumos', label: 'Insumos' },
  { value: 'revenda', label: 'Revenda' },
];

interface SupplierFormProps {
  fornecedor?: Fornecedor;
  onSubmit: (data: CreateFornecedorRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function SupplierForm({ fornecedor, onSubmit, onCancel, loading = false }: SupplierFormProps) {
  const [nome, setNome] = useState('');
  const [fone, setFone] = useState('');
  const [email, setEmail] = useState('');
  const [contato, setContato] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [tipo, setTipo] = useState<'' | TipoFornecedor>('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [addProdutoId, setAddProdutoId] = useState('');
  const [linkingProduct, setLinkingProduct] = useState(false);

  const { token } = useAuth();
  const { fornecedores } = useFornecedores();
  const { categorias } = useCategoriasProduto();
  const { produtos: produtosDoFornecedor, fetchProdutos: fetchProdutosFornecedor, updateProduto, createProduto } = useProdutos(
    true,
    fornecedor?.id ? { fornecedor_id: fornecedor.id } : undefined
  );
  const { produtos: produtosDoTipo } = useProdutos(
    true,
    fornecedor?.tipo ? { tipo: fornecedor.tipo } : undefined
  );

  const produtosParaAdicionar = fornecedor?.id && fornecedor?.tipo
    ? (produtosDoTipo as ProdutoComSaldo[]).filter((p) => !(produtosDoFornecedor as ProdutoComSaldo[]).some((x) => x.id === p.id))
    : [];

  const handleRemoverProduto = useCallback(
    async (produtoId: string) => {
      if (!fornecedor?.id || !token) return;
      setLinkingProduct(true);
      try {
        const prod = await estoqueService.getProduto(produtoId, token);
        const atuais = prod.fornecedores_ids ?? (prod.fornecedor_principal_id ? [prod.fornecedor_principal_id] : []);
        await updateProduto(produtoId, { fornecedores_ids: atuais.filter((id) => id !== fornecedor.id) });
        await fetchProdutosFornecedor();
      } finally {
        setLinkingProduct(false);
      }
    },
    [fornecedor?.id, token, updateProduto, fetchProdutosFornecedor]
  );

  const handleAdicionarProduto = useCallback(async () => {
    if (!addProdutoId || !fornecedor?.id || !token) return;
    setLinkingProduct(true);
    try {
      const prod = await estoqueService.getProduto(addProdutoId, token);
      const atuais = prod.fornecedores_ids ?? (prod.fornecedor_principal_id ? [prod.fornecedor_principal_id] : []);
      if (atuais.includes(fornecedor.id)) return;
      await updateProduto(addProdutoId, { fornecedores_ids: [...atuais, fornecedor.id] });
      setAddProdutoId('');
      await fetchProdutosFornecedor();
    } finally {
      setLinkingProduct(false);
    }
  }, [addProdutoId, fornecedor?.id, token, updateProduto, fetchProdutosFornecedor]);

  const handleCriarProduto = useCallback(
    async (data: CreateProdutoRequest) => {
      await createProduto(data);
      setShowNewProductModal(false);
      await fetchProdutosFornecedor();
    },
    [createProduto, fetchProdutosFornecedor]
  );

  useEffect(() => {
    if (fornecedor) {
      setNome(fornecedor.nome);
      setFone(fornecedor.fone ?? '');
      setEmail(fornecedor.email ?? '');
      setContato(fornecedor.contato ?? '');
      setObservacoes(fornecedor.observacoes ?? '');
      setTipo(fornecedor.tipo ?? '');
    } else {
      setNome('');
      setFone('');
      setEmail('');
      setContato('');
      setObservacoes('');
      setTipo('');
    }
  }, [fornecedor]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!nome.trim()) {
      setError('Nome é obrigatório');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        nome: nome.trim(),
        fone: fone.trim() || undefined,
        email: email.trim() || undefined,
        contato: contato.trim() || undefined,
        observacoes: observacoes.trim() || undefined,
        tipo: tipo || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = loading || submitting;

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>
      )}
      <Input label="Nome *" value={nome} onChange={(e) => setNome(e.target.value)} required disabled={isLoading} />
      <Select
        label="Tipo (insumos ou revenda)"
        options={TIPO_OPTIONS}
        value={tipo}
        onChange={(e) => setTipo(e.target.value as '' | TipoFornecedor)}
        disabled={isLoading}
      />
      <Input label="Telefone" value={fone} onChange={(e) => setFone(e.target.value)} disabled={isLoading} />
      <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
      <Input label="Contato" value={contato} onChange={(e) => setContato(e.target.value)} disabled={isLoading} />
      <Input label="Observações" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} disabled={isLoading} />

      {fornecedor?.id && (
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">Produtos que este fornecedor vende</label>
            <div className="flex gap-2">
              <select
                value={addProdutoId}
                onChange={(e) => setAddProdutoId(e.target.value)}
                disabled={linkingProduct || isLoading}
                className="rounded border border-gray-300 px-2 py-1.5 text-sm"
              >
                <option value="">— Adicionar produto —</option>
                {produtosParaAdicionar.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.codigo} – {p.descricao}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAdicionarProduto}
                disabled={!addProdutoId || linkingProduct || isLoading}
              >
                {linkingProduct ? '...' : 'Adicionar'}
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => setShowNewProductModal(true)} disabled={isLoading}>
                Cadastrar novo produto
              </Button>
            </div>
          </div>
          <ul className="space-y-1 max-h-40 overflow-y-auto">
            {(produtosDoFornecedor as ProdutoComSaldo[]).map((p) => (
              <li key={p.id} className="flex justify-between items-center gap-2 py-1 border-b border-gray-100 text-sm">
                <span className="truncate">{p.codigo} – {p.descricao}</span>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => handleRemoverProduto(p.id)}
                  disabled={linkingProduct || isLoading}
                >
                  Remover
                </Button>
              </li>
            ))}
          </ul>
          {produtosDoFornecedor.length === 0 && (
            <p className="text-sm text-gray-500 py-2">Nenhum produto vinculado. Adicione da lista ou cadastre um novo.</p>
          )}
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>Cancelar</Button>
        <Button type="submit" disabled={isLoading}>{isLoading ? 'Salvando...' : fornecedor ? 'Atualizar' : 'Criar'}</Button>
      </div>
    </form>

    {showNewProductModal && (
      <Modal isOpen={true} onClose={() => setShowNewProductModal(false)} title="Cadastrar novo produto">
        <ProductForm
          fornecedores={fornecedores}
          categorias={categorias}
          initialFornecedoresIds={fornecedor?.id ? [fornecedor.id] : undefined}
          initialTipo={fornecedor?.tipo ?? undefined}
          onSubmit={handleCriarProduto}
          onCancel={() => setShowNewProductModal(false)}
        />
      </Modal>
    )}
    </>
  );
}
