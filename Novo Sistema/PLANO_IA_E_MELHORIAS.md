# Plano – IA e Melhorias (Saldão de Móveis Jerusalém)

Plano de implementação para: **pré-preenchimento por foto** (venda e pedido de compra), **quantidade sugerida de compra (IA)**, **roteirização completa** (cadastro de veículo com dimensões, ordem de parada, aviso de veículo inoperante e reagendamento), **sugestão de preço e itens na venda** e **estoque mínimo dinâmico**.

Documento de referência de necessidades: **NECESSIDADES_SISTEMA.md**. Banco e fases gerais: **PLANO_SISTEMA.md**. Oportunidades de IA: **OPORTUNIDADES_IA.md**.

---

## Visão geral das entregas

| # | Funcionalidade | Módulo(s) | Prioridade |
|---|----------------|-----------|------------|
| 1 | Pré-preenchimento por foto (venda e pedido de compra) | vendas, compras | Alta |
| 2 | Quantidade sugerida de compra (IA) | avisos-compra | Alta |
| 3 | Roteirização: cadastro veículo (dimensões/carga), ordem de parada, veículo inoperante | roteirizacao | Alta |
| 4 | Sugestão de preço e itens na venda | vendas | Média |
| 5 | Estoque mínimo dinâmico | estoque, avisos-compra | Média |

---

# 1. Pré-preenchimento por foto (venda e pedido de compra)

## 1.1 Objetivo

Permitir que a usuária tire foto (ou envie imagem) do papel com o pedido de venda ou do pedido de compra; o sistema extrai os dados e **pré-preenche** o formulário para revisão e salvamento. Sempre com revisão humana antes de salvar.

## 1.2 Escopo

- **Venda:** extrair cliente (nome ou identificação), data, itens (descrição/código, quantidade, preço unitário/total), total geral, observações.
- **Compra:** extrair fornecedor (nome), data, itens (descrição, quantidade, preço), total, observações.

## 1.3 Dependências

- `api/src/lib/openai-helper.ts` já existe (extração por imagem com GPT-4o). Adaptar/estender para dois contratos: **pedido de venda** e **pedido de compra**.
- Variável de ambiente: `OPENAI_API_KEY` (já prevista no projeto).

## 1.4 Banco de dados

Nenhuma alteração. Dados extraídos são usados apenas para preencher o formulário; não há tabela de “rascunho por foto”.

## 1.5 API

| Ação | Endpoint | Descrição |
|------|----------|-----------|
| Extrair venda | `POST /vendas/extract-from-image` | Body: `{ imageBase64: string }`. Resposta: DTO com cliente_nome, data_pedido, itens[], total, observacoes. Itens: descricao ou codigo, quantidade, preco_unitario. |
| Extrair compra | `POST /compras/extract-from-image` | Body: `{ imageBase64: string }`. Resposta: DTO com fornecedor_nome, data_pedido, itens[], total, observacoes. |

- Validação da imagem: reutilizar lógica de `openai-helper.ts` (tamanho, formato base64, tipos JPEG/PNG/WEBP).
- Rate limit: ex.: 20 requisições/minuto por usuário nesses endpoints.
- Autenticação: mesma do módulo (requireAuth).

## 1.6 Backend – tarefas

1. **Criar DTOs e funções de extração**
   - Em `api/src/lib/` (ou em cada módulo): definir tipos TypeScript para resposta de extração de venda e de compra.
   - Criar `extractSaleOrderFromImage(imageBase64, envConfig)` e `extractPurchaseOrderFromImage(imageBase64, envConfig)` usando OpenAI (prompt específico para cada tipo). Retornar JSON estruturado (ex.: lista de itens com descricao, quantidade, preco_unitario).
   - Tratamento de erros e timeout alinhado ao `openai-helper` existente.

2. **Rotas**
   - **vendas:** `POST /vendas/extract-from-image` → valida body (Zod), chama extração de venda, retorna JSON.
   - **compras:** `POST /compras/extract-from-image` → valida body, chama extração de compra, retorna JSON.

