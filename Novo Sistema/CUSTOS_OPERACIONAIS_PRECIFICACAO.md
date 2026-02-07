# Módulo de Custos Operacionais e Suporte à Precificação

Documento de concepção do módulo **Custos Operacionais**, pensado para dar suporte à precificação correta dos produtos (revenda e fabricados), incorporando despesas fixas e variáveis que o pequeno empreendedor costuma esquecer na hora de precificar.

**Fonte da verdade das necessidades gerais:** NECESSIDADES_SISTEMA.md. Este documento estende o escopo com uma nova necessidade: **composição de custo que inclua custos operacionais**.

---

## 1. O problema

Pequenos empreendedores costumam precificar com base apenas em:
- **Preço de compra** (revenda) ou
- **Custo dos insumos** (fabricados, via BOM)

Itens como **aluguel, água, luz, telefone, gasolina, manutenção dos veículos, salários** ficam de fora. O resultado é margem real baixa ou prejuízo disfarçado: o preço de venda “parece” cobrir a mercadoria, mas não cobre a operação.

**Objetivo do módulo:** permitir cadastrar e planejar esses custos e **rateá-los** de forma simples sobre os produtos, para que o sistema possa sugerir **custo total** e **preço mínimo** (ou margem mínima) na hora de precificar.

---

## 2. O que entra na composição do custo

### 2.1 Custos já cobertos pelo sistema

| Tipo de produto | Custo direto hoje |
|-----------------|--------------------|
| **Revenda**     | `preco_compra` do produto |
| **Fabricado**   | Soma (BOM): para cada insumo, `quantidade_por_unidade × preco_compra` do insumo |

### 2.2 Custos operacionais a incorporar (sugestão de categorias)

Custos que **não** estão no preço de compra nem no BOM, mas que precisam entrar no “custo da operação” e ser rateados:

| Categoria (exemplo) | Descrição | Periodicidade típica |
|---------------------|-----------|----------------------|
| **Aluguel**         | Loja/galpão | Mensal |
| **Água**            | Conta de água | Mensal |
| **Luz**             | Energia elétrica | Mensal |
| **Telefone/Internet** | Fixo + celular + internet | Mensal |
| **Gasolina**        | Combustível (frotas/entregas) | Mensal ou por km |
| **Manutenção veículos** | Revisão, pneus, reparos | Mensal (média) ou por veículo |
| **Salários**        | Salários + encargos (quem atua na loja/fábrica/entregas) | Mensal |
| **Outros**          | Material de escritório, limpeza, etc. | Mensal |

Para **estudo de viabilidade por unidade** (fábrica vs loja), cada categoria ou lançamento deve poder ser atribuído a um **local**: **Fábrica**, **Loja** ou **Comum** (rateado entre os dois). Ver **LOJA_COMO_CLIENTE_FABRICA.md**.

O módulo deve permitir **cadastro flexível de categorias** (o empreendedor cria as que usa) e **valores por período** (ex.: valor mensal planejado ou realizado).

---

## 3. Visão geral do módulo

```
CUSTOS OPERACIONAIS
├── Cadastro de categorias (Aluguel, Luz, Salários, Gasolina, etc.)
├── Lançamento de valores por período (ex.: mês/ano)
│   └── Valor planejado (orçamento) e/ou realizado (opcional)
├── Total mensal de custos operacionais
└── Rateio sobre produtos (para precificação)
    └── Custo operacional rateado por produto → entra no “custo total sugerido”
```

**Uso na precificação:**
- **Custo total sugerido** = Custo direto (compra ou BOM) + **Custo operacional rateado por unidade**
- **Preço mínimo sugerido** = Custo total sugerido × (1 + margem mínima %), ou exibir margem real se o usuário informar o preço de venda.

---

## 4. Regras de rateio (como distribuir os custos operacionais)

O rateio pode ser feito de várias formas. Sugestão para uma primeira versão **simples**:

### 4.1 Base de rateio única (configurável)

Uma única base por período (ex.: mês). Opções possíveis:

