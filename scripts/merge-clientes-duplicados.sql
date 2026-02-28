-- =============================================================================
-- Script: Unir clientes duplicados e apagar registros redundantes
-- =============================================================================
-- Identifica duplicados por: CPF, CNPJ, e-mail ou telefone (apenas dígitos)
-- Mantém o registro com mais pedidos (ou o mais antigo em caso de empate)
-- Atualiza referências em pedidos_venda e mescla dados dos duplicados
--
-- Uso:
--   1. Execute scripts/listar-clientes-duplicados.sql para visualizar duplicados
--   2. Faça backup do banco antes de executar este script
--   3. Execute no Supabase SQL Editor ou: psql $DATABASE_URL -f merge-clientes-duplicados.sql
--
-- IMPORTANTE: O script altera e remove dados. Transação permite rollback em erro.
-- =============================================================================

BEGIN;

DO $$
DECLARE
  v_cpf TEXT;
  v_cnpj TEXT;
  v_email TEXT;
  v_fone_digits TEXT;
  v_master_id UUID;
  v_duplicate_ids UUID[];
  v_dup_id UUID;
  v_merged_nome TEXT;
  v_merged_fone TEXT;
  v_merged_email TEXT;
  v_merged_endereco TEXT;
  v_merged_observacoes TEXT;
  v_count_cpf INT := 0;
  v_count_cnpj INT := 0;
  v_count_email INT := 0;
  v_count_fone INT := 0;