3. **Segurança**
   - Não logar imagem nem base64.
   - Rate limit nos dois endpoints.

## 1.7 Frontend – tarefas

1. **Vendas**
   - No formulário de registro de venda (ex.: `RegistroVendaModal`): botão **“Preencher por foto”**.
   - Fluxo: abrir câmera ou seletor de arquivo → obter imagem → converter para base64 (ou FormData, conforme API) → chamar `POST /vendas/extract-from-image` → preencher campos do formulário (cliente sugerido, data, itens, totais). Exibir mensagem “Revise os dados antes de salvar”.
   - Permitir editar qualquer campo após o preenchimento. Opcional: tentar casar “cliente_nome” com cadastro de clientes (select por nome).

2. **Compras**
   - No formulário de pedido de compra: botão **“Preencher por foto”**.
   - Fluxo análogo: imagem → `POST /compras/extract-from-image` → preencher fornecedor, data, itens, totais. Revisão obrigatória; opcional: casar fornecedor_nome com cadastro de fornecedores.

## 1.8 Critérios de aceite

- Usuária envia foto de um pedido de venda anotado em papel e o formulário de venda é preenchido com itens e totais; ela revisa e salva.
- Usuária envia foto de um pedido de compra em papel e o formulário de compra é preenchido; ela revisa e salva.
- Em caso de falha na extração ou imagem ilegível, mensagem clara e possibilidade de nova tentativa ou digitação manual.

---

# 2. Quantidade sugerida de compra (IA)

## 2.1 Objetivo

Na tela de Avisos de compra, além da regra atual **quantidade_sugerida = máximo(0, estoque_minimo - saldo)**, passar a sugerir quantidade considerando **histórico de consumo** (e opcionalmente lead time / estoque máximo), para comprar nem a menos nem a mais que o necessário.

## 2.2 Escopo

- Calcular consumo médio (ex.: últimas 8–12 semanas) por produto a partir de `movimentacoes_estoque` (saídas).
- Sugestão: quantidade que cubra um “período de cobertura” (ex.: 2 semanas) ou reponha até o mínimo, o que for maior; limitar por `estoque_maximo` se existir.
- Manter a quantidade atual “até o mínimo” como fallback quando não houver histórico suficiente.

## 2.3 Banco de dados

- Nenhuma nova tabela obrigatória. Opcional: parâmetro global ou por produto para “semanas de cobertura” (pode ser config no backend ou coluna em `produtos` no futuro).
- Uso de: `produtos`, `movimentacoes_estoque`, view ou query de `saldo_estoque`.

## 2.4 API

- **Alterar** o contrato do endpoint que lista avisos de compra (ex.: `GET /avisos-compra` ou equivalente).
- Resposta: para cada item, manter `quantidade_sugerida` (regra atual) e incluir **quantidade_sugerida_ia** (baseada em consumo) e opcionalmente **consumo_medio_periodo** (ex.: últimas 4 semanas) e **dias_historico**.
- Regra de negócio no service:  
  - Se houver N (ex.: 4) semanas de saídas: `consumo_medio_semanal`; `quantidade_sugerida_ia = max(0, estoque_minimo - saldo, consumo_medio_semanal * semanas_cobertura)`; limitar por `estoque_maximo - saldo` se estoque_maximo preenchido.  
  - Se não houver histórico: `quantidade_sugerida_ia = quantidade_sugerida` (regra atual).

## 2.5 Backend – tarefas

1. **Repository/SQL**
   - Query para obter, por produto, soma de saídas (quantidade em valor absoluto) nas últimas X semanas em `movimentacoes_estoque` (tipo saida/producao/venda etc.).
   - No list de avisos, além dos campos atuais, calcular consumo e quantidade_sugerida_ia no service ou em uma query única.

2. **Service**
   - Implementar lógica de consumo médio e quantidade_sugerida_ia (parâmetro semanas_cobertura ex.: 2; semanas_historico ex.: 8 ou 12).
   - Retornar ambos: quantidade_sugerida (atual) e quantidade_sugerida_ia (e opcionalmente consumo_medio_periodo).