| Base de rateio | Descrição | Uso típico |
|----------------|-----------|------------|
| **Por fatia da receita** | Proporção da receita que cada produto (ou tipo) representa no período | Quem já vende e quer “pesar” pelo que vende mais |
| **Por unidade vendida** | Dividir o custo total pelo total de unidades vendidas → custo por unidade igual para todos | Simples; bom quando os produtos têm tamanho de venda parecido |
| **Por custo direto** | Proporção do custo direto (compra/BOM) de cada produto no total de custo direto | Quem fabrica: produtos que custam mais insumos “carregam” mais custo fixo |
| **Por produto (peso manual)** | Usuário define % ou peso por produto/categoria | Máxima flexibilidade, mais trabalho |

Recomendação para v1: oferecer **por unidade vendida** e **por custo direto** (com período de referência para vendas ou para custo direto médio). A base de rateio pode ser uma configuração global por período (ex.: “rateio de jan/2025: por custo direto”).

### 4.2 Fórmula prática (exemplo: rateio por custo direto)

1. **Total custos operacionais do mês** = Soma dos valores lançados nas categorias (ex.: R$ 15.000).
2. **Total custo direto do período** = Soma, sobre todos os produtos vendidos no período, de (quantidade × custo unitário direto). Ou, para “custo direto médio” dos fabricados, usar BOM + preço compra dos insumos.
3. **Coeficiente de rateio** = Total custos operacionais ÷ Total custo direto (ex.: 0,40 = 40%).
4. **Custo operacional rateado por unidade do produto X** = Custo direto unitário do produto X × Coeficiente de rateio.
5. **Custo total sugerido (produto X)** = Custo direto unitário (X) + Custo operacional rateado (X).
6. **Preço mínimo sugerido** = Custo total sugerido × (1 + margem_minima). Ex.: margem 30% → preço mínimo = custo total × 1,30.

Assim, o módulo de **Estoque/Produtos** (ou uma tela de “Precificação”) pode chamar o serviço de custos operacionais para obter o coeficiente ou o custo rateado por produto e exibir **custo total sugerido** e **preço mínimo sugerido** ao lado do preço de venda atual.

---

## 5. Desenho do banco de dados (proposta)

Tabelas novas (single-tenant, mesmo padrão do projeto):

### 5.1 Categorias de custo operacional

| Tabela | Descrição | Campos principais |
|--------|-----------|-------------------|
| **categorias_custo_operacional** | Tipos de despesa (Aluguel, Luz, Salários, etc.) | id, nome, descricao (opcional), **local** (fabrica \| loja \| comum) para viabilidade por unidade, ativo, created_at, updated_at |

### 5.2 Valores por período

| Tabela | Descrição | Campos principais |
|--------|-----------|-------------------|
| **custos_operacionais** | Valor por categoria por mês/ano | id, categoria_id (FK), ano, mes, valor_planejado, valor_realizado (opcional), observacao, created_at, updated_at. O **local** pode vir da categoria ou ser sobrescrito no lançamento (fabrica \| loja \| comum). |

Regra: um registro por (categoria_id, ano, mes). Valor realizado pode ser preenchido quando a conta fechar (opcional na v1).

### 5.3 Configuração de rateio (opcional na v1)

| Tabela | Descrição | Campos principais |
|--------|-----------|-------------------|
| **config_rateio_custos** | Como ratear no período | id, ano, mes, base_rateio (por_unidade \| por_custo_direto \| por_receita), created_at, updated_at |

Na v1 pode ser configuração global única (último período configurado) em vez de tabela por ano/mês.

### 5.4 Diagrama (resumo)

```
categorias_custo_operacional
    ↓
custos_operacionais (categoria_id, ano, mes, valor_planejado, valor_realizado?)
config_rateio_custos? (ano, mes, base_rateio)
```

Uso: o serviço de custos operacionais soma `custos_operacionais` do período, lê `base_rateio`, e calcula coeficiente e custo rateado por produto usando dados de **vendas** (itens_pedido_venda) e **produtos** (preco_compra, BOM).

---

## 6. Onde o módulo se encaixa no sistema

