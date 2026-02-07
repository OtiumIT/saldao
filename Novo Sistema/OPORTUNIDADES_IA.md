# Oportunidades de IA – Saldão de Móveis Jerusalém

Documento de análise das funções atuais do sistema e oportunidades concretas de implementação de Inteligência Artificial. Baseado no código em `api/src/modules/`, `frontend/src/modules/` e em **NECESSIDADES_SISTEMA.md** / **PLANO_SISTEMA.md**.

---

## 1. Visão geral do que já existe

| Área | Função atual | Dados / regras |
|------|--------------|----------------|
| **Avisos de compra** | Lista produtos com saldo ≤ estoque mínimo; quantidade sugerida = `máx(0, estoque_minimo - saldo)` | Regra fixa; não considera sazonalidade nem histórico |
| **Produção** | BOM por fabricado; “quantidade que dá para construir” = gargalo por insumo (estoque ÷ qtd por unidade) | Cálculo determinístico; sem previsão de demanda |
| **Roteirização** | CRUD veículos e entregas; ordem na rota e data manual; divisão entre veículos manual | Sem otimização de rota nem sugestão de ordem |
| **Vendas** | Cadastro manual de pedido (cliente, itens, preço); confirmação → baixa estoque | Sem foto, sem sugestão de preço ou itens |
| **Compras** | Pedido de compra manual; recebimento → entrada estoque | Sem foto; itens vêm de avisos ou digitação |
| **Estoque** | Cadastro produto, movimentações, conferência, import/export XLSX | Sem previsão de demanda nem sugestão de mínimo |
| **Financeiro** | Contas a pagar/receber, resumo por período | Sem previsão de fluxo nem alertas inteligentes |

**Infraestrutura de IA já presente:** `api/src/lib/openai-helper.ts` — extração de dados a partir de imagem (base64) com GPT-4o, validação de imagem e tratamento de erros. Atualmente o contrato é para **recibo de gasto** (tipo_de_gasto, valor, estabelecimento, itens). Pode ser **reutilizado e estendido** para outros tipos de documento.

---

## 2. Oportunidades de IA (priorizadas)

### 2.1 Pré-preenchimento por foto (alta prioridade, já previsto no negócio)

**Onde:** Vendas (registro de venda) e Compras (pedido de compra).

**Função atual:** Formulário 100% manual; planilha XLSX para importação em estoque; sem uso de foto.

**Oportunidade:**  
Botão “Preencher por foto” → usuária envia foto do papel (pedido de venda ou pedido de compra) → **IA extrai** cliente/fornecedor, data, itens (descrição/código, quantidade, preço) e totais → formulário é **pré-preenchido** para revisão e salvamento.

**Implementação sugerida:**
- **API:** Novo endpoint no módulo **vendas** (ex.: `POST /vendas/extract-from-image`) e no **compras** (ex.: `POST /compras/extract-from-image`) que recebem `imageBase64`, chamam um helper de extração (adaptar `openai-helper.ts` ou criar `extract-sale-order.ts` / `extract-purchase-order.ts`) com prompt específico para:
  - **Venda:** cliente (nome ou identificador), data, itens (descrição, qtd, preço unitário/total), total geral, observações.
  - **Compra:** fornecedor (nome), data, itens (descrição, qtd, preço), total.
- **Frontend:** Botão “Preencher por foto” no `RegistroVendaModal` e no formulário de pedido de compra; upload/câmera → envio da imagem à API → preenchimento dos campos; usuária sempre revisa e confirma.
- **Segurança:** Manter validação de tamanho/formato da imagem; rate limit por usuário; não logar imagens.

**Valor:** Reduz digitação e erros quando o pedido já está anotado em papel; alinhado ao descrito em NECESSIDADES_SISTEMA.md.

---

### 2.2 Quantidade sugerida de compra (IA)

**Onde:** Avisos de compra.

**Função atual:** `quantidade_sugerida = máximo(0, estoque_minimo - saldo)` (só repõe até o mínimo).