3. **Config**
   - Parâmetros: semanas_cobertura, semanas_historico (constantes ou env).

## 2.6 Frontend – tarefas

1. Na tela **Avisos de compra**: exibir coluna ou campo **Quantidade sugerida (IA)** usando `quantidade_sugerida_ia`.
2. Opcional: exibir “Consumo médio (4 sem)” para transparência.
3. O botão “Gerar pedido de compra” deve usar a quantidade sugerida (pode ser a IA como padrão, com opção de editar na tela de compras).

## 2.7 Critérios de aceite

- Produtos com histórico de saída passam a ter sugestão de compra considerando consumo; produtos sem histórico mantêm sugestão “até o mínimo”.
- Quantidade sugerida não ultrapassa estoque máximo quando cadastrado.
- Interface de avisos mostra a sugestão utilizada e permite gerar pedido de compra com ela.

---

# 3. Roteirização: cadastro de veículo, ordem de parada, veículo inoperante

## 3.1 Objetivo

- **Cadastro de veículo completo:** dimensões de carga (comprimento, largura, altura, peso máximo, volume útil), além dos atuais capacidade_volume e capacidade_itens, para permitir roteirizar respeitando carga.
- **Ordem de parada na rota:** sugestão automática da sequência de entregas por veículo (otimização por proximidade/distância), com possibilidade de ajuste manual.
- **Aviso de veículo inoperante:** marcar veículo como inoperante e **reagendar** todas as entregas previstas para esse veículo (redistribuir para outro veículo e/ou nova data).

## 3.2 Escopo

- Cadastro veículo: campos de dimensões e peso; manter capacidade_volume e capacidade_itens para compatibilidade.
- Endereços: precisamos de coordenadas (lat/lng) para ordenar por proximidade; pode ser obtido via geocoding no momento do cadastro do endereço ou na montagem da rota.
- Ordem de parada: endpoint que recebe veículo + data (ou lista de entregas) e retorna sequência sugerida; endpoint ou fluxo para aplicar a ordem (atualizar ordem_na_rota).
- Veículo inoperante: campo `inoperante` (ou uso de `ativo = false` com motivo); fluxo “Marcar como inoperante” que lista entregas afetadas e permite reagendar (escolher outro veículo e/ou data) em lote.

## 3.3 Banco de dados

### 3.3.1 Tabela `veiculos` – novos campos (migration)

Incluir campos para roteirização e controle de operação:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| **inoperante** | BOOLEAN | default false. True = veículo fora de circulação (avaria, manutenção, etc.). |
| **inoperante_desde** | TIMESTAMPTZ | nullable. Data/hora em que foi marcado inoperante. |
| **inoperante_motivo** | TEXT | nullable. Motivo (ex.: “Manutenção”, “Avaria”). |
| **capacidade_peso_kg** | NUMERIC(12,2) | nullable. Peso máximo em kg. |
| **carga_comprimento_m** | NUMERIC(8,2) | nullable. Comprimento útil da carga em metros. |
| **carga_largura_m** | NUMERIC(8,2) | nullable. Largura em m. |
| **carga_altura_m** | NUMERIC(8,2) | nullable. Altura em m. |

- Manter: capacidade_volume (m³), capacidade_itens, dias_entrega, horario_inicio, horario_fim, ativo, observacoes.

Regra: se `inoperante = true`, o veículo não deve aparecer como opção para novas alocações e deve disparar o fluxo de reagendamento das entregas já alocadas.

### 3.3.2 Geocoding para endereços (opcional na Fase 1)

Para “ordem de parada” por proximidade, é necessário ter coordenadas dos endereços.

- **Opção A:** Adicionar em `pedidos_venda` (ou em uma tabela de endereços) os campos `endereco_lat` e `endereco_lng` (NUMERIC). Preencher ao salvar/editar endereço de entrega (job ou na própria API ao persistir pedido com tipo_entrega = entrega), via serviço de geocoding (Nominatim, Google, Mapbox).
- **Opção B:** Geocoding sob demanda ao montar a rota (sem persistir lat/lng). Mais simples, mas mais chamadas ao provedor.

