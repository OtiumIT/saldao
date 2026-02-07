# Necessidades do sistema – Saldão de Móveis Jerusalém

Documento apenas com **necessidade sistêmica**. Decisões de tecnologia e stacks ficam para outro momento.

---

**Objetivo:** Sistema próprio que atenda bem a cliente, em substituição a ERPs genéricos que não se encaixam.

**Contexto:** Fábrica + revenda — parte dos móveis é **fabricada** (usa insumos), parte é **revenda** (comprada pronta). A empresa tem **dois endereços**: a **Fábrica** e a **Loja**. A **Loja** pode ser tratada como **cliente da Fábrica** (transferência a preço de transferência), permitindo **estudo de viabilidade** separado para cada unidade. Ver **LOJA_COMO_CLIENTE_FABRICA.md**.

**Requisitos da cliente:**
1. Gestão de estoque (revenda + insumos + fabricados)  
2. Gestão de vendas (com atualização do estoque)  
3. Avisos de necessidade de compras  
4. Lançamento de compras (revenda + insumos)  
5. **Produção:** cadastro de insumos por móvel, entrada de insumos, validação semanal, construção e entrada do fabricado no estoque  
6. Roteirização de entrega (2 veículos)  
7. Financeiro básico  
8. **Custos operacionais (suporte à precificação)** — Cadastro de custos fixos e variáveis (aluguel, água, luz, telefone, gasolina, manutenção de veículos, salários etc.) por período; rateio sobre os produtos para compor **custo total** e **preço mínimo sugerido**. Ver documento **CUSTOS_OPERACIONAIS_PRECIFICACAO.md**.

---

## Termos usados

- **BOM** (Bill of Materials) = **lista de materiais** ou **receita de produção**. É a “receita” do móvel: quanto de cada insumo entra em **1 unidade** do produto fabricado. Ex.: 1 guarda-roupa = 2,5 m² chapa + 20 puxadores + 4 corrediças + 0,5 L cola. Com o BOM o sistema sabe o que consumir ao registrar uma produção e consegue calcular “quantas unidades dá para fazer” com o estoque atual de insumos.

---

## Visão geral

Um único sistema que cubra **revenda + fábrica**: estoque (três tipos de item), compras (revenda e insumos), **produção** (insumos → móvel fabricado → estoque), vendas, entregas e financeiro.

```
ESTOQUE (Revenda | Insumos | Fabricados) → COMPRAS → PRODUÇÃO → VENDAS → ENTREGAS (2 veíc.) → FINANCEIRO
                                    ↑
                    AVISOS DE COMPRA (mín. insumos + mín. revenda)
```

---

## 1. Gestão de estoque

- **Cadastro de produtos:** Código, descrição, unidade (UN, M2, etc.), tipo: **Revenda**, **Insumos** (matéria prima) ou **Fabricados** (com receita/BOM no módulo Produção). Preço de compra, preço de venda (revenda/fabricados), estoque mínimo (e máximo opcional), fornecedor principal.
- **Saldo atual:** Atualizado por: venda (baixa), compra (entrada em revenda ou insumos), produção (baixa insumos + entrada fabricado), ajuste manual.
- **Movimentações:** Data, tipo (entrada/saída/ajuste/produção), produto, quantidade, origem (venda, compra, ordem produção, ajuste).
- **Relatório:** Listagem com saldo, estoque mínimo e indicador “abaixo do mínimo” (base para avisos).

---

## 2. Gestão de vendas (com atualização do estoque)

- **Cadastro do pedido:** Cliente (nome, fone, endereço de entrega), data, itens (produto + quantidade + preço). Status: rascunho → confirmado → entregue (ou cancelado).
- **Regra:** Ao confirmar o pedido, baixa automática no estoque. Se não houver saldo suficiente, o sistema pode avisar ou impedir confirmar (conforme regra de negócio).
- **Saída:** Lista de pedidos (filtro por data, status, cliente). Impressão/PDF do pedido para uso interno e entrega.
- **Pré-preenchimento por foto:** Ela tira uma foto do papel onde anotou a venda. O sistema lê a imagem, extrai cliente, data, itens, quantidades e preços e **pré-preenche toda a tela de cadastro de venda**. Ela só revisa e confirma (ou corrige o que saiu errado).

---

## 3. Avisos de necessidade de compras

- **Regra:** Para cada produto (revenda ou insumos) com saldo ≤ estoque mínimo, gerar um aviso. Insumos em falta impactam a produção (validação semanal no módulo Produção).
- **Tela “Avisos de compra”:** Lista: produto, saldo atual, estoque mínimo, quantidade sugerida. Botão “Gerar pedido de compra” (leva itens para o módulo de compras).
- **Opcional:** Aviso por produto “mais vendido” ou relatório semanal (e-mail/WhatsApp).

---

## 4. Lançamento de compras

