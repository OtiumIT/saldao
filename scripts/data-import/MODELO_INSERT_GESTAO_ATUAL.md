# Modelo de Insert – Gestão Atual (processado a partir da leitura completa das planilhas)

Este documento define as regras de mapeamento **após leitura total** dos Excel e interpretação dos dados. O script de importação aplica este modelo ao dump JSON (`gestao-atual-dump.json`).

---

## 1. Estrutura real dos arquivos (resumo)

### COMPRAS FABRICAÇAO 2026.xlsx
- **Linha 0:** Título ("COMPRA").
- **Linha 1:** Período (ex.: "JANEIRO", "DIA 15/01").
- **Linha 2:** Cabeçalho fixo: `COD` (col 0), `QUANTIDADE` (col 1), `DESCRIÇÃO` (col 2), `VALOR UNIT.` (col 3), `VALOR TOTAL` (col 4).
- **Linhas 3 em diante:** Dados. Cada **linha de produto** tem: quantidade (col 1), descrição (col 2), valor unit. (col 3), valor total (col 4). Linhas que são **observação** têm texto longo na col 0 (ex.: "COMPRA DIA 09/01...") e não são produto.
- **Cada aba = um fornecedor:** ALBRAS, OPPEANDO, CHAPAS, INDART ( PUXADORES), GABRIEL FURLAN ( CORREDIÇAS), CASA DAS FITAS.

### CONTROLE REVENDA E ESTOQUE 2026.xlsx
- **Linha 0:** Título.
- **Linha 1:** Data (número Excel) / "LUCRO MENSAL".
- **Linha 2:** Cabeçalho: col 1=QUANTIDADE, 2=DESCRIÇÃO, 3=VALOR UNIT., 4=VALOR TOTAL, 5=PREÇO REVENDA, 6=LUCRO TOTAL, 7=VENDIDO, 8=LUCRO UNIT, 9=ESTOQUE. (Col 0 vazia.)
- **Linhas 3 em diante:** Dados. Colunas: [1]=qtd, [2]=descrição, [3]=preço compra, [5]=preço revenda, [9]=estoque atual.
- **Ignorar:** linhas com descrição vazia; linhas de totais (valor total 0 e estoque 0).
- **Abas = fornecedores:** HIPER, PERNAMBUC, LIFE COLCHAO, TAPETE EVANDRO.

### REVENDA ( COMPRA) 2026.xlsx
- Vários **blocos** por aba: linha com cabeçalho ("COD", "QUANTIDADE", "DESCRIÇÃO", "VALOR UNIT.", "VALOR TOTAL", "PREÇO REVENDA", "LUCRO") e em seguida linhas de dados até próxima linha de cabeçalho ou observação.
- **Linha de produto:** col 1=quantidade, col 2=descrição, col 3=valor unit., col 5=preço revenda. Descrição e valor unit. preenchidos.
- **Ignorar:** linhas onde descrição está vazia; linhas que são observação (texto em col 0 ou 2 começando com "COMPRA DIA", "PAGAMENTO", "PEDIDO", "ENTREGA", "porto velho", "COMPRAS PORTO", etc.).
- **Abas:** LIFE COLCHAO, COMPRA HIPER 2026, porto velho.

---

## 2. Fornecedores

- **Fonte:** Nome de cada aba dos três arquivos, normalizado.
- **Normalização:** Remover prefixo "COMPRA "; remover sufixo " 2026"; trim. Ex.: "COMPRA HIPER 2026" → "HIPER".
- **Unicidade:** Um registro por nome normalizado (comparação case-insensitive).
- **Campos:** nome (obrigatório); fone, email, contato, observacoes = null.

---

## 3. Produtos

