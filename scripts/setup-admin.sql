-- =============================================================================
-- SETUP INICIAL: Criar Empresa e Primeiro Admin
-- =============================================================================
-- Execute este script no SQL Editor do Supabase Dashboard
-- https://supabase.com/dashboard/project/[seu-projeto]/sql
--
-- IMPORTANTE: 
-- 1. Primeiro crie o usuário no Supabase Auth (Authentication > Users > Add User)
-- 2. Depois execute este script substituindo os valores abaixo
-- =============================================================================

-- ⚠️ CONFIGURAÇÃO - SUBSTITUA OS VALORES ABAIXO ⚠️
DO $$
DECLARE
  -- Dados da empresa
  v_company_name TEXT := 'Designer 4 You';           -- ← Nome da empresa
  
  -- Dados do admin (use o mesmo email criado no Auth)
  v_admin_email TEXT := 'admin@empresa.com';         -- ← Email do admin
  v_admin_name TEXT := 'Administrador';              -- ← Nome do admin
  
  -- Variáveis internas (não altere)
  v_company_id UUID;
  v_user_id UUID;
BEGIN
  -- ==========================================================================
  -- PASSO 1: Criar ou buscar empresa
  -- ==========================================================================
  INSERT INTO companies (name, is_active)
  VALUES (v_company_name, true)
  ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_company_id;
  
  IF v_company_id IS NULL THEN
    SELECT id INTO v_company_id FROM companies WHERE name = v_company_name;
  END IF;
  
  RAISE NOTICE '✅ Empresa: % (ID: %)', v_company_name, v_company_id;

  -- ==========================================================================
  -- PASSO 2: Buscar usuário no Auth pelo email
  -- ==========================================================================
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = LOWER(TRIM(v_admin_email));
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION '❌ Usuário não encontrado no Auth! Crie primeiro em Authentication > Users > Add User com email: %', v_admin_email;
  END IF;
  
  RAISE NOTICE '✅ Usuário encontrado no Auth: %', v_user_id;

  -- ==========================================================================
  -- PASSO 3: Criar ou atualizar profile
  -- ==========================================================================
  INSERT INTO profiles (id, user_id, email, name, role, company_id, can_create_users)
  VALUES (
    v_user_id,
    v_user_id,
    LOWER(TRIM(v_admin_email)),
    v_admin_name,
    'admin',
    v_company_id,
    true  -- ← Admin pode criar outros usuários
  )
  ON CONFLICT (id) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    company_id = EXCLUDED.company_id,
    can_create_users = EXCLUDED.can_create_users,
    updated_at = NOW();
  
  RAISE NOTICE '✅ Profile criado/atualizado com sucesso!';
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ SETUP CONCLUÍDO!';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE 'Empresa: %', v_company_name;
  RAISE NOTICE 'Admin: % (%)', v_admin_name, v_admin_email;
  RAISE NOTICE 'Pode criar usuários: Sim';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
END $$;

-- =============================================================================
-- VERIFICAÇÃO: Mostra o resultado
-- =============================================================================
SELECT 
  c.name as empresa,
  p.name as usuario,
  p.email,
  p.role as funcao,
  p.can_create_users as pode_criar_usuarios
FROM profiles p
JOIN companies c ON c.id = p.company_id
ORDER BY c.name, p.name;
