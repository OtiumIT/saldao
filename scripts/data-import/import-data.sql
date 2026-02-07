-- ============================================
-- Script de Importação de Dados
-- Gerado automaticamente a partir do Excel "Finanças Empresarial.xlsx"
-- Data: 31/12/2025, 15:01:49
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

INSERT INTO companies (id, name, legal_name, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'JJ',
  'JJ LTDA',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (name) DO UPDATE SET updated_at = NOW()
RETURNING id, name;

INSERT INTO companies (id, name, legal_name, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Designer 4 You',
  'Designer 4 You LTDA',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (name) DO UPDATE SET updated_at = NOW()
RETURNING id, name;

-- ============================================
-- 2. CRIAR USUÁRIOS ADMIN
-- ============================================

-- Habilitar extensão para hash de senha
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Criar usuário admin para JJ
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'adminjj@example.com',
    crypt('admin123', gen_salt('bf')),
    CURRENT_TIMESTAMP,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"name": "Admin JJ"}'::jsonb,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING
RETURNING id, email;

-- Criar usuário admin para Designer 4 You
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admindesigner4you@example.com',
    crypt('admin123', gen_salt('bf')),
    CURRENT_TIMESTAMP,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"name": "Admin Designer 4 You"}'::jsonb,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING
RETURNING id, email;

-- ============================================
-- 3. ATUALIZAR PERFIS COM COMPANY_ID E PERMISSÕES
-- ============================================

-- Atualizar perfil do admin JJ
UPDATE profiles
SET 
    company_id = (SELECT id FROM companies WHERE name = 'JJ' LIMIT 1),
    can_create_users = true,
    role = 'admin'
WHERE email = 'adminjj@example.com';

-- Atualizar perfil do admin Designer 4 You
UPDATE profiles
SET 
    company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You' LIMIT 1),
    can_create_users = true,
    role = 'admin'
WHERE email = 'admindesigner4you@example.com';

-- ============================================
-- 4. CRIAR CLIENTES
-- ============================================

INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Marion',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Marion')
)
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Sammy',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Sammy')
)
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Sammy',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Sammy')
)
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Renata',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Renata')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'RENATA',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('RENATA')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'HERN',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('HERN')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'HERN',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('HERN')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Renata',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Renata')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Renata 2',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Renata 2')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Renata 2',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Renata 2')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Janete',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Janete')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Janete',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Janete')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Reggie',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Reggie')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Reggie',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Reggie')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Donna',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Donna')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Donna',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Donna')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'George',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('George')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'George',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('George')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Ronda',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Ronda')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Ronda',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Ronda')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Steve',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Steve')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Steve',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Steve')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Paloma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Paloma')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Paloma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Paloma')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Renata 3',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Renata 3')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Renata 3',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Renata 3')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Barbara',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Barbara')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Barbara',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Barbara')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Luzete',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Luzete')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Luzete',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Luzete')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Donna 2',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Donna 2')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Donna 2',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Donna 2')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Donna2',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Donna2')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Donna2',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Donna2')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Amber',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Amber')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Amber',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Amber')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Helena',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Helena')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Helena',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Helena')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Reggie 2',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Reggie 2')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Jennie',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Jennie')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Donna Loira',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Donna Loira')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Ronda 2',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Ronda 2')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Reggie 2',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Reggie 2')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Ronda 2',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Ronda 2')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Ronda 3',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Ronda 3')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Jay',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Jay')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Jay',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Jay')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Ronda 3',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Ronda 3')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Christin',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Christin')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Christin',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Christin')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Hipica',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Hipica')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Hipica',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Hipica')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Dominic',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Dominic')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Denise',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Denise')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Denise',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Denise')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Marion',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Marion')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Jesse',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Jesse')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Shery',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Shery')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Jenny',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Jenny')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Dominic',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Dominic')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Shery',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Shery')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Jenny',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Jenny')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Heather',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Heather')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Donna Loira',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Donna Loira')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Tom',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Tom')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Jay 2',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Jay 2')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Jay 2',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Jay 2')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Gail',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Gail')
RETURNING id, name;


INSERT INTO clients (id, name, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Jennie',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM clients 
  WHERE LOWER(name) = LOWER('Jennie')
RETURNING id, name;

-- ============================================
-- 5. CRIAR PROJETOS (1 por cliente)
-- ============================================

INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Marion',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Marion') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'JJ'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Marion' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Marion') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Sammy',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Sammy') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Sammy' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Sammy') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Sammy',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Sammy') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'JJ'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Sammy' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Sammy') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Renata',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Renata') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'JJ'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Renata' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Renata') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'RENATA',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('RENATA') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'RENATA' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('RENATA') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'HERN',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('HERN') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'JJ'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'HERN' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('HERN') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'HERN',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('HERN') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'HERN' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('HERN') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Renata',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Renata') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Renata' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Renata') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Renata 2',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Renata 2') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'JJ'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Renata 2' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Renata 2') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Renata 2',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Renata 2') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Renata 2' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Renata 2') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Janete',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Janete') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Janete' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Janete') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Janete',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Janete') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'JJ'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Janete' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Janete') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Reggie',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Reggie') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'JJ'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Reggie' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Reggie') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Reggie',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Reggie') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Reggie' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Reggie') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Donna',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Donna') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'JJ'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Donna' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Donna') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Donna',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Donna') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Donna' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Donna') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'George',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('George') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'George' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('George') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'George',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('George') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'JJ'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'George' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('George') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Ronda',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Ronda') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'JJ'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Ronda' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Ronda') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Ronda',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Ronda') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Ronda' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Ronda') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Steve',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Steve') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'JJ'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Steve' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Steve') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Steve',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Steve') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Steve' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Steve') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Paloma',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Paloma') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Paloma' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Paloma') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Paloma',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Paloma') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'JJ'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Paloma' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Paloma') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Renata 3',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Renata 3') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'JJ'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Renata 3' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Renata 3') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Renata 3',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Renata 3') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Renata 3' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Renata 3') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Barbara',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Barbara') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Barbara' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Barbara') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Barbara',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Barbara') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'JJ'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Barbara' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Barbara') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Luzete',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Luzete') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Luzete' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Luzete') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Luzete',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Luzete') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'JJ'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Luzete' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Luzete') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Donna 2',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Donna 2') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'JJ'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Donna 2' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Donna 2') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Donna 2',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Donna 2') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Donna 2' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Donna 2') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Donna2',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Donna2') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'JJ'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Donna2' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Donna2') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Donna2',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Donna2') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Donna2' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Donna2') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Amber',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Amber') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Amber' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Amber') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Amber',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Amber') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'JJ'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Amber' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Amber') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Helena',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Helena') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Helena' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Helena') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Helena',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Helena') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'JJ'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Helena' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Helena') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Reggie 2',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Reggie 2') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'JJ'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Reggie 2' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Reggie 2') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Jennie',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Jennie') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'JJ'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Jennie' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Jennie') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Donna Loira',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Donna Loira') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'JJ'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Donna Loira' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Donna Loira') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Ronda 2',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Ronda 2') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'JJ'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Ronda 2' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Ronda 2') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Reggie 2',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Reggie 2') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Reggie 2' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Reggie 2') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Ronda 2',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Ronda 2') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Ronda 2' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Ronda 2') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Ronda 3',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Ronda 3') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'JJ'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Ronda 3' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Ronda 3') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Jay',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Jay') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'JJ'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Jay' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Jay') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Jay',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Jay') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Jay' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Jay') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Ronda 3',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Ronda 3') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Ronda 3' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Ronda 3') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Christin',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Christin') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'JJ'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Christin' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Christin') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Christin',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Christin') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Christin' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Christin') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Hipica',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Hipica') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'JJ'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Hipica' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Hipica') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Hipica',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Hipica') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Hipica' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Hipica') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Dominic',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Dominic') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Dominic' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Dominic') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Denise',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Denise') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Denise' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Denise') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Denise',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Denise') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'JJ'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Denise' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Denise') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Marion',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Marion') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Marion' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Marion') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Jesse',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Jesse') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Jesse' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Jesse') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Shery',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Shery') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Shery' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Shery') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Jenny',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Jenny') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Jenny' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Jenny') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Dominic',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Dominic') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'JJ'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Dominic' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Dominic') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Shery',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Shery') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'JJ'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Shery' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Shery') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Jenny',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Jenny') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'JJ'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Jenny' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Jenny') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Heather',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Heather') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Heather' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Heather') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Donna Loira',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Donna Loira') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Donna Loira' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Donna Loira') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Tom',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Tom') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'JJ'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Tom' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Tom') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Jay 2',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Jay 2') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Jay 2' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Jay 2') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Jay 2',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Jay 2') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'JJ'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Jay 2' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Jay 2') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Gail',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Gail') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Gail' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Gail') LIMIT 1)
)
RETURNING id, name;


INSERT INTO projects (id, name, client_id, company_id, status, partner_1_percentage, partner_2_percentage, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Jennie',
  (SELECT id FROM clients WHERE LOWER(name) = LOWER('Jennie') LIMIT 1),
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'in_progress',
  50.00,
  50.00,
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects 
  WHERE name = 'Jennie' 
  AND client_id = (SELECT id FROM clients WHERE LOWER(name) = LOWER('Jennie') LIMIT 1)
)
RETURNING id, name;

-- ============================================
-- 6. CRIAR FORNECEDORES
-- ============================================

INSERT INTO suppliers (id, name, type, is_company, supplier_category, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Imeca',
  'material',
  true,
  'material',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM suppliers 
  WHERE name = 'Imeca' 
)
RETURNING id, name;


INSERT INTO suppliers (id, name, type, is_company, supplier_category, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'The Home Depot',
  'material',
  true,
  'material',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM suppliers 
  WHERE name = 'The Home Depot' 
)
RETURNING id, name;


INSERT INTO suppliers (id, name, type, is_company, supplier_category, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Amazon',
  'material',
  true,
  'material',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM suppliers 
  WHERE name = 'Amazon' 
)
RETURNING id, name;


INSERT INTO suppliers (id, name, type, is_company, supplier_category, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Lowe''s',
  'material',
  true,
  'material',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM suppliers 
  WHERE name = 'Lowe''s' 
)
RETURNING id, name;


INSERT INTO suppliers (id, name, type, is_company, supplier_category, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'The Home Depot',
  'material',
  true,
  'material',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM suppliers 
  WHERE name = 'The Home Depot' 
)
RETURNING id, name;


INSERT INTO suppliers (id, name, type, is_company, supplier_category, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Walmart',
  'material',
  true,
  'material',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM suppliers 
  WHERE name = 'Walmart' 
)
RETURNING id, name;


INSERT INTO suppliers (id, name, type, is_company, supplier_category, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Sherwin-Williams',
  'material',
  true,
  'material',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM suppliers 
  WHERE name = 'Sherwin-Williams' 
)
RETURNING id, name;


