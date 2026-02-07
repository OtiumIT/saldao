# Análise Negócio + UX – Saldão de Móveis Jerusalém

**Contexto:** Cliente **não emite nota fiscal**. Foco do negócio:
1. **Não vender o que não tem** no estoque.
2. **Saber o momento certo de comprar** e **quanto comprar**.
3. **Evitar estoque parado** (comprar em excesso).

Conversa entre especialista em pequenos negócios e em UX sobre o que temos e o que melhorar.

---

## 1. O que já temos (resumo)

| Área | O que existe | Observação |
|------|----------------|------------|
| **Estoque** | Produtos com saldo, mínimo, máximo; movimentações; conferência (XLS); ajuste manual; listagem com “abaixo do mínimo” em vermelho. | Base sólida. Máximo existe no cadastro mas quase não é usado na decisão de compra. |
| **Compras** | Pedido de compra, recebimento → entrada no estoque. | Fluxo ok. |
| **Avisos de compra** | Lista produtos com saldo ≤ mínimo; “quantidade sugerida” = (mínimo − saldo); botão “Gerar pedido de compra” com itens pré-preenchidos. | Responde “quando comprar” e “quanto comprar” só até repor o mínimo (não considera máximo/ideal). |
| **Vendas** | Registro de venda (caixa), itens, cliente opcional, retirada/entrega. Pedido salvo como **rascunho**; ao **Confirmar** a API valida estoque e bloqueia se insuficiente. | **Problema:** estoque só é checado na confirmação; na hora de montar a venda o usuário não vê saldo nem aviso. |
| **Produção / Financeiro / Roteirização** | Conforme plano. | Fora do foco “estoque + compra + venda”. |

---

## 2. Lacunas e melhorias (priorizadas)

### 2.1 Não vender o que não tem (prioridade alta)

**Problema hoje:** No registro de venda (caixa) o operador escolhe produto e quantidade **sem ver o saldo**. Só ao clicar em “Confirmar” (depois de já ter fechado o pedido) descobre que não tinha estoque — e aí o erro vem por produto (ex.: “Estoque insuficiente para X (saldo: 0, necessário: 2)”).

**Impacto:** Frustração, retrabalho, risco de prometer entrega do que não tem.

**Melhorias sugeridas (UX + regra):**

1. **Mostrar saldo na própria tela de venda**
   - No dropdown/lista de produtos: exibir **saldo atual** ao lado do nome (ex.: “Mesa X – Saldo: 3”).
   - Na linha do item: mostrar **“Saldo: X”** e, se quantidade digitada > saldo, **aviso em tempo real** (ex.: “Saldo insuficiente” em vermelho).

2. **Validar estoque ao adicionar/alterar item (e ao salvar)**
   - Ao definir quantidade maior que o saldo: bloquear ou avisar forte (“Não há estoque suficiente. Saldo: X”).
   - Opção: permitir salvar como rascunho mesmo assim, mas **impedir Confirmar** e deixar claro na lista que aquele pedido “está com item acima do estoque”.

3. **Desabilitar ou sinalizar produtos sem estoque**
   - Produtos com saldo 0 (ou &lt; 1 unidade) podem aparecer **desabilitados** no seletor ou com etiqueta “Sem estoque”, para não serem escolhidos por engano.

**Resumo:** Objetivo é que o operador **saiba na hora da venda** o que pode ou não vender, sem depender só do erro na confirmação.

---

### 2.2 Momento certo de comprar (prioridade alta)

**O que temos:** Avisos de compra listam quem está **abaixo do mínimo** e sugerem repor até o mínimo. Isso já responde “quando” (quando caiu abaixo do mínimo).

**O que falta (UX):**

1. **Visibilidade no dia a dia**
   - **Dashboard ou home** com um bloco “Comprar agora” (ou “Abaixo do mínimo”): quantidade de produtos em aviso e link direto para Avisos de compra (e daí para Gerar pedido).
   - Opcional: notificação/lembrete simples ao entrar no sistema (“3 produtos abaixo do mínimo”).

2. **Deixar claro o “porquê”**
   - Na tela de Avisos: texto curto do tipo “Estes produtos estão com saldo igual ou abaixo do estoque mínimo. Reponha para não perder vendas.”
   - Assim o usuário entende que a tela é a ferramenta do “momento certo de comprar”.

**Resumo:** A lógica já existe; falta **destacar** no fluxo (home/dashboard) e **comunicar** o propósito da tela.

---

### 2.3 Quanto comprar sem ficar com estoque parado (prioridade média)