BEGIN
  RAISE NOTICE '=== Iniciando merge de clientes duplicados ===';

  -- -------------------------------------------------------------------------
  -- 1. Duplicados por CPF (11 dígitos)
  -- -------------------------------------------------------------------------
  FOR v_cpf IN
    SELECT regexp_replace(COALESCE(cpf,''), '\D', '', 'g')
    FROM clientes
    WHERE cpf IS NOT NULL AND cpf != ''
      AND length(regexp_replace(COALESCE(cpf,''), '\D', '', 'g')) = 11
    GROUP BY regexp_replace(COALESCE(cpf,''), '\D', '', 'g')
    HAVING COUNT(*) > 1
  LOOP
    -- Master: o que tem mais pedidos; se empate, o mais antigo
    SELECT c.id INTO v_master_id
    FROM clientes c
    LEFT JOIN pedidos_venda p ON p.cliente_id = c.id
    WHERE regexp_replace(COALESCE(c.cpf,''), '\D', '', 'g') = v_cpf
    GROUP BY c.id, c.created_at
    ORDER BY COUNT(p.id) DESC, c.created_at ASC
    LIMIT 1;

    SELECT ARRAY_AGG(id ORDER BY (SELECT COUNT(*) FROM pedidos_venda WHERE cliente_id = c.id) DESC, created_at)
    INTO v_duplicate_ids
    FROM clientes c
    WHERE regexp_replace(COALESCE(cpf,''), '\D', '', 'g') = v_cpf;

    -- Mesclar dados (pegar primeiro não-nulo de cada campo entre os duplicados)
    SELECT
      (SELECT nome FROM clientes WHERE id = ANY(v_duplicate_ids) AND nome IS NOT NULL AND nome != '' LIMIT 1),
      (SELECT fone FROM clientes WHERE id = ANY(v_duplicate_ids) AND fone IS NOT NULL AND fone != '' LIMIT 1),
      (SELECT email FROM clientes WHERE id = ANY(v_duplicate_ids) AND email IS NOT NULL AND email != '' LIMIT 1),
      (SELECT endereco_entrega FROM clientes WHERE id = ANY(v_duplicate_ids) AND endereco_entrega IS NOT NULL AND endereco_entrega != '' LIMIT 1),
      (SELECT observacoes FROM clientes WHERE id = ANY(v_duplicate_ids) AND observacoes IS NOT NULL AND observacoes != '' LIMIT 1)
    INTO v_merged_nome, v_merged_fone, v_merged_email, v_merged_endereco, v_merged_observacoes;

    UPDATE clientes SET
      nome = COALESCE(v_merged_nome, nome),
      fone = COALESCE(v_merged_fone, fone),
      email = COALESCE(v_merged_email, email),
      endereco_entrega = COALESCE(v_merged_endereco, endereco_entrega),
      observacoes = COALESCE(v_merged_observacoes, observacoes)
    WHERE id = v_master_id;

    UPDATE pedidos_venda SET cliente_id = v_master_id WHERE cliente_id = ANY(v_duplicate_ids) AND cliente_id != v_master_id;

    FOREACH v_dup_id IN ARRAY v_duplicate_ids
    LOOP
      IF v_dup_id != v_master_id THEN
        DELETE FROM clientes WHERE id = v_dup_id;
        v_count_cpf := v_count_cpf + 1;
      END IF;
    END LOOP;
  END LOOP;

  RAISE NOTICE 'CPF: % duplicados removidos', v_count_cpf;

  -- -------------------------------------------------------------------------
  -- 2. Duplicados por CNPJ (14 dígitos)
  -- -------------------------------------------------------------------------
  FOR v_cnpj IN
    SELECT regexp_replace(COALESCE(cnpj,''), '\D', '', 'g')
    FROM clientes
    WHERE cnpj IS NOT NULL AND cnpj != ''
      AND length(regexp_replace(COALESCE(cnpj,''), '\D', '', 'g')) = 14
    GROUP BY regexp_replace(COALESCE(cnpj,''), '\D', '', 'g')
    HAVING COUNT(*) > 1
  LOOP
    SELECT c.id INTO v_master_id
    FROM clientes c
    LEFT JOIN pedidos_venda p ON p.cliente_id = c.id
    WHERE regexp_replace(COALESCE(c.cnpj,''), '\D', '', 'g') = v_cnpj
    GROUP BY c.id, c.created_at
    ORDER BY COUNT(p.id) DESC, c.created_at ASC
    LIMIT 1;

    SELECT ARRAY_AGG(id ORDER BY (SELECT COUNT(*) FROM pedidos_venda WHERE cliente_id = c.id) DESC, created_at)
    INTO v_duplicate_ids
    FROM clientes c
    WHERE regexp_replace(COALESCE(cnpj,''), '\D', '', 'g') = v_cnpj;

    SELECT
      (SELECT nome FROM clientes WHERE id = ANY(v_duplicate_ids) AND nome IS NOT NULL AND nome != '' LIMIT 1),
      (SELECT fone FROM clientes WHERE id = ANY(v_duplicate_ids) AND fone IS NOT NULL AND fone != '' LIMIT 1),
      (SELECT email FROM clientes WHERE id = ANY(v_duplicate_ids) AND email IS NOT NULL AND email != '' LIMIT 1),
      (SELECT endereco_entrega FROM clientes WHERE id = ANY(v_duplicate_ids) AND endereco_entrega IS NOT NULL AND endereco_entrega != '' LIMIT 1),
      (SELECT observacoes FROM clientes WHERE id = ANY(v_duplicate_ids) AND observacoes IS NOT NULL AND observacoes != '' LIMIT 1)
    INTO v_merged_nome, v_merged_fone, v_merged_email, v_merged_endereco, v_merged_observacoes;

    UPDATE clientes SET
      nome = COALESCE(v_merged_nome, nome),
      fone = COALESCE(v_merged_fone, fone),
      email = COALESCE(v_merged_email, email),
      endereco_entrega = COALESCE(v_merged_endereco, endereco_entrega),
      observacoes = COALESCE(v_merged_observacoes, observacoes)
    WHERE id = v_master_id;

    UPDATE pedidos_venda SET cliente_id = v_master_id WHERE cliente_id = ANY(v_duplicate_ids) AND cliente_id != v_master_id;

    FOREACH v_dup_id IN ARRAY v_duplicate_ids
    LOOP
      IF v_dup_id != v_master_id THEN
        DELETE FROM clientes WHERE id = v_dup_id;
        v_count_cnpj := v_count_cnpj + 1;
      END IF;
    END LOOP;
  END LOOP;

  RAISE NOTICE 'CNPJ: % duplicados removidos', v_count_cnpj;

  -- -------------------------------------------------------------------------
  -- 3. Duplicados por e-mail (case insensitive)
  -- -------------------------------------------------------------------------
  FOR v_email IN
    SELECT LOWER(TRIM(email))
    FROM clientes
    WHERE email IS NOT NULL AND TRIM(email) != ''
    GROUP BY LOWER(TRIM(email))
    HAVING COUNT(*) > 1
  LOOP
    SELECT c.id INTO v_master_id
    FROM clientes c
    LEFT JOIN pedidos_venda p ON p.cliente_id = c.id
    WHERE LOWER(TRIM(c.email)) = v_email
    GROUP BY c.id, c.created_at
    ORDER BY COUNT(p.id) DESC, c.created_at ASC
    LIMIT 1;

    SELECT ARRAY_AGG(id ORDER BY (SELECT COUNT(*) FROM pedidos_venda WHERE cliente_id = c.id) DESC, created_at)
    INTO v_duplicate_ids
    FROM clientes c
    WHERE LOWER(TRIM(c.email)) = v_email;

    SELECT
      (SELECT nome FROM clientes WHERE id = ANY(v_duplicate_ids) AND nome IS NOT NULL AND nome != '' LIMIT 1),
      (SELECT fone FROM clientes WHERE id = ANY(v_duplicate_ids) AND fone IS NOT NULL AND fone != '' LIMIT 1),
      (SELECT endereco_entrega FROM clientes WHERE id = ANY(v_duplicate_ids) AND endereco_entrega IS NOT NULL AND endereco_entrega != '' LIMIT 1),
      (SELECT observacoes FROM clientes WHERE id = ANY(v_duplicate_ids) AND observacoes IS NOT NULL AND observacoes != '' LIMIT 1)
    INTO v_merged_nome, v_merged_fone, v_merged_endereco, v_merged_observacoes;

    UPDATE clientes SET
      nome = COALESCE(v_merged_nome, nome),
      fone = COALESCE(v_merged_fone, fone),
      endereco_entrega = COALESCE(v_merged_endereco, endereco_entrega),
      observacoes = COALESCE(v_merged_observacoes, observacoes)
    WHERE id = v_master_id;

    UPDATE pedidos_venda SET cliente_id = v_master_id WHERE cliente_id = ANY(v_duplicate_ids) AND cliente_id != v_master_id;

    FOREACH v_dup_id IN ARRAY v_duplicate_ids
    LOOP
      IF v_dup_id != v_master_id THEN
        DELETE FROM clientes WHERE id = v_dup_id;
        v_count_email := v_count_email + 1;
      END IF;
    END LOOP;
  END LOOP;

  RAISE NOTICE 'E-mail: % duplicados removidos', v_count_email;

  -- -------------------------------------------------------------------------
  -- 4. Duplicados por telefone (apenas dígitos, 10+)
  -- -------------------------------------------------------------------------
  FOR v_fone_digits IN
    SELECT regexp_replace(COALESCE(fone,''), '\D', '', 'g')
    FROM clientes
    WHERE fone IS NOT NULL AND fone != ''
      AND length(regexp_replace(COALESCE(fone,''), '\D', '', 'g')) >= 10
    GROUP BY regexp_replace(COALESCE(fone,''), '\D', '', 'g')
    HAVING COUNT(*) > 1
  LOOP
    SELECT c.id INTO v_master_id
    FROM clientes c
    LEFT JOIN pedidos_venda p ON p.cliente_id = c.id
    WHERE regexp_replace(COALESCE(c.fone,''), '\D', '', 'g') = v_fone_digits
    GROUP BY c.id, c.created_at
    ORDER BY COUNT(p.id) DESC, c.created_at ASC
    LIMIT 1;

    SELECT ARRAY_AGG(id ORDER BY (SELECT COUNT(*) FROM pedidos_venda WHERE cliente_id = c.id) DESC, created_at)
    INTO v_duplicate_ids
    FROM clientes c
    WHERE regexp_replace(COALESCE(c.fone,''), '\D', '', 'g') = v_fone_digits;

    SELECT
      (SELECT nome FROM clientes WHERE id = ANY(v_duplicate_ids) AND nome IS NOT NULL AND nome != '' LIMIT 1),
      (SELECT email FROM clientes WHERE id = ANY(v_duplicate_ids) AND email IS NOT NULL AND email != '' LIMIT 1),
      (SELECT endereco_entrega FROM clientes WHERE id = ANY(v_duplicate_ids) AND endereco_entrega IS NOT NULL AND endereco_entrega != '' LIMIT 1),
      (SELECT observacoes FROM clientes WHERE id = ANY(v_duplicate_ids) AND observacoes IS NOT NULL AND observacoes != '' LIMIT 1)
    INTO v_merged_nome, v_merged_email, v_merged_endereco, v_merged_observacoes;

    UPDATE clientes SET
      nome = COALESCE(v_merged_nome, nome),
      email = COALESCE(v_merged_email, email),
      endereco_entrega = COALESCE(v_merged_endereco, endereco_entrega),
      observacoes = COALESCE(v_merged_observacoes, observacoes)
    WHERE id = v_master_id;

    UPDATE pedidos_venda SET cliente_id = v_master_id WHERE cliente_id = ANY(v_duplicate_ids) AND cliente_id != v_master_id;

    FOREACH v_dup_id IN ARRAY v_duplicate_ids
    LOOP
      IF v_dup_id != v_master_id THEN
        DELETE FROM clientes WHERE id = v_dup_id;
        v_count_fone := v_count_fone + 1;
      END IF;
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Telefone: % duplicados removidos', v_count_fone;
  RAISE NOTICE '=== Total: % clientes duplicados removidos ===', v_count_cpf + v_count_cnpj + v_count_email + v_count_fone;
END $$;

COMMIT;
