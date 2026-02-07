/**
 * Script Completo de Importação de Dados do Excel
 * 
 * Baseado na análise detalhada do arquivo "Finanças Empresarial.xlsx"
 * 
 * PRÉ-REQUISITOS:
 * npm install xlsx @supabase/supabase-js dotenv
 * 
 * CONFIGURAÇÃO:
 * 1. Configure as variáveis de ambiente no .env (raiz do projeto):
 *    SUPABASE_URL=https://xxxxx.supabase.co
 *    SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
 * 
 * 2. Coloque o arquivo "Finanças Empresarial.xlsx" na raiz do projeto
 * 
 * 3. Execute: node scripts/data-import/import-excel-complete.js
 */

import XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const excelPath = path.join(__dirname, '../../Finanças Empresarial.xlsx');

if (!fs.existsSync(excelPath)) {
  console.error('❌ Arquivo Excel não encontrado:', excelPath);
  console.log('📝 Por favor, coloque o arquivo "Finanças Empresarial.xlsx" na raiz do projeto');
  process.exit(1);
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não configuradas!');
  console.log('Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================
// FUNÇÕES DE TRANSFORMAÇÃO
// ============================================

/**
 * Parse de data no formato DD/MM/YY
 */
function parseExcelDate(dateStr) {
  if (!dateStr) return null;
  
  // Se já é um objeto Date válido
  if (dateStr instanceof Date && !isNaN(dateStr.getTime())) {
    return dateStr;
  }
  
  // Se é número (Excel date serial)
  if (typeof dateStr === 'number') {
    try {
      const parsed = XLSX.SSF.parse_date_code(dateStr);
      if (parsed) {
        return new Date(parsed.y, parsed.m - 1, parsed.d);
      }
    } catch (e) {
      // Ignorar
    }
  }
  
  // Se é string no formato DD/MM/YY
  if (typeof dateStr === 'string') {
    const parts = dateStr.trim().split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // JavaScript months are 0-indexed
      let year = parseInt(parts[2], 10);
      
      // Se YY < 50, assumir 20YY, senão 19YY
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
    
    // Tentar parse padrão
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  
  return null;
}

/**
 * Parse de valor no formato "$1,725.00"
 */
function parseExcelValue(valueStr) {
  if (!valueStr || valueStr === null || valueStr === undefined) {
    return null;
  }
  
  const str = String(valueStr).trim();
  
  // Se vazio ou "-" ou "$-", retornar NULL (pendente)
  if (str === '' || str === '-' || str === '$-' || str === '$ -' || str === '$-   ') {
    return null;
  }
  
  // Remove "$", espaços e converte vírgula para ponto
  const cleaned = str.replace(/[$\s]/g, '').replace(/,/g, '');
  const num = parseFloat(cleaned);
  
  return isNaN(num) ? null : num;
}

/**
 * Identificar empresa pelo Comprador
 */
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

/**
 * Mapear forma de pagamento
 */
function mapPaymentMethod(pagamento) {
  if (!pagamento) return 'card'; // default
  
  const normalized = String(pagamento).toLowerCase().trim();
  
  if (normalized.includes('zelle')) return 'zelle';
  if (normalized.includes('cartao') || normalized.includes('card') || normalized.includes('cartão')) return 'card';
  if (normalized.includes('cheque') || normalized.includes('check')) return 'check';
  if (normalized.includes('dinheiro') || normalized.includes('cash')) return 'cash';
  
  return 'card'; // default
}

/**
 * Calcular semana do ano
 */
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

// ============================================
// FUNÇÕES DE CRIAÇÃO NO BANCO
// ============================================

const cache = {
  companies: new Map(),
  clients: new Map(),
  projects: new Map(),
  suppliers: new Map(),
  admins: new Map()
};

/**
 * Criar ou obter empresa
 */
async function createOrGetCompany(name) {
  if (cache.companies.has(name)) {
    return cache.companies.get(name);
  }
  
  const { data: existing } = await supabase
    .from('companies')
    .select('id')
    .eq('name', name)
    .single();
  
  if (existing) {
    cache.companies.set(name, existing.id);
    return existing.id;
  }
  
  const { data: newCompany, error } = await supabase
    .from('companies')
    .insert({
      name,
      legal_name: `${name} LTDA`,
      is_active: true,
    })
    .select('id')
    .single();
  
  if (error) {
    console.error(`   ❌ Erro ao criar empresa "${name}":`, error.message);
    return null;
  }
  
  cache.companies.set(name, newCompany.id);
  console.log(`   ✅ Empresa criada: ${name}`);
  return newCompany.id;
}

/**
 * Obter admin de uma empresa
 */
async function getCompanyAdmin(companyId) {
  if (cache.admins.has(companyId)) {
    return cache.admins.get(companyId);
  }
  
  const { data: admin } = await supabase
    .from('profiles')
    .select('id')
    .eq('company_id', companyId)
    .eq('can_create_users', true)
    .limit(1)
    .single();
  
  if (!admin) {
    // Tentar qualquer usuário da empresa
    const { data: anyUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('company_id', companyId)
      .limit(1)
      .single();
    
    if (anyUser) {
      cache.admins.set(companyId, anyUser.id);
      return anyUser.id;
    }
    
    console.warn(`   ⚠️  Nenhum usuário encontrado para empresa ${companyId}`);
    return null;
  }
  
  cache.admins.set(companyId, admin.id);
  return admin.id;
}

/**
 * Criar ou obter cliente
 */
async function createOrGetClient(name, companyId) {
  const key = `${companyId}:${name}`;
  if (cache.clients.has(key)) {
    return cache.clients.get(key);
  }
  
  const { data: existing } = await supabase
    .from('clients')
    .select('id')
    .eq('name', name)
    .eq('company_id', companyId)
    .single();
  
  if (existing) {
    cache.clients.set(key, existing.id);
    return existing.id;
  }
  
  const adminId = await getCompanyAdmin(companyId);
  if (!adminId) {
    return null;
  }
  
  const { data: newClient, error } = await supabase
    .from('clients')
    .insert({
      name: name.trim(),
      company_id: companyId,
      created_by: adminId,
    })
    .select('id')
    .single();
  
  if (error) {
    console.error(`   ❌ Erro ao criar cliente "${name}":`, error.message);
    return null;
  }
  
  cache.clients.set(key, newClient.id);
  return newClient.id;
}

/**
 * Criar ou obter projeto
 */
async function createOrGetProject(clientId, projectName, companyId) {
  const key = `${companyId}:${clientId}:${projectName}`;
  if (cache.projects.has(key)) {
    return cache.projects.get(key);
  }
  
  const { data: existing } = await supabase
    .from('projects')
    .select('id')
    .eq('name', projectName)
    .eq('client_id', clientId)
    .eq('company_id', companyId)
    .single();
  
  if (existing) {
    cache.projects.set(key, existing.id);
    return existing.id;
  }
  
  const adminId = await getCompanyAdmin(companyId);
  if (!adminId) {
    return null;
  }
  
  const { data: newProject, error } = await supabase
    .from('projects')
    .insert({
      name: projectName.trim(),
      client_id: clientId,
      company_id: companyId,
      status: 'in_progress',
      partner_1_percentage: 50,
      partner_2_percentage: 50,
      created_by: adminId,
    })
    .select('id')
    .single();
  
  if (error) {
    console.error(`   ❌ Erro ao criar projeto "${projectName}":`, error.message);
    return null;
  }
  
  cache.projects.set(key, newProject.id);
  return newProject.id;
}

/**
 * Criar ou obter fornecedor
 */
async function createOrGetSupplier(name, companyId) {
  if (!name || name.trim() === '') {
    return null;
  }
  
  const key = `${companyId}:${name}`;
  if (cache.suppliers.has(key)) {
    return cache.suppliers.get(key);
  }
  
  const { data: existing } = await supabase
    .from('suppliers')
    .select('id')
    .eq('name', name)
    .eq('company_id', companyId)
    .single();
  
  if (existing) {
    cache.suppliers.set(key, existing.id);
    return existing.id;
  }
  
  const adminId = await getCompanyAdmin(companyId);
  if (!adminId) {
    return null;
  }
  
  const { data: newSupplier, error } = await supabase
    .from('suppliers')
    .insert({
      name: name.trim(),
      type: 'material',
      is_company: true,
      supplier_category: 'material',
      company_id: companyId,
      created_by: adminId,
    })
    .select('id')
    .single();
  
  if (error) {
    console.error(`   ❌ Erro ao criar fornecedor "${name}":`, error.message);
    return null;
  }
  
  cache.suppliers.set(key, newSupplier.id);
  return newSupplier.id;
}

/**
 * Obter admin da outra empresa (para aprovação cruzada)
 */
async function getOtherCompanyAdmin(companyId) {
  // Obter todas as empresas
  const { data: companies } = await supabase
    .from('companies')
    .select('id, name');
  
  if (!companies || companies.length < 2) {
    return null;
  }
  
  // Encontrar a outra empresa
  const otherCompany = companies.find(c => c.id !== companyId);
  if (!otherCompany) {
    return null;
  }
  
  return await getCompanyAdmin(otherCompany.id);
}

// ============================================
// FUNÇÃO PRINCIPAL DE IMPORTAÇÃO
// ============================================

async function importData() {
  console.log('📖 Lendo arquivo Excel...\n');
  
  const workbook = XLSX.readFile(excelPath);
  const sheetNames = workbook.SheetNames;
  
  // Processar apenas a aba "Fluxo de Caixa"
  const sheetName = 'Fluxo de Caixa';
  if (!sheetNames.includes(sheetName)) {
    console.error(`❌ Aba "${sheetName}" não encontrada!`);
    console.log(`Abas disponíveis: ${sheetNames.join(', ')}`);
    process.exit(1);
  }
  
  console.log(`📄 Processando aba: "${sheetName}"\n`);
  
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { defval: null, raw: false });
  
  console.log(`   Total de linhas: ${data.length}\n`);
  
  // Estatísticas
  const stats = {
    entries: 0,
    exits: 0,
    errors: 0,
    skipped: 0,
    companiesCreated: 0,
    clientsCreated: 0,
    projectsCreated: 0,
    suppliersCreated: 0
  };
  
  // Processar cada linha
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowNum = i + 2; // +2 porque Excel começa em 1 e tem header
    
    try {
      // Identificar tipo
      const tipo = (row['Tipo'] || row['tipo'] || row['TIPO'] || '').toString().toUpperCase().trim();
      const isEntry = tipo === 'ENTRADA' || tipo.includes('ENTRADA');
      const isExit = tipo === 'SAIDA' || tipo === 'SAÍDA' || tipo.includes('SAIDA') || tipo.includes('SAÍDA');
      
      if (!isEntry && !isExit) {
        stats.skipped++;
        continue;
      }
      
      // Extrair dados básicos
      const descricao = (row['Descricao'] || row['Descricao'] || row['descricao'] || '').toString().trim();
      const valor = parseExcelValue(row['Valor'] || row['valor'] || row['VALOR']);
      const dataStr = row['Data'] || row['data'] || row['Date'] || row['DATE'];
      const pagamento = row['Pagamento'] || row['pagamento'] || row['Payment'] || row['PAYMENT'];
      const comprador = (row['Comprador'] || row['comprador'] || row['Cliente'] || row['cliente'] || '').toString().trim();
      const fornecedor = (row['Fornecedor'] || row['fornecedor'] || row['Supplier'] || '').toString().trim();
      const notas = (row['Help'] || row['help'] || row['Notas'] || row['notas'] || '').toString().trim();
      const descricaoDetalhada = (row['Descrição'] || row['Descrição'] || '').toString().trim();
      const semana = row['Semana'] || row['semana'];
      
      // Validar dados obrigatórios
      if (!descricao) {
        console.warn(`   ⚠️  Linha ${rowNum}: Descrição vazia, pulando...`);
        stats.skipped++;
        continue;
      }
      
      // Identificar empresa
      const companyName = identifyCompany(comprador);
      if (!companyName) {
        console.warn(`   ⚠️  Linha ${rowNum}: Empresa não identificada (Comprador: "${comprador}"), pulando...`);
        stats.skipped++;
        continue;
      }
      
      // Criar ou obter empresa
      const companyId = await createOrGetCompany(companyName);
      if (!companyId) {
        stats.errors++;
        continue;
      }
      
      // Processar data
      let entryDate = parseExcelDate(dataStr);
      if (!entryDate) {
        console.warn(`   ⚠️  Linha ${rowNum}: Data inválida ("${dataStr}"), usando data atual`);
        entryDate = new Date();
      }
      
      // Calcular semana do ano
      let weekOfYear = null;
      if (semana) {
        const semanaNum = parseInt(semana, 10);
        if (!isNaN(semanaNum)) {
          weekOfYear = semanaNum;
        }
      }
      if (!weekOfYear) {
        weekOfYear = getWeekOfYear(entryDate);
      }
      
      // Criar ou obter cliente
      const clientId = await createOrGetClient(descricao, companyId);
      if (!clientId) {
        stats.errors++;
        continue;
      }
      
      // Criar ou obter projeto (1 projeto por cliente)
      const projectId = await createOrGetProject(clientId, descricao, companyId);
      if (!projectId) {
        stats.errors++;
        continue;
      }
      
      // Obter admin da empresa
      const adminId = await getCompanyAdmin(companyId);
      if (!adminId) {
        stats.errors++;
        continue;
      }
      
      // Obter admin da outra empresa (para aprovação cruzada)
      const otherAdminId = await getOtherCompanyAdmin(companyId);
      
      // Criar entrada ou saída
      if (isEntry) {
        const { error } = await supabase
          .from('financial_entries')
          .insert({
            project_id: projectId,
            description: descricao,
            value: valor,
            entry_date: entryDate.toISOString().split('T')[0],
            payment_method: mapPaymentMethod(pagamento),
            week_of_year: weekOfYear,
            company_id: companyId,
            status: 'approved',
            created_by: adminId,
            approved_by: otherAdminId, // Aprovação cruzada
          });
        
        if (error) {
          console.error(`   ❌ Linha ${rowNum}: Erro ao criar entrada:`, error.message);
          stats.errors++;
        } else {
          stats.entries++;
          if (stats.entries % 10 === 0) {
            process.stdout.write(`   ✅ ${stats.entries} entradas importadas...\r`);
          }
        }
      } else if (isExit) {
        // Criar ou obter fornecedor (se houver)
        let supplierId = null;
        if (fornecedor) {
          supplierId = await createOrGetSupplier(fornecedor, companyId);
        }
        
        const { error } = await supabase
          .from('financial_exits')
          .insert({
            project_id: projectId,
            description: descricao,
            value: valor,
            exit_date: entryDate.toISOString().split('T')[0],
            payment_method: mapPaymentMethod(pagamento),
            week_of_year: weekOfYear,
            company_id: companyId,
            supplier_id: supplierId,
            detailed_description: descricaoDetalhada || notas || null,
            calculation_notes: notas || null,
            status: 'approved',
            created_by: adminId,
            approved_by: otherAdminId, // Aprovação cruzada
          });
        
        if (error) {
          console.error(`   ❌ Linha ${rowNum}: Erro ao criar saída:`, error.message);
          stats.errors++;
        } else {
          stats.exits++;
          if (stats.exits % 10 === 0) {
            process.stdout.write(`   ✅ ${stats.exits} saídas importadas...\r`);
          }
        }
      }
    } catch (error) {
      console.error(`   ❌ Linha ${i + 2}: Erro inesperado:`, error.message);
      stats.errors++;
    }
  }
  
  console.log('\n');
  console.log('✅ Importação concluída!\n');
  console.log('📊 Estatísticas:');
  console.log(`   - Entradas importadas: ${stats.entries}`);
  console.log(`   - Saídas importadas: ${stats.exits}`);
  console.log(`   - Erros: ${stats.errors}`);
  console.log(`   - Linhas puladas: ${stats.skipped}`);
  console.log(`   - Empresas criadas: ${cache.companies.size}`);
  console.log(`   - Clientes criados: ${cache.clients.size}`);
  console.log(`   - Projetos criados: ${cache.projects.size}`);
  console.log(`   - Fornecedores criados: ${cache.suppliers.size}`);
}

// Executar importação
importData().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
