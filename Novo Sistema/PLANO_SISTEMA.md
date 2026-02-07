# Plano do sistema – Saldão de Móveis Jerusalém

Documento que desdobra o **NECESSIDADES_SISTEMA.md** em desenho do banco, fases de implementação e próximos passos. Fonte da verdade das necessidades: **NECESSIDADES_SISTEMA.md**.

---

## 1. Resumo das necessidades

- **Objetivo:** Sistema próprio para fábrica + revenda (móveis fabricados e revenda).
- **Módulos:** Estoque (3 tipos de produto) → Compras → Avisos de compra → Produção (BOM) → Vendas → Financeiro → Roteirização (2 veículos) → Custos operacionais (suporte à precificação).
- **Cadastros base:** Clientes, Fornecedores, Produtos (Revenda / Insumos / Fabricados), BOM por fabricado.
- **Regras principais:** Baixa de estoque na venda; entrada na compra e na produção; avisos por estoque mínimo; pré-preenchimento por foto (venda e pedido de compra) como melhoria futura.

---

## 2. Desenho do banco de dados (PostgreSQL)

Todas as tabelas abaixo devem ser criadas na base única do projeto (single-tenant). Convenção: `id` UUID ou serial conforme padrão do projeto; `created_at` / `updated_at` onde fizer sentido.

### 2.1 Autenticação e usuários (já existentes ou a migrar)

- **profiles** (ou equivalente): id, email, name, role, company_id (se mantido), can_create_users, is_super_admin, created_at, updated_at.
- **companies** (opcional, se manter multi-empresa interno): id, name, ...  
Para o Saldão single-tenant, pode-se simplificar para um único “tenant” e perfis sem company_id.

### 2.2 Cadastros base

| Tabela | Descrição | Campos principais |
|--------|-----------|-------------------|
| **clientes** | Clientes (vendas e entregas). **Loja como cliente da Fábrica:** um cliente com tipo = 'loja' representa a Loja (máx. um). Ver LOJA_COMO_CLIENTE_FABRICA.md. | id, nome, fone, email, endereco_entrega, **tipo** (externo \| loja), observacoes, created_at, updated_at |
| **fornecedores** | Fornecedores (compras) | id, nome, fone, email, contato, observacoes, created_at, updated_at |

### 2.3 Produtos e estoque

| Tabela | Descrição | Campos principais |
|--------|-----------|-------------------|
| **produtos** | Cadastro único: Revenda, Insumos ou Fabricados | id, codigo (unique), descricao, unidade (UN, M2, L, etc.), tipo (revenda \| insumos \| fabricado), preco_compra, preco_venda, estoque_minimo, estoque_maximo (opcional), fornecedor_principal_id (FK fornecedores), created_at, updated_at |
| **saldo_estoque** | Saldo atual por produto (pode ser view ou tabela derivada de movimentações) | produto_id, quantidade — ou calculado a partir de movimentacoes_estoque |
| **movimentacoes_estoque** | Histórico de entradas/saídas | id, data, tipo (entrada \| saida \| ajuste \| producao), produto_id, quantidade (+ ou -), origem_tipo (venda, compra, ordem_producao, ajuste), origem_id (referência genérica), observacao, created_at |

### 2.4 Vendas

| Tabela | Descrição | Campos principais |
|--------|-----------|-------------------|
| **pedidos_venda** | Pedido de venda | id, cliente_id (opcional se retirada), data_pedido, **tipo_entrega** (retirada \| entrega), status (rascunho \| confirmado \| entregue \| cancelado), **endereco_entrega** (obrigatório se entrega: logradouro, numero, bairro, cidade, cep, referencia), observacoes, total, created_at, updated_at |
| **itens_pedido_venda** | Itens do pedido | id, pedido_venda_id, produto_id, quantidade, preco_unitario, total_item |

### 2.5 Compras

| Tabela | Descrição | Campos principais |
|--------|-----------|-------------------|
| **pedidos_compra** | Pedido de compra ao fornecedor | id, fornecedor_id, data_pedido, status (em_aberto \| recebido_parcial \| recebido), observacoes, total, created_at, updated_at |
| **itens_pedido_compra** | Itens do pedido de compra | id, pedido_compra_id, produto_id, quantidade, preco_unitario, total_item, quantidade_recebida (para recebimento parcial) |

