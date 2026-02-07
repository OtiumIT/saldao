import * as XLSX from 'xlsx';
import type { CreateProdutoRequest, TipoProduto } from '../types/estoque.types';

const TIPOS_VALIDOS: TipoProduto[] = ['revenda', 'insumos', 'fabricado'];

export function exportProdutosToXlsx(produtos: Array<{ codigo: string; descricao: string; unidade?: string; tipo: string; preco_compra?: number; preco_venda?: number; estoque_minimo?: number; estoque_maximo?: number | null }>): void {
  const ws = XLSX.utils.json_to_sheet(
    produtos.map((p) => ({
      codigo: p.codigo,
      descricao: p.descricao,
      unidade: p.unidade ?? 'UN',
      tipo: p.tipo,
      preco_compra: p.preco_compra ?? 0,
      preco_venda: p.preco_venda ?? 0,
      estoque_minimo: p.estoque_minimo ?? 0,
      estoque_maximo: p.estoque_maximo ?? '',
    }))
  );
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Produtos');
  XLSX.writeFile(wb, 'produtos.xlsx');
}

export function parseXlsxToProdutos(file: File): Promise<CreateProdutoRequest[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error('Arquivo vazio'));
          return;
        }
        const wb = XLSX.read(data, { type: 'binary' });
        const first = wb.SheetNames[0];
        if (!first) {
          reject(new Error('Planilha vazia'));
          return;
        }
        const ws = wb.Sheets[first];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);
        const list: CreateProdutoRequest[] = [];
        for (const row of rows) {
          const codigo = String(row.codigo ?? row.Código ?? '').trim();
          const descricao = String(row.descricao ?? row.Descrição ?? '').trim();
          if (!codigo || !descricao) continue;
          const tipoRaw = String(row.tipo ?? row.Tipo ?? 'revenda').toLowerCase();
          const tipo: TipoProduto = TIPOS_VALIDOS.includes(tipoRaw as TipoProduto) ? (tipoRaw as TipoProduto) : 'revenda';
          list.push({
            codigo,
            descricao,
            unidade: String(row.unidade ?? row.Unidade ?? 'UN').trim() || 'UN',
            tipo,
            preco_compra: Number(row.preco_compra ?? row['Preço compra'] ?? 0) || 0,
            preco_venda: Number(row.preco_venda ?? row['Preço venda'] ?? 0) || 0,
            estoque_minimo: Number(row.estoque_minimo ?? row['Estoque mínimo'] ?? 0) || 0,
            estoque_maximo: row.estoque_maximo !== undefined && row.estoque_maximo !== '' ? Number(row.estoque_maximo) : null,
          });
        }
        resolve(list);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsBinaryString(file);
  });
}