INSERT INTO suppliers (id, name, type, is_company, supplier_category, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Laumber',
  'material',
  true,
  'material',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM suppliers 
  WHERE name = 'Laumber' 
)
RETURNING id, name;


INSERT INTO suppliers (id, name, type, is_company, supplier_category, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Gabriel',
  'material',
  true,
  'material',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM suppliers 
  WHERE name = 'Gabriel' 
)
RETURNING id, name;


INSERT INTO suppliers (id, name, type, is_company, supplier_category, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Imeca',
  'material',
  true,
  'material',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM suppliers 
  WHERE name = 'Imeca' 
)
RETURNING id, name;


INSERT INTO suppliers (id, name, type, is_company, supplier_category, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'CNC',
  'material',
  true,
  'material',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM suppliers 
  WHERE name = 'CNC' 
)
RETURNING id, name;


INSERT INTO suppliers (id, name, type, is_company, supplier_category, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Amazon',
  'material',
  true,
  'material',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM suppliers 
  WHERE name = 'Amazon' 
)
RETURNING id, name;


INSERT INTO suppliers (id, name, type, is_company, supplier_category, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'CNC',
  'material',
  true,
  'material',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM suppliers 
  WHERE name = 'CNC' 
)
RETURNING id, name;


INSERT INTO suppliers (id, name, type, is_company, supplier_category, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'amazon',
  'material',
  true,
  'material',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM suppliers 
  WHERE name = 'amazon' 
)
RETURNING id, name;


INSERT INTO suppliers (id, name, type, is_company, supplier_category, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'imeca',
  'material',
  true,
  'material',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM suppliers 
  WHERE name = 'imeca' 
)
RETURNING id, name;


INSERT INTO suppliers (id, name, type, is_company, supplier_category, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Sherwin-Williams',
  'material',
  true,
  'material',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM suppliers 
  WHERE name = 'Sherwin-Williams' 
)
RETURNING id, name;


INSERT INTO suppliers (id, name, type, is_company, supplier_category, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'cnc',
  'material',
  true,
  'material',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM suppliers 
  WHERE name = 'cnc' 
)
RETURNING id, name;


INSERT INTO suppliers (id, name, type, is_company, supplier_category, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Lowe''s',
  'material',
  true,
  'material',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM suppliers 
  WHERE name = 'Lowe''s' 
)
RETURNING id, name;


INSERT INTO suppliers (id, name, type, is_company, supplier_category, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'amazon',
  'material',
  true,
  'material',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM suppliers 
  WHERE name = 'amazon' 
)
RETURNING id, name;


INSERT INTO suppliers (id, name, type, is_company, supplier_category, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'DL Cabinets',
  'material',
  true,
  'material',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM suppliers 
  WHERE name = 'DL Cabinets' 
)
RETURNING id, name;


INSERT INTO suppliers (id, name, type, is_company, supplier_category, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'lumber',
  'material',
  true,
  'material',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM suppliers 
  WHERE name = 'lumber' 
)
RETURNING id, name;


INSERT INTO suppliers (id, name, type, is_company, supplier_category, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Sarasota Paint',
  'material',
  true,
  'material',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM suppliers 
  WHERE name = 'Sarasota Paint' 
)
RETURNING id, name;


INSERT INTO suppliers (id, name, type, is_company, supplier_category, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'lumber',
  'material',
  true,
  'material',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM suppliers 
  WHERE name = 'lumber' 
)
RETURNING id, name;


INSERT INTO suppliers (id, name, type, is_company, supplier_category, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Projeto',
  'material',
  true,
  'material',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM suppliers 
  WHERE name = 'Projeto' 
)
RETURNING id, name;


INSERT INTO suppliers (id, name, type, is_company, supplier_category, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Sarasota Paint',
  'material',
  true,
  'material',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM suppliers 
  WHERE name = 'Sarasota Paint' 
)
RETURNING id, name;


INSERT INTO suppliers (id, name, type, is_company, supplier_category, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Gesso',
  'material',
  true,
  'material',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM suppliers 
  WHERE name = 'Gesso' 
)
RETURNING id, name;


INSERT INTO suppliers (id, name, type, is_company, supplier_category, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Ace',
  'material',
  true,
  'material',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM suppliers 
  WHERE name = 'Ace' 
)
RETURNING id, name;


INSERT INTO suppliers (id, name, type, is_company, supplier_category, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  '407',
  'material',
  true,
  'material',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM suppliers 
  WHERE name = '407' 
)
RETURNING id, name;


INSERT INTO suppliers (id, name, type, is_company, supplier_category, company_id, created_by, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Lumber',
  'material',
  true,
  'material',
  (SELECT id FROM companies WHERE name = 'JJ'),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM suppliers 
  WHERE name = 'Lumber' 
)
RETURNING id, name;

-- ============================================
-- 7. OBTER ID DO ADMIN DA OUTRA EMPRESA (para aprovação cruzada)
-- ============================================

-- Para aprovação cruzada, precisamos do admin da OUTRA empresa
-- Execute estas queries e anote os IDs:
-- SELECT id, email, name FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1;
-- SELECT id, email, name FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1;

-- ============================================
-- 8. IMPORTAR ENTRADAS FINANCEIRAS
-- ============================================

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Sammy'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Sammy',
  1725,
  '2025-06-07',
  'zelle',
  23,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Sammy'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Sammy'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Sammy',
  1725,
  '2025-06-07',
  'zelle',
  23,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Sammy'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Renata'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Renata',
  375,
  '2025-06-24',
  'zelle',
  26,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Renata'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'RENATA'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'RENATA',
  375,
  '2025-06-24',
  'zelle',
  26,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'RENATA'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'HERN'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'HERN',
  3450,
  '2025-06-24',
  'check',
  26,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'HERN'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'HERN'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'HERN',
  3450,
  '2025-06-24',
  'zelle',
  26,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'HERN'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Sammy'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Sammy',
  13.82,
  '2025-06-30',
  'card',
  27,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Sammy'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Renata'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Renata',
  750,
  '2025-07-03',
  'zelle',
  27,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Renata'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Sammy'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Sammy',
  5400,
  '2025-07-07',
  'zelle',
  28,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Sammy'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Renata 2'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Renata 2',
  350,
  '2025-07-11',
  'zelle',
  28,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Renata 2'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Renata 2'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Renata 2',
  350,
  '2025-07-11',
  'zelle',
  28,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Renata 2'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Janete'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Janete',
  400,
  '2025-07-15',
  'check',
  29,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Janete'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Renata 2'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Renata 2',
  512.5,
  '2025-07-15',
  'zelle',
  29,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Renata 2'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Janete'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Janete',
  400,
  '2025-07-15',
  'zelle',
  29,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Janete'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Renata 2'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Renata 2',
  512.5,
  '2025-07-15',
  'zelle',
  29,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Renata 2'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'HERN'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'HERN',
  6900,
  '2025-07-17',
  'check',
  29,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'HERN'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Reggie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Reggie',
  2500,
  '2025-07-18',
  'check',
  29,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Reggie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Reggie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Reggie',
  2500,
  '2025-07-18',
  'zelle',
  29,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Reggie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Renata 2'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Renata 2',
  1725,
  '2025-07-21',
  'zelle',
  30,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Renata 2'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Janete'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Janete',
  800,
  '2025-07-22',
  'check',
  30,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Janete'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Donna',
  12622.5,
  '2025-07-22',
  'zelle',
  30,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Donna',
  12622.5,
  '2025-07-22',
  'check',
  30,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'George'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'George',
  425,
  '2025-07-25',
  'zelle',
  30,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'George'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'George'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'George',
  425,
  '2025-07-25',
  'zelle',
  30,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'George'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Ronda'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Ronda',
  2500,
  '2025-07-25',
  'zelle',
  30,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Ronda'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Ronda'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Ronda',
  2500,
  '2025-07-25',
  'zelle',
  30,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Ronda'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'George'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'George',
  100,
  '2025-08-04',
  'zelle',
  32,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'George'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Steve'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Steve',
  1050,
  '2025-08-11',
  'zelle',
  33,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Steve'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Steve'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Steve',
  1050,
  '2025-08-11',
  'zelle',
  33,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Steve'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Donna',
  25265,
  '2025-08-15',
  'check',
  33,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Paloma'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Paloma',
  1125,
  '2025-08-18',
  'zelle',
  34,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Paloma'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Paloma'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Paloma',
  1125,
  '2025-08-18',
  'card',
  34,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Paloma'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Reggie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Reggie',
  5300,
  '2025-08-23',
  'check',
  34,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Reggie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Renata 3'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Renata 3',
  2600,
  '2025-08-31',
  'zelle',
  36,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Renata 3'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Barbara'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Barbara',
  3300,
  '2025-09-08',
  'check',
  37,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Barbara'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Luzete'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Luzete',
  1250,
  '2025-09-09',
  'zelle',
  37,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Luzete'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Steve'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Steve',
  2100,
  '2025-09-09',
  'zelle',
  37,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Steve'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Luzete'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Luzete',
  1250,
  '2025-09-09',
  'zelle',
  37,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Luzete'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Paloma'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Paloma',
  2000,
  '2025-09-16',
  'cash',
  38,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Paloma'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Paloma'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Paloma',
  250,
  '2025-09-16',
  'cash',
  38,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Paloma'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna2'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Donna2',
  1600,
  '2025-09-17',
  'card',
  38,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna2'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Amber'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Amber',
  3500,
  '2025-09-24',
  'card',
  39,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Amber'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Helena'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Helena',
  1875,
  '2025-09-30',
  'card',
  40,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Helena'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Helena'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Helena',
  1875,
  '2025-09-30',
  'zelle',
  40,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Helena'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Luzete'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Luzete',
  1975,
  '2025-10-02',
  'card',
  40,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Luzete'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Reggie 2'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Reggie 2',
  2200,
  '2025-10-08',
  'check',
  41,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Reggie 2'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Ronda'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Ronda',
  5500,
  '2025-10-10',
  'check',
  41,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Ronda'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Helena'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Helena',
  3900,
  '2025-10-16',
  'check',
  42,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Helena'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Luzete'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Luzete',
  2800,
  '2025-10-20',
  'card',
  43,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Luzete'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Luzete'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Luzete',
  2100,
  '2025-10-21',
  'card',
  43,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Luzete'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Ronda 3'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Ronda 3',
  250,
  '2025-10-22',
  'card',
  43,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Ronda 3'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jay'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Jay',
  750,
  '2025-10-22',
  'check',
  43,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jay'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jay'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Jay',
  750,
  '2025-10-24',
  'check',
  43,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jay'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Ronda 2'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Ronda 2',
  6500,
  '2025-10-24',
  'zelle',
  43,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Ronda 2'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Luzete'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Luzete',
  500,
  '2025-10-25',
  'zelle',
  43,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Luzete'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Christin'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Christin',
  NULL,
  '2025-10-27',
  'check',
  44,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Christin'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Ronda 3'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Ronda 3',
  2250,
  '2025-10-27',
  'card',
  44,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Ronda 3'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Christin'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Christin',
  2800,
  '2025-10-27',
  'card',
  44,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Christin'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Marion'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Marion',
  8000,
  '2025-10-28',
  'card',
  44,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Marion'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Hipica'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Hipica',
  2250,
  '2025-10-29',
  'check',
  44,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Hipica'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Hipica'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Hipica',
  2250,
  '2025-10-30',
  'card',
  44,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Hipica'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Reggie 2'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Reggie 2',
  2251,
  '2025-10-31',
  'check',
  44,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Reggie 2'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Dominic'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Dominic',
  3000,
  '2025-11-03',
  'card',
  45,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Dominic'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Denise'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Denise',
  750,
  '2025-11-03',
  'card',
  45,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Denise'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jesse'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jesse',
  1500,
  '2025-11-11',
  'card',
  46,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jesse'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Shery'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Shery',
  13250,
  '2025-11-12',
  'card',
  46,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Shery'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jenny'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jenny',
  11350,
  '2025-11-12',
  'card',
  46,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jenny'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jesse'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jesse',
  1500,
  '2025-11-17',
  'card',
  47,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jesse'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Dominic'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Dominic',
  3200,
  '2025-11-18',
  'card',
  47,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Dominic'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Marion'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Marion',
  8979,
  '2025-11-19',
  'card',
  47,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Marion'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jennie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Jennie',
  7000,
  '2025-12-01',
  'card',
  49,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jennie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Heather'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Heather',
  2000,
  '2025-12-08',
  'card',
  50,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Heather'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Shery'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Shery',
  7625,
  '2025-12-09',
  'card',
  50,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Shery'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Shery'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Shery',
  7625,
  '2025-12-09',
  'card',
  50,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Shery'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Tom'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Tom',
  3100,
  '2025-12-09',
  'card',
  50,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Tom'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Gail'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Gail',
  8740,
  '2025-12-12',
  'card',
  50,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Gail'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_entries (
  id, project_id, description, value, entry_date, payment_method, week_of_year,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna Loira'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Donna Loira',
  5900,
  '2025-12-15',
  'card',
  51,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna Loira'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

