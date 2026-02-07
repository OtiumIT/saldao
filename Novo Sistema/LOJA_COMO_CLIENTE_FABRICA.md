# Dois endereços: Fábrica e Loja – Separar custos

A empresa tem **dois endereços**: a **Fábrica** e a **Loja**. **A fábrica trabalha só para a loja.** O foco é **separar os custos** (fábrica vs loja) via campo local nas categorias de custo. Opcional no futuro: tratar a **Loja como cliente da Fábrica**, de forma que o sistema permita um **estudo de viabilidade** separado para cada unidade: a fábrica “vende” para a loja a preço de transferência; a loja “compra” da fábrica e revende ao consumidor final.

**Fonte da verdade geral:** NECESSIDADES_SISTEMA.md. O sistema já separa custos por local (fabrica | loja | comum). Cliente tipo Loja / “Loja”, transferência ficam como opcional no futuro.

---

## 1. Contexto: dois endereços

| Unidade | Papel | Endereço |
|--------|--------|----------|
| **Fábrica** | Produz móveis (BOM) **só para abastecer a loja**. Custos: produção, insumos, aluguel/luz da fábrica, salários da fábrica, etc. |
| **Loja** | Revende (fabricados + itens de revenda), atende o consumidor final. Custos: aluguel/luz da loja, salários da loja, entrega, etc. |

**Objetivo principal:** **separar os custos** (cada categoria de custo tem local = Fábrica | Loja | Comum). Opcional no futuro: enxergar viabilidade da fábrica (receita da “venda” à loja vs custos da fábrica) e se a **loja** é viável (receita das vendas ao cliente final vs “custo” do que comprou da fábrica + custos da loja).

---

## 2. Ideia central: Loja = cliente da Fábrica

- Cadastrar a **Loja** como um **cliente** no sistema, com tipo especial (ex.: `tipo = 'loja'` ou `interno`), identificando que não é consumidor final.
- Quando a fábrica **entrega produtos para a loja** (abastecimento), registrar uma **venda** da fábrica para a Loja: pedido de venda com **cliente = Loja**, itens com **preço de transferência**.
- As vendas ao **consumidor final** continuam sendo pedidos com cliente = qualquer outro (externo). Essas vendas representam a **receita da loja** (e podem ser feitas na loja ou com entrega).

Assim:
- **Receita da Fábrica** = soma dos pedidos em que o cliente é a **Loja** (transferências), aos preços de transferência.
- **Receita da Loja** = soma dos pedidos em que o cliente é **externo** (vendas finais).
- **Custo da Loja** (para viabilidade) = o que a loja “pagou” à fábrica (preço de transferência dos fabricados) + custo de compra dos itens de revenda + custos operacionais da loja.
- **Custo da Fábrica** = custo de produção (insumos/BOM) + custos operacionais da fábrica.

---

## 3. Fluxo operacional (resumido)

```
FÁBRICA
  → Produção (insumos → fabricado, entra no estoque)
  → “Venda” para a Loja (pedido cliente = Loja, preço transferência)  ← transferência
  → (Opcional) Venda direta ao consumidor (cliente externo, na fábrica)

LOJA
  → “Compra” da fábrica = pedido de transferência (cliente Loja) — documenta valor e quantidade
  → Venda ao consumidor final (cliente externo) — baixa estoque, receita da loja
```

**Estoque:** pode permanecer **único** (um só saldo por produto). A transferência fábrica→loja é um **documento de valor** (e, se desejado no futuro, origem de movimentação “transferência”) para controle. O que importa para viabilidade é: valor “vendido” pela fábrica à loja (preço de transferência) e valor vendido pela loja ao cliente final.

---

## 4. Alterações no modelo

### 4.1 Clientes: identificar a Loja

- Incluir em **clientes** o campo **tipo**: `'externo'` | `'loja'`.
  - **externo**: consumidor final (padrão).
  - **loja**: unidade própria (a Loja). Deve existir **no máximo um** cliente com `tipo = 'loja'`.
- O endereço da Loja fica no cadastro desse cliente (endereço da loja).
- Em listagens e filtros, permitir tratar “Loja” de forma especial (ex.: não listar em seleção de cliente para venda final, ou listar em seção “Transferência para a loja”).

### 4.2 Pedidos de venda: venda final vs transferência

- **Transferência Fábrica → Loja:** pedido de venda com **cliente_id = Loja** (o cliente tipo `'loja'`).
  - Itens: produto, quantidade, **preco_unitario = preço de transferência** (definido na hora ou sugerido por produto).
  - Ao **confirmar** a transferência: pode ou não dar baixa no estoque (conforme regra de negócio). Proposta inicial: **sim**, dá baixa no estoque (o estoque é único; a saída representa a saída física da fábrica para a loja). Assim, todo produto vendido (seja em transferência seja em venda final) gera baixa.
- **Venda ao consumidor final:** pedido com cliente **externo**. Preço = preço de venda ao cliente. Confirmação → baixa no estoque.

