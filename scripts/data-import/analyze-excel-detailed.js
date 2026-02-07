/**
 * Análise Detalhada do Arquivo Excel "Finanças Empresarial.xlsx"
 * 
 * Este script analisa linha por linha o arquivo Excel para entender:
 * - Estrutura de dados antiga
 * - Padrões e convenções usadas
 * - Como mapear para o novo modelo de tabelas
 * - Inconsistências e dados faltantes
 * 
 * PRÉ-REQUISITOS:
 * npm install xlsx
 * 
 * EXECUTAR:
 * node scripts/data-import/analyze-excel-detailed.js
 */

import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const excelPath = path.join(__dirname, '../../Finanças Empresarial.xlsx');
const outputPath = path.join(__dirname, '../../ANALISE_DETALHADA_EXCEL.md');

if (!fs.existsSync(excelPath)) {
  console.error('❌ Arquivo Excel não encontrado:', excelPath);
  console.log('📝 Por favor, coloque o arquivo "Finanças Empresarial.xlsx" na raiz do projeto');
  process.exit(1);
}

console.log('📊 Iniciando análise detalhada do Excel...\n');

const workbook = XLSX.readFile(excelPath);
const sheetNames = workbook.SheetNames;

console.log(`📋 Abas encontradas: ${sheetNames.length}`);
sheetNames.forEach((name, idx) => {
  console.log(`   ${idx + 1}. ${name}`);
});

let analysis = {
  sheets: [],
  summary: {
    totalSheets: sheetNames.length,
    totalRows: 0,
    totalEntries: 0,
    totalExits: 0,
    companies: new Set(),
    clients: new Set(),
    suppliers: new Set(),
    paymentMethods: new Set(),
    dateRange: { min: null, max: null },
    issues: []
  }
};

