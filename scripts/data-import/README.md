# Scripts de Importação de Dados

## 📋 Visão Geral

- **Gestão Atual (recomendado):** importação das planilhas da pasta `Novo Sistema/GestaoAtual/` (fornecedores, produtos, estoque). Os dados são lidos por completo, processados com um modelo definido e depois inseridos no banco.
- **Finanças Empresarial:** importação do Excel "Finanças Empresarial.xlsx" para o Supabase (fluxo de caixa, empresas, clientes).

---

## 🗂️ Importação Gestão Atual (fornecedores, produtos, estoque)

As planilhas não são grandes; **todo o conteúdo é lido** e depois processado com regras claras antes de gerar o modelo de insert.

### Passo a passo

1. **Gerar o dump (ler todas as planilhas para JSON)**  
   Na raiz do projeto:
   ```bash
   node scripts/data-import/dump-gestao-atual.js
   ```
   Saída: `scripts/data-import/gestao-atual-dump.json`.

2. **Revisar o modelo de insert (opcional)**  
   Regras de mapeamento: `scripts/data-import/MODELO_INSERT_GESTAO_ATUAL.md`.

3. **Testar sem gravar (dry-run)**  
   ```bash
   node scripts/data-import/import-gestao-atual.js --dry-run
   ```
   Mostra quantos fornecedores e produtos seriam criados e uma amostra.

4. **Importar no banco**  
   Configure `DATABASE_URL` no `.env` na raiz e execute:
   ```bash
   node scripts/data-import/import-gestao-atual.js
   ```

### O que é importado

- **Fornecedores:** um por nome de aba normalizado (ex.: "COMPRA HIPER 2026" → HIPER).
- **Produtos:** insumos (COMPRAS FABRICAÇAO) e revenda (CONTROLE REVENDA e REVENDA COMPRA), com deduplicação por (fornecedor, descrição).
- **Movimentações de estoque:** entradas iniciais para itens do CONTROLE REVENDA que têm coluna ESTOQUE > 0.

---

## 🚀 Como Usar

### 1. Instalar Dependências

```bash
cd scripts/data-import
npm install xlsx @supabase/supabase-js dotenv
```

Ou na raiz do projeto:

```bash
npm install xlsx @supabase/supabase-js dotenv --save-dev
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto ou configure:

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
```

### 3. Colocar Arquivo Excel

Coloque o arquivo `Finanças Empresarial.xlsx` na raiz do projeto.

### 4. Executar Importação

```bash
# Script completo (recomendado)
node scripts/data-import/import-excel-complete.js

# Ou usando npm
npm run import --prefix scripts/data-import
```

## 📊 O que o Script Faz

1. **Lê a aba "Fluxo de Caixa" do Excel** (aba principal com dados transacionais)
2. **Identifica empresas** pelo campo "Comprador" (JJ NEXUS → JJ, DESING 4 YOU → Designer 4 You)
3. **Cria empresas** automaticamente se não existirem
4. **Cria clientes** baseado na coluna "Descricao" (nome do cliente/projeto)
5. **Cria projetos** para cada cliente (1 projeto = 1 cliente)
6. **Cria fornecedores** baseado na coluna "Fornecedor" (apenas para saídas)
7. **Importa entradas financeiras** (Tipo = "ENTRADA")
8. **Importa saídas financeiras** (Tipo = "SAIDA")
9. **Parseia datas** no formato DD/MM/YY (ex: "07/06/25" → 2025-06-07)
10. **Parseia valores** no formato "$1,725.00" → 1725.00 (ou NULL se pendente)
11. **Mapeia formas de pagamento** (Zelle → 'zelle', Cartao → 'card', etc.)
12. **Calcula semana do ano** (usa coluna "Semana" ou calcula da data)
13. **Aprova automaticamente** dados importados (status = 'approved')
14. **Configura aprovação cruzada** (approved_by = admin da outra empresa)

## 📝 Estrutura Esperada do Excel