**Oportunidade:**  
Sugerir quantidade de compra considerando:
- Histórico de consumo (movimentações de saída por produto e período).
- Sazonalidade (ex.: mais vendas em certos meses).
- Lead time de entrega (se houver dados de prazo do fornecedor).
- Estoque máximo (se cadastrado), para não sugerir compra além do necessário.

**Implementação sugerida:**
- **Dados:** Consultar `movimentacoes_estoque` (saídas) por produto e período; opcional: tabela de lead time por fornecedor/produto.
- **Modelo:** Regressão simples ou modelo de séries temporais (ex.: consumo médio por semana) para prever consumo nos próximos N dias; sugerir compra = `previsão até próximo ciclo - saldo atual`, limitado por estoque_maximo e arredondamento (múltiplo de compra, se houver).
- **Alternativa leve:** Sem ML: “quantidade sugerida = máximo(estoque_minimo - saldo, consumo_medio_30d * semanas_cobertura)” com parâmetro configurável (ex.: 2 semanas). IA pode entrar depois para refinar (sazonalidade, outliers).
- **API:** Novo método no service de avisos que, para cada item abaixo do mínimo, retorna também `quantidade_sugerida_ia` (ou substitui a atual por essa lógica quando habilitada).
- **Frontend:** Exibir quantidade sugerida (e opcionalmente “consumo médio” e “sugestão por regra/por IA”) na tela de Avisos de compra.

**Valor:** Evita comprar em excesso ou a menos; melhora uso de capital e disponibilidade.

---

### 2.3 Ordem de parada na rota (otimização)

**Onde:** Roteirização (entregas por veículo).

**Função atual:** `ordem_na_rota` e `veiculo_id` definidos manualmente; não há “ordem sugerida por proximidade”.

**Oportunidade:**  
Dado um conjunto de entregas (com endereço) e um veículo, **sugerir a ordem de parada** para minimizar distância ou tempo (TSP – Travelling Salesman Problem, ou variante com janelas de tempo).

**Implementação sugerida:**
- **Geocoding:** Ao salvar endereço de entrega (ou ao montar a rota), obter lat/lng via API de geocoding (ex.: Nominatim, Google, Mapbox). Guardar em tabela (ex.: `entregas` ou `pedidos_venda` com `lat`, `lng`) ou cache.
- **Otimização:** Algoritmo heurístico (ex.: nearest neighbour, 2-opt) ou chamada a serviço (Google Routes, OSRM) para sequência de paradas. Não exige “IA generativa”; pode ser apenas algoritmo + APIs de distância/tempo.
- **IA opcional:** Se houver restrições complexas (preferência de cliente, janelas de entrega), um modelo pode sugerir “prioridade” ou “cluster” de entregas por região; a ordem final pode continuar com algoritmo de rota.
- **API:** Endpoint no módulo **roteirizacao** (ex.: `POST /roteirizacao/sugerir-ordem`) que recebe `veiculo_id` e lista de `entrega_id` (ou data) e retorna lista ordenada.
- **Frontend:** Botão “Sugerir ordem da rota” que chama a API e preenche `ordem_na_rota`; usuário pode ajustar manualmente.

**Valor:** Menos km e tempo na entrega; melhor uso dos 2 veículos.

---

### 2.4 Sugestão de preço e itens na venda

**Onde:** Registro de venda (caixa).

**Função atual:** Usuário escolhe produto, quantidade e preço manualmente (com sugestão do preço de venda do cadastro).

**Oportunidade:**  
- **Preço:** Sugerir preço com base em histórico de vendas do mesmo produto (mediana ou média recente), promoções ou regras (ex.: margem mínima). Pode ser regra simples primeiro; IA para preços dinâmicos se houver muitos produtos e variação.
- **Itens:** “Produtos frequentemente comprados junto” (market basket) para sugerir itens adicionais ao pedido; ou “clientes parecidos compraram também X”.