// Analisar cada aba
for (const sheetName of sheetNames) {
  console.log(`\n📄 Analisando aba: "${sheetName}"`);
  
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { defval: null, raw: false });
  
  if (data.length === 0) {
    console.log('   ⚠️  Aba vazia');
    analysis.sheets.push({
      name: sheetName,
      rows: 0,
      columns: [],
      data: [],
      issues: ['Aba vazia']
    });
    continue;
  }
  
  // Identificar colunas
  const columns = Object.keys(data[0]);
  console.log(`   Colunas encontradas (${columns.length}):`, columns.join(', '));
  
  // Analisar cada linha
  const sheetAnalysis = {
    name: sheetName,
    rows: data.length,
    columns: columns,
    sampleRows: data.slice(0, 5), // Primeiras 5 linhas como amostra
    dataTypes: {},
    patterns: {
      entries: [],
      exits: [],
      issues: []
    },
    statistics: {
      entries: 0,
      exits: 0,
      withValue: 0,
      withoutValue: 0,
      dates: [],
      paymentMethods: new Set(),
      clients: new Set(),
      suppliers: new Set()
    }
  };
  
  // Analisar tipos de dados de cada coluna
  columns.forEach(col => {
    const values = data.map(row => row[col]).filter(v => v !== null && v !== undefined && v !== '');
    if (values.length > 0) {
      const firstValue = values[0];
      const type = typeof firstValue;
      sheetAnalysis.dataTypes[col] = {
        type: type,
        sample: firstValue,
        nonEmpty: values.length,
        empty: data.length - values.length,
        unique: new Set(values).size
      };
    }
  });
  
  // Analisar cada linha em detalhe
  data.forEach((row, index) => {
    const rowAnalysis = {
      rowNumber: index + 2, // +2 porque Excel começa em 1 e tem header
      raw: row,
      mapped: {},
      issues: []
    };
    
    // Identificar tipo (Entrada ou Saída)
    const tipo = (row['Tipo'] || row['tipo'] || row['TIPO'] || '').toString().toLowerCase().trim();
    const isEntry = tipo.includes('entrada') || tipo.includes('receita') || tipo.includes('receb') || tipo === 'e';
    const isExit = tipo.includes('saída') || tipo.includes('saida') || tipo.includes('despesa') || tipo.includes('gasto') || tipo === 's';
    
    if (!isEntry && !isExit && tipo) {
      rowAnalysis.issues.push(`Tipo não identificado: "${tipo}"`);
    }
    
    // Extrair dados básicos
    const descricao = (row['Descrição'] || row['Descricao'] || row['descrição'] || row['DESCRIÇÃO'] || '').toString().trim();
    const valor = row['Valor'] || row['valor'] || row['VALOR'] || null;
    const dataStr = row['Data'] || row['data'] || row['Date'] || row['DATE'] || null;
    const pagamento = (row['Pagamento'] || row['pagamento'] || row['Payment'] || row['PAYMENT'] || '').toString().toLowerCase().trim();
    const comprador = (row['Comprador'] || row['comprador'] || row['Cliente'] || row['cliente'] || row['CLIENTE'] || '').toString().trim();
    const fornecedor = (row['Fornecedor'] || row['fornecedor'] || row['Supplier'] || row['SUPPLIER'] || '').toString().trim();
    const notas = (row['Help'] || row['help'] || row['Notas'] || row['notas'] || row['Observações'] || row['observações'] || '').toString().trim();
    
    // Validar dados obrigatórios
    if (!descricao) {
      rowAnalysis.issues.push('Descrição vazia');
    }
    
    // Processar valor
    let valorNum = null;
    if (valor !== null && valor !== undefined && valor !== '') {
      if (typeof valor === 'number') {
        valorNum = valor;
      } else {
        const valorStr = valor.toString().replace(/[^\d.,-]/g, '').replace(',', '.');
        valorNum = parseFloat(valorStr);
        if (isNaN(valorNum)) {
          rowAnalysis.issues.push(`Valor inválido: "${valor}"`);
        }
      }
    } else {
      rowAnalysis.issues.push('Valor vazio (pode ser pendente)');
    }
    
    // Processar data
    let entryDate = null;
    if (dataStr) {
      try {
        if (typeof dataStr === 'number') {
          // Excel date serial number
          const parsed = XLSX.SSF.parse_date_code(dataStr);
          if (parsed) {
            entryDate = new Date(parsed.y, parsed.m - 1, parsed.d);
          }
        } else {
          entryDate = new Date(dataStr);
        }
        
        if (!entryDate || isNaN(entryDate.getTime())) {
          rowAnalysis.issues.push(`Data inválida: "${dataStr}"`);
          entryDate = null;
        } else {
          if (!analysis.summary.dateRange.min || entryDate < analysis.summary.dateRange.min) {
            analysis.summary.dateRange.min = entryDate;
          }
          if (!analysis.summary.dateRange.max || entryDate > analysis.summary.dateRange.max) {
            analysis.summary.dateRange.max = entryDate;
          }
        }
      } catch (error) {
        rowAnalysis.issues.push(`Erro ao processar data: "${dataStr}" - ${error.message}`);
        entryDate = null;
      }
    } else {
      rowAnalysis.issues.push('Data vazia');
    }
    
    // Mapear para novo modelo
    if (isEntry) {
      sheetAnalysis.statistics.entries++;
      analysis.summary.totalEntries++;
      
      rowAnalysis.mapped = {
        table: 'financial_entries',
        fields: {
          project_id: comprador ? `[CRIAR/OBTER PROJETO: ${comprador}]` : '[PROJETO GENÉRICO]',
          description: descricao,
          value: valorNum,
          entry_date: entryDate && !isNaN(entryDate.getTime()) ? entryDate.toISOString().split('T')[0] : null,
          payment_method: mapPaymentMethod(pagamento),
          week_of_year: entryDate ? getWeekOfYear(entryDate) : null,
          status: 'approved', // Dados históricos são aprovados
          company_id: `[IDENTIFICAR EMPRESA DA ABA: ${sheetName}]`
        },
        notes: notas || null
      };
      
      if (comprador) analysis.summary.clients.add(comprador);
      if (pagamento) analysis.summary.paymentMethods.add(pagamento);
      
    } else if (isExit) {
      sheetAnalysis.statistics.exits++;
      analysis.summary.totalExits++;
      
      rowAnalysis.mapped = {
        table: 'financial_exits',
        fields: {
          project_id: comprador ? `[CRIAR/OBTER PROJETO: ${comprador}]` : '[PROJETO GENÉRICO]',
          description: descricao,
          value: valorNum,
          exit_date: entryDate && !isNaN(entryDate.getTime()) ? entryDate.toISOString().split('T')[0] : null,
          payment_method: mapPaymentMethod(pagamento),
          week_of_year: entryDate ? getWeekOfYear(entryDate) : null,
          supplier_id: fornecedor ? `[CRIAR/OBTER FORNECEDOR: ${fornecedor}]` : null,
          detailed_description: notas || null,
          status: 'approved', // Dados históricos são aprovados
          company_id: `[IDENTIFICAR EMPRESA DA ABA: ${sheetName}]`
        }
      };
      
      if (comprador) analysis.summary.clients.add(comprador);
      if (fornecedor) analysis.summary.suppliers.add(fornecedor);
      if (pagamento) analysis.summary.paymentMethods.add(pagamento);
    }
    
    if (valorNum !== null) {
      sheetAnalysis.statistics.withValue++;
    } else {
      sheetAnalysis.statistics.withoutValue++;
    }
    
    if (entryDate) {
      sheetAnalysis.statistics.dates.push(entryDate);
    }
    
    if (pagamento) {
      sheetAnalysis.statistics.paymentMethods.add(pagamento);
    }
    
    // Adicionar à análise da aba
    if (isEntry) {
      sheetAnalysis.patterns.entries.push(rowAnalysis);
    } else if (isExit) {
      sheetAnalysis.patterns.exits.push(rowAnalysis);
    }
    
    if (rowAnalysis.issues.length > 0) {
      sheetAnalysis.patterns.issues.push(rowAnalysis);
    }
  });
  
  // Identificar empresa da aba
  const companyName = identifyCompany(sheetName, data);
  if (companyName) {
    analysis.summary.companies.add(companyName);
    sheetAnalysis.company = companyName;
  }
  
  analysis.sheets.push(sheetAnalysis);
  analysis.summary.totalRows += data.length;
}

