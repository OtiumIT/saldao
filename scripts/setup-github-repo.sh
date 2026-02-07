#!/bin/bash

# Script para criar repositório GitHub e fazer push inicial
# Uso: ./setup-github-repo.sh

set -e

echo "🚀 Configuração do Repositório GitHub"
echo "======================================"
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se git está instalado
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git não está instalado${NC}"
    exit 1
fi

# Verificar se gh CLI está instalado (opcional, mas recomendado)
if ! command -v gh &> /dev/null; then
    echo -e "${YELLOW}⚠️  GitHub CLI (gh) não está instalado${NC}"
    echo "Você pode instalar em: https://cli.github.com/"
    echo "Ou criar o repositório manualmente no GitHub"
    echo ""
    USE_GH=false
else
    USE_GH=true
    echo -e "${GREEN}✅ GitHub CLI encontrado${NC}"
fi

# Perguntar informações
echo "Por favor, forneça as seguintes informações:"
echo ""
read -p "Nome do repositório (ex: gestao-dfy): " REPO_NAME
read -p "Descrição do repositório: " REPO_DESC
read -p "Username do GitHub do cliente: " CLIENT_USERNAME
read -p "Repositório será privado? (s/n): " IS_PRIVATE

if [[ "$IS_PRIVATE" == "s" || "$IS_PRIVATE" == "S" ]]; then
    PRIVATE_FLAG="--private"
    PRIVATE_TEXT="privado"
else
    PRIVATE_FLAG="--public"
    PRIVATE_TEXT="público"
fi

echo ""
echo -e "${YELLOW}📋 Resumo:${NC}"
echo "Nome: $REPO_NAME"
echo "Descrição: $REPO_DESC"
echo "Cliente: $CLIENT_USERNAME"
echo "Tipo: $PRIVATE_TEXT"
echo ""

read -p "Continuar? (s/n): " CONFIRM

if [[ "$CONFIRM" != "s" && "$CONFIRM" != "S" ]]; then
    echo "Cancelado."
    exit 0
fi

# Verificar se já é um repositório git
if [ -d ".git" ]; then
    echo -e "${GREEN}✅ Repositório Git já inicializado${NC}"
else
    echo "Inicializando repositório Git..."
    git init
    echo -e "${GREEN}✅ Repositório Git inicializado${NC}"
fi

# Verificar se há commits
if git rev-parse --verify HEAD >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Já existem commits${NC}"
else
    echo "Criando commit inicial..."
    git add .
    git commit -m "Initial commit - Sistema de Gestão Financeira"
    echo -e "${GREEN}✅ Commit inicial criado${NC}"
fi

# Criar repositório no GitHub
if [ "$USE_GH" = true ]; then
    echo ""
    echo "Criando repositório no GitHub..."
    gh repo create "$REPO_NAME" \
        --description "$REPO_DESC" \
        $PRIVATE_FLAG \
        --source=. \
        --remote=origin \
        --push
    
    echo -e "${GREEN}✅ Repositório criado e código enviado!${NC}"
    
    # Adicionar cliente como colaborador
    echo ""
    read -p "Adicionar $CLIENT_USERNAME como colaborador? (s/n): " ADD_COLLAB
    
    if [[ "$ADD_COLLAB" == "s" || "$ADD_COLLAB" == "S" ]]; then
        echo "Adicionando colaborador..."
        gh repo add-collaborator "$REPO_NAME" "$CLIENT_USERNAME"
        echo -e "${GREEN}✅ Colaborador adicionado!${NC}"
    fi
else
    echo ""
    echo -e "${YELLOW}📝 Instruções manuais:${NC}"
    echo ""
    echo "1. Acesse: https://github.com/new"
    echo "2. Nome do repositório: $REPO_NAME"
    echo "3. Descrição: $REPO_DESC"
    echo "4. Tipo: $PRIVATE_TEXT"
    echo "5. NÃO inicialize com README, .gitignore ou license"
    echo "6. Clique em 'Create repository'"
    echo ""
    echo "Depois execute:"
    echo "  git remote add origin https://github.com/SEU_USERNAME/$REPO_NAME.git"
    echo "  git branch -M main"
    echo "  git push -u origin main"
    echo ""
    echo "Para adicionar o cliente como colaborador:"
    echo "  Settings > Collaborators > Add people > $CLIENT_USERNAME"
fi

echo ""
echo -e "${GREEN}✅ Configuração concluída!${NC}"
echo ""
echo "Próximos passos:"
echo "1. Verificar se o repositório foi criado corretamente"
echo "2. Configurar GitHub Actions (se necessário)"
echo "3. Configurar secrets no GitHub (se necessário"
echo ""
