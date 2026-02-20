# Módulo Parcelamento

Cadastro de opções de parcelamento no cartão: taxas por número de parcelas (1x sem taxa, 2x em diante com taxa editável).

## Regras de negócio

- **1x no cartão:** sem taxa (0%).
- **2x em diante:** taxa percentual configurável por número de parcelas.
- Na venda, quando o cliente opta por parcelamento, o **total do pedido** já deve incluir a taxa: `total = (subtotal itens + frete) × (1 + taxa/100)`.
- O pedido de venda armazena `parcelas` e `taxa_parcelamento_percentual` para auditoria.

## Endpoints

- `GET /api/parcelamento` — Lista todas as opções (ordenadas por parcelas).
- `GET /api/parcelamento/por-parcelas/:parcelas` — Retorna a opção para N parcelas (uso na tela de vendas).
- `GET /api/parcelamento/:id` — Opção por ID.
- `PATCH /api/parcelamento/:id` — Atualiza taxa (body: `{ taxa_percentual: number }`).
- `PATCH /api/parcelamento/por-parcelas/:parcelas` — Atualiza taxa por número de parcelas.

## Dependências

- Tabela `opcoes_parcelamento` (migration 024).
- Colunas `pedidos_venda.parcelas` e `pedidos_venda.taxa_parcelamento_percentual`.
