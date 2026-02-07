# Script SQL de Importação de Dados

## 📄 Arquivo Gerado

**`import-data.sql`** - Arquivo SQL completo com todos os INSERTs para importação direta no Supabase.

## 📊 Conteúdo do Script

O arquivo SQL contém:

1. **Criação de Empresas** (2 empresas: JJ, Designer 4 You)
2. **Criação de Clientes** (~69 clientes únicos)
3. **Criação de Projetos** (1 projeto por cliente)
4. **Criação de Fornecedores** (~29 fornecedores únicos)
5. **Importação de Entradas Financeiras** (77 registros)
6. **Importação de Saídas Financeiras** (445 registros)

## 🚀 Como Usar

### Opção 1: Via Supabase Dashboard (Recomendado)

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Abra o arquivo `scripts/data-import/import-data.sql`
5. **IMPORTANTE**: Antes de executar, certifique-se de que:
   - ✅ Todas as migrations foram executadas (001 a 006)
   - ✅ Existem usuários admin nas empresas (JJ e Designer 4 You)
   - ✅ Os usuários estão associados às empresas (via `scripts/create-initial-companies.sql`)

6. Execute o script completo (ou seção por seção)

### Opção 2: Via psql

```bash
psql -h db.xxxxx.supabase.co -U postgres -d postgres -f scripts/data-import/import-data.sql
```

## ⚠️ IMPORTANTE: Pré-requisitos

### 1. Executar Migrations

Certifique-se de que todas as migrations foram executadas:

- `001_initial_schema.sql`
- `002_initial_users.sql`
- `003_companies_and_isolation.sql`
- `004_password_reset.sql`
- `005_user_management.sql`
- `006_approval_validation.sql`

### 2. Criar Usuários Admin

Antes de executar o script SQL, você precisa ter **pelo menos 1 usuário admin** em cada empresa:

1. Crie usuários via Supabase Auth Dashboard:
   - Um para JJ
   - Um para Designer 4 You

2. Execute o script `scripts/create-initial-companies.sql` para associar usuários às empresas

3. Verifique que os usuários têm `can_create_users = true`:
   ```sql
   SELECT id, email, name, company_id, can_create_users 
   FROM profiles 
   WHERE can_create_users = true;
   ```

### 3. Como o Script Funciona

O script SQL usa **subqueries** para buscar IDs automaticamente:

- Busca empresas pelo nome
- Busca usuários admin automaticamente (primeiro com `can_create_users = true`)
- Busca clientes, projetos e fornecedores automaticamente
- Configura aprovação cruzada automaticamente (admin da outra empresa)

**Vantagem**: Não precisa substituir UUIDs manualmente!

**Requisito**: Deve haver pelo menos 1 usuário admin em cada empresa.

## 📋 Estrutura do Script

```sql
-- 1. CRIAR EMPRESAS
-- Cria JJ e Designer 4 You (com ON CONFLICT para não duplicar)

-- 2. OBTER IDs (instruções)
-- Instruções para verificar IDs (opcional, o script usa subqueries)

-- 3. OBTER ID DO USUÁRIO ADMIN (instruções)
-- Instruções para verificar IDs (opcional, o script usa subqueries)

-- 4. CRIAR CLIENTES
-- Cria todos os clientes únicos encontrados no Excel

-- 5. CRIAR PROJETOS
-- Cria 1 projeto por cliente (nome do projeto = nome do cliente)

-- 6. CRIAR FORNECEDORES
-- Cria todos os fornecedores únicos encontrados no Excel

-- 7. OBTER ID DO ADMIN DA OUTRA EMPRESA (instruções)
-- Instruções para aprovação cruzada (o script faz automaticamente)

-- 8. IMPORTAR ENTRADAS FINANCEIRAS
-- 77 registros de entradas

-- 9. IMPORTAR SAÍDAS FINANCEIRAS
-- 445 registros de saídas
```

## ✅ Verificar Importação

Após executar o script, verifique os dados:

```sql
-- Verificar empresas
SELECT * FROM companies;

-- Verificar clientes criados
SELECT 
  c.name as cliente,
  co.name as empresa,
  COUNT(DISTINCT p.id) as projetos
FROM clients c
JOIN companies co ON co.id = c.company_id
LEFT JOIN projects p ON p.client_id = c.id
GROUP BY c.id, c.name, co.name
ORDER BY co.name, c.name;

-- Verificar entradas importadas
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN value IS NULL THEN 1 END) as pendentes,
  COUNT(CASE WHEN status = 'approved' THEN 1 END) as aprovadas,
  MIN(entry_date) as primeira_data,
  MAX(entry_date) as ultima_data
FROM financial_entries;

-- Verificar saídas importadas
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN value IS NULL THEN 1 END) as pendentes,
  COUNT(CASE WHEN status = 'approved' THEN 1 END) as aprovadas,
  MIN(exit_date) as primeira_data,
  MAX(exit_date) as ultima_data
FROM financial_exits;

-- Verificar aprovação cruzada
SELECT 
  c.name as empresa_criadora,
  COUNT(*) as total,
  COUNT(CASE WHEN fe.approved_by IS NOT NULL THEN 1 END) as aprovadas
FROM financial_entries fe
JOIN companies c ON c.id = fe.company_id
GROUP BY c.id, c.name;
```

## 🔄 Regerar o Script

Se precisar regerar o script SQL (após alterar o Excel):

```bash
cd scripts/data-import
node generate-sql-inserts.js
```

Ou:

```bash
npm run generate-sql --prefix scripts/data-import
```

## ⚠️ Problemas Comuns

### Erro: "null value in column 'created_by'"

**Causa**: Não há usuários admin nas empresas.

**Solução**:
1. Crie usuários via Supabase Auth Dashboard
2. Execute `scripts/create-initial-companies.sql`
3. Verifique: `SELECT * FROM profiles WHERE can_create_users = true;`

### Erro: "violates foreign key constraint"

**Causa**: Migrations não foram executadas ou ordem incorreta.

**Solução**: Execute todas as migrations na ordem (001 a 006).

### Duplicatas criadas

**Causa**: Executou o script múltiplas vezes.

**Solução**: 
- O script tem `WHERE NOT EXISTS` para evitar duplicatas
- Mas se executar múltiplas vezes, pode criar duplicatas em alguns casos
- Limpe os dados antes de reimportar se necessário

### Aprovação cruzada não funcionou

**Causa**: Não há usuários admin na outra empresa.

**Solução**: Certifique-se de que há pelo menos 1 usuário admin em cada empresa.

## 📝 Notas

- O script usa `gen_random_uuid()` para gerar IDs automaticamente
- O script usa `NOW()` para timestamps
- O script usa `ON CONFLICT` para empresas (evita duplicatas)
- O script usa `WHERE NOT EXISTS` para clientes, projetos e fornecedores
- O script configura `status = 'approved'` para todos os dados (históricos)
- O script configura aprovação cruzada automaticamente
- Valores NULL são mantidos (representam pendências)

## ✅ Checklist

Antes de executar:
- [ ] Migrations executadas (001 a 006)
- [ ] Usuários admin criados (1 para JJ, 1 para Designer 4 You)
- [ ] Usuários associados às empresas
- [ ] `can_create_users = true` nos admins

Após executar:
- [ ] 2 empresas criadas
- [ ] ~69 clientes criados
- [ ] ~69 projetos criados
- [ ] ~29 fornecedores criados
- [ ] 77 entradas importadas
- [ ] 445 saídas importadas
- [ ] Todas com status = 'approved'
- [ ] Aprovação cruzada configurada
