# Módulo Custos Operacionais

Suporte à precificação e viabilidade (Fábrica vs Loja): categorias de custo (Aluguel, Luz, Salários, etc.) e lançamento de valores por mês.

- **Categorias:** nome, descrição, **local** (fabrica | loja | comum) para rateio por unidade.
- **Custos por período:** valor_planejado (e opcional valor_realizado) por categoria/ano/mês.
- Ver **CUSTOS_OPERACIONAIS_PRECIFICACAO.md** e **LOJA_COMO_CLIENTE_FABRICA.md**.

## Endpoints

- `GET/POST /categorias` — listar / criar categoria
- `GET/PATCH/DELETE /categorias/:id` — obter / atualizar / excluir categoria
- `GET /categorias/ativas` — apenas ativas (para lançamento do mês)
- `GET /mes?ano=&mes=` — custos do período (lista + totais)
- `POST /mes` — upsert itens do mês (body: { ano, mes, itens: [{ categoria_id, valor_planejado?, valor_realizado?, observacao? }] })
