import * as XLSX from 'xlsx';
import type { ImportExcelRow } from '../services/compras.service';

/**
 * Encontra a linha de cabeçalho que contém COD, QUANTIDADE, DESCRIÇÃO (ou equivalentes).
 * Retorna o índice da linha e os índices das colunas.
 */
function findHeaderRow(sheet: XLSX.WorkSheet): { rowIndex: number; cols: { cod: number; qtd: number; desc: number; valorUnit: number; precoRevenda: number } } | null {
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
  for (let R = 0; R <= Math.min(range.e.r, 15); R++) {
    const row: string[] = [];
    for (let C = 0; C <= Math.min(range.e.c, 10); C++) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      const cell = sheet[addr];
      const val = cell && cell.v != null ? String(cell.v).toLowerCase().trim() : '';
      row.push(val);
    }
    const codIdx = row.findIndex((c) => c === 'cod' || c === 'código' || c === 'codigo');
    const qtdIdx = row.findIndex((c) => c.includes('quantidade') || c === 'qtd');
    const descIdx = row.findIndex((c) => c.includes('descri') || c === 'descrição' || c === 'descricao' || c === 'produto');
    const valorUnitIdx = row.findIndex((c) => c.includes('valor unit') || c.includes('valor unitário') || c === 'vl unit');
    const precoRevendaIdx = row.findIndex((c) => c.includes('preço revenda') || c.includes('preco revenda') || c.includes('revenda'));
    if (qtdIdx >= 0 && descIdx >= 0) {
      return {
        rowIndex: R,
        cols: {
          cod: codIdx >= 0 ? codIdx : -1,
          qtd: qtdIdx,
          desc: descIdx,
          valorUnit: valorUnitIdx >= 0 ? valorUnitIdx : 3,
          precoRevenda: precoRevendaIdx >= 0 ? precoRevendaIdx : 5,
        },
      };
    }
  }
  return null;
}

/**
 * Converte planilha Excel (formato REVENDA COMPRA com COD, QUANTIDADE, DESCRIÇÃO, VALOR UNIT., PREÇO REVENDA)
 * em lista de linhas para importação. Usa a primeira aba ou a que tiver o cabeçalho.
 */
export function parsePlanilhaCompras(file: File): Promise<ImportExcelRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data || !(data instanceof ArrayBuffer)) {
          reject(new Error('Falha ao ler o arquivo'));
          return;
        }
        const wb = XLSX.read(data, { type: 'array' });
        const sheetName = wb.SheetNames[0];
        const sheet = wb.Sheets[sheetName];
        if (!sheet || !sheet['!ref']) {
          reject(new Error('Planilha vazia ou inválida'));
          return;
        }
        const header = findHeaderRow(sheet);
        if (!header) {
          reject(new Error('Cabeçalho não encontrado. Use colunas: COD, QUANTIDADE, DESCRIÇÃO, VALOR UNIT., PREÇO REVENDA'));
          return;
        }
        const range = XLSX.utils.decode_range(sheet['!ref']);
        const rows: ImportExcelRow[] = [];
        const { rowIndex, cols } = header;

        for (let R = rowIndex + 1; R <= range.e.r; R++) {
          const get = (c: number): string => {
            if (c < 0) return '';
            const addr = XLSX.utils.encode_cell({ r: R, c });
            const cell = sheet[addr];
            return cell && cell.v != null ? String(cell.v).trim() : '';
          };
          const getNum = (c: number): number => {
            if (c < 0) return 0;
            const addr = XLSX.utils.encode_cell({ r: R, c });
            const cell = sheet[addr];
            if (!cell) return 0;
            const v = cell.v;
            if (typeof v === 'number' && !Number.isNaN(v)) return v;
            if (typeof v === 'string') return parseFloat(v.replace(',', '.')) || 0;
            return 0;
          };

          const descricao = get(cols.desc);
          const quantidade = getNum(cols.qtd);
          if (!descricao || quantidade <= 0) continue;

          const valorUnit = getNum(cols.valorUnit);
          const precoRevenda = getNum(cols.precoRevenda);
          const codigo = cols.cod >= 0 ? get(cols.cod) : undefined;

          rows.push({
            codigo: codigo || undefined,
            descricao,
            quantidade,
            valor_unitario: valorUnit >= 0 ? valorUnit : 0,
            preco_revenda: precoRevenda > 0 ? precoRevenda : undefined,
          });
        }

        if (rows.length === 0) {
          reject(new Error('Nenhuma linha válida encontrada (descrição e quantidade > 0)'));
          return;
        }
        resolve(rows);
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Erro ao ler planilha'));
      }
    };
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo'));
    reader.readAsArrayBuffer(file);
  });
}
