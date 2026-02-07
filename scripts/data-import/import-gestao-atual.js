/**
 * Importa dados da Gestão Atual para o banco:
 * 1. Lê todo o conteúdo das planilhas (dump JSON).
 * 2. Aplica o modelo de insert (MODELO_INSERT_GESTAO_ATUAL.md).
 * 3. Insere: fornecedores → produtos → movimentações de estoque iniciais.
 *
 * Pré-requisitos:
 * - Gerar dump: node scripts/data-import/dump-gestao-atual.js
 * - DATABASE_URL no .env na raiz
 *
 * Uso:
 *   node scripts/data-import/import-gestao-atual.js          # importa no banco
 *   node scripts/data-import/import-gestao-atual.js --dry-run # só processa e lista
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '../..');
dotenv.config({ path: path.join(rootDir, '.env') });
if (!process.env.DATABASE_URL) dotenv.config({ path: path.join(rootDir, 'api', '.env') });

const DUMP_PATH = path.join(__dirname, 'gestao-atual-dump.json');
const { Pool } = pg;

// ---------------------------------------------------------------------------
// Modelo: normalização e helpers
// ---------------------------------------------------------------------------

function normalizarFornecedor(abaName) {
  let n = String(abaName || '').trim();
  n = n.replace(/^COMPRA\s+/i, '').replace(/\s*2026\s*$/i, '').trim();
  return n || 'Fornecedor';
}

function slug(s) {
  return String(s).toUpperCase().replace(/\s+/g, '-').replace(/[^A-Z0-9-]/g, '').slice(0, 25);
}

function descricaoNormalizada(s) {
  return String(s || '').trim().toLowerCase();
}

function isObservacao(str) {
  if (!str || typeof str !== 'string') return false;
  const s = str.trim();
  return /^COMPRA\s+DIA|^PAGAMENTO|^PEDIDO|^ENTREGA\s+DIA|^CARTAO|^SANTANDER|^PIX|boleto|^porto velho\s*-|^COMPRAS PORTO/i.test(s);
}

function isCabeçalhoLinha(row, headerTokens) {
  const col0 = String(row[0] ?? '').trim().toUpperCase();
  const col1 = String(row[1] ?? '').trim().toUpperCase();
  const col2 = String(row[2] ?? '').trim().toUpperCase();
  return col0 === 'COD' || (col1 === 'QUANTIDADE' && col2 === 'DESCRIÇÃO') || (col1 === 'QUANTIDADE' && col2 === 'DESCRICAO');
}

function num(v) {
  if (v == null || v === '') return null;
  if (typeof v === 'number' && !Number.isNaN(v)) return v;
  const n = parseFloat(String(v).replace(/[^\d.,-]/g, '').replace(',', '.'));
  return Number.isNaN(n) ? null : n;
}

// ---------------------------------------------------------------------------
// Leitura do dump e aplicação do modelo
// ---------------------------------------------------------------------------

function loadDump() {
  if (!fs.existsSync(DUMP_PATH)) {
    throw new Error(`Dump não encontrado: ${DUMP_PATH}. Execute antes: node scripts/data-import/dump-gestao-atual.js`);
  }
  return JSON.parse(fs.readFileSync(DUMP_PATH, 'utf-8'));
}

function extrairInsumos(dump) {
  const file = dump.files.find((f) => f.file === 'COMPRAS FABRICAÇAO 2026.xlsx');
  if (!file) return { fornecedores: [], itens: [] };
  const fornecedores = [];
  const itens = [];
  for (const sheet of file.sheets) {
    const nomeFornecedor = normalizarFornecedor(sheet.name);
    fornecedores.push(nomeFornecedor);
    const rows = sheet.rows || [];
    const headerRowIndex = 2; // linha 2 (0-based) = COD, QUANTIDADE, DESCRIÇÃO...
    let seq = 0;
    for (let i = headerRowIndex + 1; i < rows.length; i++) {
      const row = rows[i] || [];
      const col0 = row[0];
      const descricao = row[2] != null ? String(row[2]).trim() : '';
      if (!descricao) continue;
      if (isObservacao(String(col0))) continue;
      if (isCabeçalhoLinha(row, ['COD', 'QUANTIDADE', 'DESCRIÇÃO'])) continue;
      seq++;
      const cod = row[0] != null ? String(row[0]).trim() : '';
      const codigo = cod && cod !== 'COD' && !isObservacao(cod) ? cod : `INS-${slug(nomeFornecedor)}-${seq}`;
      itens.push({
        tipo: 'insumos',
        fornecedor: nomeFornecedor,
        codigo,
        descricao,
        preco_compra: num(row[3]) ?? 0,
        preco_venda: 0,
        quantidade_inicial: num(row[1]),
      });
    }
  }
  return { fornecedores, itens };
}

function extrairRevendaControle(dump) {
  const file = dump.files.find((f) => f.file === 'CONTROLE REVENDA E ESTOQUE 2026.xlsx');
  if (!file) return { fornecedores: [], itens: [] };
  const fornecedores = [];
  const itens = [];
  for (const sheet of file.sheets) {
    const nomeFornecedor = normalizarFornecedor(sheet.name);
    fornecedores.push(nomeFornecedor);
    const rows = sheet.rows || [];
    const headerRowIndex = 2; // col 1=QUANTIDADE, 2=DESCRIÇÃO, 3=VALOR UNIT., 5=PREÇO REVENDA, 9=ESTOQUE
    let seq = 0;
    for (let i = headerRowIndex + 1; i < rows.length; i++) {
      const row = rows[i] || [];
      const descricao = row[2] != null ? String(row[2]).trim() : '';
      if (!descricao) continue;
      const valorTotal = num(row[4]);
      const estoque = num(row[9]);
      if (valorTotal === 0 && estoque === 0 && !row[1] && !row[3]) continue; // linha de totais
      seq++;
      itens.push({
        tipo: 'revenda',
        fornecedor: nomeFornecedor,
        codigo: `REV-${slug(nomeFornecedor)}-${seq}`,
        descricao,
        preco_compra: num(row[3]) ?? 0,
        preco_venda: num(row[5]) ?? 0,
        quantidade_inicial: estoque ?? 0,
      });
    }
  }
  return { fornecedores, itens };
}

function extrairRevendaCompra(dump) {
  const file = dump.files.find((f) => f.file === 'REVENDA ( COMPRA) 2026.xlsx');
  if (!file) return { fornecedores: [], itens: [] };
  const fornecedores = [];
  const itens = [];
  for (const sheet of file.sheets) {
    const nomeFornecedor = normalizarFornecedor(sheet.name);
    fornecedores.push(nomeFornecedor);
    const rows = sheet.rows || [];
    let seq = 0;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i] || [];
      if (isCabeçalhoLinha(row)) continue; // pular linha de cabeçalho
      const descricao = row[2] != null ? String(row[2]).trim() : '';
      if (!descricao) continue;
      if (isObservacao(descricao)) continue;
      if (isObservacao(String(row[0] || ''))) continue;
      const valorUnit = num(row[3]);
      if (valorUnit == null || valorUnit === 0) continue; // linha sem preço
      seq++;
      itens.push({
        tipo: 'revenda',
        fornecedor: nomeFornecedor,
        codigo: `REV2-${slug(nomeFornecedor)}-${seq}`,
        descricao,
        preco_compra: valorUnit,
        preco_venda: num(row[5]) ?? 0,
        quantidade_inicial: 0,
      });
    }
  }
  return { fornecedores, itens };
}

function aplicarModelo(dump) {
  const insumos = extrairInsumos(dump);
  const revendaCtrl = extrairRevendaControle(dump);
  const revendaCompra = extrairRevendaCompra(dump);

  const todosFornecedores = [...new Set([...insumos.fornecedores, ...revendaCtrl.fornecedores, ...revendaCompra.fornecedores])];
  const todosItens = [...insumos.itens, ...revendaCtrl.itens, ...revendaCompra.itens];

  // Deduplicar produtos por (fornecedor, descricao_normalizada)
  const seen = new Set();
  const itensUnicos = [];
  for (const item of todosItens) {
    const key = `${item.fornecedor}|${descricaoNormalizada(item.descricao)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    itensUnicos.push(item);
  }

  // Garantir codigo único (evitar REV-HIPER-1 duplicado em dois arquivos)
  const codigosUsados = new Set();
  for (const item of itensUnicos) {
    let cod = item.codigo;
    if (codigosUsados.has(cod)) {
      let suffix = 1;
      while (codigosUsados.has(`${cod}-${suffix}`)) suffix++;
      cod = `${cod}-${suffix}`;
    }
    codigosUsados.add(cod);
    item.codigo = cod;
  }

  return { fornecedores: todosFornecedores, itens: itensUnicos };
}

// ---------------------------------------------------------------------------
// Inserção no banco
// ---------------------------------------------------------------------------

const DRY_RUN = process.argv.includes('--dry-run');

async function run() {
  if (!fs.existsSync(DUMP_PATH)) {
    console.error('❌ Dump não encontrado. Execute antes: node scripts/data-import/dump-gestao-atual.js');
    process.exit(1);
  }

  const dump = loadDump();
  const { fornecedores: todosFornecedores, itens: itensUnicos } = aplicarModelo(dump);

  console.log('📊 Modelo aplicado ao dump:');
  console.log('   Fornecedores únicos:', todosFornecedores.length);
  console.log('   Produtos (após dedup):', itensUnicos.length);

  if (DRY_RUN) {
    console.log('\n   Fornecedores:', todosFornecedores.join(', '));
    console.log('   Amostra produtos (5):', itensUnicos.slice(0, 5).map((i) => `${i.codigo} | ${i.descricao} | ${i.tipo} | R$${i.preco_compra} | estoque=${i.quantidade_inicial ?? 0}`));
    console.log('\n✅ Dry-run concluído. Gere o dump e execute sem --dry-run para importar.');
    return;
  }

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL não definida no .env');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const mapFornecedorId = {};
    for (const nome of todosFornecedores) {
      const exist = await pool.query('SELECT id FROM fornecedores WHERE TRIM(LOWER(nome)) = TRIM(LOWER($1))', [nome]);
      if (exist.rows.length) {
        mapFornecedorId[nome] = exist.rows[0].id;
      } else {
        const { rows } = await pool.query('INSERT INTO fornecedores (nome) VALUES ($1) RETURNING id', [nome]);
        mapFornecedorId[nome] = rows[0].id;
      }
    }
    console.log('   Fornecedores inseridos/vinculados:', Object.keys(mapFornecedorId).length);

    let produtosInseridos = 0;
    let produtosPulados = 0;
    for (const item of itensUnicos) {
      const fornecedorId = mapFornecedorId[item.fornecedor] || null;
      try {
        const { rows } = await pool.query(
          `INSERT INTO produtos (codigo, descricao, unidade, tipo, preco_compra, preco_venda, fornecedor_principal_id)
           VALUES ($1, $2, 'UN', $3, $4, $5, $6)
           ON CONFLICT (codigo) DO NOTHING
           RETURNING id`,
          [item.codigo, item.descricao, item.tipo, item.preco_compra, item.preco_venda ?? 0, fornecedorId]
        );
        if (rows.length > 0) {
          produtosInseridos++;
          if (item.quantidade_inicial > 0) {
            await pool.query(
              `INSERT INTO movimentacoes_estoque (data, tipo, produto_id, quantidade, observacao)
               VALUES (CURRENT_DATE, 'entrada', $1, $2, $3)`,
              [rows[0].id, item.quantidade_inicial, 'Importação Gestão Atual - estoque inicial']
            );
          }
        } else {
          produtosPulados++;
        }
      } catch (err) {
        console.warn('   Aviso:', item.codigo, err.message);
        produtosPulados++;
      }
    }

    console.log('   Produtos inseridos:', produtosInseridos);
    console.log('   Produtos pulados (codigo já existe):', produtosPulados);
    console.log('\n✅ Importação concluída.');
  } finally {
    await pool.end();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
