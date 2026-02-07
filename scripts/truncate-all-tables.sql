-- Script para fazer TRUNCATE em todas as tabelas, mantendo apenas profiles e companies
-- ATENÇÃO: Este script irá APAGAR TODOS OS DADOS das tabelas listadas abaixo
-- Execute apenas se tiver certeza!

-- Desabilitar temporariamente as constraints de foreign key para evitar erros
SET session_replication_role = 'replica';

-- Tabelas que serão truncadas (em ordem para respeitar foreign keys)
-- Ordem: primeiro as tabelas dependentes, depois as principais

-- Tabelas de relacionamento e histórico
TRUNCATE TABLE approval_history CASCADE;
TRUNCATE TABLE financial_exit_labor CASCADE;
TRUNCATE TABLE estimate_items CASCADE;
TRUNCATE TABLE partnership_companies CASCADE;

-- Tabelas principais de dados
TRUNCATE TABLE financial_exits CASCADE;
TRUNCATE TABLE financial_entries CASCADE;
TRUNCATE TABLE estimates CASCADE;
TRUNCATE TABLE projects CASCADE;
TRUNCATE TABLE clients CASCADE;
TRUNCATE TABLE suppliers CASCADE;
TRUNCATE TABLE labor CASCADE;
TRUNCATE TABLE partnerships CASCADE;
TRUNCATE TABLE cost_categories CASCADE;

-- Reabilitar constraints
SET session_replication_role = 'origin';

-- Verificar se as tabelas foram limpas (opcional - descomente para verificar)
-- SELECT 
--   'clients' as tabela, COUNT(*) as registros FROM clients
-- UNION ALL
-- SELECT 'projects', COUNT(*) FROM projects
-- UNION ALL
-- SELECT 'suppliers', COUNT(*) FROM suppliers
-- UNION ALL
-- SELECT 'labor', COUNT(*) FROM labor
-- UNION ALL
-- SELECT 'estimates', COUNT(*) FROM estimates
-- UNION ALL
-- SELECT 'financial_entries', COUNT(*) FROM financial_entries
-- UNION ALL
-- SELECT 'financial_exits', COUNT(*) FROM financial_exits
-- UNION ALL
-- SELECT 'partnerships', COUNT(*) FROM partnerships
-- UNION ALL
-- SELECT 'profiles', COUNT(*) FROM profiles
-- UNION ALL
-- SELECT 'companies', COUNT(*) FROM companies;

-- Mensagem de confirmação
DO $$
BEGIN
  RAISE NOTICE '✅ TRUNCATE concluído com sucesso!';
  RAISE NOTICE '📊 Tabelas mantidas: profiles, companies';
  RAISE NOTICE '🗑️  Tabelas limpas: clients, projects, suppliers, labor, estimates, financial_entries, financial_exits, partnerships, cost_categories e suas tabelas relacionadas';
END $$;
