# Avaliação de UX — Landing Saldão de Móveis Jerusalém

**Avaliador:** Análise de UX (perspectiva de avaliadora)  
**Objeto:** Página única (WhatsApp, Instagram, localização)  
**Data:** 2025

---

## 1. Objetivo da página e usuários

| Aspecto | Avaliação |
|--------|-----------|
| **Objetivo claro** | ✅ A página comunica bem: ofertas, contato (WhatsApp/Instagram) e onde fica a loja. |
| **Público** | Cliente que busca móveis, ofertas ou quer falar/visitar. O conteúdo está alinhado. |
| **Proposta de valor** | ✅ “Transforme seu lar”, “60% OFF”, “qualidade e preço baixo” aparecem logo no hero. |

**Sugestão:** Incluir horário de funcionamento (ex.: “Seg–Sáb, 9h–18h”) na área da loja reduz dúvidas e aumenta confiança.

---

## 2. Arquitetura da informação e hierarquia

| Aspecto | Avaliação |
|--------|-----------|
| **Estrutura** | ✅ Simples e linear: Hero → Fale Conosco → Nossa Loja → Footer. Fácil de escanear. |
| **Ordem das ações** | ✅ WhatsApp e Instagram antes do mapa é adequado (contato antes de deslocamento). |
| **Títulos de seção** | ✅ “Fale Conosco” e “Nossa Loja” são claros e objetivos. |

**Problema menor:** No mobile, o hero ocupa bastante altura; o primeiro CTA (WhatsApp) pode ficar “abaixo da dobra”. Vale testar encurtar um pouco o hero em telas pequenas ou garantir que um pedaço do botão apareça na primeira tela.

---

## 3. Conversão e CTAs

| Aspecto | Avaliação |
|--------|-----------|
| **Destaque do WhatsApp** | ✅ Cor verde, ícone e texto “Ver catálogo no WhatsApp” deixam a ação óbvia. |
| **Número de CTAs** | ✅ Poucos e focados (2 botões de contato + 2 de navegação no mapa). Sem poluição. |
| **Mensagem pré-preenchida** | ✅ “Gostaria de ver o catálogo de móveis” facilita o primeiro contato. |
| **Risco de confusão** | ⚠️ Os links começam com `href="#"` e são preenchidos por JS. Se o script falhar, o usuário clica e não vai a lugar nenhum. |

**Recomendação:** Usar `href` já válidos no HTML (ex.: `https://wa.me/...`) e, se quiser, o JS só para ajustar a mensagem. Assim o site funciona mesmo com JS desabilitado ou com erro de script.

---

## 4. Acessibilidade

| Aspecto | Avaliação |
|--------|-----------|
| **Contraste** | ✅ Texto claro no fundo escuro do hero; botões com cores fortes (verde, gradiente). |
| **Ícones** | ⚠️ Ícones Font Awesome sem texto alternativo. Quem usa leitor de tela ou vê só ícones pode não entender. |
| **Links** | ⚠️ “Abrir no Google Maps”, “Google Maps”, “Ir com Waze” estão ok; falta `aria-label` em alguns (ex.: “Abrir WhatsApp no app”). |
| **Iframe do mapa** | ✅ Há `title="Localização no mapa"`. |
| **Foco (teclado)** | ⚠️ Não há indicação explícita de foco (outline) nos botões/links. Pode dificultar navegação só por teclado. |

**Recomendações:**
- Incluir `aria-label` nos botões principais (ex.: “Abrir conversa no WhatsApp para ver o catálogo”).
- Garantir `:focus-visible` com outline visível em todos os elementos interativos (links e botões).

---

## 5. Mobile e uso em celular

| Aspecto | Avaliação |
|--------|-----------|
| **Layout responsivo** | ✅ Coluna única no mobile; sidebar vira bloco no topo. |
| **Área de toque** | ✅ Botões altos (padding 20px) e área clicável grande. |
| **Mapa** | ✅ Iframe responsivo; botões “Google Maps” e “Waze” são úteis no celular. |
| **Performance** | ⚠️ Imagem do hero vem de URL externa (Unsplash). Dependência de terceiro e pode ser pesada em 3G. |

**Recomendação:** Considerar hospedar uma versão otimizada da imagem do hero no próprio site e usar `srcset`/`sizes` para mobile.

---

## 6. Consistência visual e identidade

| Aspecto | Avaliação |
|--------|-----------|
| **Paleta** | ✅ Azul, amarelo gold, verde WhatsApp e gradiente Instagram coerentes com o estilo “loja de móveis”. |
| **Tipografia** | ✅ Uso consistente de Montserrat. |
| **Badge “60% OFF”** | ✅ Chama atenção; a animação de pulse pode ser forte para alguns usuários (enjoo). Oferecer opção de reduzir movimento seria ideal (preferência “reduced motion”). |

**Sugestão:** Adicionar no CSS `@media (prefers-reduced-motion: reduce) { .badge-promo { animation: none; } }` para respeitar preferência de acessibilidade.

---

## 7. Conteúdo e confiança

| Aspecto | Avaliação |
|--------|-----------|
| **Endereço** | ✅ Endereço completo no mapa e link para rotas. |
| **Footer** | ✅ Nome da empresa e “Acesso à Gestão” separados; não polui para o cliente. |
| **Falta** | Horário de funcionamento, telefone fixo (se houver) e talvez um número de WhatsApp visível como texto (além do botão) para quem quiser anotar. |

---

## 8. Resumo executivo

| Critério | Nota (1–5) | Comentário |
|----------|------------|------------|
| Clareza do objetivo | 5 | Objetivo e público bem definidos. |
| Hierarquia e escaneabilidade | 5 | Estrutura simples e lógica. |
| Conversão (CTAs) | 4 | CTAs claros; melhorar robustez dos links (href iniciais). |
| Acessibilidade | 3 | Contraste e mapa ok; melhorar foco, aria-labels e reduced motion. |
| Mobile | 4 | Layout e toques bons; atenção à imagem do hero. |
| Consistência visual | 5 | Identidade coerente. |
| Confiança / conteúdo | 4 | Falta horário e, se fizer sentido, telefone/WhatsApp em texto. |

**Nota geral sugerida:** 4,2 / 5 — Landing objetiva e alinhada ao objetivo; melhorias pontuais em acessibilidade, robustez dos links e informação de horário elevariam ainda mais a experiência.

---

## 9. Ações prioritárias (backlog UX)

1. **Alta:** Garantir `href` válidos nos links principais (WhatsApp, Instagram) no HTML.
2. **Alta:** Adicionar `:focus-visible` em links e botões e `aria-label` nos CTAs.
3. **Média:** Incluir horário de funcionamento na seção “Nossa Loja”.
4. **Média:** Desativar animação do badge quando `prefers-reduced-motion: reduce`.
5. **Baixa:** Hospedar e otimizar imagem do hero para mobile; considerar `srcset`.

Se quiser, posso aplicar no código as alterações de acessibilidade e dos `href` (itens 1 e 2).
