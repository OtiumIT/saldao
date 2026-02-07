# Uso no celular (Mobile First)

O sistema é pensado para **uso prioritário no celular**. Todas as telas devem ser utilizáveis em telas pequenas e com toque.

## O que já está implementado

- **Menu:** No celular o menu lateral vira um **drawer** (abre com o ícone ☰ no topo). Toque no fundo escuro ou navegue para fechar.
- **Header:** Título reduzido (“Saldão de Móveis”), botão Sair e área do usuário com tamanho adequado para toque.
- **Listagens (DataTable):** Em telas pequenas (< 768px) as tabelas viram **cards** (um card por item), em vez de tabela horizontal. Busca e filtros continuam no topo.
- **Botões e inputs:** Altura mínima de **44px** para alvos de toque (recomendação WCAG). Classe `touch-manipulation` para reduzir atraso do toque.
- **Modais:** No mobile o modal ocupa quase a tela (vem de baixo) e pode ser rolado. Botão fechar com área de toque ≥ 44px.
- **Viewport e PWA:** `viewport-fit=cover` e meta para “mobile web app” (incl. iOS). Safe area para notch e home indicator no body.
- **Páginas:** Títulos e botões principais em coluna no mobile; botões “Nova venda”, “Salvar” etc. em largura total no celular quando fizer sentido.

## Como testar no celular

1. Acesse a URL do sistema pelo navegador do celular (ou use as ferramentas de desenvolvedor do Chrome “Toggle device toolbar” para simular).
2. Confira: abrir/fechar menu, listar clientes/produtos/vendas (cards), abrir formulários em modal, preencher e salvar.
3. Em iOS/Android, pode “Adicionar à tela inicial” para abrir como app (sem barra do navegador, se o servidor permitir).

## Dicas para novas telas

- Use `min-h-[44px]` em botões e links importantes.
- Em listas, prefira o **DataTable** (já responsivo) ou uma lista em cards em telas pequenas.
- Evite tabelas com muitas colunas sem scroll ou alternativa em cards.
- Modais: o componente `Modal` já está ajustado; mantenha conteúdo rolável se for longo.
