/**
 * Analisa as planilhas da pasta Novo Sistema/GestaoAtual/
 * para mapear colunas e preparar importação (fornecedores, produtos, estoque).
 *
 * Execute: node scripts/data-import/analyze-gestao-atual.js
 */

import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GESTAO_DIR = path.join(__dirname, '../../Novo Sistema/GestaoAtual');

if (!fs.existsSync(GESTAO_DIR)) {
  console.error('❌ Pasta não encontrada:', GESTAO_DIR);
  process.exit(1);
}

const files = fs.readdirSync(GESTAO_DIR).filter((f) => f.endsWith('.xlsx'));
console.log('📊 Análise Gestao Atual\n');
console.log('Arquivos .xlsx encontrados:', files.length, '\n');

for (const file of files) {
  const filePath = path.join(GESTAO_DIR, file);
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📄', file);
  console.log('═══════════════════════════════════════════════════════════');

  const workbook = XLSX.readFile(filePath);
  const sheetNames = workbook.SheetNames;

  for (const sheetName of sheetNames) {
    const ws = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(ws, { defval: null, raw: false });
    const rows = data.length;

    if (rows === 0) {
      console.log(`\n  Aba: "${sheetName}" → vazia\n`);
      continue;
    }

    const columns = Object.keys(data[0]);
    console.log(`\n  Aba: "${sheetName}" (${rows} linhas)`);
    console.log('  Colunas:', columns.join(' | '));

    // Amostra das primeiras 3 linhas
    console.log('\n  Amostra (3 primeiras linhas):');
    for (let i = 0; i < Math.min(3, data.length); i++) {
      const row = data[i];
      const preview = columns
        .map((col) => {
          const v = row[col];
          if (v == null || v === '') return '-';
          const s = String(v).slice(0, 25);
          return s + (String(v).length > 25 ? '…' : '');
        })
        .join(' | ');
      console.log(`    ${i + 1}. ${preview}`);
    }
    console.log('');
  }
}

console.log('✅ Análise concluída. Use estas colunas no script de importação.');
