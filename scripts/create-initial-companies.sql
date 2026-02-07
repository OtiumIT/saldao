-- Script SQL para criar empresas iniciais da SOCIEDADE
-- Execute este script no SQL Editor do Supabase APÓS criar os usuários no Auth
-- 
-- IMPORTANTE: Este sistema é para uma SOCIEDADE entre duas empresas:
-- - JJ (sócia)
-- - Designer 4 You (sócia)
-- 
-- Cada empresa pode ter múltiplos usuários.
-- Usuários veem dados de AMBAS as empresas.
-- Usuários só podem APROVAR lançamentos da OUTRA empresa.

-- 1. Criar empresas da sociedade
INSERT INTO companies (name, legal_name, is_active) VALUES
  ('Designer 4 You', 'Designer 4 You LTDA', true),
  ('JJ', 'JJ LTDA', true)
ON CONFLICT (name) DO NOTHING
RETURNING id, name;

-- 2. Atualizar perfis dos usuários admin com company_id
-- IMPORTANTE: Substitua os emails pelos emails reais dos usuários criados

-- Para Designer 4 You (criar pelo menos 1 admin)
UPDATE profiles 
SET 
  company_id = (SELECT id FROM companies WHERE name = 'Designer 4 You'),
  can_create_users = true,
  role = 'admin'
WHERE email = 'admin@designer4you.com';  -- ⚠️ SUBSTITUA pelo email real

-- Para JJ (criar pelo menos 1 admin)
UPDATE profiles 
SET 
  company_id = (SELECT id FROM companies WHERE name = 'JJ'),
  can_create_users = true,
  role = 'admin'
WHERE email = 'admin@jj.com';  -- ⚠️ SUBSTITUA pelo email real

-- 3. Verificar resultado
SELECT 
  c.name as empresa,
  p.email,
  p.name as usuario,
  p.role,
  p.can_create_users,
  CASE 
    WHEN p.company_id IS NULL THEN '❌ SEM EMPRESA'
    ELSE '✅ OK'
  END as status
FROM companies c
LEFT JOIN profiles p ON p.company_id = c.id
ORDER BY c.name, p.email;

-- 4. Verificar que ambas empresas foram criadas
SELECT 
  name as empresa,
  legal_name,
  is_active,
  created_at
FROM companies
ORDER BY name;