### 2.6 Produção (BOM e ordens)

| Tabela | Descrição | Campos principais |
|--------|-----------|-------------------|
| **bom** | Receita: por 1 unidade do fabricado, quanto de cada insumo | id, produto_fabricado_id (FK produtos), produto_insumo_id (FK produtos), quantidade_por_unidade, created_at |
| **ordens_producao** | Ordem de produção lançada | id, produto_fabricado_id, quantidade, data_ordem, status (pendente \| concluida), observacao, created_at |
| **movimentacoes_producao** | (Opcional) Detalhe de consumo/entrada por ordem; ou usar apenas movimentacoes_estoque com origem_tipo = ordem_producao e origem_id = ordens_producao.id |

### 2.7 Financeiro

| Tabela | Descrição | Campos principais |
|--------|-----------|-------------------|
| **contas_a_pagar** | Contas a pagar (compras ou manual) | id, descricao, valor, vencimento, status (pendente \| pago), forma_pagamento, pedido_compra_id (opcional), parcela_numero, created_at, updated_at, pago_em |
| **contas_a_receber** | Contas a receber (vendas ou manual) | id, descricao, valor, vencimento, status (pendente \| recebido), forma_pagamento, pedido_venda_id (opcional), parcela_numero, created_at, updated_at, recebido_em |

### 2.8 Roteirização (entregas)

Foco: empresa trabalha com **entrega própria**; o sistema deve permitir roteirizar as entregas considerando veículos, capacidade e janelas de entrega.

| Tabela | Descrição | Campos principais |
|--------|-----------|-------------------|
| **veiculos** | Cadastro de veículos (dias/horários e capacidade) | id, nome, placa (opcional), ativo, **dias_entrega** (ex.: seg,qua,sex ou JSON), **horario_inicio**, **horario_fim**, **capacidade_volume** (m³ ou unidade de carga), **capacidade_itens** (qtd máxima de itens/entrega), **observacoes**, created_at |
| **entregas** | Vinculação pedido → veículo e ordem na rota | id, pedido_venda_id, veiculo_id, data_entrega_prevista, ordem_na_rota, status (pendente \| em_rota \| entregue), entregue_em, created_at |

### 2.9 Custos operacionais (suporte à precificação)

Detalhes em **CUSTOS_OPERACIONAIS_PRECIFICACAO.md**. Resumo das tabelas:

| Tabela | Descrição | Campos principais |
|--------|-----------|-------------------|
| **categorias_custo_operacional** | Tipos de despesa (Aluguel, Luz, Salários, etc.). **local** para viabilidade Fábrica vs Loja. | id, nome, descricao (opcional), **local** (fabrica \| loja \| comum), ativo, created_at, updated_at |
| **custos_operacionais** | Valor por categoria por mês/ano | id, categoria_id (FK), ano, mes, valor_planejado, valor_realizado (opcional), observacao, created_at, updated_at |

O rateio (por unidade vendida ou por custo direto) usa dados de vendas e produtos/BOM; não exige tabela própria na v1 (configuração em memória ou tabela opcional **config_rateio_custos**).

### 2.10 Diagrama de dependências (resumido)

```
clientes, fornecedores
    ↓
produtos (fornecedor_principal_id → fornecedores)
    ↓
bom (produto_fabricado, produto_insumo → produtos)
    ↓
movimentacoes_estoque (produto_id → produtos)
pedidos_venda (cliente_id → clientes) → itens_pedido_venda (produto_id)
pedidos_compra (fornecedor_id → fornecedores) → itens_pedido_compra (produto_id)
ordens_producao (produto_fabricado_id → produtos) → movimentacoes_estoque (origem)
contas_a_pagar / contas_a_receber (opcional: FK pedido_compra / pedido_venda)
veiculos → entregas (pedido_venda_id, veiculo_id)
categorias_custo_operacional → custos_operacionais (categoria_id, ano, mes)
clientes (tipo 'loja') = Loja; pedidos_venda com cliente=Loja = transferência fábrica→loja (viabilidade). Ver LOJA_COMO_CLIENTE_FABRICA.md.
```