// Funções auxiliares
function mapPaymentMethod(pagamento) {
  if (!pagamento) return 'card'; // default
  
  const normalized = pagamento.toLowerCase().trim();
  if (normalized.includes('zelle')) return 'zelle';
  if (normalized.includes('cartão') || normalized.includes('card') || normalized.includes('cartao')) return 'card';
  if (normalized.includes('cheque') || normalized.includes('check')) return 'check';
  if (normalized.includes('dinheiro') || normalized.includes('cash')) return 'cash';
  return 'card'; // default
}

function getWeekOfYear(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

function identifyCompany(sheetName, data) {
  // Tentar identificar pelo nome da aba
  const nameLower = sheetName.toLowerCase();
  if (nameLower.includes('designer') || nameLower.includes('4 you') || nameLower.includes('4you')) {
    return 'Designer 4 You';
  }
  if (nameLower.includes('jj')) {
    return 'JJ';
  }
  
  // Tentar identificar pela primeira linha
  if (data.length > 0) {
    const firstRow = data[0];
    const empresa = firstRow['Empresa'] || firstRow['empresa'] || firstRow['EMPRESA'];
    if (empresa) {
      return empresa.toString().trim();
    }
  }
  
  return null;
}

// Gerar relatório Markdown
function generateReport() {
  let report = `# Análise Detalhada do Arquivo Excel "Finanças Empresarial.xlsx"\n\n`;
  report += `**Data da Análise:** ${new Date().toLocaleString('pt-BR')}\n\n`;
  report += `---\n\n`;
  
  // Resumo Executivo
  report += `## 📊 Resumo Executivo\n\n`;
  report += `- **Total de Abas:** ${analysis.summary.totalSheets}\n`;
  report += `- **Total de Linhas:** ${analysis.summary.totalRows}\n`;
  report += `- **Total de Entradas:** ${analysis.summary.totalEntries}\n`;
  report += `- **Total de Saídas:** ${analysis.summary.totalExits}\n`;
  report += `- **Empresas Identificadas:** ${Array.from(analysis.summary.companies).join(', ') || 'Não identificadas'}\n`;
  report += `- **Clientes Únicos:** ${analysis.summary.clients.size}\n`;
  report += `- **Fornecedores Únicos:** ${analysis.summary.suppliers.size}\n`;
  report += `- **Formas de Pagamento:** ${Array.from(analysis.summary.paymentMethods).join(', ') || 'Não identificadas'}\n`;
  
  if (analysis.summary.dateRange.min && analysis.summary.dateRange.max) {
    report += `- **Período dos Dados:** ${analysis.summary.dateRange.min.toLocaleDateString('pt-BR')} a ${analysis.summary.dateRange.max.toLocaleDateString('pt-BR')}\n`;
  }
  
  report += `\n---\n\n`;
  
  // Análise por Aba
  report += `## 📄 Análise Detalhada por Aba\n\n`;
  
  analysis.sheets.forEach((sheet, idx) => {
    report += `### ${idx + 1}. Aba: "${sheet.name}"\n\n`;
    
    if (sheet.company) {
      report += `**Empresa Identificada:** ${sheet.company}\n\n`;
    }
    
    report += `**Estatísticas:**\n`;
    report += `- Total de linhas: ${sheet.rows}\n`;
    report += `- Entradas: ${sheet.statistics.entries}\n`;
    report += `- Saídas: ${sheet.statistics.exits}\n`;
    report += `- Com valor: ${sheet.statistics.withValue}\n`;
    report += `- Sem valor (pendentes): ${sheet.statistics.withoutValue}\n`;
    report += `- Problemas encontrados: ${sheet.patterns.issues.length}\n\n`;
    
    report += `**Colunas Encontradas:**\n`;
    sheet.columns.forEach(col => {
      const typeInfo = sheet.dataTypes[col];
      if (typeInfo) {
        report += `- \`${col}\`: ${typeInfo.type} (${typeInfo.nonEmpty} preenchidos, ${typeInfo.empty} vazios, ${typeInfo.unique} únicos)\n`;
      }
    });
    report += `\n`;
    
    // Amostra de dados
    if (sheet.sampleRows.length > 0) {
      report += `**Amostra de Dados (primeiras 5 linhas):**\n\n`;
      report += `| ${sheet.columns.join(' | ')} |\n`;
      report += `| ${sheet.columns.map(() => '---').join(' | ')} |\n`;
      sheet.sampleRows.forEach(row => {
        const values = sheet.columns.map(col => {
          const val = row[col];
          if (val === null || val === undefined) return '';
          if (typeof val === 'object') return JSON.stringify(val);
          return String(val).substring(0, 50); // Limitar tamanho
        });
        report += `| ${values.join(' | ')} |\n`;
      });
      report += `\n`;
    }
    
    // Problemas encontrados
    if (sheet.patterns.issues.length > 0) {
      report += `**⚠️ Problemas Encontrados:**\n\n`;
      const issuesByType = {};
      sheet.patterns.issues.forEach(issueRow => {
        issueRow.issues.forEach(issue => {
          if (!issuesByType[issue]) {
            issuesByType[issue] = [];
          }
          issuesByType[issue].push(issueRow.rowNumber);
        });
      });
      
      Object.keys(issuesByType).forEach(issue => {
        const rows = issuesByType[issue];
        report += `- **${issue}**: ${rows.length} ocorrências (linhas: ${rows.slice(0, 10).join(', ')}${rows.length > 10 ? '...' : ''})\n`;
      });
      report += `\n`;
    }
    
    // Mapeamento para novo modelo
    report += `**Mapeamento para Novo Modelo:**\n\n`;
    
    if (sheet.patterns.entries.length > 0) {
      report += `##### Entradas Financeiras (${sheet.patterns.entries.length} registros)\n\n`;
      report += `| Campo Original | Campo Novo | Observações |\n`;
      report += `|----------------|------------|-------------|\n`;
      report += `| Descrição | \`financial_entries.description\` | Texto da transação |\n`;
      report += `| Valor | \`financial_entries.value\` | Pode ser NULL (pendente) |\n`;
      report += `| Data | \`financial_entries.entry_date\` | Data da transação |\n`;
      report += `| Pagamento | \`financial_entries.payment_method\` | Mapeado: ${Array.from(sheet.statistics.paymentMethods).join(', ')} |\n`;
      report += `| Comprador | \`financial_entries.project_id\` | Via tabela \`projects\` (criar se não existir) |\n`;
      report += `| Help/Notas | \`financial_entries.description\` (adicionar) | Observações adicionais |\n`;
      report += `| - | \`financial_entries.week_of_year\` | Calculado automaticamente da data |\n`;
      report += `| - | \`financial_entries.company_id\` | Identificado pela aba: ${sheet.company || 'NÃO IDENTIFICADO'} |\n`;
      report += `| - | \`financial_entries.status\` | 'approved' (dados históricos) |\n`;
      report += `\n`;
    }
    
    if (sheet.patterns.exits.length > 0) {
      report += `##### Saídas Financeiras (${sheet.patterns.exits.length} registros)\n\n`;
      report += `| Campo Original | Campo Novo | Observações |\n`;
      report += `|----------------|------------|-------------|\n`;
      report += `| Descrição | \`financial_exits.description\` | Texto da transação |\n`;
      report += `| Valor | \`financial_exits.value\` | Pode ser NULL (pendente) |\n`;
      report += `| Data | \`financial_exits.exit_date\` | Data da transação |\n`;
      report += `| Pagamento | \`financial_exits.payment_method\` | Mapeado: ${Array.from(sheet.statistics.paymentMethods).join(', ')} |\n`;
      report += `| Comprador | \`financial_exits.project_id\` | Via tabela \`projects\` (criar se não existir) |\n`;
      report += `| Fornecedor | \`financial_exits.supplier_id\` | Via tabela \`suppliers\` (criar se não existir) |\n`;
      report += `| Help/Notas | \`financial_exits.detailed_description\` | Observações detalhadas |\n`;
      report += `| - | \`financial_exits.week_of_year\` | Calculado automaticamente da data |\n`;
      report += `| - | \`financial_exits.company_id\` | Identificado pela aba: ${sheet.company || 'NÃO IDENTIFICADO'} |\n`;
      report += `| - | \`financial_exits.status\` | 'approved' (dados históricos) |\n`;
      report += `\n`;
    }
    
    report += `---\n\n`;
  });
  
  // Mapeamento Geral
  report += `## 🔄 Mapeamento Geral: Dados Antigos → Novo Modelo\n\n`;
  report += `### Tabelas Necessárias para Importação\n\n`;
  report += `1. **companies** - Empresas da sociedade (JJ, Designer 4 You)\n`;
  report += `2. **clients** - Clientes/Compradores (criar a partir da coluna "Comprador")\n`;
  report += `3. **projects** - Projetos (criar a partir de "Comprador" ou usar projeto genérico)\n`;
  report += `4. **suppliers** - Fornecedores (criar a partir da coluna "Fornecedor")\n`;
  report += `5. **financial_entries** - Entradas financeiras\n`;
  report += `6. **financial_exits** - Saídas financeiras\n\n`;
  
  report += `### Regras de Transformação\n\n`;
  report += `1. **Empresa**: Identificar pela aba ou primeira linha\n`;
  report += `2. **Cliente**: Criar registro em \`clients\` se não existir\n`;
  report += `3. **Projeto**: Criar projeto para cada cliente (ou usar genérico)\n`;
  report += `4. **Fornecedor**: Criar registro em \`suppliers\` se não existir (apenas para saídas)\n`;
  report += `5. **Forma de Pagamento**: Mapear para enum ('zelle', 'card', 'check', 'cash')\n`;
  report += `6. **Data**: Converter para formato DATE\n`;
  report += `7. **Semana do Ano**: Calcular automaticamente da data\n`;
  report += `8. **Status**: Todos os dados históricos como 'approved'\n`;
  report += `9. **Valor NULL**: Manter como NULL (representa pendente)\n\n`;
  
  report += `### Problemas Identificados e Soluções\n\n`;
  
  const allIssues = new Set();
  analysis.sheets.forEach(sheet => {
    sheet.patterns.issues.forEach(issueRow => {
      issueRow.issues.forEach(issue => allIssues.add(issue));
    });
  });
  
  if (allIssues.size > 0) {
    Array.from(allIssues).forEach(issue => {
      report += `- **${issue}**: `;
      if (issue.includes('Data')) {
        report += `Tentar parsear diferentes formatos de data. Se falhar, usar data atual.\n`;
      } else if (issue.includes('Valor')) {
        report += `Manter como NULL se não conseguir converter. Representa valor pendente.\n`;
      } else if (issue.includes('Descrição')) {
        report += `Usar "Sem descrição" ou pular registro.\n`;
      } else if (issue.includes('Tipo')) {
        report += `Tentar inferir pelo contexto ou marcar como não identificado.\n`;
      } else {
        report += `Revisar manualmente.\n`;
      }
    });
  } else {
    report += `Nenhum problema crítico identificado.\n`;
  }
  
  report += `\n---\n\n`;
  report += `## 📝 Próximos Passos\n\n`;
  report += `1. Revisar esta análise\n`;
  report += `2. Corrigir problemas identificados no Excel (opcional)\n`;
  report += `3. Criar script de importação baseado neste mapeamento\n`;
  report += `4. Testar importação com amostra pequena\n`;
  report += `5. Executar importação completa\n`;
  report += `6. Validar dados importados\n\n`;
  
  return report;
}

// Salvar relatório
const report = generateReport();
fs.writeFileSync(outputPath, report, 'utf-8');

console.log(`\n✅ Análise concluída!`);
console.log(`📄 Relatório salvo em: ${outputPath}`);
console.log(`\n📊 Resumo:`);
console.log(`   - ${analysis.summary.totalSheets} abas analisadas`);
console.log(`   - ${analysis.summary.totalRows} linhas totais`);
console.log(`   - ${analysis.summary.totalEntries} entradas`);
console.log(`   - ${analysis.summary.totalExits} saídas`);
console.log(`   - ${analysis.summary.clients.size} clientes únicos`);
console.log(`   - ${analysis.summary.suppliers.size} fornecedores únicos`);
