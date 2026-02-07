/**
 * Script para Gerar Arquivo SQL com Todos os INSERTs
 * 
 * Este script lê o Excel e gera um arquivo .sql com todos os INSERTs
 * para execução direta no SQL Editor do Supabase.
 * 
 * PRÉ-REQUISITOS:
 * npm install xlsx
 * 
 * EXECUTAR:
 * node scripts/data-import/generate-sql-inserts.js
 * 
 * OUTPUT:
 * scripts/data-import/import-data.sql
 */

import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const excelPath = path.join(__dirname, '../../Finanças Empresarial.xlsx');
const outputPath = path.join(__dirname, 'import-data.sql');

if (!fs.existsSync(excelPath)) {
  console.error('❌ Arquivo Excel não encontrado:', excelPath);
  process.exit(1);
}

console.log('📖 Lendo arquivo Excel...\n');

const workbook = XLSX.readFile(excelPath);
const sheetName = 'Fluxo de Caixa';

if (!workbook.SheetNames.includes(sheetName)) {
  console.error(`❌ Aba "${sheetName}" não encontrada!`);
  process.exit(1);
}

const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { defval: null, raw: false });

console.log(`📄 Processando ${data.length} linhas...\n`);

// ============================================
// FUNÇÕES DE TRANSFORMAÇÃO
// ============================================

function parseExcelDate(dateStr) {
  if (!dateStr) return null;
  
  if (dateStr instanceof Date && !isNaN(dateStr.getTime())) {
    return dateStr;
  }
  
  if (typeof dateStr === 'number') {
    try {
      const parsed = XLSX.SSF.parse_date_code(dateStr);
      if (parsed) {
        return new Date(parsed.y, parsed.m - 1, parsed.d);
      }
    } catch (e) {}
  }
  
  if (typeof dateStr === 'string') {
    const parts = dateStr.trim().split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      let year = parseInt(parts[2], 10);
      
      if (year < 50) {
        year = 2000 + year;
      } else {
        year = 1900 + year;
      }
      
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  
  return null;
}

function parseExcelValue(valueStr) {
  if (!valueStr || valueStr === null || valueStr === undefined) {
    return null;
  }
  
  const str = String(valueStr).trim();
  
  if (str === '' || str === '-' || str === '$-' || str === '$ -' || str === '$-   ') {
    return null;
  }
  
  const cleaned = str.replace(/[$\s]/g, '').replace(/,/g, '');
  const num = parseFloat(cleaned);
  
  return isNaN(num) ? null : num;
}

function identifyCompany(comprador) {
  if (!comprador) return null;
  
  const normalized = String(comprador).toUpperCase().trim();
  
  if (normalized.includes('JJ') || normalized.includes('NEXUS')) {
    return 'JJ';
  }
  
  if (normalized.includes('DESING') || normalized.includes('DESIGNER') || 
      normalized.includes('4 YOU') || normalized.includes('4YOU')) {
    return 'Designer 4 You';
  }
  
  return null;
}

function mapPaymentMethod(pagamento) {
  if (!pagamento) return 'card';
  
  const normalized = String(pagamento).toLowerCase().trim();
  
  if (normalized.includes('zelle')) return 'zelle';
  if (normalized.includes('cartao') || normalized.includes('card') || normalized.includes('cartão')) return 'card';
  if (normalized.includes('cheque') || normalized.includes('check')) return 'check';
  if (normalized.includes('dinheiro') || normalized.includes('cash')) return 'cash';
  
  return 'card';
}

function getWeekOfYear(date) {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return null;
  }
  
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

function formatDate(date) {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return 'NULL';
  }
  return `'${date.toISOString().split('T')[0]}'`;
}

function formatDecimal(value) {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  return value.toString();
}

// ============================================
// PROCESSAMENTO
// ============================================

const companies = new Map();
const clients = new Map();
const projects = new Map();
const suppliers = new Map();
const entries = [];
const exits = [];