---

## 3. Fases de implementação (ordem sugerida)

| Fase | Módulo | O que fazer | Dependências de tabelas |
|------|--------|-------------|--------------------------|
| 0 | Base e cadastros mínimos | Criar base PostgreSQL local; migrations para auth/usuários (se necessário), **clientes**, **fornecedores**. API + frontend para CRUD de clientes e fornecedores. | clientes, fornecedores |
| 1 | Estoque | Cadastro de **produtos** (tipos Revenda, Insumos, Fabricados), saldo e **movimentacoes_estoque**. Telas: listagem, cadastro produto, movimentações, relatório com “abaixo do mínimo”. | produtos, movimentacoes_estoque |
| 2 | Compras | **pedidos_compra** + **itens_pedido_compra**. Recebimento → entrada no estoque (movimentacoes_estoque). | pedidos_compra, itens_pedido_compra, movimentacoes_estoque |
| 3 | Avisos de compra | Tela “Avisos de compra”: produtos com saldo ≤ estoque mínimo; botão “Gerar pedido de compra” (pré-preenche itens no módulo Compras). | produtos, saldo (view ou cálculo) |
| 4 | Produção | **bom**, **ordens_producao**. Telas: BOM por fabricado; validação semanal (quantidade que dá para construir); lançar ordem → baixa insumos + entrada fabricado. | bom, ordens_producao, movimentacoes_estoque |
| 5 | Vendas | **pedidos_venda** + **itens_pedido_venda**. Confirmar pedido → baixa estoque. Listagem, impressão/PDF. | pedidos_venda, itens_pedido_venda, movimentacoes_estoque |
| 6 | Financeiro básico | **contas_a_pagar**, **contas_a_receber**. Vínculo opcional com compras/vendas. Resumo (totais, fluxo do mês). | contas_a_pagar, contas_a_receber |
| 7 | Roteirização | **veiculos**, **entregas**. Lista de entregas do dia; dividir entre 2 veículos; ordem sugerida; tela motorista (marcar entregue). | veiculos, entregas, pedidos_venda |
| 8 | Custos operacionais | **categorias_custo_operacional**, **custos_operacionais**. Cadastro de categorias (Aluguel, Luz, Salários, etc.), valores por mês; rateio sobre produtos para custo total e preço mínimo sugerido. Ver CUSTOS_OPERACIONAIS_PRECIFICACAO.md. | categorias_custo_operacional, custos_operacionais; usa vendas e produtos/BOM para rateio |

Melhorias futuras (fora do escopo inicial): pré-preenchimento por foto (venda e pedido de compra), relatórios adicionais, integrações.

---

## 4. Telas a criar (por fase e módulo)

Lista de todas as telas do sistema. Cada módulo no frontend segue a estrutura: `frontend/src/modules/{nome}/pages/`, `components/`, `services/`, `hooks/`, `types/`.

### Fase 0 — Base e cadastros (já implementadas)

| # | Módulo      | Tela                    | Descrição |
|---|-------------|-------------------------|-----------|
| 0.1 | auth      | Login                   | Tela de login (usuário/senha). Já existe. |
| 0.2 | auth      | Esqueci senha / Redefinir senha | Fluxo de recuperação de senha. Já existe. |
| 0.3 | auth      | Usuários (admin)        | Listagem e CRUD de usuários. Já existe (com Supabase depois). |
| 0.4 | clientes  | Listagem de clientes    | Lista com busca/filtro; botão novo; editar/excluir. Já existe. |
| 0.5 | clientes  | Formulário de cliente   | Modal ou página: nome, fone, email, endereço entrega, observações. Já existe. |
| 0.6 | fornecedores | Listagem de fornecedores | Lista com busca/filtro; botão novo; editar/excluir. Já existe. |
| 0.7 | fornecedores | Formulário de fornecedor | Modal ou página: nome, fone, email, contato, observações. Já existe. |

