-- =============================================================================
-- CONSULTA: Empresas cadastradas e seus usuários
-- =============================================================================
-- Execute no SQL Editor do Supabase para ver os dados existentes

-- Empresas cadastradas
SELECT 
  id as empresa_id,
  name as empresa_nome,
  is_active as ativa
FROM companies
ORDER BY name;

-- Usuários no Auth (para vincular ao profile)
SELECT 
  id as user_id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC;

-- Profiles existentes (usuários já configurados)
SELECT 
  p.id,
  p.email,
  p.name as nome,
  p.role as funcao,
  p.can_create_users as pode_criar_usuarios,
  c.name as empresa
FROM profiles p
LEFT JOIN companies c ON c.id = p.company_id
ORDER BY c.name, p.name;
