# Configuração do Gmail para Envio de Emails

## Passo 1: Habilitar Verificação em Duas Etapas

1. Acesse sua conta Google: https://myaccount.google.com/
2. Vá em **Segurança**
3. Ative a **Verificação em duas etapas** (se ainda não estiver ativada)

## Passo 2: Gerar Senha de App

1. Acesse: https://myaccount.google.com/apppasswords
2. Selecione **App** como "Mail"
3. Selecione **Dispositivo** como "Outro (nome personalizado)"
4. Digite: "Sistema Gestão Financeira"
5. Clique em **Gerar**
6. **COPIE A SENHA** (16 caracteres, sem espaços)

## Passo 3: Configurar no .env

Adicione as seguintes variáveis no arquivo `api/.env`:

```env
# Gmail Configuration
GMAIL_USER=seu-email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

**IMPORTANTE:**
- Use o email completo do Gmail (ex: `seuemail@gmail.com`)
- Use a senha de app gerada (16 caracteres, você pode remover os espaços)
- NUNCA use sua senha normal do Gmail

## Exemplo de .env completo:

```env
# Supabase Configuration
SUPABASE_URL=https://mbrjmfzluktffqhcsbvj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua_chave_aqui

# Server Configuration
PORT=3055
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:4055

# Gmail Configuration
GMAIL_USER=seu-email@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
FRONTEND_URL=http://localhost:4055
```

## Teste

Após configurar, reinicie o servidor da API e teste a funcionalidade "Esqueci minha senha".