Recomendação: migration com `endereco_lat`, `endereco_lng` em `pedidos_venda` (nullable); preenchimento pode ser incremental (ao editar endereço ou ao “otimizar rota”).

### 3.3.3 Resumo das migrations sugeridas

1. **008_veiculos_dimensoes_inoperante.sql**
   - ALTER TABLE veiculos ADD COLUMN inoperante BOOLEAN NOT NULL DEFAULT false;
   - ALTER TABLE veiculos ADD COLUMN inoperante_desde TIMESTAMPTZ;
   - ALTER TABLE veiculos ADD COLUMN inoperante_motivo TEXT;
   - ALTER TABLE veiculos ADD COLUMN capacidade_peso_kg NUMERIC(12,2);
   - ALTER TABLE veiculos ADD COLUMN carga_comprimento_m NUMERIC(8,2);
   - ALTER TABLE veiculos ADD COLUMN carga_largura_m NUMERIC(8,2);
   - ALTER TABLE veiculos ADD COLUMN carga_altura_m NUMERIC(8,2);

2. **009_pedidos_venda_geocoding.sql** (opcional para ordem de parada)
   - ALTER TABLE pedidos_venda ADD COLUMN endereco_lat NUMERIC(12,8);
   - ALTER TABLE pedidos_venda ADD COLUMN endereco_lng NUMERIC(12,8);

## 3.4 API – Roteirização

| Ação | Endpoint | Descrição |
|------|----------|-----------|
| Listar veículos | já existe | Incluir novos campos e filtrar por ativo e não inoperante onde fizer sentido. |
| Criar/atualizar veículo | já existe | Incluir inoperante, inoperante_desde, inoperante_motivo, capacidade_peso_kg, carga_*_m. |
| Marcar inoperante | `PATCH /roteirizacao/veiculos/:id/inoperante` | Body: `{ inoperante: true, motivo?: string }`. Resposta: lista de entregas afetadas (ids, datas, pedidos). |
| Reagendar entregas | `POST /roteirizacao/reagendar-entregas` | Body: `{ entrega_ids: string[], novo_veiculo_id?: string, nova_data?: string }`. Atualiza veiculo_id e/ou data_entrega_prevista das entregas. |
| Entregas por veículo inoperante | `GET /roteirizacao/entregas-afetadas-veiculo/:veiculoId` | Retorna entregas com status pendente/em_rota e data_entrega_prevista >= hoje que estão no veículo. Usado ao marcar inoperante. |
| Sugerir ordem da rota | `POST /roteirizacao/sugerir-ordem` | Body: `{ veiculo_id: string, data_entrega: string }` ou `{ entrega_ids: string[] }`. Retorna lista de entrega_id na ordem sugerida (por proximidade se houver lat/lng; senão ordem atual ou por endereço texto). |
| Aplicar ordem da rota | `PATCH /roteirizacao/entregas/ordem` | Body: `{ entrega_ids_ordenados: string[] }`. Atualiza ordem_na_rota de cada entrega conforme a posição na lista. |

## 3.5 Backend – tarefas (roteirização)

1. **Migration 008:** novos campos em `veiculos`; migration 009 opcional (lat/lng em pedidos_venda).
2. **Repository**
   - createVeiculo/updateVeiculo: incluir inoperante, inoperante_desde, inoperante_motivo, capacidade_peso_kg, carga_*_m.
   - listEntregasAfetadasPorVeiculoInoperante(veiculoId): entregas com veiculo_id = X, status em ('pendente','em_rota'), data_entrega_prevista >= hoje.
   - reagendarEntregas(entregaIds, novoVeiculoId?, novaData?): UPDATE entregas SET veiculo_id = ?, data_entrega_prevista = ? WHERE id IN (...).
   - sugerirOrdemRota(veiculoId, dataEntrega): buscar entregas do veículo na data; se houver lat/lng nos pedidos, ordenar por distância (ex.: partir de um “depósito” fixo ou primeira entrega); retornar array de entrega_id na ordem.
   - aplicarOrdemRota(entregaIdsOrdenados): para cada id, atualizar ordem_na_rota = índice (1, 2, 3...).
