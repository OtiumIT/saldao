-- Limpa tabelas do Saldão (para reimportação). Ignora tabelas que não existem.
SET session_replication_role = replica;

DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'produtos_fornecedores', 'movimentacoes_estoque', 'bom', 'ordens_producao',
    'itens_pedido_compra', 'pedidos_compra', 'itens_pedido_venda', 'pedidos_venda',
    'contas_a_pagar', 'contas_a_receber', 'entregas', 'custos_operacionais',
    'produtos', 'categorias_produto', 'categorias_custo_operacional',
    'fornecedores', 'veiculos', 'clientes'
  ];
BEGIN
  FOREACH t IN ARRAY tables
  LOOP
    BEGIN
      EXECUTE format('TRUNCATE TABLE public.%I RESTART IDENTITY CASCADE', t);
    EXCEPTION WHEN undefined_table THEN
      NULL;
    END;
  END LOOP;
END $$;

SET session_replication_role = DEFAULT;