### Fase 1 — Estoque

| # | Módulo  | Tela | Descrição |
|---|---------|------|-----------|
| 1.1 | estoque | Listagem de produtos | Tabela: código, descrição, tipo (Revenda/Insumos/Fabricado), unidade, saldo atual, estoque mínimo, indicador “abaixo do mínimo”, preço compra/venda, fornecedor principal. Filtro por tipo. Ações: novo, editar, ver movimentações. |
| 1.2 | estoque | **Cadastro de produtos** | Formulário simples: código, descrição, unidade, tipo (Revenda \| Insumos \| Fabricado), preço compra, preço venda, estoque mínimo (e máximo opcional), fornecedor principal. Validação: código único. **Exportar** e **importar** planilha **XLSX** (lista de produtos). |
| 1.3 | estoque | Movimentações de estoque | Listagem: data, tipo (entrada/saída/ajuste/produção), produto, quantidade, origem (venda, compra, ordem produção, ajuste). Filtro por produto e período. |
| 1.4 | estoque | **Conferência de estoque** | Tela para conferir saldos: listagem por produto com saldo atual; opções **baixar** (template), **exportar** e **importar** planilha **XLS** para ajuste em lote (reconciliação). Gera movimentações de ajuste conforme planilha. |
| 1.5 | estoque | Ajuste manual de estoque | Modal ou tela rápida: produto, quantidade (+ ou −), observação. Gera movimentação com origem “ajuste”. |
| 1.6 | estoque | Relatório de estoque | Listagem com saldo, estoque mínimo e indicador “abaixo do mínimo”; exportar. |

### Fase 2 — Compras

| # | Módulo  | Tela | Descrição |
|---|---------|------|-----------|
| 2.1 | compras | Listagem de pedidos de compra | Tabela: fornecedor, data, status (em aberto / recebido parcial / recebido), total. Filtro por fornecedor, data, status. Ações: novo, editar (se em aberto), receber. |
| 2.2 | compras | **Cadastro de pedidos (compra)** | Tela simples: fornecedor, data, itens (produto + quantidade + preço unitário), total calculado. Ao **receber** o pedido → **atualiza o estoque** (entrada nas movimentações). Possível origem: “Avisos de compra” (itens pré-preenchidos). |
| 2.3 | compras | Recebimento de pedido | Tela/modal: marcar recebimento total ou parcial por item (quantidade recebida). Ao confirmar → gera entrada no estoque (movimentações) e atualiza status do pedido. |
| 2.4 | compras | Histórico de entradas por produto | Listagem de entradas vindas de compras (por produto ou geral). Pode ser integrada à tela de movimentações com filtro “origem = compra”. |

### Fase 3 — Avisos de compra

| # | Módulo         | Tela | Descrição |
|---|----------------|------|-----------|
| 3.1 | avisos-compra | Avisos de compra | Lista: produto (revenda ou insumos), saldo atual, estoque mínimo, quantidade sugerida (ex.: mínimo − saldo ou fixo). Botão “Gerar pedido de compra”: abre módulo Compras com itens pré-preenchidos. |

### Fase 4 — Produção

| # | Módulo    | Tela | Descrição |
|---|-----------|------|-----------|
| 4.1 | producao | Cadastro de BOM (receita) por fabricado | Na tela do produto tipo Fabricado (ou tela dedicada): lista de insumos com “quantidade por unidade” do móvel. Ex.: 1 guarda-roupa = 2,5 m² chapa + 20 puxadores + … Adicionar/remover linhas de insumo. |
| 4.2 | producao | Validação de insumos | Lista dos produtos fabricados: “quantidade que dá para construir agora” (gargalo), “insumo gargalo”, opcional “quanto falta para mais X unidades”. Uso semanal. |
| 4.3 | producao | Lançar ordem de produção | Formulário: produto fabricado, quantidade. Opcional: validar se há insumos suficientes antes de confirmar. Ao confirmar: baixa insumos (conforme BOM) + entrada do fabricado no estoque; movimentações com origem “Ordem de produção nº X”. |
| 4.4 | producao | Listagem de ordens de produção | Tabela: ordem, produto fabricado, quantidade, data, status (pendente/concluída). Filtros e detalhe da ordem. |