3. **Service**
   - Marcar inoperante: updateVeiculo(id, { inoperante: true, inoperante_desde: now, inoperante_motivo }); retornar listEntregasAfetadasPorVeiculoInoperante(id).
   - Reagendar: validar ids e permissões; chamar repository reagendarEntregas.
   - Sugerir ordem: chamar repository (e, se for o caso, serviço de geocoding/rotas externo); retornar lista ordenada.
4. **Rotas**
   - PATCH /veiculos/:id/inoperante
   - GET /entregas-afetadas-veiculo/:veiculoId
   - POST /reagendar-entregas
   - POST /sugerir-ordem
   - PATCH /entregas/ordem

## 3.6 Frontend – tarefas (roteirização)

1. **Cadastro de veículo**
   - Formulário com: nome, placa, ativo; dias_entrega, horario_inicio, horario_fim; capacidade_volume (m³), capacidade_itens; **capacidade_peso_kg**, **carga_comprimento_m**, **carga_largura_m**, **carga_altura_m**; observacoes.
   - Seção ou modal “Veículo inoperante”: checkbox **Inoperante** + motivo (texto). Ao marcar, exibir aviso: “Há X entregas agendadas para este veículo. Deseja reagendá-las?”

2. **Aviso de veículo inoperante e reagendamento**
   - Ao marcar veículo como inoperante: chamar `GET /entregas-afetadas-veiculo/:id`. Se houver entregas, exibir tela/modal **“Reagendar entregas”** com lista (pedido, cliente, endereço, data prevista). Opções:
     - **Reagendar em lote:** escolher **novo veículo** e/ou **nova data** e enviar `POST /roteirizacao/reagendar-entregas` com os ids das entregas afetadas.
     - Permitir reagendar apenas parte (seleção) ou todas.
   - Mensagem de sucesso: “X entregas reagendadas.”

3. **Ordem de parada**
   - Na tela de entregas do dia (ou por veículo): botão **“Sugerir ordem da rota”**. Chamar `POST /sugerir-ordem` com veículo e data; exibir lista na ordem sugerida e botão **“Aplicar esta ordem”** que chama `PATCH /entregas/ordem`. Usuário pode arrastar para reordenar antes de aplicar.
   - Se não houver geocoding ainda, a sugestão pode ser por ordem de endereço (texto) ou manter ordem atual; depois integrar API de rotas/geocoding.

4. **Listagem de veículos**
   - Indicar visualmente veículos **inoperantes** (badge ou ícone) e não permitir alocar novas entregas a eles enquanto estiverem inoperantes.

## 3.7 Critérios de aceite

- Cadastro de veículo inclui dimensões de carga (peso, comprimento, largura, altura) e é salvo corretamente.
- Ao marcar veículo como inoperante, o sistema exibe aviso com quantidade de entregas afetadas e permite reagendar (novo veículo e/ou data) em lote.
- Após reagendamento, as entregas aparecem no novo veículo/data e deixam de estar vinculadas ao veículo inoperante.
- Botão “Sugerir ordem da rota” retorna uma ordem de paradas e o usuário pode aplicar ou ajustar manualmente.
- Veículos inoperantes não são oferecidos para novas alocações e ficam sinalizados na listagem.

---

# 4. Sugestão de preço e itens na venda

## 4.1 Objetivo

- **Preço sugerido:** ao selecionar um produto no registro de venda, sugerir preço com base no último preço usado para aquele produto (ou mediana dos últimos N pedidos) com fallback para o preço de venda do cadastro do produto.
- **Itens sugeridos:** exibir “Frequentemente vendidos com este item” (produtos que mais aparecem junto no mesmo pedido) para agilizar inclusão de itens e aumentar ticket.

## 4.2 Escopo

- Dados: `itens_pedido_venda`, `pedidos_venda`, `produtos`. Sem ML pesado na primeira versão: regras e agregados SQL.
- Preço: por produto_id, mediana ou média dos preco_unitario dos últimos 30–60 dias; senão preco_venda do produto.
- Itens junto: co-ocorrência (quando o produto A está no pedido, quais outros produtos aparecem no mesmo pedido); top 5 por produto.

