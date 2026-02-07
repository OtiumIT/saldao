-- Script para criar parceiria "Designer 4 You & JJ" e configurar todos os registros
-- Execute este script após aplicar a migration 008_partnerships.sql

-- 1. Buscar ou criar as empresas
DO $$
DECLARE
  company_designer_id UUID;
  company_jj_id UUID;
  v_partnership_id UUID;  -- Renomear para evitar ambiguidade
  admin_user_id UUID;
  total_percentage DECIMAL(5, 2);
BEGIN
  -- Buscar o primeiro usuário admin para usar como created_by
  SELECT id INTO admin_user_id
  FROM profiles
  WHERE role = 'admin'
  LIMIT 1;

  -- Se não houver admin, usar o primeiro usuário
  IF admin_user_id IS NULL THEN
    SELECT id INTO admin_user_id
    FROM profiles
    LIMIT 1;
  END IF;

  -- Buscar empresa "Designer 4 You" (tentar vários padrões)
  SELECT id INTO company_designer_id
  FROM companies
  WHERE LOWER(name) LIKE '%designer%4%you%' 
     OR LOWER(name) LIKE '%designer 4 you%'
     OR LOWER(name) = 'designer 4 you'
     OR LOWER(name) LIKE '%designer4you%'
  LIMIT 1;

  -- Se não encontrar, criar
  IF company_designer_id IS NULL THEN
    INSERT INTO companies (name, legal_name, is_active, created_by)
    VALUES ('Designer 4 You', 'Designer 4 You', true, admin_user_id)
    RETURNING id INTO company_designer_id;
    RAISE NOTICE 'Empresa Designer 4 You criada com ID: %', company_designer_id;
  ELSE
    RAISE NOTICE 'Empresa Designer 4 You encontrada com ID: %', company_designer_id;
  END IF;

  -- Buscar empresa "JJ" (tentar vários padrões)
  SELECT id INTO company_jj_id
  FROM companies
  WHERE LOWER(name) = 'jj'
     OR LOWER(name) LIKE 'jj%'
     OR LOWER(name) LIKE '%jj%'
  ORDER BY CASE WHEN LOWER(name) = 'jj' THEN 1 ELSE 2 END
  LIMIT 1;

  -- Se não encontrar, criar
  IF company_jj_id IS NULL THEN
    INSERT INTO companies (name, legal_name, is_active, created_by)
    VALUES ('JJ', 'JJ', true, admin_user_id)
    RETURNING id INTO company_jj_id;
    RAISE NOTICE 'Empresa JJ criada com ID: %', company_jj_id;
  ELSE
    RAISE NOTICE 'Empresa JJ encontrada com ID: %', company_jj_id;
  END IF;

  -- 2. Verificar se a parceiria já existe
  SELECT id INTO v_partnership_id
  FROM partnerships
  WHERE name = 'Designer 4 You & JJ'
  LIMIT 1;

  -- Se não existir, criar
  IF v_partnership_id IS NULL THEN
    INSERT INTO partnerships (name, description, is_active, created_by)
    VALUES ('Designer 4 You & JJ', 'Parceiria entre Designer 4 You e JJ', true, admin_user_id)
    RETURNING id INTO v_partnership_id;
    RAISE NOTICE 'Parceiria criada com ID: %', v_partnership_id;
  ELSE
    RAISE NOTICE 'Parceiria já existe com ID: %', v_partnership_id;
    
    -- Verificar se as empresas já estão na parceiria
    IF NOT EXISTS (
      SELECT 1 FROM partnership_companies pc
      WHERE pc.partnership_id = v_partnership_id 
      AND pc.company_id IN (company_designer_id, company_jj_id)
    ) THEN
      -- Adicionar empresas se não estiverem
      INSERT INTO partnership_companies (partnership_id, company_id, percentage)
      VALUES
        (v_partnership_id, company_designer_id, 50.00),
        (v_partnership_id, company_jj_id, 50.00)
      ON CONFLICT (partnership_id, company_id) DO NOTHING;
      RAISE NOTICE 'Empresas adicionadas à parceiria existente';
    END IF;
  END IF;

  -- 3. Adicionar empresas na parceiria (50% cada) - apenas se não existirem
  INSERT INTO partnership_companies (partnership_id, company_id, percentage)
  VALUES
    (v_partnership_id, company_designer_id, 50.00),
    (v_partnership_id, company_jj_id, 50.00)
  ON CONFLICT (partnership_id, company_id) DO UPDATE
  SET percentage = EXCLUDED.percentage;

  RAISE NOTICE 'Empresas configuradas na parceiria (50 por cento cada)';

  -- 4. Atualizar TODOS os registros existentes para usar a parceiria
  -- Clients
  UPDATE clients c
  SET entity_type = 'partnership',
      partnership_id = v_partnership_id
  WHERE (c.entity_type = 'own' OR c.entity_type IS NULL OR c.partnership_id IS NULL);

  RAISE NOTICE 'Clients atualizados: %', (SELECT COUNT(*) FROM clients c WHERE c.partnership_id = v_partnership_id);

  -- Suppliers
  UPDATE suppliers s
  SET entity_type = 'partnership',
      partnership_id = v_partnership_id
  WHERE (s.entity_type = 'own' OR s.entity_type IS NULL OR s.partnership_id IS NULL);

  RAISE NOTICE 'Suppliers atualizados: %', (SELECT COUNT(*) FROM suppliers s WHERE s.partnership_id = v_partnership_id);

  -- Labor
  UPDATE labor l
  SET entity_type = 'partnership',
      partnership_id = v_partnership_id
  WHERE (l.entity_type = 'own' OR l.entity_type IS NULL OR l.partnership_id IS NULL);

  RAISE NOTICE 'Labor atualizados: %', (SELECT COUNT(*) FROM labor l WHERE l.partnership_id = v_partnership_id);

  -- Projects
  UPDATE projects p
  SET entity_type = 'partnership',
      partnership_id = v_partnership_id
  WHERE (p.entity_type = 'own' OR p.entity_type IS NULL OR p.partnership_id IS NULL);

  RAISE NOTICE 'Projects atualizados: %', (SELECT COUNT(*) FROM projects p WHERE p.partnership_id = v_partnership_id);

  -- 5. Validar porcentagens da parceiria
  SELECT COALESCE(SUM(pc.percentage), 0) INTO total_percentage
  FROM partnership_companies pc
  WHERE pc.partnership_id = v_partnership_id;

  IF total_percentage != 100.00 THEN
    RAISE WARNING 'ATENÇÃO: A soma das porcentagens da parceiria é %, deveria ser 100', total_percentage;
  ELSE
    RAISE NOTICE 'Parceiria validada: soma das porcentagens = 100';
  END IF;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'Script concluído com sucesso!';
  RAISE NOTICE 'Parceiria ID: %', v_partnership_id;
  RAISE NOTICE 'Designer 4 You ID: %', company_designer_id;
  RAISE NOTICE 'JJ ID: %', company_jj_id;
  RAISE NOTICE '========================================';

END $$;

-- Verificar resultados
SELECT 
  p.id as partnership_id,
  p.name as partnership_name,
  COUNT(DISTINCT pc.company_id) as num_companies,
  SUM(pc.percentage) as total_percentage
FROM partnerships p
LEFT JOIN partnership_companies pc ON pc.partnership_id = p.id
WHERE p.name = 'Designer 4 You & JJ'
GROUP BY p.id, p.name;

-- Mostrar estatísticas de registros atualizados
SELECT 
  'Clients' as tabela,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE entity_type = 'partnership') as partnership_count
FROM clients
UNION ALL
SELECT 
  'Suppliers' as tabela,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE entity_type = 'partnership') as partnership_count
FROM suppliers
UNION ALL
SELECT 
  'Labor' as tabela,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE entity_type = 'partnership') as partnership_count
FROM labor
UNION ALL
SELECT 
  'Projects' as tabela,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE entity_type = 'partnership') as partnership_count
FROM projects;