### Fase 5 — Vendas

| # | Módulo | Tela | Descrição |
|---|--------|------|-----------|
| 5.1 | vendas | Listagem de pedidos de venda | Tabela: cliente (ou “Retirada”), data, status (rascunho/confirmado/entregue/cancelado), total, entrega (sim/não). Filtro por data, status, cliente. Ações: novo, editar (rascunho), confirmar, imprimir/PDF, pedido de entrega. |
| 5.2 | vendas | **Registro de vendas (caixa)** | Tela **bem simples e rápida** para cadastrar venda: itens (produto + qtd + preço), total; **cliente opcional** (em caso de retirada pode ficar sem cliente). Opções: **importar/exportar planilha** (XLS/XLSX) para lançar em lote; **foto para processar pedido** (upload/captura → extrai itens e pré-preenche para revisão). Ao confirmar: baixa estoque. |
| 5.2b | vendas | **Transferência Fábrica → Loja** | Pedido com cliente = Loja (cadastrada como cliente tipo “loja”); itens com **preço de transferência**. Ao confirmar, baixa estoque. Base para receita da fábrica e custo da loja (viabilidade). Ver LOJA_COMO_CLIENTE_FABRICA.md. |
| 5.3 | vendas | **Pedido de entrega** | Quando a venda for **entrega** (não retirada): tela para preencher **endereço completo** (logradouro, número, bairro, cidade, CEP, referência). Aqui entra o vínculo com **roteirização**: este pedido passa a compor as entregas a serem distribuídas nos veículos. |
| 5.4 | vendas | Impressão/PDF do pedido | Geração de PDF do pedido para uso interno e entrega (dados do pedido + itens + totais). |

### Fase 6 — Financeiro básico

| # | Módulo     | Tela | Descrição |
|---|------------|------|-----------|
| 6.1 | financeiro | Contas a pagar | Listagem: descrição, valor, vencimento, status (pendente/pago), forma de pagamento, vínculo com compra (opcional). Cadastro manual; marcar como pago. Filtro por período e status. |
| 6.2 | financeiro | Contas a receber | Listagem: descrição, valor, vencimento, status (pendente/recebido), forma de pagamento, vínculo com venda (opcional). Cadastro manual; marcar como recebido. Filtro por período e status. |
| 6.3 | financeiro | Resumo financeiro | Totais a pagar e a receber (hoje / semana / mês). Fluxo do mês (entradas − saídas) de forma simples. Pode ser dashboard no próprio módulo ou tela dedicada. |

### Fase 7 — Roteirização (entregas)

**Foco:** conseguir roteirizar as entregas (entrega própria). Considerar **tamanho/capacidade de cada veículo**, **dias e horários** de entrega e **quantidade que cabe** em cada um.

| # | Módulo        | Tela | Descrição |
|---|---------------|------|-----------|
| 7.1 | roteirizacao | **Cadastro de veículos** | Nome, placa (opcional), ativo; **dias de entrega** (ex.: seg/qua/sex); **horário de entrega** (início e fim); **tamanho/capacidade** do veículo (ex.: m³ ou “quantidade de itens/entregas que cabem”) para uso na divisão de rotas. |
| 7.2 | roteirizacao | Entregas pendentes / do dia | Lista de pedidos com **pedido de entrega** preenchido (endereço completo), por data. Status: a roteirizar, alocado, em rota, entregue. |
| 7.3 | roteirizacao | **Dividir e roteirizar** | Associar entregas aos veículos respeitando **capacidade** e **dias/horários** de cada um. Ordem de parada (rota) por veículo — sugerida por proximidade ou ordem manual. |
| 7.4 | roteirizacao | Rota (ordem de parada) | Por veículo: lista ordenada de paradas com endereço; opcional mapa com sequência. |
| 7.5 | roteirizacao | Tela motorista (campo/celular) | Visão simplificada: entregas do veículo no dia; marcar “entregue”; opcional canhoto/assinatura. |