## 4.3 Banco de dados

Nenhuma alteração obrigatória. Apenas consultas a itens_pedido_venda e produtos.

## 4.4 API

| Ação | Endpoint | Descrição |
|------|----------|-----------|
| Preço sugerido | `GET /vendas/sugestao-preco?produto_id=:id` | Retorna { preco_sugerido: number, origem: 'ultimo_pedido' \| 'mediana' \| 'cadastro' }. |
| Itens sugeridos | `GET /vendas/itens-sugeridos?produto_id=:id` ou por lista de produto_ids | Retorna [{ produto_id, descricao, codigo, vezes_junto, preco_venda }] ordenado por vezes_junto (top 5 ou 10). |

## 4.5 Backend – tarefas

1. **Repository/SQL**
   - Preço: SELECT preco_unitario dos itens_pedido_venda onde produto_id = X e pedido confirmado/entregue, ordenar por data, limit 50; calcular mediana no service (ou no SQL com percentile_cont).
   - Itens junto: para produto_id A, listar pedidos que contêm A; desses pedidos, listar outros produto_id com contagem; JOIN produtos para descricao/codigo/preco_venda; ORDER BY contagem DESC LIMIT 5.
2. **Service**
   - getPrecoSugerido(produtoId): se houver histórico, mediana; senão preco_venda do produto.
   - getItensSugeridos(produtoId): co-ocorrência como acima.
3. **Rotas**
   - GET /vendas/sugestao-preco
   - GET /vendas/itens-sugeridos

## 4.6 Frontend – tarefas

1. No formulário de registro de venda, ao selecionar um **produto** em uma linha:
   - Chamar GET /vendas/sugestao-preco?produto_id=X e preencher o campo **preço unitário** com preco_sugerido (usuário pode editar).
2. Opcional: bloco **“Frequentemente vendidos com este item”** (ou “Também pode interessar”) listando itens retornados por GET /vendas/itens-sugeridos; ao clicar, adiciona uma nova linha com esse produto e preço sugerido.

## 4.7 Critérios de aceite

- Ao escolher produto no pedido de venda, o preço unitário é preenchido com sugestão (último/mediana ou cadastro).
- É possível ver e adicionar rapidamente itens “vendidos junto” ao pedido.

---

# 5. Estoque mínimo dinâmico

## 5.1 Objetivo

Sugerir **estoque mínimo** (e opcionalmente **estoque máximo**) por produto com base em histórico de consumo (e variabilidade), lead time e nível de serviço, em vez de depender só do valor fixo digitado. A sugestão é exibida no cadastro do produto para o usuário **aceitar ou ajustar**; não altera automaticamente o valor salvo sem confirmação.

## 5.2 Escopo

- Cálculo: consumo médio diário (ou semanal) a partir de saídas em `movimentacoes_estoque`; desvio padrão opcional; “dias de cobertura” ou “semanas de cobertura” desejadas; lead time em dias (se houver cadastro ou padrão).
- Fórmula sugerida: estoque_minimo_sugerido = consumo_medio_diario * (lead_time_dias + dias_cobertura_seguranca) ou equivalente em semanas. Opcional: adicionar margem por desvio (ex.: 1.5 * desvio).
- Aplicar apenas a produtos com histórico (ex.: pelo menos 4 semanas de movimentação). Para os demais, exibir “Sem histórico suficiente” e manter campo manual.

## 5.3 Banco de dados

- Opcional: coluna em `produtos` para **lead_time_dias** (nullable) para uso na fórmula. Pode ser adicionada em migration.
- Opcional: parâmetro global “dias_cobertura_seguranca” (ex.: 7 ou 14) no backend ou config.

## 5.4 API

| Ação | Endpoint | Descrição |
|------|----------|-----------|
| Sugestão estoque mínimo/máximo | `GET /estoque/produtos/:id/sugestao-estoque` | Retorna { estoque_minimo_sugerido, estoque_maximo_sugerido (opcional), consumo_medio_diario, dias_historico, mensagem? }. |

