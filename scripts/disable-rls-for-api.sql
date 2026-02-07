-- Script para DESABILITAR RLS em TODAS as tabelas do banco
-- A API já tem autenticação própria e validação de permissões
-- O service_role_key será usado para acesso total

-- Desabilitar RLS em TODAS as tabelas
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE labor DISABLE ROW LEVEL SECURITY;
ALTER TABLE cost_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE estimates DISABLE ROW LEVEL SECURITY;
ALTER TABLE estimate_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE financial_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE financial_exits DISABLE ROW LEVEL SECURITY;
ALTER TABLE financial_exit_labor DISABLE ROW LEVEL SECURITY;
ALTER TABLE approval_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE partnerships DISABLE ROW LEVEL SECURITY;
ALTER TABLE partnership_companies DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas RLS dessas tabelas (opcional, mas limpa o banco)
-- Clients
DROP POLICY IF EXISTS "Users can view all clients" ON clients;
DROP POLICY IF EXISTS "Users can view all clients in society" ON clients;
DROP POLICY IF EXISTS "Users can create clients" ON clients;
DROP POLICY IF EXISTS "Users can create clients in own company" ON clients;
DROP POLICY IF EXISTS "Users can update clients" ON clients;
DROP POLICY IF EXISTS "Users can update own company clients" ON clients;
DROP POLICY IF EXISTS "Users can delete clients" ON clients;
DROP POLICY IF EXISTS "Users can delete own company clients" ON clients;

-- Projects
DROP POLICY IF EXISTS "Users can view all projects" ON projects;
DROP POLICY IF EXISTS "Users can view all projects in society" ON projects;
DROP POLICY IF EXISTS "Users can create projects" ON projects;
DROP POLICY IF EXISTS "Users can create projects in own company" ON projects;
DROP POLICY IF EXISTS "Users can update projects" ON projects;
DROP POLICY IF EXISTS "Users can update own company projects" ON projects;
DROP POLICY IF EXISTS "Users can delete projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own company projects" ON projects;

-- Suppliers
DROP POLICY IF EXISTS "Users can view all suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can view all suppliers in society" ON suppliers;
DROP POLICY IF EXISTS "Users can create suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can create suppliers in own company" ON suppliers;
DROP POLICY IF EXISTS "Users can update suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can update own company suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can delete suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can delete own company suppliers" ON suppliers;

-- Labor
DROP POLICY IF EXISTS "Users can view all labor" ON labor;
DROP POLICY IF EXISTS "Users can view all labor in society" ON labor;
DROP POLICY IF EXISTS "Users can create labor" ON labor;
DROP POLICY IF EXISTS "Users can create labor in own company" ON labor;
DROP POLICY IF EXISTS "Users can update labor" ON labor;
DROP POLICY IF EXISTS "Users can update own company labor" ON labor;
DROP POLICY IF EXISTS "Users can delete labor" ON labor;
DROP POLICY IF EXISTS "Users can delete own company labor" ON labor;

-- Cost categories
DROP POLICY IF EXISTS "Users can view all cost categories" ON cost_categories;
DROP POLICY IF EXISTS "Users can create cost categories" ON cost_categories;
DROP POLICY IF EXISTS "Users can update cost categories" ON cost_categories;

-- Estimates
DROP POLICY IF EXISTS "Users can view all estimates" ON estimates;
DROP POLICY IF EXISTS "Users can view all estimates in society" ON estimates;
DROP POLICY IF EXISTS "Users can create estimates" ON estimates;
DROP POLICY IF EXISTS "Users can create estimates in own company" ON estimates;
DROP POLICY IF EXISTS "Users can update estimates" ON estimates;
DROP POLICY IF EXISTS "Users can update own company estimates" ON estimates;

-- Estimate items
DROP POLICY IF EXISTS "Users can view estimate items" ON estimate_items;
DROP POLICY IF EXISTS "Users can create estimate items" ON estimate_items;
DROP POLICY IF EXISTS "Users can update estimate items" ON estimate_items;
DROP POLICY IF EXISTS "Users can delete estimate items" ON estimate_items;

-- Financial entries
DROP POLICY IF EXISTS "Users can view all financial entries" ON financial_entries;
DROP POLICY IF EXISTS "Users can view all financial entries in society" ON financial_entries;
DROP POLICY IF EXISTS "Users can create financial entries" ON financial_entries;
DROP POLICY IF EXISTS "Users can create financial entries in own company" ON financial_entries;
DROP POLICY IF EXISTS "Users can update financial entries" ON financial_entries;
DROP POLICY IF EXISTS "Users can update own company financial entries" ON financial_entries;

-- Financial exits
DROP POLICY IF EXISTS "Users can view all financial exits" ON financial_exits;
DROP POLICY IF EXISTS "Users can view all financial exits in society" ON financial_exits;
DROP POLICY IF EXISTS "Users can create financial exits" ON financial_exits;
DROP POLICY IF EXISTS "Users can create financial exits in own company" ON financial_exits;
DROP POLICY IF EXISTS "Users can update financial exits" ON financial_exits;
DROP POLICY IF EXISTS "Users can update own company financial exits" ON financial_exits;

-- Financial exit labor
DROP POLICY IF EXISTS "Users can view financial exit labor" ON financial_exit_labor;
DROP POLICY IF EXISTS "Users can create financial exit labor" ON financial_exit_labor;
DROP POLICY IF EXISTS "Users can update financial exit labor" ON financial_exit_labor;
DROP POLICY IF EXISTS "Users can delete financial exit labor" ON financial_exit_labor;

-- Approval history
DROP POLICY IF EXISTS "Users can view approval history" ON approval_history;
DROP POLICY IF EXISTS "Users can create approval history" ON approval_history;

-- Companies
DROP POLICY IF EXISTS "Users can view all companies" ON companies;
DROP POLICY IF EXISTS "Users can create companies" ON companies;
DROP POLICY IF EXISTS "Users can update own company" ON companies;

-- Partnerships
DROP POLICY IF EXISTS "Users can view all partnerships" ON partnerships;
DROP POLICY IF EXISTS "Users can create partnerships" ON partnerships;
DROP POLICY IF EXISTS "Users can update own partnerships" ON partnerships;
DROP POLICY IF EXISTS "Users can delete own partnerships" ON partnerships;
DROP POLICY IF EXISTS "Users can view all partnership companies" ON partnership_companies;
DROP POLICY IF EXISTS "Users can manage partnership companies" ON partnership_companies;

-- Remover políticas de profiles também
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own company profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own or company profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can create profiles in own company" ON profiles;

-- Mensagem de confirmação
DO $$
BEGIN
  RAISE NOTICE '✅ RLS DESABILITADO EM TODAS AS TABELAS!';
  RAISE NOTICE '📊 Tabelas com RLS desabilitado: profiles, clients, projects, suppliers, labor, estimates, financial_entries, financial_exits, companies, partnerships e todas as relacionadas';
  RAISE NOTICE '⚠️  A API agora tem acesso total a todas as tabelas usando service_role_key';
  RAISE NOTICE '🔒 Segurança agora depende exclusivamente da validação de permissões na API';
END $$;
