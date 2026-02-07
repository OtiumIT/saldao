/**
 * Script de teste para todas as APIs
 * 
 * Uso:
 *   API_URL=https://api.partnerfinancecontrol.com TEST_EMAIL=email@example.com TEST_PASSWORD=senha npx tsx scripts/test-api.ts
 * 
 * Requer variáveis de ambiente:
 *   - API_URL: URL da API (ex: https://api.partnerfinancecontrol.com)
 *   - TEST_EMAIL: Email do usuário de teste
 *   - TEST_PASSWORD: Senha do usuário de teste
 */

const API_URL = process.env.API_URL || 'https://api.partnerfinancecontrol.com';
const TEST_EMAIL = process.env.TEST_EMAIL || '';
const TEST_PASSWORD = process.env.TEST_PASSWORD || '';

interface TestResult {
  endpoint: string;
  method: string;
  status: number;
  success: boolean;
  error?: string;
  duration: number;
}

const results: TestResult[] = [];
let authToken: string | null = null;
let createdResources: { [key: string]: string } = {}; // Armazenar IDs de recursos criados

async function testEndpoint(
  method: string,
  endpoint: string,
  body?: unknown,
  requiresAuth = true
): Promise<TestResult> {
  const startTime = Date.now();
  const url = `${API_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (requiresAuth && authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json().catch(() => ({ error: 'Failed to parse response' }));
    const duration = Date.now() - startTime;

    return {
      endpoint,
      method,
      status: response.status,
      success: response.ok,
      error: response.ok ? undefined : (data.error || data.message || 'Unknown error'),
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      endpoint,
      method,
      status: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
      duration,
    };
  }
}

async function login(): Promise<boolean> {
  console.log('🔐 Testando login...');
  
  if (!TEST_EMAIL || !TEST_PASSWORD) {
    console.log('⚠️  TEST_EMAIL e TEST_PASSWORD não fornecidos. Pulando testes autenticados.');
    return false;
  }
  
  const startTime = Date.now();
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
    });

    const data = await response.json();
    const duration = Date.now() - startTime;

    if (response.ok && data.access_token) {
      authToken = data.access_token;
      console.log(`✅ Login bem-sucedido (${duration}ms)`);
      return true;
    } else {
      console.log(`❌ Login falhou (${duration}ms):`, data.error || 'Erro desconhecido');
      return false;
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(`❌ Erro de rede no login (${duration}ms):`, error instanceof Error ? error.message : 'Erro desconhecido');
    return false;
  }
}

async function runTests() {
  console.log('🚀 Iniciando testes da API...\n');
  console.log(`API URL: ${API_URL}`);
  console.log(`Email de teste: ${TEST_EMAIL}\n`);

  // 1. Health Check
  console.log('📋 Testando Health Check...');
  results.push(await testEndpoint('GET', '/health', undefined, false));
  
  // 2. Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('\n❌ Não foi possível fazer login. Testes autenticados serão pulados.');
  }

  // 3. Profile
  console.log('\n👤 Testando Profile...');
  results.push(await testEndpoint('GET', '/api/auth/profile'));

  // 4. Clients
  console.log('\n👥 Testando Clients...');
  results.push(await testEndpoint('GET', '/api/clients'));
  const clientResult = await testEndpoint('POST', '/api/clients', {
    name: 'Cliente Teste API',
    email: 'teste-api@example.com',
  });
  results.push(clientResult);
  if (clientResult.success && clientResult.status === 201) {
    // Tentar extrair ID da resposta (seria necessário fazer fetch real)
    console.log('  ℹ️  Cliente criado (ID não capturado no teste)');
  }
  
  // 5. Projects
  console.log('\n📁 Testando Projects...');
  results.push(await testEndpoint('GET', '/api/projects'));
  
  // Buscar um client_id real para criar projeto
  const clientsResponse = await fetch(`${API_URL}/api/clients`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  });
  const clients = await clientsResponse.json().catch(() => []);
  const realClientId = Array.isArray(clients) && clients.length > 0 ? clients[0].id : null;
  
  if (realClientId) {
    results.push(await testEndpoint('POST', '/api/projects', {
      name: 'Projeto Teste API',
      client_id: realClientId,
      status: 'budget',
    }));
  } else {
    console.log('  ⚠️  Nenhum cliente encontrado, pulando criação de projeto');
  }
  
  // 6. Suppliers
  console.log('\n🏢 Testando Suppliers...');
  results.push(await testEndpoint('GET', '/api/suppliers'));
  results.push(await testEndpoint('POST', '/api/suppliers', {
    name: 'Fornecedor Teste API',
    type: 'material',
  }));
  
  // 7. Labor
  console.log('\n👷 Testando Labor...');
  results.push(await testEndpoint('GET', '/api/labor'));
  results.push(await testEndpoint('POST', '/api/labor', {
    name: 'Mão de Obra Teste',
    type: 'hourly',
    rate: 50,
  }));
  
  // 8. Estimates
  console.log('\n📊 Testando Estimates...');
  results.push(await testEndpoint('GET', '/api/estimates'));
  
  // Buscar um project_id real
  const projectsResponse = await fetch(`${API_URL}/api/projects`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  });
  const projects = await projectsResponse.json().catch(() => []);
  const realProjectId = Array.isArray(projects) && projects.length > 0 ? projects[0].id : null;
  
  if (realProjectId) {
    results.push(await testEndpoint('POST', '/api/estimates', {
      project_id: realProjectId,
      estimated_revenue: 1000,
    }));
  } else {
    console.log('  ⚠️  Nenhum projeto encontrado, pulando criação de estimate');
  }
  
  // 9. Financial Entries
  console.log('\n💰 Testando Financial Entries...');
  results.push(await testEndpoint('GET', '/api/financial-entries'));
  if (realProjectId) {
    results.push(await testEndpoint('POST', '/api/financial-entries', {
      project_id: realProjectId,
      description: 'Entrada Teste',
      value: 100,
      entry_date: new Date().toISOString(),
      payment_method: 'zelle',
    }));
  } else {
    console.log('  ⚠️  Nenhum projeto encontrado, pulando criação de entrada financeira');
  }
  
  // 10. Financial Exits
  console.log('\n💸 Testando Financial Exits...');
  results.push(await testEndpoint('GET', '/api/financial-exits'));
  if (realProjectId) {
    results.push(await testEndpoint('POST', '/api/financial-exits', {
      project_id: realProjectId,
      description: 'Saída Teste',
      value: 50,
      exit_date: new Date().toISOString(),
      payment_method: 'card',
    }));
  } else {
    console.log('  ⚠️  Nenhum projeto encontrado, pulando criação de saída financeira');
  }
  
  // 11. Reports - todos os endpoints
  console.log('\n📈 Testando Reports...');
  results.push(await testEndpoint('GET', '/api/reports/monthly-summary'));
  results.push(await testEndpoint('GET', '/api/reports/project-comparison'));
  results.push(await testEndpoint('GET', '/api/reports/projects-summary'));
  results.push(await testEndpoint('GET', '/api/reports/partner-division'));
  results.push(await testEndpoint('GET', '/api/reports/period'));
  
  // 12. Partnerships
  console.log('\n🤝 Testando Partnerships...');
  results.push(await testEndpoint('GET', '/api/partnerships'));
  results.push(await testEndpoint('POST', '/api/partnerships', {
    name: 'Parceria Teste API',
    companies: [],
  }));
  
  // 13. Users (só se tiver permissão)
  console.log('\n👥 Testando Users...');
  results.push(await testEndpoint('GET', '/api/users'));
  results.push(await testEndpoint('GET', '/api/users/companies'));
  
  // 14. Companies (só super admin)
  console.log('\n🏭 Testando Companies...');
  results.push(await testEndpoint('GET', '/api/companies'));
  // Usar timestamp para garantir nome único
  const uniqueCompanyName = `Empresa Teste API ${Date.now()}`;
  results.push(await testEndpoint('POST', '/api/companies', {
    name: uniqueCompanyName,
  }));
  
  // 15. Approvals
  console.log('\n✅ Testando Approvals...');
  results.push(await testEndpoint('GET', '/api/approvals/pending'));
  
  // 16. Auth - outros endpoints
  console.log('\n🔐 Testando Auth (outros endpoints)...');
  results.push(await testEndpoint('POST', '/api/auth/logout', {}, true));
  results.push(await testEndpoint('POST', '/api/auth/forgot-password', {
    email: 'teste@example.com',
  }, false));
  
  // 17. Test Email
  console.log('\n📧 Testando Email...');
  results.push(await testEndpoint('POST', '/api/test/test-email', {
    to: 'teste@example.com',
    subject: 'Teste',
    html: '<p>Teste</p>',
  }));

  // 18. GET por ID (buscar específico)
  console.log('\n🔍 Testando GET por ID...');
  if (realClientId) {
    results.push(await testEndpoint('GET', `/api/clients/${realClientId}`));
  }
  if (realProjectId) {
    results.push(await testEndpoint('GET', `/api/projects/${realProjectId}`));
  }
  
  // Buscar partnership_id real
  const partnershipsResponse = await fetch(`${API_URL}/api/partnerships`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  });
  const partnerships = await partnershipsResponse.json().catch(() => []);
  const realPartnershipId = Array.isArray(partnerships) && partnerships.length > 0 ? partnerships[0].id : null;
  if (realPartnershipId) {
    results.push(await testEndpoint('GET', `/api/partnerships/${realPartnershipId}`));
  }

  // 19. PATCH (atualizar)
  console.log('\n✏️  Testando PATCH (atualizar)...');
  if (realClientId) {
    results.push(await testEndpoint('PATCH', `/api/clients/${realClientId}`, {
      name: 'Cliente Atualizado Teste',
    }));
  }
  if (realProjectId) {
    results.push(await testEndpoint('PATCH', `/api/projects/${realProjectId}`, {
      name: 'Projeto Atualizado Teste',
    }));
  }
  
  // Buscar supplier_id real
  const suppliersResponse = await fetch(`${API_URL}/api/suppliers`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  });
  const suppliers = await suppliersResponse.json().catch(() => []);
  const realSupplierId = Array.isArray(suppliers) && suppliers.length > 0 ? suppliers[0].id : null;
  if (realSupplierId) {
    results.push(await testEndpoint('PATCH', `/api/suppliers/${realSupplierId}`, {
      name: 'Fornecedor Atualizado Teste',
    }));
  }

  // Buscar financial_entry_id real
  const entriesResponse = await fetch(`${API_URL}/api/financial-entries`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  });
  const entries = await entriesResponse.json().catch(() => []);
  const realEntryId = Array.isArray(entries) && entries.length > 0 ? entries[0].id : null;
  if (realEntryId) {
    results.push(await testEndpoint('PATCH', `/api/financial-entries/${realEntryId}`, {
      description: 'Entrada Atualizada Teste',
    }));
  }

  // Buscar financial_exit_id real
  const exitsResponse = await fetch(`${API_URL}/api/financial-exits`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  });
  const exits = await exitsResponse.json().catch(() => []);
  const realExitId = Array.isArray(exits) && exits.length > 0 ? exits[0].id : null;
  if (realExitId) {
    results.push(await testEndpoint('PATCH', `/api/financial-exits/${realExitId}`, {
      description: 'Saída Atualizada Teste',
    }));
  }

  // 20. POST Approve (aprovar)
  console.log('\n✅ Testando POST Approve...');
  if (realEntryId) {
    results.push(await testEndpoint('POST', `/api/financial-entries/${realEntryId}/approve`));
  }
  if (realExitId) {
    results.push(await testEndpoint('POST', `/api/financial-exits/${realExitId}/approve`));
  }
  
  // Buscar estimate_id real
  const estimatesResponse = await fetch(`${API_URL}/api/estimates`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  });
  const estimates = await estimatesResponse.json().catch(() => []);
  const realEstimateId = Array.isArray(estimates) && estimates.length > 0 ? estimates[0].id : null;
  if (realEstimateId) {
    results.push(await testEndpoint('POST', `/api/estimates/${realEstimateId}/approve`));
    results.push(await testEndpoint('POST', `/api/estimates/${realEstimateId}/lock`));
  }

  // 21. GET Approvals History
  console.log('\n📜 Testando Histórico de Aprovações...');
  if (realEntryId) {
    results.push(await testEndpoint('GET', `/api/approvals/history/financial_entries/${realEntryId}`));
  }
  if (realExitId) {
    results.push(await testEndpoint('GET', `/api/approvals/history/financial_exits/${realExitId}`));
  }
  if (realEstimateId) {
    results.push(await testEndpoint('GET', `/api/approvals/history/estimates/${realEstimateId}`));
  }

  // 22. Auth - Reset Password
  console.log('\n🔐 Testando Auth - Reset Password...');
  results.push(await testEndpoint('POST', '/api/auth/reset-password', {
    token: 'dummy-token',
    password: 'NewPassword123!',
  }, false));

  // Resumo
  console.log('\n' + '='.repeat(80));
  console.log('📊 RESUMO DOS TESTES');
  console.log('='.repeat(80));
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  
  console.log(`\n✅ Sucessos: ${successful}`);
  console.log(`❌ Falhas: ${failed}`);
  console.log(`⏱️  Tempo total: ${totalDuration}ms`);
  console.log(`📈 Taxa de sucesso: ${((successful / results.length) * 100).toFixed(1)}%\n`);

  // Detalhes das falhas
  if (failed > 0) {
    console.log('❌ FALHAS DETALHADAS:');
    console.log('-'.repeat(80));
    results
      .filter(r => !r.success)
      .forEach(r => {
        console.log(`\n${r.method} ${r.endpoint}`);
        console.log(`  Status: ${r.status}`);
        console.log(`  Erro: ${r.error || 'Unknown'}`);
        console.log(`  Duração: ${r.duration}ms`);
      });
  }

  // Detalhes de todos os testes
  console.log('\n📋 TODOS OS TESTES:');
  console.log('-'.repeat(80));
  results.forEach(r => {
    const icon = r.success ? '✅' : '❌';
    console.log(`${icon} ${r.method.padEnd(6)} ${r.endpoint.padEnd(40)} ${r.status.toString().padStart(3)} ${r.duration}ms`);
  });

  console.log('\n');
}

// Executar testes
runTests().catch(console.error);