### Fase 8 — Custos operacionais (suporte à precificação)

**Foco:** cadastro de custos fixos e variáveis (aluguel, luz, salários, gasolina, etc.) por período; rateio sobre produtos para **custo total** e **preço mínimo sugerido**. Ver CUSTOS_OPERACIONAIS_PRECIFICACAO.md.

| # | Módulo              | Tela | Descrição |
|---|---------------------|------|-----------|
| 8.1 | custos-operacionais | **Categorias de custo** | Listagem e CRUD de categorias (Aluguel, Água, Luz, Telefone, Gasolina, Manutenção veículos, Salários, Outros). Não excluir se tiver lançamentos; inativar. |
| 8.2 | custos-operacionais | **Lançamento por mês** | Seleção ano/mês; lista de categorias com valor planejado (e opcional valor realizado). Total do mês calculado. |
| 8.3 | custos-operacionais | **Resumo** | Totais por mês; opcional gráfico ou tabela ano x mês. Configuração da base de rateio (por unidade vendida / por custo direto). |
| 8.4 | estoque (integração) | **Precificação no produto** | Na listagem ou cadastro de produtos: exibir custo total sugerido e preço mínimo sugerido (com margem %); botão “Ver composição” (custo direto + rateio). |
| 8.5 | custos-operacionais / vendas | **Viabilidade Fábrica e Loja** | Relatórios: Receita e custos por unidade (Fábrica = transferências para a Loja; Loja = vendas a cliente externo). Custos operacionais por local (fabrica/loja/comum). Ver LOJA_COMO_CLIENTE_FABRICA.md. |

### Resumo por fase

| Fase | Módulo          | Quantidade de telas |
|------|-----------------|----------------------|
| 0    | Auth, Clientes, Fornecedores | 7 (todas já existentes) |
| 1    | Estoque         | 6 |
| 2    | Compras         | 4 |
| 3    | Avisos de compra| 1 |
| 4    | Produção        | 4 |
| 5    | Vendas          | 4 |
| 6    | Financeiro      | 3 |
| 7    | Roteirização    | 5 |
| 8    | Custos operacionais | 3–4 (categorias, lançamento por mês, resumo, integração precificação) |
| **Total** | | **37–38 telas** |

---

## 5. Próximos passos concretos

1. **Base PostgreSQL local**  
   - Garantir que o PostgreSQL está rodando (já instalado).  
   - Criar banco dedicado, ex.: `saldao_jerusalem`.  
   - Configurar `DATABASE_URL` no `.env` da API.

2. **Migrations iniciais (Fase 0)**  
   - Criar na pasta `supabase/migrations/` (ou em `api/db/migrations/` se o projeto adotar):  
     - `001_auth_profiles.sql` (ou equivalente, se migrar auth para PG).  
     - `002_clientes_fornecedores.sql`: tabelas **clientes** e **fornecedores** conforme desenho acima.  
   - Documentar em README das migrations a ordem de execução.

3. **API e frontend (Fase 0)**  
   - Estrutura modular na API: `api/src/modules/clientes/`, `api/src/modules/fornecedores/` (routes, service, repository).  
   - Frontend: módulos **clientes** e **fornecedores** (listagem, formulário, hooks, serviços).  
   - Conectar repositórios ao PostgreSQL (driver `pg`), sem usar API do Supabase para dados.

4. **Estoque (Fase 1)**  
   - Migration: **produtos**, **movimentacoes_estoque**.  
   - Implementar módulo estoque (cadastro de produtos, movimentações, relatório).

5. **Seguir as fases 2 a 7** na ordem do quadro acima, criando migrations e módulos correspondentes.

---

## 6. Onde está cada decisão

- **Necessidades funcionais:** NECESSIDADES_SISTEMA.md.  
- **Desenho do banco e fases:** este arquivo (PLANO_SISTEMA.md).  
- **Stack e regras de código:** `.cursor/rules/` (PostgreSQL direto, estrutura modular, sem multitenancy).

Quando criar a base local e as primeiras migrations, usar este plano como checklist e atualizar o README das migrations com os nomes reais dos arquivos e a ordem de execução.