**Implementação sugerida:**
- **Dados:** `itens_pedido_venda` e `pedidos_venda` (histórico); cadastro de produtos.
- **Preço:** Endpoint ou lógica no service de vendas: dado `produto_id`, retornar `preco_sugerido` = último preço usado ou mediana dos últimos N pedidos; fallback para `preco_venda` do produto.
- **Itens sugeridos:** Co-ocorrência de produtos nos mesmos pedidos (contagem); para o produto (ou cliente) atual, retornar top-K produtos “comprados junto”. Pode ser SQL agregado; ML (collaborative filtering ou regras de associação) em fase posterior.
- **Frontend:** Ao selecionar produto, preencher preço com sugestão; em um canto “Também pode interessar” ou “Frequentemente vendidos com este item”.

**Valor:** Agiliza o caixa e pode aumentar ticket médio.

---

### 2.5 Validação de insumos e planejamento de produção

**Onde:** Produção (validação semanal; ordem de produção).

**Função atual:** “Quantidade que dá para construir” = mínimo (por insumo) de `floor(saldo_insumo / quantidade_por_unidade)`; sem previsão de demanda nem sugestão de “quanto produzir”.

**Oportunidade:**  
- **Quanto produzir:** Estimar demanda (vendas recentes + tendência) do produto fabricado e sugerir “produzir até X unidades” (limitado pelo gargalo de insumos).
- **Quando comprar insumos:** Além do aviso “abaixo do mínimo”, avisar “para produzir N unidades do fabricado X, faltam Y do insumo Z”.

**Implementação sugerida:**
- **Demanda:** Média ou mediana de saídas (vendas) dos últimos 30/60 dias por produto fabricado; opcional: tendência com regressão simples.
- **Service:** Novo método no módulo **producao** (ex.: `sugestaoProducao(produtoFabricadoId)`) que retorna: quantidade possível (já existe), consumo médio do fabricado, quantidade sugerida a produzir = mínimo(quantidade_possivel, demanda_prevista_periodo).
- **Avisos de compra:** Para insumos, além de “abaixo do mínimo”, calcular “quanto falta para produzir as próximas K unidades” dos fabricados que usam esse insumo (a partir do BOM); exibir “Recomendado para produção: +X unidades”.
- **Frontend:** Na validação de insumos / ordem de produção, mostrar “Sugestão: produzir N unidades” e “Faltam Y do insumo Z para mais N unidades”.

**Valor:** Produz o necessário sem excesso; compra de insumos alinhada à produção.

---

### 2.6 Estoque mínimo dinâmico

**Onde:** Cadastro de produtos e Avisos de compra.

**Função atual:** `estoque_minimo` e opcionalmente `estoque_maximo` fixos por produto.

**Oportunidade:**  
Sugerir **estoque mínimo** (e máximo) com base em histórico de consumo e variabilidade (desvio padrão), lead time e nível de serviço desejado (ex.: não faltar em 95% dos ciclos). Pode ser fórmula (ex.: mínimo = consumo_medio * (lead_time + periodo_revisao) + segurança) ou modelo que aprende com rupturas passadas.

**Implementação sugerida:**
- **Cálculo:** Consumo médio e desvio nas saídas; lead time (se cadastrado); parâmetro “dias de cobertura” ou “nível de serviço”.
- **API:** Endpoint ou job que calcula `estoque_minimo_sugerido` (e opcionalmente `estoque_maximo_sugerido`) por produto; pode ser exibido no cadastro como “sugestão” sem alterar o valor salvo até o usuário confirmar.
- **Frontend:** Na tela de produto ou na listagem, campo “Sugestão de estoque mínimo (IA)” e botão “Usar sugestão”.

**Valor:** Menos ruptura e menos estoque parado.

---

### 2.7 Previsão de fluxo de caixa e alertas (financeiro)

**Onde:** Módulo financeiro (resumo, contas a pagar/receber).

**Função atual:** Totais e listagens por período; sem previsão nem alertas inteligentes.

**Oportunidade:**  
- **Previsão:** Próximos 7/30 dias: entradas previstas (contas a receber + padrão de recebimento) e saídas (contas a pagar + padrão de pagamento); saldo projetado.
- **Alertas:** “Próxima semana com mais saídas que entradas”; “Cliente X costuma atrasar; valor alto a receber”.

