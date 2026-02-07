/**
 * Lê TODAS as planilhas da GestaoAtual e gera um JSON completo
 * para análise (LLM ou humana) antes de definir o modelo de insert.
 *
 * Saída: scripts/data-import/gestao-atual-dump.json
 *
 * Execute: node scripts/data-import/dump-gestao-atual.js
 */

import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '../..');
const GESTAO_DIR = path.join(rootDir, 'Novo Sistema/GestaoAtual');
const OUT_PATH = path.join(__dirname, 'gestao-atual-dump.json');

function readSheetRaw(ws) {
  const ref = ws['!ref'];
  if (!ref) return { rows: [] };
  const range = XLSX.utils.decode_range(ref);
  const rows = [];
  for (let R = range.s.r; R <= range.e.r; R++) {
    const row = [];
    for (let C = range.s.c; C <= range.e.c; C++) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      const cell = ws[addr];
      let value = null;
      if (cell) {
        if (cell.t !== undefined && cell.t === 'n' && cell.v != null) value = cell.v;
        else if (cell.w != null) value = cell.w;
        else if (cell.v != null) value = cell.v;
      }
      row.push(value);
    }
    rows.push(row);
  }
  return { rows };
}

function dumpWorkbook(filePath) {
  const wb = XLSX.readFile(filePath, { cellDates: false, cellNF: false });
  const out = { file: path.basename(filePath), sheets: [] };
  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    const { rows } = readSheetRaw(ws);
    out.sheets.push({ name: sheetName, rowCount: rows.length, rows });
  }
  return out;
}

function main() {
  if (!fs.existsSync(GESTAO_DIR)) {
    console.error('Pasta não encontrada:', GESTAO_DIR);
    process.exit(1);
  }

  const files = fs.readdirSync(GESTAO_DIR).filter((f) => f.endsWith('.xlsx'));
  const dump = { generatedAt: new Date().toISOString(), files: [] };

  for (const file of files) {
    const filePath = path.join(GESTAO_DIR, file);
    console.log('Lendo', file, '...');
    dump.files.push(dumpWorkbook(filePath));
  }

  fs.writeFileSync(OUT_PATH, JSON.stringify(dump, null, 2), 'utf-8');
  console.log('Escrito:', OUT_PATH);
}

main();