-- ============================================
-- 9. IMPORTAR SAÍDAS FINANCEIRAS
-- ============================================

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Marion'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Marion',
  182.7,
  '2023-11-15',
  'card',
  46,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Imeca') LIMIT 1),
  'Red Oak, Plywood Natural, Imex-fullsoft, Light gray',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Marion'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Sammy'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Sammy',
  236.47,
  '2025-06-09',
  'card',
  24,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Sammy'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Sammy'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Sammy',
  299.96,
  '2025-06-23',
  'card',
  26,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Sammy'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Sammy'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Sammy',
  35,
  '2025-06-23',
  'card',
  26,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Sammy'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Sammy'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Sammy',
  98.43,
  '2025-06-24',
  'card',
  26,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Sammy'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Sammy'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Sammy',
  88.97,
  '2025-06-26',
  'card',
  26,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Sammy'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Sammy'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Sammy',
  9.54,
  '2025-06-27',
  'card',
  26,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Sammy'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Sammy'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Sammy',
  74.9,
  '2025-06-30',
  'card',
  27,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Sammy'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Sammy'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Sammy',
  94.44,
  '2025-06-30',
  'card',
  27,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Sammy'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Sammy'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Sammy',
  35,
  '2025-06-30',
  'card',
  27,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Sammy'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'HERN'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'HERN',
  100,
  '2025-06-30',
  'cash',
  27,
  NULL,
  'Brian',
  'Brian',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'HERN'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Sammy'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Sammy',
  5.25,
  '2025-07-01',
  'card',
  27,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Sammy'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Sammy'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Sammy',
  720,
  '2025-07-01',
  'card',
  27,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Sammy'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'HERN'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'HERN',
  100,
  '2025-07-01',
  'cash',
  27,
  NULL,
  'Brian',
  'Brian',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'HERN'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Renata'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Renata',
  15,
  '2025-07-02',
  'card',
  27,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Renata'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Sammy'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Sammy',
  6.78,
  '2025-07-02',
  'card',
  27,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Sammy'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Renata'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Renata',
  158.19,
  '2025-07-02',
  'card',
  27,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Renata'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Renata'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Renata',
  63.61,
  '2025-07-02',
  'card',
  27,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Renata'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'HERN'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'HERN',
  100,
  '2025-07-02',
  'cash',
  27,
  NULL,
  'Brian',
  'Brian',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'HERN'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Sammy'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Sammy',
  400,
  '2025-07-03',
  'zelle',
  27,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Sammy'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'HERN'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'HERN',
  100,
  '2025-07-03',
  'cash',
  27,
  NULL,
  'Brian',
  'Brian',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'HERN'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'HERN'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'HERN',
  397.03,
  '2025-07-07',
  'card',
  28,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'HERN'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'HERN'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'HERN',
  67,
  '2025-07-07',
  'card',
  28,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'HERN'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Sammy'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Sammy',
  89.84,
  '2025-07-07',
  'card',
  28,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Sammy'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'HERN'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'HERN',
  100,
  '2025-07-07',
  'cash',
  28,
  NULL,
  'Brian',
  'Brian',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'HERN'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'HERN'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'HERN',
  150,
  '2025-07-07',
  'cash',
  28,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'HERN'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'HERN'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'HERN',
  165.61,
  '2025-07-08',
  'card',
  28,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'HERN'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'HERN'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'HERN',
  273.92,
  '2025-07-08',
  'card',
  28,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'HERN'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'HERN'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'HERN',
  100,
  '2025-07-08',
  'cash',
  28,
  NULL,
  'Brian',
  'Brian',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'HERN'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'HERN'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'HERN',
  150,
  '2025-07-08',
  'cash',
  28,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'HERN'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'HERN'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'HERN',
  327.06,
  '2025-07-09',
  'card',
  28,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'HERN'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'HERN'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'HERN',
  100,
  '2025-07-09',
  'cash',
  28,
  NULL,
  'Brian',
  'Brian',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'HERN'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'HERN'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'HERN',
  150,
  '2025-07-09',
  'cash',
  28,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'HERN'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'HERN'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'HERN',
  20,
  '2025-07-09',
  'card',
  28,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'HERN'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'HERN'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'HERN',
  27.99,
  '2025-07-09',
  'card',
  28,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'HERN'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'HERN'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'HERN',
  504.09,
  '2025-07-10',
  'card',
  28,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'HERN'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'HERN'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'HERN',
  83.13,
  '2025-07-10',
  'card',
  28,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'HERN'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'HERN'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'HERN',
  67.84,
  '2025-07-10',
  'card',
  28,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'HERN'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'HERN'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'HERN',
  100,
  '2025-07-10',
  'cash',
  28,
  NULL,
  'Brian',
  'Brian',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'HERN'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'HERN'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'HERN',
  150,
  '2025-07-10',
  'cash',
  28,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'HERN'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'HERN'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'HERN',
  80.12,
  '2025-07-11',
  'card',
  28,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'HERN'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'HERN'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'HERN',
  63.61,
  '2025-07-11',
  'card',
  28,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'HERN'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'HERN'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'HERN',
  100,
  '2025-07-11',
  'cash',
  28,
  NULL,
  'Brian',
  'Brian',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'HERN'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Renata 2'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Renata 2',
  296.06,
  '2025-07-12',
  'card',
  28,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Renata 2'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Renata 2'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Renata 2',
  180,
  '2025-07-12',
  'zelle',
  28,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Renata 2'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'HERN'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'HERN',
  16.02,
  '2025-07-14',
  'card',
  29,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'HERN'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'HERN'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'HERN',
  11.24,
  '2025-07-14',
  'card',
  29,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'HERN'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'HERN'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'HERN',
  1138.8,
  '2025-07-14',
  'card',
  29,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'HERN'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'HERN'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'HERN',
  21.38,
  '2025-07-14',
  'card',
  29,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'HERN'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'HERN'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'HERN',
  100,
  '2025-07-14',
  'cash',
  29,
  NULL,
  'Brian',
  'Brian',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'HERN'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'HERN'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'HERN',
  150,
  '2025-07-14',
  'cash',
  29,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'HERN'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'HERN'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'HERN',
  16.02,
  '2025-07-14',
  'card',
  29,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'HERN'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'HERN'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'HERN',
  21.38,
  '2025-07-15',
  'card',
  29,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'HERN'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'HERN'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'HERN',
  5.32,
  '2025-07-15',
  'card',
  29,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'HERN'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'HERN'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'HERN',
  28.45,
  '2025-07-16',
  'card',
  29,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'HERN'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'HERN'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'HERN',
  34.55,
  '2025-07-16',
  'card',
  29,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'HERN'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'HERN'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'HERN',
  21.28,
  '2025-07-16',
  'card',
  29,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'HERN'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'HERN'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'HERN',
  100,
  '2025-07-16',
  'cash',
  29,
  NULL,
  'Brian',
  'Brian',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'HERN'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'HERN'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'HERN',
  150,
  '2025-07-16',
  'cash',
  29,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'HERN'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'HERN'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'HERN',
  100,
  '2025-07-17',
  'cash',
  29,
  NULL,
  'Brian',
  'Brian',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'HERN'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'HERN'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'HERN',
  82,
  '2025-07-17',
  'card',
  29,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'HERN'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'HERN'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'HERN',
  45,
  '2025-07-17',
  'card',
  29,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'HERN'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Renata 2'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Renata 2',
  65.48,
  '2025-07-18',
  'card',
  29,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Renata 2'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Janete'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Janete',
  177.96,
  '2025-07-21',
  'card',
  30,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Janete'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Renata 2'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Renata 2',
  150,
  '2025-07-21',
  'cash',
  30,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Renata 2'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Renata 2'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Renata 2',
  100,
  '2025-07-21',
  'cash',
  30,
  NULL,
  'Brian',
  'Brian',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Renata 2'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Renata 2'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Renata 2',
  29.99,
  '2025-07-21',
  'card',
  30,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Renata 2'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Janete'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Janete',
  150,
  '2025-07-22',
  'cash',
  30,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Janete'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Janete'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Janete',
  100,
  '2025-07-22',
  'cash',
  30,
  NULL,
  'Brian',
  'Brian',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Janete'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Donna',
  273.92,
  '2025-07-23',
  'card',
  30,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Imeca') LIMIT 1),
  'Plywood and 2 Placa 241',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Donna',
  789.49,
  '2025-07-23',
  'card',
  30,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Imeca') LIMIT 1),
  'Plywood, Edge Banding and MDF',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Donna',
  1053.96,
  '2025-07-24',
  'card',
  30,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  'Red Oak',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Donna',
  222.01,
  '2025-07-24',
  'card',
  30,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Amazon') LIMIT 1),
  'Controller, WB5, Power Adapter, LED',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Reggie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Reggie',
  1551.5,
  '2025-07-25',
  'card',
  30,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Imeca') LIMIT 1),
  'MDF, Edge Banding and Pickup',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Reggie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Donna',
  46.67,
  '2025-07-25',
  'card',
  30,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Imeca') LIMIT 1),
  'Edge Banding',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Donna',
  150,
  '2025-07-28',
  'cash',
  31,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Donna',
  100,
  '2025-07-28',
  'cash',
  31,
  NULL,
  'Brian',
  'Brian',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Donna',
  126.76,
  '2025-07-28',
  'card',
  31,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  'Pano, fita',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Donna',
  150,
  '2025-07-29',
  'cash',
  31,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Donna',
  100,
  '2025-07-29',
  'cash',
  31,
  NULL,
  'Brian',
  'Brian',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Donna',
  13.89,
  '2025-07-29',
  'card',
  31,
  (SELECT id FROM suppliers WHERE name = 'Lowe''s' AND company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1),
  'Stain',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Donna',
  76.57,
  '2025-07-29',
  'card',
  31,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  'Plywood',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Donna',
  355.74,
  '2025-07-29',
  'card',
  31,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Imeca') LIMIT 1),
  'Placa Red Oak and MDF',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Donna',
  150,
  '2025-07-30',
  'cash',
  31,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Donna',
  100,
  '2025-07-30',
  'cash',
  31,
  NULL,
  'Brian',
  'Brian',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Donna',
  174.99,
  '2025-07-30',
  'card',
  31,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  'Stain, Adhesive Wallpaper,Eletrical Box,',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Donna',
  24.58,
  '2025-07-30',
  'card',
  31,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Walmart') LIMIT 1),
  'Polycrylic',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Ronda'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Ronda',
  1542.22,
  '2025-07-30',
  'card',
  31,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Imeca') LIMIT 1),
  'MDF, PVC and Edge Banding',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Ronda'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Donna',
  150,
  '2025-07-31',
  'cash',
  31,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Donna',
  100,
  '2025-07-31',
  'cash',
  31,
  NULL,
  'Brian',
  'Brian',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Donna',
  24.59,
  '2025-07-31',
  'card',
  31,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  'Eletrical Box',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Donna',
  53.12,
  '2025-07-31',
  'card',
  31,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Amazon') LIMIT 1),
  'Dimmer',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Donna',
  100,
  '2025-08-01',
  'cash',
  31,
  NULL,
  'Brian',
  'Brian',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'George'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'George',
  50,
  '2025-08-01',
  'cash',
  31,
  NULL,
  'Brian',
  'Brian',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'George'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Donna',
  100,
  '2025-08-04',
  'cash',
  32,
  NULL,
  'Brian',
  'Brian',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Donna',
  150,
  '2025-08-04',
  'cash',
  32,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'George'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'George',
  46,
  '2025-08-04',
  'card',
  32,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'George'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Donna',
  100,
  '2025-08-05',
  'cash',
  32,
  NULL,
  'Brian',
  'Brian',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Donna',
  150,
  '2025-08-05',
  'cash',
  32,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Donna',
  28.3,
  '2025-08-05',
  'card',
  32,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Sherwin-Williams') LIMIT 1),
  'Polycrylic',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Donna',
  77.04,
  '2025-08-05',
  'card',
  32,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Imeca') LIMIT 1),
  'MDF',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Donna',
  100,
  '2025-08-06',
  'cash',
  32,
  NULL,
  'Brian',
  'Brian',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Donna',
  150,
  '2025-08-06',
  'cash',
  32,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Donna',
  85.18,
  '2025-08-06',
  'card',
  32,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  'Silicone, Stain',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Donna',
  73.39,
  '2025-08-06',
  'card',
  32,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Sherwin-Williams') LIMIT 1),
  'Polycrylic',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Donna',
  100,
  '2025-08-07',
  'cash',
  32,
  NULL,
  'Brian',
  'Brian',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Donna',
  150,
  '2025-08-07',
  'cash',
  32,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Donna',
  13.35,
  '2025-08-07',
  'card',
  32,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  'pin naik',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Donna',
  100,
  '2025-08-08',
  'cash',
  32,
  NULL,
  'Brian',
  'Brian',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Reggie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Reggie',
  611.84,
  '2025-08-08',
  'card',
  32,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Laumber') LIMIT 1),
  'ThermoWood',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Reggie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Donna',
  150,
  '2025-08-11',
  'cash',
  33,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Donna',
  150,
  '2025-08-11',
  'card',
  33,
  NULL,
  'Vusmar',
  'Vusmar',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Donna',
  18.29,
  '2025-08-11',
  'card',
  33,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Amazon') LIMIT 1),
  'Led',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Donna',
  450,
  '2025-08-12',
  'card',
  33,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Gabriel') LIMIT 1),
  'Papel de Parede',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Donna',
  150,
  '2025-08-12',
  'card',
  33,
  NULL,
  'Vusmar',
  'Vusmar',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Donna',
  150,
  '2025-08-12',
  'cash',
  33,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Donna',
  150,
  '2025-08-13',
  'card',
  33,
  NULL,
  'Vusmar',
  'Vusmar',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Donna',
  150,
  '2025-08-13',
  'cash',
  33,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Donna',
  82.49,
  '2025-08-13',
  'card',
  33,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Sherwin-Williams') LIMIT 1),
  'Tinta Accentual',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Donna',
  50.38,
  '2025-08-14',
  'card',
  33,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  'Crown-Molde',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Donna',
  150,
  '2025-08-14',
  'card',
  33,
  NULL,
  'Vusmar',
  'Vusmar',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Donna',
  150,
  '2025-08-14',
  'cash',
  33,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Reggie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Reggie',
  70.11,
  '2025-08-18',
  'card',
  34,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  'Tinta Gold e prata',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Reggie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Steve'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Steve',
  939.46,
  '2025-08-18',
  'card',
  34,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Imeca') LIMIT 1),
  'Melanine',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Steve'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Reggie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Reggie',
  150,
  '2025-08-18',
  'card',
  34,
  NULL,
  'Vusmar',
  'Vusmar',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Reggie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Reggie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Reggie',
  150,
  '2025-08-18',
  'cash',
  34,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Reggie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Donna',
  410,
  '2025-08-18',
  'zelle',
  34,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('CNC') LIMIT 1),
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Reggie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Reggie',
  97.99,
  '2025-08-18',
  'card',
  34,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Amazon') LIMIT 1),
  'led,controle,dimer transformador',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Reggie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Reggie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Reggie',
  150,
  '2025-08-19',
  'card',
  34,
  NULL,
  'Vusmar',
  'Vusmar',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Reggie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Reggie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Reggie',
  150,
  '2025-08-19',
  'cash',
  34,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Reggie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Reggie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Reggie',
  525,
  '2025-08-21',
  'card',
  34,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('CNC') LIMIT 1),
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Reggie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Reggie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Reggie',
  150,
  '2025-08-21',
  'cash',
  34,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Reggie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Reggie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Reggie',
  150,
  '2025-08-21',
  'card',
  34,
  NULL,
  'Vusmar',
  'Vusmar',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Reggie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Reggie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Reggie',
  18.79,
  '2025-08-22',
  'card',
  34,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  'silicone',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Reggie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Reggie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Reggie',
  150,
  '2025-08-22',
  'card',
  34,
  NULL,
  'Vusmar',
  'Vusmar',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Reggie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Reggie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Reggie',
  20,
  '2025-08-22',
  'card',
  34,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Reggie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Reggie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Reggie',
  10,
  '2025-08-22',
  'card',
  34,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Reggie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Renata 3'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Renata 3',
  349.36,
  '2025-08-23',
  'card',
  34,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Imeca') LIMIT 1),
  'Placas, Nail',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Renata 3'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Renata 3'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Renata 3',
  30.47,
  '2025-08-27',
  'card',
  35,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Imeca') LIMIT 1),
  'dobradica',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Renata 3'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Renata 3'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Renata 3',
  19.5,
  '2025-08-27',
  'card',
  35,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('amazon') LIMIT 1),
  'fonte transformador',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Renata 3'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Renata 3'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Renata 3',
  14.53,
  '2025-08-28',
  'card',
  35,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  'Screw,',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Renata 3'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Renata 3'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Renata 3',
  180,
  '2025-08-28',
  'cash',
  35,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Renata 3'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Renata 3'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Renata 3',
  420,
  '2025-08-30',
  'zelle',
  35,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('CNC') LIMIT 1),
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Renata 3'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Renata 3'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Renata 3',
  63.35,
  '2025-09-03',
  'card',
  36,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Imeca') LIMIT 1),
  'Melanine',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Renata 3'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Steve'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Steve',
  92.79,
  '2025-09-04',
  'card',
  36,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Imeca') LIMIT 1),
  'dobradica',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Steve'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Paloma'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Paloma',
  NULL,
  '2025-09-04',
  'card',
  36,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Imeca') LIMIT 1),
  'MDF Valor 134.82 - Recebido do Cliente',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Paloma'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Steve'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Steve',
  180,
  '2025-09-04',
  'cash',
  36,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Steve'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Barbara'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Barbara',
  85.73,
  '2025-09-04',
  'card',
  36,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Sherwin-Williams') LIMIT 1),
  'Tinta',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Barbara'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Barbara'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Barbara',
  63.35,
  '2025-09-04',
  'zelle',
  36,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('imeca') LIMIT 1),
  'mdf',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Barbara'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Barbara'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Barbara',
  180,
  '2025-09-05',
  'cash',
  36,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Barbara'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Barbara'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Barbara',
  41.68,
  '2025-09-08',
  'card',
  37,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Sherwin-Williams') LIMIT 1),
  'tinta',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Barbara'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Barbara'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Barbara',
  8.15,
  '2025-09-08',
  'card',
  37,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  'Carlon Old Work Ceiling 4"',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Barbara'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Barbara'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Barbara',
  44.09,
  '2025-09-08',
  'card',
  37,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Sherwin-Williams') LIMIT 1),
  'tinta master',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Barbara'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Steve'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Steve',
  180,
  '2025-09-09',
  'cash',
  37,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Steve'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Paloma'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Paloma',
  180,
  '2025-09-10',
  'cash',
  37,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Paloma'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Paloma'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Paloma',
  NULL,
  '2025-09-10',
  'card',
  37,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  '2x4',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Paloma'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Paloma'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Paloma',
  NULL,
  '2025-09-11',
  'card',
  37,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Imeca') LIMIT 1),
  'Dobradica e Parafuso',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Paloma'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Paloma'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Paloma',
  180,
  '2025-09-11',
  'cash',
  37,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Paloma'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Paloma'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Paloma',
  180,
  '2025-09-12',
  'cash',
  37,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Paloma'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Paloma'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Paloma',
  180,
  '2025-09-15',
  'cash',
  38,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Paloma'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna 2'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Donna 2',
  33.66,
  '2025-09-16',
  'card',
  38,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  'Red OAK',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna 2'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna 2'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Donna 2',
  52,
  '2025-09-16',
  'card',
  38,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Sherwin-Williams') LIMIT 1),
  'Caulk',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna 2'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna2'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Donna2',
  33.66,
  '2025-09-17',
  'card',
  38,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna2'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna2'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Donna2',
  81.92,
  '2025-09-17',
  'card',
  38,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna2'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Steve'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Steve',
  360,
  '2025-09-17',
  'zelle',
  38,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('cnc') LIMIT 1),
  'cortes',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Steve'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Amber'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Amber',
  130,
  '2025-09-24',
  'zelle',
  39,
  NULL,
  'Thiago',
  'Thiago',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Amber'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Amber'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Amber',
  130,
  '2025-09-25',
  'zelle',
  39,
  NULL,
  'Thiago',
  'Thiago',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Amber'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Amber'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Amber',
  130,
  '2025-09-26',
  'zelle',
  39,
  NULL,
  'Thiago',
  'Thiago',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Amber'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Amber'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Amber',
  130,
  '2025-09-27',
  'zelle',
  39,
  NULL,
  'Thiago',
  'Thiago',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Amber'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Amber'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Amber',
  130,
  '2025-09-29',
  'zelle',
  40,
  NULL,
  'Thiago',
  'Thiago',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Amber'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Luzete'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Luzete',
  788.93,
  '2025-09-30',
  'card',
  40,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Imeca') LIMIT 1),
  'plywood,melamina.',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Luzete'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Amber'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Amber',
  7.62,
  '2025-09-30',
  'card',
  40,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  'Caixinha',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Amber'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Luzete'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Luzete',
  32.6,
  '2025-09-30',
  'card',
  40,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  'Saco lixo    (nota Amber)',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Luzete'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Amber'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Amber',
  130,
  '2025-09-30',
  'zelle',
  40,
  NULL,
  'Thiago',
  'Thiago',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Amber'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Ronda'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Ronda',
  447.58,
  '2025-10-01',
  'card',
  40,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Imeca') LIMIT 1),
  'Plywood',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Ronda'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Luzete'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Luzete',
  212.37,
  '2025-10-01',
  'card',
  40,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Imeca') LIMIT 1),
  'Dobradiças e corediças',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Luzete'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Amber'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Amber',
  130,
  '2025-10-01',
  'zelle',
  40,
  NULL,
  'Thiago',
  'Thiago',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Amber'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Luzete'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Luzete',
  686.94,
  '2025-10-01',
  'card',
  40,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  'Cobertura de carvalho',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Luzete'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Luzete'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Luzete',
  1163.78,
  '2025-10-01',
  'zelle',
  40,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('CNC') LIMIT 1),
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Luzete'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Luzete'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Luzete',
  34.99,
  '2025-10-01',
  'card',
  40,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('amazon') LIMIT 1),
  'Led',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Luzete'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Luzete'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Luzete',
  130,
  '2025-10-02',
  'zelle',
  40,
  NULL,
  'Thiago',
  'Thiago',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Luzete'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Luzete'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Luzete',
  130,
  '2025-10-03',
  'zelle',
  40,
  NULL,
  'Thiago',
  'Thiago',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Luzete'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Luzete'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Luzete',
  130,
  '2025-10-06',
  'zelle',
  41,
  NULL,
  'Thiago',
  'Thiago',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Luzete'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Ronda'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Ronda',
  180,
  '2025-10-06',
  'cash',
  41,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Ronda'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Ronda'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Ronda',
  103.9,
  '2025-10-07',
  'card',
  41,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Imeca') LIMIT 1),
  'Edge Banding, Clip Top, Clip Mouting',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Ronda'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Ronda'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Ronda',
  6.81,
  '2025-10-07',
  'card',
  41,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Imeca') LIMIT 1),
  'Wood Pins',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Ronda'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Ronda'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Ronda',
  100.52,
  '2025-10-07',
  'card',
  41,
  (SELECT id FROM suppliers WHERE name = 'Lowe''s' AND company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1),
  'Polycrylic, Paper, Tinta',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Ronda'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Luzete'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Luzete',
  130,
  '2025-10-07',
  'zelle',
  41,
  NULL,
  'Thiago',
  'Thiago',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Luzete'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Ronda'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Ronda',
  180,
  '2025-10-07',
  'cash',
  41,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Ronda'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Ronda'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Ronda',
  130,
  '2025-10-08',
  'zelle',
  41,
  NULL,
  'Thiago',
  'Thiago',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Ronda'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Ronda'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Ronda',
  180,
  '2025-10-08',
  'cash',
  41,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Ronda'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Ronda'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Ronda',
  967.45,
  '2025-10-08',
  'card',
  41,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('CNC') LIMIT 1),
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Ronda'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Ronda'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Ronda',
  68,
  '2025-10-08',
  'card',
  41,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('amazon') LIMIT 1),
  'controle, fonte e transformador',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Ronda'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Ronda'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Ronda',
  130,
  '2025-10-09',
  'zelle',
  41,
  NULL,
  'Thiago',
  'Thiago',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Ronda'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Ronda'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Ronda',
  180,
  '2025-10-09',
  'cash',
  41,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Ronda'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Ronda'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Ronda',
  124.07,
  '2025-10-09',
  'card',
  41,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  'Fio',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Ronda'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Ronda'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Ronda',
  98.13,
  '2025-10-09',
  'card',
  41,
  (SELECT id FROM suppliers WHERE name = 'Lowe''s' AND company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1),
  'Fio',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Ronda'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Ronda'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Ronda',
  130,
  '2025-10-10',
  'zelle',
  41,
  NULL,
  'Thiago',
  'Thiago',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Ronda'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Ronda'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Ronda',
  180,
  '2025-10-10',
  'cash',
  41,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Ronda'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jennie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Jennie',
  47.08,
  '2025-10-12',
  'card',
  42,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Imeca') LIMIT 1),
  'mdf',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jennie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna Loira'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Donna Loira',
  600.27,
  '2025-10-12',
  'card',
  42,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Imeca') LIMIT 1),
  'plywood, Edge Banding',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna Loira'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Helena'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Helena',
  144.45,
  '2025-10-13',
  'card',
  42,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Imeca') LIMIT 1),
  'MDF',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Helena'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Helena'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Helena',
  119.94,
  '2025-10-13',
  'card',
  42,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  '2x4',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Helena'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Helena'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Helena',
  180,
  '2025-10-13',
  'cash',
  42,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Helena'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Helena'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Helena',
  130,
  '2025-10-13',
  'zelle',
  42,
  NULL,
  'Thiago',
  'Thiago',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Helena'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Helena'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Helena',
  13.89,
  '2025-10-14',
  'card',
  42,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  'pano',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Helena'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Helena'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Helena',
  180,
  '2025-10-14',
  'cash',
  42,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Helena'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Helena'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Helena',
  130,
  '2025-10-14',
  'zelle',
  42,
  NULL,
  'Thiago',
  'Thiago',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Helena'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Helena'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Helena',
  43.82,
  '2025-10-14',
  'card',
  42,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Sherwin-Williams') LIMIT 1),
  'tinta',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Helena'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Helena'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Helena',
  135.89,
  '2025-10-14',
  'card',
  42,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('amazon') LIMIT 1),
  'led,controle,dimer transformador',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Helena'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Helena'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Helena',
  37.45,
  '2025-10-15',
  'card',
  42,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Sherwin-Williams') LIMIT 1),
  'tinta',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Helena'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Helena'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Helena',
  10.98,
  '2025-10-15',
  'card',
  42,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  'single brush',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Helena'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Reggie 2'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Reggie 2',
  999.95,
  '2025-10-15',
  'card',
  42,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('DL Cabinets') LIMIT 1),
  'gabinetes',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Reggie 2'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Helena'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Helena',
  130,
  '2025-10-15',
  'zelle',
  42,
  NULL,
  'Thiago',
  'Thiago',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Helena'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Helena'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Helena',
  174,
  '2025-10-15',
  'card',
  42,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('amazon') LIMIT 1),
  'fonte , adaptador, perfil de led, led',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Helena'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Helena'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Helena',
  130,
  '2025-10-16',
  'zelle',
  42,
  NULL,
  'Thiago',
  'Thiago',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Helena'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Helena'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Helena',
  180,
  '2025-10-16',
  'cash',
  42,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Helena'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Helena'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Helena',
  130,
  '2025-10-20',
  'zelle',
  43,
  NULL,
  'Thiago',
  'Thiago',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Helena'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Reggie 2'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Reggie 2',
  180,
  '2025-10-20',
  'cash',
  43,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Reggie 2'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Reggie 2'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Reggie 2',
  37,
  '2025-10-20',
  'card',
  43,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('amazon') LIMIT 1),
  'Handles',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Reggie 2'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Ronda 2'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Ronda 2',
  1647.13,
  '2025-10-20',
  'card',
  43,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('DL Cabinets') LIMIT 1),
  'gabinetes',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Ronda 2'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Reggie 2'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Reggie 2',
  804.64,
  '2025-10-20',
  'card',
  43,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('DL Cabinets') LIMIT 1),
  'gabinetes',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Reggie 2'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Reggie 2'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Reggie 2',
  343.47,
  '2025-10-20',
  'card',
  43,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('DL Cabinets') LIMIT 1),
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Reggie 2'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Luzete'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Luzete',
  28.3,
  '2025-10-20',
  'card',
  43,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Sherwin-Williams') LIMIT 1),
  'Poly',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Luzete'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Luzete'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Luzete',
  36,
  '2025-10-20',
  'card',
  43,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('amazon') LIMIT 1),
  'Suporte para pasta',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Luzete'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Luzete'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Luzete',
  85,
  '2025-10-20',
  'card',
  43,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('amazon') LIMIT 1),
  'Fonte, controle, led e adapdador',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Luzete'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Ronda 2'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Ronda 2',
  NULL,
  '2025-10-20',
  'card',
  43,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('DL Cabinets') LIMIT 1),
  'Cabinet',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Ronda 2'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Reggie 2'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Reggie 2',
  130,
  '2025-10-21',
  'zelle',
  43,
  NULL,
  'Thiago',
  'Thiago',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Reggie 2'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Reggie 2'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Reggie 2',
  180,
  '2025-10-21',
  'cash',
  43,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Reggie 2'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Reggie 2'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Reggie 2',
  16.46,
  '2025-10-22',
  'card',
  43,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  'Trim Screws',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Reggie 2'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Ronda 2'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Ronda 2',
  130,
  '2025-10-22',
  'zelle',
  43,
  NULL,
  'Thiago',
  'Thiago',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Ronda 2'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Ronda 2'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Ronda 2',
  180,
  '2025-10-22',
  'cash',
  43,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Ronda 2'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Ronda 3'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Ronda 3',
  8.5,
  '2025-10-22',
  'card',
  43,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('amazon') LIMIT 1),
  'Suporte para Papel Higienico',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Ronda 3'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jay'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jay',
  119.26,
  '2025-10-23',
  'card',
  43,
  NULL,
  'MDF',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jay'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Ronda 3'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Ronda 3',
  37.79,
  '2025-10-23',
  'card',
  43,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Imeca') LIMIT 1),
  'Paywood',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Ronda 3'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Ronda 3'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Ronda 3',
  664.9,
  '2025-10-23',
  'card',
  43,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('lumber') LIMIT 1),
  'ThermoWood',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Ronda 3'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Reggie 2'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Reggie 2',
  155.88,
  '2025-10-23',
  'card',
  43,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('DL Cabinets') LIMIT 1),
  'Cabinet',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Reggie 2'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Ronda 3'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Ronda 3',
  9.61,
  '2025-10-23',
  'card',
  43,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  'cola',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Ronda 3'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jay'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jay',
  130,
  '2025-10-23',
  'zelle',
  43,
  NULL,
  'Thiago',
  'Thiago',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jay'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Ronda 2'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Ronda 2',
  180,
  '2025-10-23',
  'cash',
  43,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Ronda 2'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jay'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jay',
  130,
  '2025-10-24',
  'zelle',
  43,
  NULL,
  'Thiago',
  'Thiago',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jay'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Ronda 2'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Ronda 2',
  180,
  '2025-10-24',
  'cash',
  43,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Ronda 2'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Ronda 3'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Ronda 3',
  180,
  '2025-10-27',
  'cash',
  44,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Ronda 3'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Ronda 3'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Ronda 3',
  130,
  '2025-10-27',
  'zelle',
  44,
  NULL,
  'Thiago',
  'Thiago',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Ronda 3'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Christin'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Christin',
  185.15,
  '2025-10-27',
  'card',
  44,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Imeca') LIMIT 1),
  'MDF',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Christin'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Christin'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Christin',
  397.42,
  '2025-10-27',
  'card',
  44,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  'Molden, Blade, Papel,Plastico e Blue Tape',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Christin'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Christin'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Christin',
  116.77,
  '2025-10-28',
  'card',
  44,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Sherwin-Williams') LIMIT 1),
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Christin'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Christin'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Christin',
  130,
  '2025-10-28',
  'zelle',
  44,
  NULL,
  'Thiago',
  'Thiago',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Christin'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Ronda 3'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Ronda 3',
  180,
  '2025-10-28',
  'cash',
  44,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Ronda 3'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Hipica'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Hipica',
  72.76,
  '2025-10-29',
  'card',
  44,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Imeca') LIMIT 1),
  'MDF',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Hipica'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Hipica'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Hipica',
  267.62,
  '2025-10-29',
  'card',
  44,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  '2x4, Red Oak',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Hipica'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Christin'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Christin',
  130,
  '2025-10-29',
  'zelle',
  44,
  NULL,
  'Thiago',
  'Thiago',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Christin'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Christin'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Christin',
  130,
  '2025-10-29',
  'zelle',
  44,
  NULL,
  'Thiago',
  'Thiago',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Christin'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Hipica'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Hipica',
  22.46,
  '2025-10-30',
  'card',
  44,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Sarasota Paint') LIMIT 1),
  'Stain',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Hipica'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Hipica'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Hipica',
  53.76,
  '2025-10-30',
  'card',
  44,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  'Red OAK',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Hipica'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Hipica'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Hipica',
  180,
  '2025-10-30',
  'cash',
  44,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Hipica'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Hipica'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Hipica',
  180,
  '2025-10-30',
  'cash',
  44,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Hipica'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Marion'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Marion',
  686.94,
  '2025-10-30',
  'card',
  44,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  'Cobertura de carvalho',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Marion'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Reggie 2'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Reggie 2',
  30,
  '2025-10-31',
  'card',
  44,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Reggie 2'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Dominic'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Dominic',
  123.26,
  '2025-11-03',
  'card',
  45,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Imeca') LIMIT 1),
  'Melanine',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Dominic'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Marion'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Marion',
  776.61,
  '2025-11-03',
  'card',
  45,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('lumber') LIMIT 1),
  'Ripado',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Marion'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Marion'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Marion',
  774.08,
  '2025-11-03',
  'card',
  45,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Imeca') LIMIT 1),
  'Melanine, Edge, Clip top',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Marion'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Denise'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Denise',
  130,
  '2025-11-03',
  'card',
  45,
  NULL,
  'Thiago',
  'Thiago',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Denise'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Denise'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Denise',
  180,
  '2025-11-03',
  'card',
  45,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Denise'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Marion'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Marion',
  863.8,
  '2025-11-04',
  'card',
  45,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Imeca') LIMIT 1),
  'Plywood, Edge Banding',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Marion'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Marion'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Marion',
  130,
  '2025-11-04',
  'card',
  45,
  NULL,
  'Thiago',
  'Thiago',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Marion'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Marion'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Marion',
  180,
  '2025-11-04',
  'card',
  45,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Marion'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Marion'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Marion',
  33.66,
  '2025-11-05',
  'card',
  45,
  (SELECT id FROM suppliers WHERE name = 'Lowe''s' AND company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1),
  'Stain',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Marion'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Luzete'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Luzete',
  61.95,
  '2025-11-05',
  'card',
  45,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Sherwin-Williams') LIMIT 1),
  'Emerald',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Luzete'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Marion'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Marion',
  130,
  '2025-11-05',
  'card',
  45,
  NULL,
  'Thiago',
  'Thiago',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Marion'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Marion'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Marion',
  130,
  '2025-11-06',
  'card',
  45,
  NULL,
  'Thiago',
  'Thiago',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Marion'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Marion'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Marion',
  130,
  '2025-11-07',
  'card',
  45,
  NULL,
  'Thiago',
  'Thiago',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Marion'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Marion'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Marion',
  150,
  '2025-11-07',
  'card',
  45,
  NULL,
  'Kaique',
  'Kaique',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Marion'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Marion'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Marion',
  63.61,
  '2025-11-10',
  'card',
  46,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Sherwin-Williams') LIMIT 1),
  'Emerald',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Marion'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Marion'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Marion',
  29.99,
  '2025-11-10',
  'card',
  46,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('amazon') LIMIT 1),
  'Push for Open',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Marion'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Marion'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Marion',
  150,
  '2025-11-10',
  'card',
  46,
  NULL,
  'Kaique',
  'Kaique',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Marion'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jesse'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jesse',
  85.63,
  '2025-11-11',
  'card',
  46,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  'Liq Nail, MDF PNL, Scotchblue, Paper',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jesse'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jesse'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jesse',
  150,
  '2025-11-11',
  'card',
  46,
  NULL,
  'Kaique',
  'Kaique',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jesse'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Marion'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Marion',
  180,
  '2025-11-11',
  'card',
  46,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Marion'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Luzete'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Luzete',
  491.77,
  '2025-11-12',
  'card',
  46,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Imeca') LIMIT 1),
  'Wood doors',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Luzete'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jesse'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jesse',
  42.8,
  '2025-11-12',
  'card',
  46,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Imeca') LIMIT 1),
  'MDF',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jesse'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jesse'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jesse',
  150,
  '2025-11-12',
  'card',
  46,
  NULL,
  'Kaique',
  'Kaique',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jesse'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Marion'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Marion',
  180,
  '2025-11-12',
  'card',
  46,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Marion'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Marion'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Marion',
  177.19,
  '2025-11-12',
  'card',
  46,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('lumber') LIMIT 1),
  'Ripado',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Marion'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Marion'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Marion',
  580,
  '2025-11-12',
  'card',
  46,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('CNC') LIMIT 1),
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Marion'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Marion'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Marion',
  180,
  '2025-11-13',
  'card',
  46,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Marion'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jesse'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jesse',
  27.72,
  '2025-11-13',
  'card',
  46,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Sherwin-Williams') LIMIT 1),
  'colossus 3/4, Wood filler',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jesse'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Marion'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Marion',
  104.07,
  '2025-11-13',
  'card',
  46,
  (SELECT id FROM suppliers WHERE name = 'Lowe''s' AND company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1),
  'stain, poly',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Marion'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jesse'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jesse',
  112.35,
  '2025-11-13',
  'card',
  46,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Sherwin-Williams') LIMIT 1),
  'tinta',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jesse'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jesse'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jesse',
  150,
  '2025-11-13',
  'card',
  46,
  NULL,
  'Kaique',
  'Kaique',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jesse'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Marion'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Marion',
  180,
  '2025-11-13',
  'card',
  46,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Marion'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jesse'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jesse',
  150,
  '2025-11-13',
  'card',
  46,
  NULL,
  'Willian',
  'Willian',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jesse'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jesse'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jesse',
  150,
  '2025-11-14',
  'card',
  46,
  NULL,
  'Kaique',
  'Kaique',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jesse'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jenny'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jenny',
  1495.06,
  '2025-11-14',
  'card',
  46,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('lumber') LIMIT 1),
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jenny'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Marion'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Marion',
  150,
  '2025-11-14',
  'card',
  46,
  NULL,
  'Kaique',
  'Kaique',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Marion'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Marion'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Marion',
  180,
  '2025-11-14',
  'card',
  46,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Marion'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jesse'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jesse',
  150,
  '2025-11-14',
  'card',
  46,
  NULL,
  'Willian',
  'Willian',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jesse'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Dominic'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Dominic',
  128.03,
  '2025-11-15',
  'card',
  46,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Imeca') LIMIT 1),
  'Plywood, Clip top, screws',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Dominic'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Dominic'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Dominic',
  150,
  '2025-11-15',
  'card',
  46,
  NULL,
  'Kaique',
  'Kaique',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Dominic'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jenny'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jenny',
  30,
  '2025-11-16',
  'card',
  47,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Projeto') LIMIT 1),
  'Bruna',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jenny'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Dominic'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Dominic',
  75,
  '2025-11-16',
  'card',
  47,
  NULL,
  'Kaique',
  'Kaique',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Dominic'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Marion'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Marion',
  180,
  '2025-11-17',
  'card',
  47,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Marion'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Dominic'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Dominic',
  48.32,
  '2025-11-17',
  'card',
  47,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Imeca') LIMIT 1),
  'MDF',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Dominic'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Dominic'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Dominic',
  150,
  '2025-11-17',
  'card',
  47,
  NULL,
  'Kaique',
  'Kaique',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Dominic'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Marion'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Marion',
  127.28,
  '2025-11-18',
  'card',
  47,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('amazon') LIMIT 1),
  'controle, fonte',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Marion'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Marion'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Marion',
  52.19,
  '2025-11-18',
  'card',
  47,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('amazon') LIMIT 1),
  'Handles',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Marion'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Marion'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Marion',
  9.57,
  '2025-11-18',
  'card',
  47,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  '2x3',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Marion'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Shery'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Shery',
  1574.3,
  '2025-11-18',
  'card',
  47,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  'Cobertura de carvalho',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Shery'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Marion'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Marion',
  180,
  '2025-11-18',
  'card',
  47,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Marion'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Dominic'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Dominic',
  150,
  '2025-11-18',
  'card',
  47,
  NULL,
  'Kaique',
  'Kaique',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Dominic'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jenny'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jenny',
  345.61,
  '2025-11-19',
  'card',
  47,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Imeca') LIMIT 1),
  'MDF, Handles',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jenny'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jenny'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jenny',
  192.88,
  '2025-11-19',
  'card',
  47,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  'Glue, Paper,BlueTape, Liq Nail, Plastic',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jenny'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jenny'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jenny',
  179.91,
  '2025-11-19',
  'card',
  47,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Sherwin-Williams') LIMIT 1),
  'Prime, Tinta',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jenny'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Marion'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Marion',
  180,
  '2025-11-19',
  'card',
  47,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Marion'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jenny'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jenny',
  150,
  '2025-11-19',
  'card',
  47,
  NULL,
  'Kaique',
  'Kaique',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jenny'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jenny'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Jenny',
  180,
  '2025-11-20',
  'card',
  47,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jenny'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jenny'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jenny',
  150,
  '2025-11-20',
  'card',
  47,
  NULL,
  'Kaique',
  'Kaique',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jenny'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jenny'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jenny',
  19.08,
  '2025-11-21',
  'card',
  47,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Sherwin-Williams') LIMIT 1),
  'wood filler',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jenny'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jenny'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jenny',
  369.58,
  '2025-11-21',
  'card',
  47,
  (SELECT id FROM suppliers WHERE name = 'Lowe''s' AND company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1),
  'molden',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jenny'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jenny'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jenny',
  12,
  '2025-11-21',
  'card',
  47,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('amazon') LIMIT 1),
  'coat hooks towel',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jenny'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jenny'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Jenny',
  125.48,
  '2025-11-21',
  'card',
  47,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Imeca') LIMIT 1),
  'MDF',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jenny'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jenny'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Jenny',
  180,
  '2025-11-21',
  'card',
  47,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jenny'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jenny'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jenny',
  150,
  '2025-11-21',
  'card',
  47,
  NULL,
  'Kaique',
  'Kaique',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jenny'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jenny'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jenny',
  150,
  '2025-11-21',
  'card',
  47,
  NULL,
  'Willian',
  'Willian',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jenny'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jenny'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Jenny',
  37.96,
  '2025-11-24',
  'card',
  48,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  'Bluetape',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jenny'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jenny'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jenny',
  82.69,
  '2025-11-24',
  'card',
  48,
  NULL,
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jenny'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jenny'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Jenny',
  200,
  '2025-11-24',
  'card',
  48,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jenny'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jenny'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Jenny',
  150,
  '2025-11-24',
  'card',
  48,
  NULL,
  'Brian',
  'Brian',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jenny'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jenny'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jenny',
  75,
  '2025-11-24',
  'card',
  48,
  NULL,
  'Kaique',
  'Kaique',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jenny'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jenny'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jenny',
  150,
  '2025-11-24',
  'card',
  48,
  NULL,
  'Willian',
  'Willian',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jenny'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jenny'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Jenny',
  661.52,
  '2025-11-25',
  'card',
  48,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Imeca') LIMIT 1),
  'Moulding',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jenny'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jenny'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Jenny',
  200,
  '2025-11-25',
  'card',
  48,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jenny'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jenny'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Jenny',
  150,
  '2025-11-25',
  'card',
  48,
  NULL,
  'Brian',
  'Brian',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jenny'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jenny'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jenny',
  150,
  '2025-11-25',
  'card',
  48,
  NULL,
  'Kaique',
  'Kaique',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jenny'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jenny'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jenny',
  150,
  '2025-11-25',
  'card',
  48,
  NULL,
  'Willian',
  'Willian',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jenny'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jenny'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jenny',
  10.7,
  '2025-11-25',
  'card',
  48,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Sherwin-Williams') LIMIT 1),
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jenny'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jenny'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Jenny',
  13.89,
  '2025-11-25',
  'card',
  48,
  (SELECT id FROM suppliers WHERE name = 'Lowe''s' AND company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1),
  'stain',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jenny'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jenny'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Jenny',
  49.22,
  '2025-11-26',
  'card',
  48,
  (SELECT id FROM suppliers WHERE name = 'Lowe''s' AND company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1),
  'Molding',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jenny'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jenny'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jenny',
  53.49,
  '2025-11-26',
  'card',
  48,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Sherwin-Williams') LIMIT 1),
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jenny'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jenny'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jenny',
  56.3,
  '2025-11-26',
  'card',
  48,
  NULL,
  'Molding',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jenny'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jenny'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jenny',
  37.45,
  '2025-11-28',
  'card',
  48,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Sherwin-Williams') LIMIT 1),
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jenny'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jenny'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jenny',
  30.97,
  '2025-11-29',
  'card',
  48,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Sherwin-Williams') LIMIT 1),
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jenny'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Shery'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Shery',
  75.65,
  '2025-11-30',
  'card',
  49,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  'papel e bluetape',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Shery'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Shery'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Shery',
  112.85,
  '2025-12-01',
  'card',
  49,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  'whitwood, 2x4',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Shery'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Shery'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Shery',
  47.08,
  '2025-12-01',
  'card',
  49,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Imeca') LIMIT 1),
  'MDF',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Shery'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Shery'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Shery',
  124.12,
  '2025-12-02',
  'card',
  49,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('amazon') LIMIT 1),
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Shery'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Shery'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Shery',
  90.07,
  '2025-12-02',
  'card',
  49,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Sarasota Paint') LIMIT 1),
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Shery'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Shery'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Shery',
  55.6,
  '2025-12-02',
  'card',
  49,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  'Drywall',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Shery'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Shery'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Shery',
  1304.22,
  '2025-12-02',
  'card',
  49,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Imeca') LIMIT 1),
  'Plywood',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Shery'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Shery'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Shery',
  26.73,
  '2025-12-02',
  'card',
  49,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  'Drywall',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Shery'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Shery'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Shery',
  49.16,
  '2025-12-02',
  'card',
  49,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Walmart') LIMIT 1),
  'poly',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Shery'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Shery'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Shery',
  62.83,
  '2025-12-02',
  'card',
  49,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  'massa e drywall',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Shery'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Shery'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Shery',
  150,
  '2025-12-03',
  'card',
  49,
  NULL,
  'Willian',
  'Willian',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Shery'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Shery'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Shery',
  150,
  '2025-12-03',
  'card',
  49,
  NULL,
  'Kaique',
  'Kaique',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Shery'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Shery'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Shery',
  180,
  '2025-12-03',
  'card',
  49,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Shery'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Shery'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Shery',
  180,
  '2025-12-04',
  'cash',
  49,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Shery'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Shery'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Shery',
  667.36,
  '2025-12-04',
  'card',
  49,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('amazon') LIMIT 1),
  'Cobertura de carvalho',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Shery'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Shery'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Shery',
  180,
  '2025-12-04',
  'card',
  49,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Shery'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Shery'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Shery',
  150,
  '2025-12-04',
  'card',
  49,
  NULL,
  'Kaique',
  'Kaique',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Shery'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Shery'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Shery',
  150,
  '2025-12-05',
  'card',
  49,
  NULL,
  'Willian',
  'Willian',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Shery'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Shery'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Shery',
  180,
  '2025-12-05',
  'card',
  49,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Shery'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Shery'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Shery',
  150,
  '2025-12-05',
  'card',
  49,
  NULL,
  'Kaique',
  'Kaique',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Shery'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Shery'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Shery',
  150,
  '2025-12-05',
  'card',
  49,
  NULL,
  'Willian',
  'Willian',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Shery'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Shery'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Shery',
  1460.55,
  '2025-12-05',
  'card',
  49,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('lumber') LIMIT 1),
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Shery'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Shery'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Shery',
  100,
  '2025-12-05',
  'card',
  49,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Gesso') LIMIT 1),
  'Javier',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Shery'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Shery'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Shery',
  27.67,
  '2025-12-06',
  'card',
  49,
  (SELECT id FROM suppliers WHERE name = 'Lowe''s' AND company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1),
  'Poly e Stain',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Shery'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Shery'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Shery',
  30.98,
  '2025-12-08',
  'card',
  50,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Sherwin-Williams') LIMIT 1),
  'tinta',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Shery'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Shery'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Shery',
  150,
  '2025-12-08',
  'card',
  50,
  NULL,
  'Willian',
  'Willian',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Shery'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Shery'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Shery',
  150,
  '2025-12-08',
  'card',
  50,
  NULL,
  'Kaique',
  'Kaique',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Shery'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Shery'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Shery',
  180,
  '2025-12-08',
  'card',
  50,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Shery'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Shery'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Shery',
  187.5,
  '2025-12-09',
  'card',
  50,
  NULL,
  '18.75h trabalhada + 2h extra = 37.5',
  'Willian',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Shery'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Shery'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Shery',
  187.5,
  '2025-12-09',
  'card',
  50,
  NULL,
  '18.75h trabalhada + 2h extra = 37.5',
  'Kaique',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Shery'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Shery'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Shery',
  225,
  '2025-12-09',
  'card',
  50,
  NULL,
  '22.5h trabalhada + 2h extra = 45',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Shery'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Shery'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Shery',
  56.6,
  '2025-12-09',
  'card',
  50,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Sherwin-Williams') LIMIT 1),
  'poly',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Shery'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna Loira'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Donna Loira',
  57.75,
  '2025-12-09',
  'card',
  50,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  'esponja, saco graute',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna Loira'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Shery'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Shery',
  43.14,
  '2025-12-09',
  'card',
  50,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  'liqnail',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Shery'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna Loira'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Donna Loira',
  150,
  '2025-12-10',
  'card',
  50,
  NULL,
  'Kaique',
  'Kaique',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna Loira'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jay 2'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jay 2',
  150,
  '2025-12-10',
  'card',
  50,
  NULL,
  'Willian',
  'Willian',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jay 2'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna Loira'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Donna Loira',
  180,
  '2025-12-10',
  'card',
  50,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna Loira'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jay 2'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Jay 2',
  90.97,
  '2025-12-10',
  'card',
  50,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  'cimento',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jay 2'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna Loira'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Donna Loira',
  600.27,
  '2025-12-10',
  'card',
  50,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Imeca') LIMIT 1),
  'Plywood',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna Loira'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jennie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Jennie',
  47.08,
  '2025-12-10',
  'card',
  50,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Imeca') LIMIT 1),
  'MDF',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jennie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jenny'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jenny',
  75.84,
  '2025-12-10',
  'card',
  50,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Sherwin-Williams') LIMIT 1),
  'tinta',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jenny'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jenny'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Jenny',
  55.23,
  '2025-12-10',
  'card',
  50,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  'Canos Ronda',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jenny'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jennie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Jennie',
  79.63,
  '2025-12-11',
  'card',
  50,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  'papel e bluetape',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jennie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna Loira'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Donna Loira',
  32.94,
  '2025-12-11',
  'card',
  50,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Ace') LIMIT 1),
  'Poll e capinha outlet',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna Loira'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna Loira'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Donna Loira',
  180,
  '2025-12-11',
  'card',
  50,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna Loira'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna Loira'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Donna Loira',
  150,
  '2025-12-11',
  'card',
  50,
  NULL,
  'Willian',
  'Willian',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna Loira'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna Loira'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Donna Loira',
  150,
  '2025-12-11',
  'card',
  50,
  NULL,
  'Kaique',
  'Kaique',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna Loira'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jay 2'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Jay 2',
  21.27,
  '2025-12-12',
  'card',
  50,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  'cimento',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jay 2'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Heather'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Heather',
  219.56,
  '2025-12-12',
  'card',
  50,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('407') LIMIT 1),
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Heather'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jay 2'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jay 2',
  21.27,
  '2025-12-12',
  'card',
  50,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  'cimento',
  NULL,
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jay 2'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna Loira'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Donna Loira',
  150,
  '2025-12-12',
  'card',
  50,
  NULL,
  'Willian',
  'Willian',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna Loira'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Donna Loira'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Donna Loira',
  112.5,
  '2025-12-12',
  'card',
  50,
  NULL,
  'saiu as 2 p.m. ver valor que foi pago',
  'Kaique',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Donna Loira'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jennie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Jennie',
  356.99,
  '2025-12-15',
  'card',
  51,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Imeca') LIMIT 1),
  'Mdf',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jennie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jennie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Jennie',
  418.32,
  '2025-12-15',
  'card',
  51,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  '2x4, molden',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jennie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jay 2'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Jay 2',
  9.94,
  '2025-12-15',
  'card',
  51,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  'cimento',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jay 2'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jennie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Jennie',
  180,
  '2025-12-15',
  'card',
  51,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jennie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jennie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jennie',
  150,
  '2025-12-15',
  'card',
  51,
  NULL,
  'Willian',
  'Willian',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jennie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jennie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jennie',
  150,
  '2025-12-15',
  'card',
  51,
  NULL,
  'Kaique',
  'Kaique',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jennie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jennie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Jennie',
  82.24,
  '2025-12-16',
  'card',
  51,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  'Screw',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jennie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jennie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Jennie',
  65.71,
  '2025-12-16',
  'card',
  51,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Imeca') LIMIT 1),
  'mdf',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jennie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jennie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Jennie',
  75.83,
  '2025-12-16',
  'card',
  51,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Sherwin-Williams') LIMIT 1),
  'prime e massinha',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jennie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jennie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Jennie',
  180,
  '2025-12-16',
  'card',
  51,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jennie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jennie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jennie',
  150,
  '2025-12-16',
  'card',
  51,
  NULL,
  'Willian',
  'Willian',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jennie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jennie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jennie',
  150,
  '2025-12-16',
  'card',
  51,
  NULL,
  'Kaique',
  'Kaique',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jennie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jennie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Jennie',
  180,
  '2025-12-17',
  'card',
  51,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jennie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jennie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jennie',
  150,
  '2025-12-17',
  'card',
  51,
  NULL,
  'Willian',
  'Willian',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jennie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jennie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jennie',
  150,
  '2025-12-17',
  'card',
  51,
  NULL,
  'Kaique',
  'Kaique',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jennie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jay 2'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Jay 2',
  31.92,
  '2025-12-17',
  'card',
  51,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  'window tape, apontador, madeira verde',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jay 2'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jennie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Jennie',
  58.98,
  '2025-12-18',
  'card',
  51,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  'Screen Mould, Tape',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jennie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jennie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Jennie',
  180,
  '2025-12-18',
  'card',
  51,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jennie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jennie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jennie',
  150,
  '2025-12-18',
  'card',
  51,
  NULL,
  'Kaique',
  'Kaique',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jennie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jennie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jennie',
  150,
  '2025-12-18',
  'card',
  51,
  NULL,
  'Willian',
  'Willian',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jennie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jennie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Jennie',
  120,
  '2025-12-18',
  'card',
  51,
  NULL,
  'Eduardo',
  'Eduardo',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jennie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jennie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Jennie',
  304.01,
  '2025-12-19',
  'card',
  51,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Sherwin-Williams') LIMIT 1),
  'tintas',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jennie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jennie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Jennie',
  35.79,
  '2025-12-19',
  'card',
  51,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Sherwin-Williams') LIMIT 1),
  'Prime',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jennie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jennie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Jennie',
  180,
  '2025-12-19',
  'card',
  51,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jennie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jennie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jennie',
  150,
  '2025-12-19',
  'card',
  51,
  NULL,
  'Kaique',
  'Kaique',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jennie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jennie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jennie',
  150,
  '2025-12-19',
  'card',
  51,
  NULL,
  'Willian',
  'Willian',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jennie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jennie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Jennie',
  120,
  '2025-12-19',
  'card',
  51,
  NULL,
  'Eduardo',
  'Eduardo',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jennie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jennie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Jennie',
  180,
  '2025-12-22',
  'card',
  52,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jennie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jennie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jennie',
  150,
  '2025-12-22',
  'card',
  52,
  NULL,
  'Willian',
  'Willian',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jennie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jennie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jennie',
  150,
  '2025-12-22',
  'card',
  52,
  NULL,
  'Kaique',
  'Kaique',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jennie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jennie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Jennie',
  60,
  '2025-12-22',
  'card',
  52,
  NULL,
  'Eduardo',
  'Eduardo',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jennie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jennie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Jennie',
  35.29,
  '2025-12-22',
  'card',
  52,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  'Moldura, Tomada,caixa para oultlet',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jennie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jennie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Jennie',
  180,
  '2025-12-23',
  'card',
  52,
  NULL,
  'Joelma',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jennie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Shery'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Shery',
  180,
  '2025-12-23',
  'card',
  52,
  NULL,
  'diaria + 30 pois trabalho solo na casa do jay 2',
  'Willian',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Shery'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jennie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jennie',
  150,
  '2025-12-23',
  'card',
  52,
  NULL,
  'Kaique',
  'Kaique',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jennie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jennie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Jennie',
  94.16,
  '2025-12-23',
  'card',
  52,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Imeca') LIMIT 1),
  'MDF',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jennie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Shery'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Shery',
  132.57,
  '2025-12-23',
  'card',
  52,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Sherwin-Williams') LIMIT 1),
  'Tinta',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Shery'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jennie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Jennie',
  132.32,
  '2025-12-23',
  'card',
  52,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('The Home Depot') LIMIT 1),
  'Orange Wall, Cromoude',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jennie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jennie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Jennie',
  59.45,
  '2025-12-23',
  'card',
  52,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Sherwin-Williams') LIMIT 1),
  'tinta',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jennie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jennie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Jennie',
  140,
  '2025-12-24',
  'card',
  52,
  NULL,
  'meio periodo mais 50 dollar',
  'Joelma',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jennie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jennie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jennie',
  125,
  '2025-12-24',
  'card',
  52,
  NULL,
  'meio periodo mais 50 dollar',
  'Willian',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jennie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jennie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jennie',
  125,
  '2025-12-24',
  'card',
  52,
  NULL,
  'meio periodo mais 50 dollar',
  'Kaique',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jennie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jennie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Jennie',
  64.2,
  '2025-12-24',
  'card',
  52,
  (SELECT id FROM suppliers WHERE name = 'Lowe''s' AND company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1),
  'Trimi',
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jennie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Shery'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Shery',
  150,
  '2025-12-26',
  'card',
  52,
  NULL,
  'Willian',
  'Willian',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Shery'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jennie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jennie',
  150,
  '2025-12-29',
  'card',
  53,
  NULL,
  'Willian',
  'Willian',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jennie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jennie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jennie',
  150,
  '2025-12-29',
  'card',
  53,
  NULL,
  'Kaique',
  'Kaique',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jennie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jennie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Jennie',
  120,
  '2025-12-29',
  'card',
  53,
  NULL,
  'Eduardo',
  'Eduardo',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jennie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Tom'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Tom',
  1678.62,
  '2025-12-30',
  'card',
  53,
  (SELECT id FROM suppliers WHERE LOWER(name) = LOWER('Lumber') LIMIT 1),
  NULL,
  NULL,
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Tom'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jennie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jennie',
  150,
  '2025-12-30',
  'card',
  53,
  NULL,
  'Willian',
  'Willian',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jennie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jennie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
   LIMIT 1),
  'Jennie',
  150,
  '2025-12-30',
  'card',
  53,
  NULL,
  'Kaique',
  'Kaique',
  (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jennie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You')
);

