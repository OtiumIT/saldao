# Script de Regeneração de Usuário

Este script regenera um usuário no Supabase Auth e atualiza todas as referências em todas as tabelas do banco de dados.

## O que o script faz:

1. **Busca o profile** pelo email fornecido
2. **Verifica/Cria usuário no Supabase Auth**:
   - Se o usuário não existe no Auth, cria um novo com senha temporária
   - Se o usuário existe mas o email está diferente, atualiza o email
3. **Atualiza o profile** com o novo `user_id` (se mudou)
4. **Atualiza todas as tabelas** que referenciam o `user_id` antigo:
   - `clients` (created_by)
   - `projects` (created_by)
   - `suppliers` (created_by)
   - `labor` (created_by)
   - `estimates` (created_by, approved_by)
   - `financial_entries` (created_by, approved_by, partner_responsible_id)
   - `financial_exits` (created_by, approved_by)
   - `approval_history` (created_by)

## Como usar:

### Opção 1: Usando tsx (recomendado)

```bash
cd api
npx tsx ../scripts/regenerate-user.ts <email>
```

### Opção 2: Compilando e executando

```bash
cd api
npx tsc ../scripts/regenerate-user.ts --outDir ../scripts/dist --module esnext --target es2020 --moduleResolution node
node ../scripts/dist/regenerate-user.js <email>
```

## Exemplo:

```bash
cd api
npx tsx ../scripts/regenerate-user.ts jose.neto.fc@gmail.com
```

## Requisitos:

- Node.js instalado
- Variáveis de ambiente configuradas no `api/.env`:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

## Saída esperada:

```
═══════════════════════════════════════════════════════
🔄 REGENERANDO USUÁRIO
═══════════════════════════════════════════════════════
Email: jose.neto.fc@gmail.com

📋 [1] Buscando profile pelo email...
✅ Profile encontrado:
   ID: 1a1ae948-2c9e-4335-a69e-e10c2b5da601
   User ID (atual): 1a1ae948-2c9e-4335-a69e-e10c2b5da601
   Nome: Admin Designer 4 You
   Email: jose.neto.fc@gmail.com
   Role: admin
   Company ID: 271c39ba-df3b-4089-9a5e-e8d6361465a7

🔍 [2] Verificando se usuário existe no Supabase Auth...
⚠️ Usuário não encontrado no Auth. Criando novo usuário...
✅ Usuário criado no Auth com ID: [novo-uuid]

🔄 [3] Atualizando profile com novo user_id...
✅ Profile atualizado

🔄 [4] Atualizando referências em todas as tabelas...
   User ID antigo: 1a1ae948-2c9e-4335-a69e-e10c2b5da601
   User ID novo: [novo-uuid]

   📝 clients.created_by: X registro(s) encontrado(s)
   ✅ clients.created_by: X registro(s) atualizado(s)
   ...

✅ Total de registros atualizados: X

═══════════════════════════════════════════════════════
✅ PROCESSO CONCLUÍDO COM SUCESSO!
═══════════════════════════════════════════════════════
Email: jose.neto.fc@gmail.com
User ID: [novo-uuid]

📧 O usuário pode agora solicitar recuperação de senha.
═══════════════════════════════════════════════════════
```

## Notas importantes:

- ⚠️ **Backup**: Sempre faça backup do banco antes de executar este script
- ⚠️ **Teste**: Teste primeiro em ambiente de desenvolvimento
- ✅ **Seguro**: O script apenas atualiza referências, não deleta dados
- ✅ **Idempotente**: Pode ser executado múltiplas vezes sem problemas
