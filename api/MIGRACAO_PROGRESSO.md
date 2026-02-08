# Progresso da Migração para Supabase Data API

## ✅ Módulos Migrados (7/14)

1. ✅ **clientes** - Completo
2. ✅ **avisos-compra** - Completo (usa múltiplas queries)
3. ✅ **categorias-produto** - Completo
4. ✅ **cores** - Completo
5. ✅ **custos-operacionais** - Completo (usa múltiplas queries para JOINs)
6. ✅ **fornecedores** - Completo
7. ✅ **funcionarios** - Completo (usa múltiplas queries para JOINs)

## ⏳ Módulos Pendentes (7/14)

1. ⏳ **compras** - Tem transações complexas (precisa RPC ou fazer sequencial)
2. ⏳ **financeiro** - Simples, CRUD básico
3. ⏳ **roteirizacao** - Tem JOINs e queries complexas
4. ⏳ **estoque/produtos** - Queries complexas com views (saldo_estoque)
5. ⏳ **estoque/movimentacoes** - CRUD básico
6. ⏳ **producao** - Queries complexas com JOINs e cálculos
7. ⏳ **vendas** - Queries complexas com JOINs e transações

## 📝 Notas Importantes

- **Transações**: Supabase Data API não suporta transações explícitas. Para operações que precisam de atomicidade (compras, vendas), será necessário criar RPCs no Supabase ou fazer operações sequenciais com tratamento de erro manual.

- **JOINs**: Para JOINs complexos, estamos fazendo múltiplas queries e combinando no código. Isso pode ser otimizado criando RPCs no Supabase.

- **Views**: Views como `saldo_estoque` não podem ser consultadas diretamente via Data API. Será necessário criar RPCs ou fazer queries manuais nas tabelas base.

## 🎯 Próximos Passos

1. Criar repositories Supabase para módulos pendentes
2. Atualizar services e routes para passar `env`
3. Testar build
4. Criar RPCs no Supabase para queries complexas (opcional, para otimização)
5. Deploy e testes