**O que temos:** Cadastro tem **estoque máximo** (opcional). Avisos sugerem só **repor até o mínimo** (quantidade_sugerida = mínimo − saldo). Ou seja, não usamos o máximo para limitar “não compre demais”.

**Melhorias sugeridas:**

1. **Usar estoque máximo na sugestão de compra**
   - **Quantidade sugerida** = não ultrapassar o máximo:  
     `sugerido = min(estoque_maximo - saldo_atual, pedido_mínimo_típico?)`  
     e nunca menor que (mínimo − saldo) quando abaixo do mínimo.
   - Regra simples: “Sugerir compra até repor o mínimo, mas **nunca acima do máximo**” (se máximo estiver preenchido).
   - Na tela de Avisos: coluna “Sugerido” já pode refletir isso; opcional coluna “Máximo” para o usuário ver o teto.

2. **Incentivar preenchimento de estoque máximo (UX)**
   - No cadastro de produto: texto de ajuda “Máximo evita comprar demais e ficar com estoque parado”.
   - Em relatório/lista de produtos: mostrar “Saldo / Máximo” quando máximo estiver definido (ex.: “5 / 10”), para o dono ir ajustando o máximo com o tempo.

**Resumo:** “Quanto comprar” fica mais claro quando a sugestão **respeita o máximo** e a interface **valoriza** o uso do campo máximo.

---

### 2.4 Simplificações para quem não emite NF (prioridade média)

**Contexto:** Sem NF, o foco é controle de estoque e compra, não documento fiscal.

1. **Nomenclatura**
   - Evitar termos que remetam a NF (ex.: “Nota”, “CFOP”, “ICMS”). Já estamos com “Pedido”, “Venda”, “Registro” — manter essa linha.

2. **Fluxo de venda**
   - Manter **rascunho → confirmar** é útil (permite fechar a venda na hora e só dar baixa ao confirmar). O importante é que **na tela de registro** o saldo e os avisos evitem vender o que não tem (ver 2.1).

3. **Relatórios**
   - Ter pelo menos um resumo por período: “Vendas por período” (quantidade de pedidos, total) e “Produtos mais vendidos” (para apoiar decisão de estoque mínimo/máximo). Pode ser fase 2.

---

### 2.5 Outras melhorias de UX (prioridade menor)

1. **Caixa (registro de venda)**
   - Ordem dos campos: **itens primeiro** (produto, qtd, preço), depois cliente, tipo (retirada/entrega), endereço se entrega. Assim o operador monta a venda antes de preencher quem é e como entrega.
   - Atalho “produto mais vendido” ou “últimos vendidos” pode acelerar o dia a dia.

2. **Avisos de compra**
   - Um único fornecedor por aviso hoje pode não bater com a realidade (vários fornecedores). Manter “Gerar pedido” com itens pré-preenchidos, mas deixar claro que o usuário pode trocar o fornecedor ou dividir em mais de um pedido na tela de Compras.

3. **Produtos**
   - Na listagem de produtos, filtro rápido “Abaixo do mínimo” (além do destaque em vermelho) ajuda a focar no que exige ação.

---

## 3. Priorização sugerida (para desenvolvimento)

| Prioridade | Melhoria | Objetivo de negócio |
|------------|----------|----------------------|
| **P1** | Saldo visível no registro de venda + aviso/bloqueio quando qtd > saldo | Não vender o que não tem |
| **P1** | Validar estoque ao confirmar (já existe) + mensagem clara de erro | Não vender o que não tem |
| **P2** | Dashboard/home com “Comprar agora” (avisos abaixo do mínimo) | Momento certo de comprar |
| **P2** | Sugestão de compra respeitando estoque máximo (e incentivo a cadastrar máximo) | Quanto comprar sem estoque parado |
| **P3** | Reorganizar ordem dos campos no caixa; filtro “Abaixo do mínimo” em Produtos | UX do dia a dia |

---

## 4. Conclusão

- **Não vender o que não tem:** a regra já existe na confirmação; falta **mostrar saldo e avisar/bloquear na tela de venda** (e, se quiser, desabilitar ou marcar produtos sem estoque).
- **Momento certo de comprar:** já existe (Avisos de compra); falta **visibilidade** (dashboard/home) e **texto que explique** o propósito.
- **Quanto comprar / estoque parado:** já temos **estoque máximo** no cadastro; falta **usar na sugestão de compra** e **reforçar na UX** o uso do máximo.

Com isso, o sistema fica alinhado ao foco do cliente (sem NF): controle de estoque na venda, momento de compra e quantidade sugerida sem excesso.
