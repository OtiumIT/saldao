# Variáveis de Ambiente

Este arquivo documenta todas as variáveis de ambiente necessárias para executar a API.

## Configuração

1. Copie `.env.example` como `.env` na pasta `api/`
2. Preencha as variáveis conforme o modo de uso (com ou sem Supabase)
3. Nunca commite o arquivo `.env` no repositório

## Modo sem Supabase (autenticação fixa + PostgreSQL local)

Por hora, o sistema pode rodar **sem Supabase**: login com usuário e senha fixos e dados de clientes/fornecedores no PostgreSQL local.

```env
FIXED_AUTH=true
FIXED_AUTH_EMAIL=admin@saldao.local
FIXED_AUTH_PASSWORD=senha123
JWT_SECRET=saldao-jwt-secret-change-in-production

DATABASE_URL=postgresql://localhost:5432/saldao_jerusalem

PORT=3055
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

**Login na tela:** use `admin@saldao.local` / `senha123` (ou os valores definidos em `FIXED_AUTH_EMAIL` e `FIXED_AUTH_PASSWORD`).

Quando for usar Supabase para auth e usuários, desative definindo `FIXED_AUTH=false` (ou removendo a variável) e configure `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`.

## Variáveis Obrigatórias (modo com Supabase)

### Supabase
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### OpenAI
```env
OPENAI_API_KEY=sk-proj-your_openai_api_key_here
```

### Gmail (para envio de emails)
```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your_app_password_here
```

## Variáveis Opcionais

### Frontend
```env
FRONTEND_URL=http://localhost:4055
CORS_ORIGIN=http://localhost:4055
```

### Servidor
```env
PORT=3055
```

### Email
```env
CONTACT_EMAIL=noreply@yourdomain.com
SEND_CONFIRMATION_EMAIL=false
```

## Exemplo Completo

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# OpenAI Configuration
OPENAI_API_KEY=sk-proj-your_openai_api_key_here

# Gmail Configuration (for sending emails)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your_app_password_here
CONTACT_EMAIL=noreply@yourdomain.com

# Frontend Configuration
FRONTEND_URL=http://localhost:4055
CORS_ORIGIN=http://localhost:4055

# Server Configuration
PORT=3055

# Email Configuration
SEND_CONFIRMATION_EMAIL=false
```

## Segurança

⚠️ **IMPORTANTE**: 
- Nunca commite arquivos `.env` com valores reais
- Rotacione as chaves regularmente
- Use diferentes chaves para desenvolvimento e produção
- Em produção, use secret managers (AWS Secrets Manager, Azure Key Vault, etc.)
