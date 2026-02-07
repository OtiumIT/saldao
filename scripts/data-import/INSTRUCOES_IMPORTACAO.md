# Instruções de Importação de Dados

## 📋 Pré-requisitos

1. ✅ Todas as migrations executadas (001 a 006)
2. ✅ Empresas criadas (JJ, Designer 4 You)
3. ✅ **PELO MENOS 1 USUÁRIO ADMIN criado para cada empresa**
4. ✅ Usuários associados às empresas (via `scripts/create-initial-companies.sql`)

## 🚀 Passo a Passo

### 1. Preparar Ambiente

```bash
# Instalar dependências
npm install --prefix scripts/data-import

# Ou na raiz do projeto
npm install xlsx @supabase/supabase-js dotenv
```

### 2. Configurar .env

Crie/edite o arquivo `.env` na **raiz do projeto**:

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

⚠️ **IMPORTANTE**: Use `SUPABASE_SERVICE_ROLE_KEY` (não a anon key)

### 3. Verificar Arquivo Excel

Certifique-se de que o arquivo `Finanças Empresarial.xlsx` está na **raiz do projeto**.

### 4. Verificar Usuários Admin

Antes de importar, verifique se há usuários admin em cada empresa:

```sql
SELECT 
  c.name as empresa,
  p.email,
  p.name as usuario,
  p.can_create_users
FROM companies c
LEFT JOIN profiles p ON p.company_id = c.id
WHERE p.can_create_users = true
ORDER BY c.name;
```

Se não houver usuários admin, crie-os primeiro (veja `CONFIGURACAO_COMPLETA.md`).

### 5. Executar Importação

```bash
# Opção 1: Direto
node scripts/data-import/import-excel-complete.js

# Opção 2: Via npm
npm run import --prefix scripts/data-import
```

### 6. Acompanhar Progresso

O script mostrará:
- ✅ Empresas criadas
- ✅ Progresso de importação (a cada 10 registros)
- ⚠️ Avisos sobre linhas puladas
- ❌ Erros encontrados

### 7. Verificar Resultados

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

## ⚠️ Problemas Comuns

### Erro: "Nenhum usuário encontrado para empresa"

**Causa**: Não há usuários admin nas empresas.

**Solução**:
1. Crie usuários via Supabase Auth Dashboard
2. Execute `scripts/create-initial-companies.sql` (atualizando os emails)
3. Verifique com a query acima

### Erro: "permission denied"

**Causa**: Usando anon key ao invés de service_role_key.

**Solução**: Use `SUPABASE_SERVICE_ROLE_KEY` no `.env`.

### Datas aparecem como data atual

**Causa**: Formato de data no Excel não foi reconhecido.

**Solução**: 
- O script usa data atual como fallback
- Verifique os logs para ver quais linhas tiveram problema
- Datas no formato DD/MM/YY devem funcionar corretamente

### Valores aparecem como NULL

**Causa**: Isso é esperado para registros pendentes.

**Solução**: 
- Valores NULL representam pendências (formato "$-" no Excel)
- Isso é o comportamento correto

### Duplicatas criadas

**Causa**: Executou o script múltiplas vezes.

**Solução**:
- O script tem cache interno para evitar duplicatas
- Mas se executar múltiplas vezes, pode criar duplicatas
- Limpe os dados antes de reimportar se necessário

## 📊 Estatísticas Esperadas

Baseado na análise do Excel:

- **Empresas**: 2 (JJ, Designer 4 You)
- **Clientes**: ~30-40 únicos (depende dos nomes em "Descricao")
- **Projetos**: 1 por cliente
- **Fornecedores**: ~20 únicos
- **Entradas**: ~78 registros
- **Saídas**: ~456 registros
- **Período**: 07/01/2025 a 12/12/2025

## ✅ Checklist Pós-Importação

- [ ] 2 empresas criadas (JJ, Designer 4 You)
- [ ] Clientes criados (um para cada nome único em "Descricao")
- [ ] Projetos criados (1 por cliente)
- [ ] Fornecedores criados (apenas os que aparecem em saídas)
- [ ] ~78 entradas financeiras importadas
- [ ] ~456 saídas financeiras importadas
- [ ] Todas com status = 'approved'
- [ ] Aprovação cruzada configurada (approved_by da outra empresa)
- [ ] Valores NULL mantidos para pendências
- [ ] Datas parseadas corretamente

## 🔄 Reimportação

Se precisar reimportar:

1. **Opção 1: Limpar dados importados** (cuidado!)
   ```sql
   -- CUIDADO: Isso apaga TODOS os dados!
   DELETE FROM financial_exits;
   DELETE FROM financial_entries;
   DELETE FROM projects;
   DELETE FROM clients;
   DELETE FROM suppliers;
   -- NÃO apagar companies (são necessárias)
   ```

2. **Opção 2: Importar apenas novos dados**
   - O script tem cache interno
   - Mas pode criar duplicatas se os dados já existirem
   - Melhor: limpar e reimportar tudo

## 📝 Logs e Debug

O script mostra:
- ✅ Sucessos (empresas criadas, progresso)
- ⚠️ Avisos (linhas puladas, dados inválidos)
- ❌ Erros (falhas na criação)

Para mais detalhes, verifique:
- Console output do script
- Logs do Supabase (se disponível)
- Tabelas do banco de dados
