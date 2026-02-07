import * as XLSX from 'xlsx';

export interface LinhaConferencia {
  produto_id: string;
  codigo: string;
  descricao: string;
  saldo_atual: number;
}

/** Gera planilha XLS para conferência: código, descrição, saldo_atual (editável) */
export function downloadTemplateConferencia(rows: { codigo: string; descricao: string; saldo: number; id: string }[]): void {
  const ws = XLSX.utils.json_to_sheet(
    rows.map((r) => ({
      codigo: r.codigo,
      descricao: r.descricao,
      saldo_atual: r.saldo,
      produto_id: r.id,
    }))
  );
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Conferência');
  XLSX.writeFile(wb, 'conferencia_estoque.xls');
}

/** Lê planilha XLS/XLSX e retorna { produto_id, saldo_atual } para API */
export function parseConferenciaFile(file: File): Promise<LinhaConferencia[]> {
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
        const list: LinhaConferencia[] = [];
        for (const row of rows) {
          const produto_id = String(row.produto_id ?? '').trim();
          const codigo = String(row.codigo ?? row.Código ?? '').trim();
          const descricao = String(row.descricao ?? row.Descrição ?? '').trim();
          const saldo_atual = Number(row.saldo_atual ?? row['Saldo atual'] ?? 0);
          if (!produto_id && !codigo) continue;
          list.push({ produto_id, codigo, descricao, saldo_atual });
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
