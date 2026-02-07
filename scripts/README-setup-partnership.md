# Script de Configuração de Parceiria

Este script cria a parceiria "Designer 4 You & JJ" e configura todos os registros existentes para usar essa parceiria.

## 📋 O que o script faz:

1. **Busca ou cria as empresas:**
   - Designer 4 You
   - JJ

2. **Cria a parceiria:**
   - Nome: "Designer 4 You & JJ"
   - Descrição: "Parceiria entre Designer 4 You e JJ"
   - Distribuição: 50% para cada empresa

3. **Atualiza TODOS os registros existentes:**
   - Clients (clientes)
   - Suppliers (fornecedores)
   - Labor (mão de obra)
   - Projects (projetos)

   Todos passam a ter:
   - `entity_type = 'partnership'`
   - `partnership_id` = ID da parceiria criada

## 🚀 Como executar:

### Opção 1: Via Supabase Dashboard (Recomendado)

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Abra o arquivo `scripts/setup-partnership.sql`
5. Cole todo o conteúdo e execute

### Opção 2: Via psql

```bash
psql -h [seu-host] -U postgres -d postgres -f scripts/setup-partnership.sql
```

### Opção 3: Via Supabase CLI

```bash
supabase db execute -f scripts/setup-partnership.sql
```

## ⚠️ Importante:

- **Execute APENAS após aplicar a migration `008_partnerships.sql`**
- O script é **idempotente**: pode ser executado múltiplas vezes sem problemas
- Se as empresas já existirem, o script as reutiliza
- Se a parceiria já existir, o script pode criar uma duplicada (verifique antes)

## 📊 Verificação:

Após executar, o script mostra:
- ID da parceiria criada
- IDs das empresas
- Quantidade de registros atualizados por tabela
- Validação das porcentagens (deve somar 100%)

## 🔍 Consultas úteis:

```sql
-- Ver a parceiria criada
SELECT * FROM partnerships WHERE name = 'Designer 4 You & JJ';

-- Ver empresas na parceiria
SELECT 
  p.name as partnership_name,
  c.name as company_name,
  pc.percentage
FROM partnerships p
JOIN partnership_companies pc ON pc.partnership_id = p.id
JOIN companies c ON c.id = pc.company_id
WHERE p.name = 'Designer 4 You & JJ';

-- Contar registros por tipo
SELECT 
  'Clients' as tabela,
  COUNT(*) FILTER (WHERE entity_type = 'partnership') as partnership,
  COUNT(*) FILTER (WHERE entity_type = 'own') as own
FROM clients
UNION ALL
SELECT 'Suppliers', 
  COUNT(*) FILTER (WHERE entity_type = 'partnership'),
  COUNT(*) FILTER (WHERE entity_type = 'own')
FROM suppliers
UNION ALL
SELECT 'Labor',
  COUNT(*) FILTER (WHERE entity_type = 'partnership'),
  COUNT(*) FILTER (WHERE entity_type = 'own')
FROM labor
UNION ALL
SELECT 'Projects',
  COUNT(*) FILTER (WHERE entity_type = 'partnership'),
  COUNT(*) FILTER (WHERE entity_type = 'own')
FROM projects;
```
