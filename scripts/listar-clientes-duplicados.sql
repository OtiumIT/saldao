-- =============================================================================
-- Script: Listar clientes duplicados (somente leitura)
-- =============================================================================
-- Execute ANTES do merge para visualizar quais registros serão unificados.
-- Não altera nenhum dado.
-- =============================================================================

SELECT criterio, valor, ids, nomes, cpfs, qtd FROM (
  SELECT 'CPF' AS criterio, regexp_replace(COALESCE(cpf,''), '\D', '', 'g') AS valor,
         array_agg(id ORDER BY (SELECT COUNT(*) FROM pedidos_venda WHERE cliente_id = c.id) DESC, created_at) AS ids,
         array_agg(nome ORDER BY (SELECT COUNT(*) FROM pedidos_venda WHERE cliente_id = c.id) DESC, created_at) AS nomes,
         array_agg(COALESCE(cpf,'') ORDER BY (SELECT COUNT(*) FROM pedidos_venda WHERE cliente_id = c.id) DESC, created_at) AS cpfs,
         COUNT(*) AS qtd
  FROM clientes c
  WHERE cpf IS NOT NULL AND cpf != ''
    AND length(regexp_replace(COALESCE(cpf,''), '\D', '', 'g')) = 11
  GROUP BY regexp_replace(COALESCE(cpf,''), '\D', '', 'g')
  HAVING COUNT(*) > 1

  UNION ALL

  SELECT 'CNPJ', regexp_replace(COALESCE(cnpj,''), '\D', '', 'g'),
         array_agg(id ORDER BY (SELECT COUNT(*) FROM pedidos_venda WHERE cliente_id = c.id) DESC, created_at),
         array_agg(nome ORDER BY (SELECT COUNT(*) FROM pedidos_venda WHERE cliente_id = c.id) DESC, created_at),
         array_agg(COALESCE(cpf,'') ORDER BY (SELECT COUNT(*) FROM pedidos_venda WHERE cliente_id = c.id) DESC, created_at),
         COUNT(*)
  FROM clientes c
  WHERE cnpj IS NOT NULL AND cnpj != ''
    AND length(regexp_replace(COALESCE(cnpj,''), '\D', '', 'g')) = 14
  GROUP BY regexp_replace(COALESCE(cnpj,''), '\D', '', 'g')
  HAVING COUNT(*) > 1

  UNION ALL

  SELECT 'EMAIL', LOWER(TRIM(email)),
         array_agg(id ORDER BY (SELECT COUNT(*) FROM pedidos_venda WHERE cliente_id = c.id) DESC, created_at),
         array_agg(nome ORDER BY (SELECT COUNT(*) FROM pedidos_venda WHERE cliente_id = c.id) DESC, created_at),
         array_agg(COALESCE(cpf,'') ORDER BY (SELECT COUNT(*) FROM pedidos_venda WHERE cliente_id = c.id) DESC, created_at),
         COUNT(*)
  FROM clientes c
  WHERE email IS NOT NULL AND TRIM(email) != ''
  GROUP BY LOWER(TRIM(email))
  HAVING COUNT(*) > 1

  UNION ALL

  SELECT 'FONE', regexp_replace(COALESCE(fone,''), '\D', '', 'g'),
         array_agg(id ORDER BY (SELECT COUNT(*) FROM pedidos_venda WHERE cliente_id = c.id) DESC, created_at),
         array_agg(nome ORDER BY (SELECT COUNT(*) FROM pedidos_venda WHERE cliente_id = c.id) DESC, created_at),
         array_agg(COALESCE(cpf,'') ORDER BY (SELECT COUNT(*) FROM pedidos_venda WHERE cliente_id = c.id) DESC, created_at),
         COUNT(*)
  FROM clientes c
  WHERE fone IS NOT NULL AND fone != ''
    AND length(regexp_replace(COALESCE(fone,''), '\D', '', 'g')) >= 10
  GROUP BY regexp_replace(COALESCE(fone,''), '\D', '', 'g')
  HAVING COUNT(*) > 1
) t
ORDER BY criterio, valor;
