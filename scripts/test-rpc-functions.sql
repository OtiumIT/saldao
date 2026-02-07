-- Script para testar as funções RPC diretamente no Supabase
-- Execute este script no SQL Editor do Supabase para verificar se as funções estão funcionando

-- 1. Testar create_project
-- Primeiro, vamos verificar se há um client_id válido
SELECT id, name FROM clients LIMIT 1;

-- Depois, vamos verificar se há um company_id válido
SELECT id, name FROM companies LIMIT 1;

-- Agora vamos testar a função create_project
-- NOTA: Substitua os UUIDs pelos valores reais do seu banco
/*
SELECT * FROM create_project(
  p_client_id := (SELECT id FROM clients LIMIT 1),
  p_name := 'Teste Projeto RPC',
  p_company_id := (SELECT id FROM companies LIMIT 1),
  p_created_by := (SELECT id FROM profiles LIMIT 1)
);
*/

-- 2. Testar create_supplier
/*
SELECT * FROM create_supplier(
  p_name := 'Fornecedor Teste RPC',
  p_type := 'material',
  p_company_id := (SELECT id FROM companies LIMIT 1),
  p_created_by := (SELECT id FROM profiles LIMIT 1)
);
*/

-- 3. Verificar permissões das funções
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE 'create_%'
ORDER BY routine_name;

-- 4. Verificar se as funções têm GRANT EXECUTE
SELECT 
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments,
  r.rolname as grantee
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
LEFT JOIN pg_proc_acl pa ON p.oid = pa.prooid
LEFT JOIN pg_roles r ON pa.grantee = r.oid
WHERE n.nspname = 'public'
AND p.proname LIKE 'create_%'
ORDER BY p.proname, r.rolname;