- **Pedido de compra:** Fornecedor, data, itens (produto + quantidade + preço unitário), total. Status: em aberto → recebido (parcial/total).
- **Recebimento:** Ao marcar como “recebido”, entrada no estoque automática.
- **Origem dos itens:** Da tela de Avisos de compra (pré-preenchido) ou digitados manualmente.
- **Saída:** Lista de pedidos (por fornecedor, data, status). Histórico de entradas por produto.
- **Pré-preenchimento por foto:** Foto do pedido de compra em papel. O sistema lê a imagem, extrai fornecedor, data, itens, quantidades e preços e **preenche o pedido de compra**. Ela revisa, ajusta se precisar e salva.

---

## 5. Produção (fábrica): insumos, receita, validação e construção

### 5.1 Cadastro de insumos (matéria prima)

Produtos tipo Insumos no cadastro geral. Entrada via Compras (pedido → recebimento → estoque). Estoque mínimo por insumo para avisos e validação.

### 5.2 Cadastro de cada móvel fabricado (receita / BOM)

Produto tipo Fabricado: código, descrição, unidade, preço de venda. **Receita de produção (BOM):** por unidade do móvel, quanto de cada insumo é usado (ex.: 1 Guarda-roupa = 2,5 m² chapa + 20 puxadores + 4 corrediças + 0,5 L cola). Tela do fabricado com lista Insumo + quantidade por unidade.

### 5.3 Validação semanal dos insumos

Para cada móvel: para cada insumo da receita, estoque_atual ÷ quantidade_por_unidade = quantas unidades esse insumo sustenta. O **máximo que dá para construir** = menor valor (gargalo). Tela “Validação de insumos”: lista dos fabricados com “quantidade que dá para construir agora”, “insumo gargalo”, e opcional “quanto falta para mais X unidades”. Uso ao menos semanal.

### 5.4 Construção (ordem de produção) e entrada no estoque

Lançar produção: móvel fabricado + quantidade. Sistema calcula consumo (quantidade × BOM), dá baixa nos insumos e entrada no estoque do fabricado. Opcional: validar se há insumos suficientes antes de confirmar. Movimentações com origem “Ordem de produção nº X” para rastreio.

**Fluxo:** Entrada insumos (Compras) → Cadastro móvel + BOM → Validação semanal → Construção (baixa insumos + entrada fabricado) → Vendas consomem estoque (revenda + fabricados).

---

## 6. Roteirização de entrega (2 veículos)

- **Entregas do dia:** Lista de pedidos confirmados / a entregar, com endereço. Filtrar por data e marcar “entregue”.
- **Dois veículos:** Cadastro Veículo 1 e Veículo 2 (nome, placa opcional). Dividir entregas entre os dois (arrastar ou por região).
- **Rota:** Ordem de parada sugerida por proximidade. Lista ordenada + mapa com a sequência.
- **Uso em campo:** Tela no celular para motorista ver lista e marcar “entregue” (e canhoto/assinatura se quiser).

---

## 7. Financeiro básico

- **Contas a pagar:** Vinculadas a compras (parcelas) ou lançamentos manuais. Descrição, valor, vencimento, status (pendente/pago), forma de pagamento.
- **Contas a receber:** Vinculadas a vendas ou manuais. Mesmos campos.
- **Resumo:** Total a pagar e a receber (hoje / semana / mês). Fluxo do mês (entradas − saídas) de forma simples.

---

## Pré-preenchimento por foto

**Objetivo:** Reduzir digitação quando a cliente já anotou venda ou pedido de compra em papel. Ela tira uma foto → o sistema interpreta e pré-preenche o formulário; ela só revisa e salva.

**Fluxo:** (1) Botão “Preencher por foto” na tela de venda ou pedido de compra. (2) Tirar foto ou enviar imagem do papel. (3) Sistema lê e interpreta a estrutura. (4) Formulário é preenchido automaticamente. (5) Ela revisa, corrige e salva.

**Onde se aplica:** **Venda** — foto do papel da venda → pré-preenche cliente, data, itens, totais. **Pedido de compra** — foto do pedido em papel → pré-preenche fornecedor, data, itens, totais.

**Importante:** O pré-preenchimento é sugestão. A usuária sempre revisa e pode editar qualquer campo antes de salvar.

---

## Prioridade de entrega (ordem sugerida)

| Fase | Módulo                 | Motivo |
|------|------------------------|--------|
| 1    | Estoque                | Base: cadastro em 3 tipos (Revenda, Insumos, Fabricados) e saldo. |
| 2    | Compras                | Entrada de estoque (revenda e insumos) e base para avisos. |
| 3    | Avisos de compra       | Depende de estoque mínimo (revenda e insumos). |
| 4    | **Produção**           | BOM por fabricado, validação semanal, ordem de produção. |
| 5    | Vendas + baixa estoque | Usa estoque (revenda + fabricados) e gera receita. |
| 6    | Financeiro básico      | Aproveita vendas e compras para a pagar/receber. |
| 7    | Roteirização (2 veículos) | Usa lista de pedidos a entregar. |

A cliente pode usar estoque (3 tipos), compras e avisos; em seguida produção; depois vendas, financeiro e rotas.