// Primeiro, coletar todos os dados únicos
for (const row of data) {
  const tipo = (row['Tipo'] || row['tipo'] || '').toString().toUpperCase().trim();
  const isEntry = tipo === 'ENTRADA' || tipo.includes('ENTRADA');
  const isExit = tipo === 'SAIDA' || tipo === 'SAÍDA' || tipo.includes('SAIDA') || tipo.includes('SAÍDA');
  
  if (!isEntry && !isExit) continue;
  
  const comprador = (row['Comprador'] || row['comprador'] || '').toString().trim();
  const companyName = identifyCompany(comprador);
  
  if (!companyName) continue;
  
  companies.set(companyName, true);
  
  const descricao = (row['Descricao'] || row['Descricao'] || '').toString().trim();
  if (!descricao) continue;
  
  const key = `${companyName}:${descricao}`;
  if (!clients.has(key)) {
    clients.set(key, { company: companyName, name: descricao });
  }
  
  const fornecedor = (row['Fornecedor'] || row['fornecedor'] || '').toString().trim();
  if (fornecedor && isExit) {
    const supplierKey = `${companyName}:${fornecedor}`;
    if (!suppliers.has(supplierKey)) {
      suppliers.set(supplierKey, { company: companyName, name: fornecedor });
    }
  }
}

// Gerar SQL
let sql = `-- ============================================
-- Script de Importação de Dados
-- Gerado automaticamente a partir do Excel "Finanças Empresarial.xlsx"
-- Data: ${new Date().toLocaleString('pt-BR')}
-- ============================================

-- NOTA: Este script assume que:
-- 1. As migrations foram executadas (001 a 006)
-- 2. Existem usuários admin nas empresas (substitua os UUIDs abaixo)
-- 3. Os UUIDs de usuários admin estão corretos

-- ⚠️ IMPORTANTE: Substitua os UUIDs abaixo pelos UUIDs reais dos usuários admin
-- Obtenha os UUIDs com:
-- SELECT id, email, name, company_id FROM profiles WHERE can_create_users = true;

-- ============================================
-- 1. CRIAR EMPRESAS
-- ============================================

`;

// Empresas
for (const [companyName] of companies) {
  sql += `INSERT INTO companies (id, name, legal_name, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  ${escapeSql(companyName)},
  ${escapeSql(`${companyName} LTDA`)},
  true,
  NOW(),
  NOW()
)
ON CONFLICT (name) DO UPDATE SET updated_at = NOW()
RETURNING id, name;

`;
}

sql += `-- ============================================
-- 2. OBTER IDs DAS EMPRESAS (substitua pelos IDs reais)
-- ============================================

-- Execute estas queries e anote os IDs:
-- SELECT id, name FROM companies WHERE name = 'JJ';
-- SELECT id, name FROM companies WHERE name = 'Designer 4 You';

-- Variáveis temporárias (substitua pelos IDs reais):
-- \\set company_jj_id 'UUID_AQUI'
-- \\set company_designer_id 'UUID_AQUI'

-- ============================================
-- 3. OBTER ID DO USUÁRIO ADMIN DE CADA EMPRESA
-- ============================================

-- Execute estas queries e anote os IDs:
-- SELECT id, email, name FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1;
-- SELECT id, email, name FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1;

-- Variáveis temporárias (substitua pelos IDs reais):
-- \\set admin_jj_id 'UUID_AQUI'
-- \\set admin_designer_id 'UUID_AQUI'

-- ============================================
-- 4. CRIAR CLIENTES
-- ============================================

`;

// Clientes
const clientInserts = [];
for (const [key, client] of clients) {
  const companyVar = client.company === 'JJ' ? 'company_jj_id' : 'company_designer_id';
  const adminVar = client.company === 'JJ' ? 'admin_jj_id' : 'admin_designer_id';
  
  clientInserts.push(`INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  ${escapeSql(client.name)},
  (SELECT id FROM companies WHERE name = ${escapeSql(client.company)}),
  (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = ${escapeSql(client.company)}) AND can_create_users = true LIMIT 1),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE name = ${escapeSql(client.name)} 
  AND company_id = (SELECT id FROM companies WHERE name = ${escapeSql(client.company)})
)
RETURNING id, name;

`);
}

sql += clientInserts.join('\n');

sql += `-- ============================================
-- 5. CRIAR PROJETOS (1 por cliente)
-- ============================================

`;

