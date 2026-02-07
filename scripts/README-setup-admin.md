# Setup Inicial: Criar Empresa e Admin

## Passo a Passo

### 1. Criar usuário no Supabase Auth

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá para **Authentication** > **Users**
3. Clique em **Add User** > **Create new user**
4. Preencha:
   - **Email**: email do admin
   - **Password**: senha inicial
   - **Auto Confirm User**: ✅ marque esta opção
5. Clique em **Create user**

### 2. Executar script SQL

1. Vá para **SQL Editor** no Supabase Dashboard
2. Abra o arquivo `scripts/setup-admin.sql`
3. **Edite as variáveis** no início do script:
   ```sql
   v_company_name TEXT := 'Nome da Empresa';    -- Nome da empresa
   v_admin_email TEXT := 'admin@empresa.com';   -- Mesmo email do passo 1
   v_admin_name TEXT := 'Nome do Admin';        -- Nome do admin
   ```
4. Execute o script (Ctrl+Enter ou botão Run)
5. Verifique o resultado na tabela exibida

### 3. Testar login

1. Acesse o sistema em produção
2. Faça login com o email e senha criados
3. Verifique se o menu "Usuários" aparece (apenas admins veem)

## Criar Segunda Empresa

Para criar uma segunda empresa com seu admin, repita os passos acima alterando:
- Nome da empresa
- Email do admin
- Nome do admin

## Troubleshooting

**Erro "Usuário não encontrado no Auth"**
- Verifique se criou o usuário no Supabase Auth primeiro
- Confira se o email está correto (sem espaços, minúsculo)

**Admin não vê menu Usuários**
- Verifique se `can_create_users = true` na tabela profiles
- Execute a query de verificação no final do script