- **Não substitui** o Financeiro: contas a pagar/receber continuam no módulo Financeiro. Custos operacionais aqui são **planejamento/orçamento** e **base de rateio para precificação**.
- **Alimenta** a precificação: Estoque (cadastro de produtos) ou uma tela “Precificação” pode exibir custo total sugerido e preço mínimo sugerido usando esse módulo.
- **Lê** dados de outros módulos: produtos (preco_compra, BOM), vendas (itens vendidos no período) para calcular rateio. A API do módulo custos-operacionais pode chamar serviços de estoque/produção e vendas para obter totais (respeitando a regra: dados de outros módulos via serviço, não repositório direto).

Ordem sugerida de implementação: **após** Estoque, Compras, Produção e Vendas (e idealmente após ou junto com Financeiro), pois o rateio usa vendas e custo direto (BOM/compra).

---

## 7. Funcionalidades sugeridas (telas e API)

### 7.1 Cadastro de categorias

- Listagem: nome, ativo.
- Formulário: nome, descrição (opcional), ativo.
- Não excluir categoria que já tem lançamentos; permitir inativar.

### 7.2 Lançamento de custos por período

- Tela “Custos operacionais – Mês/Ano”: seleção de ano e mês; lista de categorias com campo **valor planejado** (e opcional **valor realizado**).
- Total do mês calculado (soma dos valores).
- API: GET/POST/PATCH por período (ano, mes) e categoria.

### 7.3 Resumo e uso no rateio

- Tela “Resumo”: totais por mês, gráfico ou tabela ano x mês (opcional).
- Endpoint de **suporte à precificação**: dado um produto_id (ou lista), retornar custo operacional rateado por unidade e custo total sugerido para um período de referência (ex.: último mês com dados). Opcional: retornar preço mínimo sugerido dado uma margem %.

### 7.4 Configuração de rateio

- Tela ou seção: “Base de rateio” para o período (por unidade vendida, por custo direto, por receita). Pode ser um único seletor global “Usar rateio: por custo direto” na primeira versão.

---

## 8. Integração com a tela de produtos / precificação

- No **cadastro ou listagem de produtos** (Estoque): exibir coluna ou card **Custo total sugerido** e **Preço mínimo sugerido** (com margem padrão, ex.: 25%).
- Botão ou link “Ver composição”: modal ou drawer com custo direto (compra ou BOM), custo operacional rateado, total e preço mínimo.
- Isso exige que o frontend chame a API de custos operacionais (ex.: `GET /custos-operacionais/precificacao?produtoId=...&ano=2025&mes=1`) para obter os valores. O backend do módulo custos-operacionais usa estoque/produção (custo direto) e vendas (para base por unidade ou por receita) e seus próprios totais de custo operacional.

---

## 9. Resumo e próximos passos

| Item | Descrição |
|------|-----------|
| **Problema** | Precificação sem custos fixos/operacionais leva a margem baixa ou prejuízo. |
| **Solução** | Módulo de custos operacionais: categorias, valores por mês, rateio sobre produtos. |
| **Rateio** | Por unidade vendida ou por custo direto (v1); depois por receita ou peso manual. |
| **Integração** | Custo total sugerido = custo direto + rateio; preço mínimo = custo total × (1 + margem). |
| **Ordem** | Implementar após Vendas (e preferencialmente Financeiro); rateio usa vendas e BOM. |

**Próximos passos concretos:**

1. Incluir o módulo **Custos Operacionais** no PLANO_SISTEMA.md como nova fase (ex.: Fase 8 ou “Melhoria pós-Financeiro”).
2. Criar migrations: `categorias_custo_operacional`, `custos_operacionais` (e opcional `config_rateio_custos`).
3. Implementar API: `api/src/modules/custos-operacionais/` (routes, service, repository).
4. Implementar frontend: `frontend/src/modules/custos-operacionais/` (cadastro de categorias, lançamento por mês, tela de resumo).
5. Expor endpoint de precificação e integrar na tela de produtos (custo total sugerido, preço mínimo sugerido).

Quando a prioridade for definida pela cliente, este documento serve de base para a implementação do módulo e da integração com a precificação.