## 5.5 Backend – tarefas

1. **Repository**
   - Por produto_id: somar saídas (valor absoluto) por dia/semana nas últimas 8–12 semanas; calcular média e opcionalmente desvio.
   - Lead time: se existir campo em produtos, usar; senão constante (ex.: 7 dias).
2. **Service**
   - Calcular estoque_minimo_sugerido e opcionalmente estoque_maximo_sugerido (ex.: mínimo + lote econômico ou múltiplo de compra). Retornar também consumo_medio e dias_historico para transparência.
3. **Rota**
   - GET /estoque/produtos/:id/sugestao-estoque

## 5.6 Frontend – tarefas

1. Na tela de **cadastro/edição de produto** (ou na listagem com expansão):
   - Botão ou seção **“Sugestão de estoque (IA)”** que chama GET /estoque/produtos/:id/sugestao-estoque.
   - Exibir: “Estoque mínimo sugerido: X (baseado em Y dias de consumo)” e “Estoque máximo sugerido: Z” (se houver). Botão **“Usar sugestão”** que preenche os campos estoque_minimo (e estoque_maximo); usuário salva quando quiser.
2. Se não houver histórico suficiente, exibir mensagem e não preencher.

## 5.7 Critérios de aceite

- Para produtos com histórico de saída, o sistema calcula e exibe sugestão de estoque mínimo (e opcionalmente máximo).
- Usuário pode aplicar a sugestão aos campos e salvar; nenhuma alteração automática sem ação do usuário.
- Produtos sem histórico exibem mensagem adequada.

---

# 6. Ordem de implementação sugerida

| Fase | Itens | Motivo |
|------|--------|--------|
| 1 | Roteirização: migration 008 (veículo dimensões + inoperante), cadastro completo, aviso inoperante e reagendamento | Base para uso diário e segurança operacional |
| 2 | Pré-preenchimento por foto (venda e compra) | Alto valor e reuso do openai-helper |
| 3 | Ordem de parada na rota (sugerir e aplicar) + opcional geocoding (migration 009) | Depende do cadastro de veículo e entregas |
| 4 | Quantidade sugerida de compra (IA) | Melhora avisos sem mudar fluxo |
| 5 | Sugestão de preço e itens na venda | Melhora UX do caixa |
| 6 | Estoque mínimo dinâmico + opcional lead_time em produtos | Refina compras e estoque |

Cada fase pode ser entregue em sprints menores (ex.: 1 = migrations + API veículo inoperante; depois frontend cadastro + modal reagendar). O documento **PLANO_SISTEMA.md** pode ser atualizado para referenciar este plano (IA e melhorias) nas “melhorias futuras” já realizadas ou em andamento.

---

# 7. Resumo de migrations e novos endpoints

- **Migrations:**  
  - 008: veiculos (inoperante, inoperante_desde, inoperante_motivo, capacidade_peso_kg, carga_comprimento_m, carga_largura_m, carga_altura_m).  
  - 009 (opcional): pedidos_venda (endereco_lat, endereco_lng).  
  - 010 (opcional): produtos (lead_time_dias) para estoque mínimo dinâmico.

- **Novos endpoints (resumo):**  
  - POST /vendas/extract-from-image  
  - POST /compras/extract-from-image  
  - GET /avisos-compra (alterado: quantidade_sugerida_ia, consumo_medio_periodo)  
  - PATCH /roteirizacao/veiculos/:id/inoperante  
  - GET /roteirizacao/entregas-afetadas-veiculo/:veiculoId  
  - POST /roteirizacao/reagendar-entregas  
  - POST /roteirizacao/sugerir-ordem  
  - PATCH /roteirizacao/entregas/ordem  
  - GET /vendas/sugestao-preco  
  - GET /vendas/itens-sugeridos  
  - GET /estoque/produtos/:id/sugestao-estoque  

Cadastro de veículo (PUT/PATCH) passa a aceitar os novos campos; listagem de veículos retorna inoperante e dimensões.