### Aba Principal: "Fluxo de Caixa"

O script processa apenas esta aba, que contém os dados transacionais.

### Colunas Esperadas:

| Coluna | Tipo | Obrigatório | Exemplo |
|--------|------|-------------|---------|
| **Data** | String (DD/MM/YY) | ✅ Sim | "07/06/25", "15/11/23" |
| **Semana** | Número | ✅ Sim | 23, 46 |
| **Mes** | Número | ✅ Sim | 6, 11 |
| **Tipo** | String | ✅ Sim | "ENTRADA" ou "SAIDA" |
| **Descricao** | String | ✅ Sim | "Sammy", "Marion" (nome do cliente) |
| **Valor** | String ($) | ⚠️ Pode ser vazio | "$1,725.00" ou "$-" (pendente) |
| **Pagamento** | String | ❌ Opcional | "Zelle", "Cartao", "Cheque", "Dinheiro" |
| **Comprador** | String | ⚠️ Quase sempre | "JJ NEXUS" ou "DESING 4 YOU" |
| **Help** | String | ❌ Opcional | Observações/notas |
| **Fornecedor** | String | ❌ Opcional | Nome do fornecedor (apenas saídas) |
| **Descrição** | String | ❌ Opcional | Descrição detalhada (diferente de "Descricao") |

### Identificação de Empresa:

- **"JJ NEXUS"** → Empresa: **JJ**
- **"DESING 4 YOU"** → Empresa: **Designer 4 You** (nota: erro de digitação no Excel é tratado)

## ⚠️ Importante

- O script usa `SUPABASE_SERVICE_ROLE_KEY` para bypass de RLS
- **Dados importados são automaticamente aprovados** (status = 'approved')
- **Aprovação cruzada configurada**: Entradas/Saídas da JJ são aprovadas por Designer 4 You e vice-versa
- Empresas são criadas automaticamente se não existirem (JJ, Designer 4 You)
- Clientes são criados a partir da coluna "Descricao" (nome do cliente)
- Projetos são criados (1 projeto = 1 cliente, nome do projeto = nome do cliente)
- Fornecedores são criados automaticamente a partir da coluna "Fornecedor"
- **Valores NULL são mantidos** (representam pendências)
- **Datas inválidas** usam data atual como fallback
- **Cache interno** para evitar duplicatas (empresas, clientes, projetos, fornecedores)

## 🔍 Verificar Importação

```sql
-- Ver empresas criadas
SELECT * FROM companies;

-- Ver clientes importados
SELECT * FROM clients ORDER BY created_at DESC;

-- Ver entradas importadas
SELECT * FROM financial_entries ORDER BY entry_date DESC LIMIT 10;

-- Ver saídas importadas
SELECT * FROM financial_exits ORDER BY exit_date DESC LIMIT 10;
```

## 🛠️ Troubleshooting

### Erro: "Cannot find module 'xlsx'"
```bash
npm install xlsx
```

### Erro: "SUPABASE_URL is not defined"
Verifique se o arquivo `.env` está configurado corretamente.

### Erro: "permission denied"
Verifique se está usando `SUPABASE_SERVICE_ROLE_KEY` (não anon key).

### Dados não aparecem
- Verifique se as migrations foram executadas (001 a 006)
- Verifique se as empresas foram criadas
- Verifique se há usuários admin nas empresas (necessário para created_by)
- Verifique os logs do script para erros específicos

### Erro: "Nenhum usuário encontrado para empresa"
- **Solução**: Crie pelo menos 1 usuário admin para cada empresa antes de importar
- Execute o script `scripts/create-initial-companies.sql` após criar os usuários

### Datas aparecem incorretas
- O script parseia datas no formato DD/MM/YY
- Se a data estiver em outro formato, será usada a data atual como fallback
- Verifique os logs para avisos sobre datas inválidas

### Valores aparecem como NULL
- Isso é esperado para registros pendentes (formato "$-" no Excel)
- O script mantém NULL para representar valores pendentes