**Implementação sugerida:**
- **Dados:** Contas a pagar/receber com vencimento; histórico de datas de pagamento/recebimento (pago_em, recebido_em) para estimar atrasos.
- **Previsão:** Agregação por dia/semana dos vencimentos + ajuste por “probabilidade de atraso” (média de atraso por tipo/cliente). Pode ser regras primeiro; modelo de classificação (pago no prazo vs atrasado) depois.
- **API:** Endpoint no **financeiro** (ex.: `GET /financeiro/previsao-fluxo?dias=30`) retornando série de saldo projetado e totais; endpoint ou campo “alertas” com mensagens curtas.
- **Frontend:** Gráfico ou tabela “Fluxo previsto (próximos 30 dias)” e caixa de “Alertas”.

**Valor:** Melhor visibilidade e decisão de caixa.

---

### 2.8 Assistente conversacional (futuro)

**Onde:** Sistema como um todo.

**Oportunidade:**  
Chat ou comando em linguagem natural: “Quais produtos estão abaixo do mínimo?”, “Quantas unidades do guarda-roupa dá para produzir?”, “Resumo financeiro da semana”. Backend interpreta a intenção, chama o módulo correspondente e devolve resposta estruturada (e opcionalmente texto gerado).

**Implementação sugerida:**  
Endpoint `POST /api/assistant` com texto do usuário; uso de LLM (ex.: GPT) para classificar intenção e parâmetros; chamadas internas aos services (avisos, produção, financeiro, etc.); resposta em JSON + texto amigável. Exige cuidado com permissões (só dados que o usuário pode ver) e custo de tokens.

**Valor:** Acesso rápido a informações sem navegar várias telas; útil em celular.

---

## 3. Resumo e ordem sugerida de implementação

| # | Oportunidade | Módulo(s) | Complexidade | Impacto | Dependências |
|---|--------------|-----------|--------------|---------|--------------|
| 1 | Pré-preenchimento por foto (venda e compra) | vendas, compras | Média | Alto | openai-helper já existe; adaptar prompt e DTOs |
| 2 | Quantidade sugerida de compra (IA) | avisos-compra | Média | Alto | Histórico de movimentações |
| 3 | Ordem de parada na rota | roteirizacao | Média | Alto | Geocoding; algoritmo ou API de rotas |
| 4 | Sugestão de preço e itens na venda | vendas | Baixa a média | Médio | Histórico de pedidos |
| 5 | Validação/planejamento de produção | producao, avisos-compra | Média | Alto | BOM e movimentações |
| 6 | Estoque mínimo dinâmico | estoque, avisos-compra | Média | Médio | Histórico de saídas |
| 7 | Previsão de fluxo e alertas | financeiro | Média | Médio | Contas e datas de pagamento/recebimento |
| 8 | Assistente conversacional | novo módulo | Alta | Médio | Módulos existentes; LLM |

Recomendação: começar por **1 (foto)** e **2 (quantidade sugerida)** ou **3 (rota)**, pois estão alinhados às dores já documentadas (NECESSIDADES_SISTEMA.md) e, no caso da foto, há base de código para reutilizar.

---

## 4. Considerações técnicas e de segurança

- **API keys:** OpenAI (ou outro provedor) em variável de ambiente; nunca no frontend.
- **Dados sensíveis:** Imagens de documentos não devem ser logadas nem armazenadas além do necessário para a requisição; considerar política de retenção.
- **Rate limiting:** Aplicar em endpoints que chamam IA (foto, assistente) para evitar abuso e custo.
- **Validação:** Todo dado extraído por IA (foto, sugestões) deve ser validado (Zod) e revisável pelo usuário antes de persistir.
- **Auditoria:** Registrar uso de endpoints de IA (quem, quando) para análise de adoção e custo.

Este documento pode ser atualizado conforme novas funções forem implementadas ou novas oportunidades forem identificadas.