// Projetos
const projectInserts = [];
for (const [key, client] of clients) {
  projectInserts.push(`INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  ${escapeSql(client.name)},
  (SELECT id FROM clients WHERE name = ${escapeSql(client.name)} AND company_id = (SELECT id FROM companies WHERE name = ${escapeSql(client.company)}) LIMIT 1),
  (SELECT id FROM companies WHERE name = ${escapeSql(client.company)}),
  'in_progress',
  50.00,
  50.00,
  (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = ${escapeSql(client.company)}) AND can_create_users = true LIMIT 1),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = ${escapeSql(client.name)} 
  AND client_id = (SELECT id FROM clients WHERE name = ${escapeSql(client.name)} AND company_id = (SELECT id FROM companies WHERE name = ${escapeSql(client.company)}) LIMIT 1)
)
RETURNING id, name;

`);
}

sql += projectInserts.join('\n');

sql += `-- ============================================
-- 6. CRIAR FORNECEDORES
-- ============================================

`;

// Fornecedores
const supplierInserts = [];
for (const [key, supplier] of suppliers) {
  supplierInserts.push(`INSERT INTO suppliers (id, name, type, is_company, supplier_category, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  ${escapeSql(supplier.name)},
  'material',
  true,
  'material',
  (SELECT id FROM companies WHERE name = ${escapeSql(supplier.company)}),
  (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = ${escapeSql(supplier.company)}) AND can_create_users = true LIMIT 1),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM suppliers 
  WHERE name = ${escapeSql(supplier.name)} 
  AND company_id = (SELECT id FROM companies WHERE name = ${escapeSql(supplier.company)})
)
RETURNING id, name;

`);
}

sql += supplierInserts.join('\n');

sql += `-- ============================================
-- 7. OBTER ID DO ADMIN DA OUTRA EMPRESA (para aprovação cruzada)
-- ============================================

-- Para aprovação cruzada, precisamos do admin da OUTRA empresa
-- Execute estas queries e anote os IDs:
-- SELECT id, email, name FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1;
-- SELECT id, email, name FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1;

-- ============================================
-- 8. IMPORTAR ENTRADAS FINANCEIRAS
-- ============================================

`;

// Processar entradas
let entryCount = 0;
for (const row of data) {
  const tipo = (row['Tipo'] || row['tipo'] || '').toString().toUpperCase().trim();
  if (tipo !== 'ENTRADA' && !tipo.includes('ENTRADA')) continue;
  
  const descricao = (row['Descricao'] || row['Descricao'] || '').toString().trim();
  if (!descricao) continue;
  
  const comprador = (row['Comprador'] || row['comprador'] || '').toString().trim();
  const companyName = identifyCompany(comprador);
  if (!companyName) continue;
  
  const valor = parseExcelValue(row['Valor'] || row['valor']);
  const dataStr = row['Data'] || row['data'];
  let entryDate = parseExcelDate(dataStr);
  if (!entryDate) entryDate = new Date();
  
  const pagamento = row['Pagamento'] || row['pagamento'];
  const semana = row['Semana'] || row['semana'];
  let weekOfYear = null;
  if (semana) {
    const semanaNum = parseInt(semana, 10);
    if (!isNaN(semanaNum)) weekOfYear = semanaNum;
  }
  if (!weekOfYear) weekOfYear = getWeekOfYear(entryDate);
  
  const otherCompany = companyName === 'JJ' ? 'Designer 4 You' : 'JJ';
  
  sql += `INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = ${escapeSql(descricao)}
   AND p.company_id = (SELECT id FROM companies WHERE name = ${escapeSql(companyName)})
   LIMIT 1),
  ${escapeSql(descricao)},
  ${valor === null ? 'NULL' : formatDecimal(valor)},
  ${formatDate(entryDate)},
  ${escapeSql(mapPaymentMethod(pagamento))},
  ${weekOfYear === null ? 'NULL' : weekOfYear},
  (SELECT id FROM companies WHERE name = ${escapeSql(companyName)}),
  'approved',
  (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = ${escapeSql(companyName)}) AND can_create_users = true LIMIT 1),
  (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = ${escapeSql(otherCompany)}) AND can_create_users = true LIMIT 1),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = ${escapeSql(descricao)}
  AND p.company_id = (SELECT id FROM companies WHERE name = ${escapeSql(companyName)})
);

`;
  
  entryCount++;
}

sql += `-- ============================================
-- 9. IMPORTAR SAÍDAS FINANCEIRAS
-- ============================================

`;