Opcional para relatórios: campo **local_venda** em `pedidos_venda`: `'fabrica'` | `'loja'`, para saber onde a venda foi feita (útil se houver venda direta na fábrica ao consumidor). Se não houver venda direta na fábrica, toda venda a cliente externo pode ser considerada “na loja”.

### 4.3 Preço de transferência

- Em **transferências** (pedido cliente = Loja), o preço de cada item é o **preço de transferência** (quanto a loja “paga” à fábrica).
- Pode ser: (a) um campo por produto, ex. **preco_transferencia** em `produtos` (sugestão na tela de transferência), ou (b) apenas definido no próprio pedido de transferência (mais flexível). Recomendação: **definir no pedido** (itens com preco_unitario); opcionalmente sugerir a partir de um preço de transferência cadastrado no produto.
- Para **viabilidade da loja**: ao calcular o “custo” das vendas ao consumidor, usar para **fabricados** o preço de transferência (ex.: último valor usado em transferência para aquele produto, ou média do período). Para **revenda**, usar preço de compra.

---

## 5. Custos operacionais por local (Fábrica vs Loja)

Para fechar o estudo de viabilidade, os **custos operacionais** precisam ser atribuíveis a cada unidade:

- No módulo de **Custos Operacionais** (CUSTOS_OPERACIONAIS_PRECIFICACAO.md), as categorias (ou cada lançamento) devem poder ser associadas a um **local**:
  - **Fábrica** — aluguel da fábrica, luz da fábrica, salários da produção, etc.
  - **Loja** — aluguel da loja, luz da loja, salários da loja, etc.
  - **Comum** — gasolina, telefone, manutenção de veículos (rateados entre fábrica e loja, ou alocados a um dos dois conforme regra).

Proposta: em **categorias_custo_operacional** (ou em **custos_operacionais**) incluir **local**: `'fabrica'` | `'loja'` | `'comum'`. Se for `comum`, o sistema pode ratear 50/50 ou permitir configuração de percentual. Assim:

- **Resultado Fábrica** ≈ Receita (transferências para a loja) − Custo de produção dos itens transferidos − Custos operacionais **fábrica** (e parte dos comuns).
- **Resultado Loja** ≈ Receita (vendas a cliente externo) − Custo das mercadorias vendidas (transferência + revenda) − Custos operacionais **loja** (e parte dos comuns).

---

## 6. Relatórios de viabilidade (visão desejada)

| Relatório | Conteúdo |
|-----------|----------|
| **Viabilidade Fábrica** | Receita: total dos pedidos com cliente = Loja (transferências). Custo: custo de produção (BOM) dos itens transferidos + custos operacionais da fábrica (+ rateio dos comuns). **Resultado = Receita − Custos.** |
| **Viabilidade Loja** | Receita: total dos pedidos com cliente ≠ Loja (vendas finais). Custo: para cada item vendido, custo = preço de transferência (fabricado) ou preço de compra (revenda); somar custos operacionais da loja (+ rateio dos comuns). **Resultado = Receita − Custos.** |
| **Consolidado** | Soma dos dois ou visão “empresa toda” (todas as receitas, todos os custos). |

Isso permite responder: a fábrica está “vendendo” à loja com margem suficiente? A loja está revendendo com margem suficiente após “pagar” a fábrica e os custos da loja?

---

## 7. Resumo das mudanças necessárias

| Onde | O quê |
|------|--------|
| **clientes** | Campo **tipo** (`'externo'` \| `'loja'`). Garantir no máximo um cliente `tipo = 'loja'`. Endereço da loja = endereço desse cliente. |
| **pedidos_venda** | Opcional: **local_venda** (`'fabrica'` \| `'loja'`) para relatório. Inferência: se cliente = Loja → transferência; se cliente externo → venda final (e, se não houver venda direta na fábrica, local = loja). |
| **Custos operacionais** | Categorias ou lançamentos com **local** (`'fabrica'` \| `'loja'` \| `'comum'`) para rateio por unidade. |
| **Produtos** | Opcional: **preco_transferencia** para sugerir preço nas transferências. |
| **Telas** | Cadastro da Loja como cliente (tipo loja); tela ou fluxo “Transferência para a loja” (pedido com cliente = Loja, preço transferência); relatórios Viabilidade Fábrica e Viabilidade Loja. |

---

## 8. Ordem de implementação sugerida

1. **Migration:** adicionar `tipo` em `clientes` (default `'externo'`); criar/cadastrar o cliente **Loja** (tipo `'loja'`, endereço da loja).
2. **Vendas:** na listagem de pedidos, permitir filtrar por “Transferências” (cliente = Loja) e “Vendas finais” (cliente ≠ Loja). Na criação de pedido, permitir escolher cliente Loja e informar preço de transferência nos itens.
3. **Custos operacionais:** adicionar **local** às categorias ou aos lançamentos; usar no rateio e nos relatórios por unidade.
4. **Relatórios:** Viabilidade Fábrica e Viabilidade Loja (e consolidado), conforme fórmulas acima.

Com isso, o sistema passa a suportar oficialmente os **dois endereços** e o **estudo de viabilidade** da fábrica e da loja usando a Loja como cliente da Fábrica.