### 3.1 Insumos (arquivo COMPRAS FABRICAÇAO)
- **Condição de linha válida:** `rows[i][2]` (DESCRIÇÃO) é string não vazia; linha não é observação: `rows[i][0]` não começa com "COMPRA DIA", "PAGAMENTO", etc.
- **Mapeamento:**  
  - codigo: `rows[i][0]` se não vazio e não parecer cabeçalho, senão `INS-{fornecedor_slug}-{seq}`.  
  - descricao: `rows[i][2]`.  
  - tipo: `insumos`.  
  - preco_compra: `rows[i][3]` (número).  
  - preco_venda: 0.  
  - quantidade_inicial: `rows[i][1]` (número) para eventual movimentação (insumos não usam estoque inicial no CONTROLE; opcional).
- **Fornecedor:** nome da aba normalizado → fornecedor_principal_id.

### 3.2 Revenda (arquivo CONTROLE REVENDA E ESTOQUE)
- **Condição de linha válida:** índice ≥ 3; `rows[i][2]` (DESCRIÇÃO) não vazio; não é linha de totais (ex.: `rows[i][4] === 0 && rows[i][9] === 0`).
- **Mapeamento:**  
  - codigo: `REV-{fornecedor_slug}-{seq}` (seq por aba).  
  - descricao: `rows[i][2]`.  
  - tipo: `revenda`.  
  - preco_compra: `rows[i][3]`.  
  - preco_venda: `rows[i][5]`.  
  - quantidade_inicial (para movimentação): `rows[i][9]` (ESTOQUE) se > 0.
- **Fornecedor:** nome da aba normalizado.

### 3.3 Revenda (arquivo REVENDA ( COMPRA))
- **Detecção de bloco:** linha onde `rows[i][0] === "COD"` ou (rows[i][1] === "QUANTIDADE" e rows[i][2] === "DESCRIÇÃO") → cabeçalho; próximas linhas são dados até nova linha de cabeçalho ou até linha cujo texto (col 0 ou 2) pareça observação.
- **Linha de produto:** `rows[i][2]` não vazio; `rows[i][3]` numérico; descrição não é observação (não começa com COMPRA DIA, PAGAMENTO, PEDIDO, ENTREGA, "porto velho", "COMPRAS PORTO", "PAGAMENTO DIA", "CARTAO", "SANTANDER", "PIX", "boleto", etc.).
- **Mapeamento:**  
  - codigo: `REV2-{fornecedor_slug}-{seq}`.  
  - descricao: `rows[i][2]`.  
  - tipo: `revenda`.  
  - preco_compra: `rows[i][3]`.  
  - preco_venda: `rows[i][5]` (pode ser null).
- **Fornecedor:** nome da aba normalizado ("COMPRA HIPER 2026" → "HIPER").

### 3.4 Deduplicação e codigo único
- **Chave de deduplicação:** (fornecedor_normalizado, descricao_normalizada). descricao_normalizada = trim, lowercase.
- Manter primeiro registro de cada chave; para os seguintes, gerar codigo único (ex.: REV-HIPER-1, REV-HIPER-2, …) sem repetir.
- Na inserção no banco: codigo deve ser UNIQUE; em conflito, ignorar ou usar codigo com sufixo -2, -3.

---

## 4. Movimentações de estoque (inicial)

- **Fonte:** Apenas produtos vindos do **CONTROLE REVENDA E ESTOQUE** com `estoque > 0` (col 9).
- **Registro:** Uma movimentação por produto: tipo `entrada`, data = data da importação (ou CURRENT_DATE), quantidade = estoque da planilha, observacao = "Importação Gestão Atual - estoque inicial".

---

## 5. Ordem de execução no script

1. Carregar `gestao-atual-dump.json`.
2. Coletar todos os fornecedores (abas normalizadas) e inserir em `fornecedores` (evitar duplicata por nome).
3. Coletar todos os produtos aplicando as regras acima (insumos + revenda dos dois arquivos); deduplicar por (fornecedor, descricao).
4. Inserir produtos em `produtos` (codigo único; em conflito ajustar codigo).
5. Para produtos de CONTROLE REVENDA com quantidade_inicial > 0, inserir em `movimentacoes_estoque`.
