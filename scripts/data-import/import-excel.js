/**
 * Script de Importação de Dados do Excel
 * 
 * Este script lê o arquivo "Finanças Empresarial.xlsx" e importa os dados
 * para o banco de dados Supabase seguindo a estrutura criada.
 * 
 * PRÉ-REQUISITOS:
 * npm install xlsx @supabase/supabase-js dotenv
 * 
 * CONFIGURAÇÃO:
 * 1. Configure as variáveis de ambiente no .env:
 *    SUPABASE_URL=https://xxxxx.supabase.co
 *    SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
 * 
 * 2. Execute: node scripts/data-import/import-excel.js
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

// Mapeamento de formas de pagamento
const paymentMethodMap = {
  'zelle': 'zelle',
  'Zelle': 'zelle',
  'cartão': 'card',
  'Cartão': 'card',
  'card': 'card',
  'cheque': 'check',
  'Cheque': 'check',
  'check': 'check',
  'dinheiro': 'cash',
  'Dinheiro': 'cash',
  'cash': 'cash',
};

// Função para calcular semana do ano
function getWeekOfYear(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

// Função para normalizar nome de empresa/sócio
function normalizeCompanyName(name) {
  if (!name) return null;
  
  const normalized = name.trim();
  
  // Identificar empresas conhecidas
  if (normalized.toLowerCase().includes('designer') || 
      normalized.toLowerCase().includes('4 you') ||
      normalized.toLowerCase().includes('4you')) {
    return 'Designer 4 You';
  }
  
  // Adicionar outras empresas conforme necessário
  return normalized;
}

async function createOrGetCompany(name) {
  if (!name) return null;
  
  const { data: existing } = await supabase
    .from('companies')
    .select('id')
    .eq('name', name)
    .single();
  
  if (existing) {
    return existing.id;
  }
  
  const { data: newCompany, error } = await supabase
    .from('companies')
    .insert({
      name,
      is_active: true,
    })
    .select('id')
    .single();
  
  if (error) {
    console.error('Erro ao criar empresa:', error);
    return null;
  }
  
  return newCompany.id;
}

async function createOrGetClient(name, companyId) {
  if (!name) return null;
  
  const { data: existing } = await supabase
    .from('clients')
    .select('id')
    .eq('name', name)
    .eq('company_id', companyId)
    .single();
  
  if (existing) {
    return existing.id;
  }
  
  // Precisa de um usuário para created_by - usar primeiro admin da empresa
  const { data: admin } = await supabase
    .from('profiles')
    .select('id')
    .eq('company_id', companyId)
    .limit(1)
    .single();
  
  if (!admin) {
    console.warn('Nenhum usuário encontrado para empresa:', companyId);
    return null;
  }
  
  const { data: newClient, error } = await supabase
    .from('clients')
    .insert({
      name,
      company_id: companyId,
      created_by: admin.id,
    })
    .select('id')
    .single();
  
  if (error) {
    console.error('Erro ao criar cliente:', error);
    return null;
  }
  
  return newClient.id;
}

async function createOrGetProject(clientId, projectName, companyId) {
  if (!projectName || !clientId) return null;
  
  const { data: existing } = await supabase
    .from('projects')
    .select('id')
    .eq('name', projectName)
    .eq('client_id', clientId)
    .eq('company_id', companyId)
    .single();
  
  if (existing) {
    return existing.id;
  }
  
  const { data: admin } = await supabase
    .from('profiles')
    .select('id')
    .eq('company_id', companyId)
    .limit(1)
    .single();
  
  if (!admin) return null;
  
  const { data: newProject, error } = await supabase
    .from('projects')
    .insert({
      name: projectName,
      client_id: clientId,
      company_id: companyId,
      status: 'in_progress',
      partner_1_percentage: 50,
      partner_2_percentage: 50,
      created_by: admin.id,
    })
    .select('id')
    .single();
  
  if (error) {
    console.error('Erro ao criar projeto:', error);
    return null;
  }
  
  return newProject.id;
}

async function createOrGetSupplier(name, companyId) {
  if (!name) return null;
  
  const { data: existing } = await supabase
    .from('suppliers')
    .select('id')
    .eq('name', name)
    .eq('company_id', companyId)
    .single();
  
  if (existing) {
    return existing.id;
  }
  
  const { data: admin } = await supabase
    .from('profiles')
    .select('id')
    .eq('company_id', companyId)
    .limit(1)
    .single();
  
  if (!admin) return null;
  
  const { data: newSupplier, error } = await supabase
    .from('suppliers')
    .insert({
      name,
      type: 'material',
      is_company: true,
      supplier_category: 'material',
      company_id: companyId,
      created_by: admin.id,
    })
    .select('id')
    .single();
  
  if (error) {
    console.error('Erro ao criar fornecedor:', error);
    return null;
  }
  
  return newSupplier.id;
}

async function importData() {
  console.log('📖 Lendo arquivo Excel...');
  
  const workbook = XLSX.readFile(excelPath);
  const sheetNames = workbook.SheetNames;
  
  console.log(`\n📊 Abas encontradas: ${sheetNames.join(', ')}\n`);
  
  // Processar cada aba
  for (const sheetName of sheetNames) {
    console.log(`\n📄 Processando aba: ${sheetName}`);
    
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`   Linhas encontradas: ${data.length}`);
    
    // Identificar empresa baseado no nome da aba ou dados
    let companyName = normalizeCompanyName(sheetName);
    if (!companyName) {
      // Tentar identificar pela primeira linha
      const firstRow = data[0];
      if (firstRow && firstRow['Empresa']) {
        companyName = normalizeCompanyName(firstRow['Empresa']);
      }
    }
    
    if (!companyName) {
      console.warn('   ⚠️  Não foi possível identificar a empresa, pulando...');
      continue;
    }
    
    console.log(`   Empresa identificada: ${companyName}`);
    
    // Criar ou obter empresa
    const companyId = await createOrGetCompany(companyName);
    if (!companyId) {
      console.error('   ❌ Erro ao criar/obter empresa');
      continue;
    }
    
    // Processar cada linha
    let imported = 0;
    let errors = 0;
    
    for (const row of data) {
      try {
        // Identificar tipo (Entrada ou Saída)
        const tipo = row['Tipo'] || row['tipo'] || '';
        const isEntry = tipo.toLowerCase().includes('entrada') || 
                       tipo.toLowerCase().includes('receita') ||
                       tipo.toLowerCase().includes('receb');
        
        // Obter dados básicos
        const descricao = row['Descrição'] || row['Descricao'] || row['descrição'] || '';
        const valor = parseFloat(row['Valor'] || row['valor'] || 0) || null;
        const dataStr = row['Data'] || row['data'] || row['Date'] || '';
        const pagamento = row['Pagamento'] || row['pagamento'] || row['Payment'] || 'card';
        const comprador = row['Comprador'] || row['comprador'] || row['Cliente'] || '';
        const fornecedor = row['Fornecedor'] || row['fornecedor'] || row['Supplier'] || '';
        const notas = row['Help'] || row['help'] || row['Notas'] || row['Observações'] || '';
        
        if (!descricao) {
          continue; // Pular linhas sem descrição
        }
        
        // Parse da data
        let entryDate;
        if (dataStr) {
          if (typeof dataStr === 'number') {
            // Excel date serial number
            entryDate = XLSX.SSF.parse_date_code(dataStr);
          } else {
            entryDate = new Date(dataStr);
          }
        } else {
          entryDate = new Date();
        }
        
        if (isNaN(entryDate.getTime())) {
          entryDate = new Date();
        }
        
        const weekOfYear = getWeekOfYear(entryDate);
        const paymentMethod = paymentMethodMap[pagamento.toLowerCase()] || 'card';
        
        // Obter usuário admin da empresa
        const { data: admin } = await supabase
          .from('profiles')
          .select('id')
          .eq('company_id', companyId)
          .limit(1)
          .single();
        
        if (!admin) {
          console.warn('   ⚠️  Nenhum admin encontrado para empresa');
          continue;
        }
        
        // Criar ou obter cliente/projeto
        let projectId = null;
        if (comprador) {
          const clientId = await createOrGetClient(comprador, companyId);
          if (clientId) {
            projectId = await createOrGetProject(clientId, comprador, companyId);
          }
        }
        
        // Se não tem projeto, criar um genérico
        if (!projectId) {
          const genericClientId = await createOrGetClient('Cliente Genérico', companyId);
          if (genericClientId) {
            projectId = await createOrGetProject(genericClientId, 'Projeto Genérico', companyId);
          }
        }
        
        if (!projectId) {
          console.warn('   ⚠️  Não foi possível criar projeto');
          errors++;
          continue;
        }
        
        // Criar entrada ou saída
        if (isEntry) {
          // Financial Entry
          const { error } = await supabase
            .from('financial_entries')
            .insert({
              project_id: projectId,
              description: descricao,
              value: valor,
              entry_date: entryDate.toISOString().split('T')[0],
              payment_method: paymentMethod,
              week_of_year: weekOfYear,
              company_id: companyId,
              status: 'approved', // Aprovar automaticamente dados importados
              created_by: admin.id,
              approved_by: admin.id,
            });
          
          if (error) {
            console.error('   ❌ Erro ao criar entrada:', error.message);
            errors++;
          } else {
            imported++;
          }
        } else {
          // Financial Exit
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
              payment_method: paymentMethod,
              week_of_year: weekOfYear,
              company_id: companyId,
              supplier_id: supplierId,
              detailed_description: notas,
              status: 'approved', // Aprovar automaticamente dados importados
              created_by: admin.id,
              approved_by: admin.id,
            });
          
          if (error) {
            console.error('   ❌ Erro ao criar saída:', error.message);
            errors++;
          } else {
            imported++;
          }
        }
      } catch (error) {
        console.error('   ❌ Erro ao processar linha:', error.message);
        errors++;
      }
    }
    
    console.log(`   ✅ Importados: ${imported}`);
    console.log(`   ❌ Erros: ${errors}`);
  }
  
  console.log('\n✅ Importação concluída!');
}

// Executar importação
importData().catch(console.error);