// Processar saídas
let exitCount = 0;
for (const row of data) {
  const tipo = (row['Tipo'] || row['tipo'] || '').toString().toUpperCase().trim();
  if (tipo !== 'SAIDA' && tipo !== 'SAÍDA' && !tipo.includes('SAIDA') && !tipo.includes('SAÍDA')) continue;
  
  const descricao = (row['Descricao'] || row['Descricao'] || '').toString().trim();
  if (!descricao) continue;
  
  const comprador = (row['Comprador'] || row['comprador'] || '').toString().trim();
  const companyName = identifyCompany(comprador);
  if (!companyName) continue;
  
  const valor = parseExcelValue(row['Valor'] || row['valor']);
  const dataStr = row['Data'] || row['data'];
  let exitDate = parseExcelDate(dataStr);
  if (!exitDate) exitDate = new Date();
  
  const pagamento = row['Pagamento'] || row['pagamento'];
  const fornecedor = (row['Fornecedor'] || row['fornecedor'] || '').toString().trim();
  const notas = (row['Help'] || row['help'] || '').toString().trim();
  const descricaoDetalhada = (row['Descrição'] || row['Descrição'] || '').toString().trim();
  
  const semana = row['Semana'] || row['semana'];
  let weekOfYear = null;
  if (semana) {
    const semanaNum = parseInt(semana, 10);
    if (!isNaN(semanaNum)) weekOfYear = semanaNum;
  }
  if (!weekOfYear) weekOfYear = getWeekOfYear(exitDate);
  
  const otherCompany = companyName === 'JJ' ? 'Designer 4 You' : 'JJ';
  
  sql += `INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = ${escapeSql(descricao)}
   AND p.company_id = (SELECT id FROM companies WHERE name = ${escapeSql(companyName)})
   LIMIT 1),
  ${escapeSql(descricao)},
  ${valor === null ? 'NULL' : formatDecimal(valor)},
  ${formatDate(exitDate)},
  ${escapeSql(mapPaymentMethod(pagamento))},
  ${weekOfYear === null ? 'NULL' : weekOfYear},
  ${fornecedor ? `(SELECT id FROM suppliers WHERE name = ${escapeSql(fornecedor)} AND company_id = (SELECT id FROM companies WHERE name = ${escapeSql(companyName)}) LIMIT 1)` : 'NULL'},
  ${descricaoDetalhada || notas ? escapeSql(descricaoDetalhada || notas) : 'NULL'},
  ${notas ? escapeSql(notas) : 'NULL'},
  (SELECT id FROM companies WHERE name = ${escapeSql(companyName)}),
  'approved',
  (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = ${escapeSql(companyName)}) AND can_create_users = true LIMIT 1),
  (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = ${escapeSql(otherCompany)}) AND can_create_users = true LIMIT 1),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = ${escapeSql(descricao)}
  AND p.company_id = (SELECT id FROM companies WHERE name = ${escapeSql(companyName)})
);

`;
  
  exitCount++;
}

sql += `-- ============================================
-- FIM DO SCRIPT
-- ============================================

-- Estatísticas esperadas:
-- - Empresas: ${companies.size}
-- - Clientes: ${clients.size}
-- - Projetos: ${clients.size}
-- - Fornecedores: ${suppliers.size}
-- - Entradas: ${entryCount}
-- - Saídas: ${exitCount}

-- Verificar importação:
-- SELECT COUNT(*) FROM financial_entries;
-- SELECT COUNT(*) FROM financial_exits;
-- SELECT COUNT(*) FROM clients;
-- SELECT COUNT(*) FROM projects;
-- SELECT COUNT(*) FROM suppliers;
`;

// Salvar arquivo
fs.writeFileSync(outputPath, sql, 'utf-8');

console.log(`✅ SQL gerado com sucesso!`);
console.log(`📄 Arquivo: ${outputPath}`);
console.log(`\n📊 Estatísticas:`);
console.log(`   - Empresas: ${companies.size}`);
console.log(`   - Clientes: ${clients.size}`);
console.log(`   - Projetos: ${clients.size}`);
console.log(`   - Fornecedores: ${suppliers.size}`);
console.log(`   - Entradas: ${entryCount}`);
console.log(`   - Saídas: ${exitCount}`);
console.log(`\n⚠️  IMPORTANTE:`);
console.log(`   O script SQL usa subqueries para buscar IDs automaticamente.`);
console.log(`   Certifique-se de que há usuários admin nas empresas antes de executar.`);