INSERT INTO financial_exits (
  id, project_id, description, value, exit_date, payment_method, week_of_year,
  supplier_id, detailed_description, calculation_notes,
  company_id, status, created_by, approved_by, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT p.id FROM projects p
   JOIN clients c ON c.id = p.client_id
   WHERE c.name = 'Jennie'
   AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
   LIMIT 1),
  'Jennie',
  120,
  '2025-12-30',
  'card',
  53,
  NULL,
  'Eduardo',
  'Eduardo',
  (SELECT id FROM companies WHERE name = 'JJ'),
  'approved',
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'JJ') LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') AND can_create_users = true LIMIT 1),
    (SELECT id FROM profiles WHERE company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You') LIMIT 1)
  ),
  NOW(),
  NOW()
WHERE EXISTS (
  SELECT 1 FROM projects p
  JOIN clients c ON c.id = p.client_id
  WHERE c.name = 'Jennie'
  AND p.company_id = (SELECT id FROM companies WHERE name = 'JJ')
);

-- ============================================
-- FIM DO SCRIPT
-- ============================================

-- Estatísticas esperadas:
-- - Empresas: 2
-- - Clientes: 69
-- - Projetos: 69
-- - Fornecedores: 29
-- - Entradas: 77
-- - Saídas: 445

-- Verificar importação:
-- SELECT COUNT(*) FROM financial_entries;
-- SELECT COUNT(*) FROM financial_exits;
-- SELECT COUNT(*) FROM clients;
-- SELECT COUNT(*) FROM projects;
-- SELECT COUNT(*) FROM suppliers;
