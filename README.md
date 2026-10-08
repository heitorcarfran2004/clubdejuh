# Miçangas da Juh — app de membros

Área de entrega do produto, em produção em clubedajuh.vercel.app. O acesso é ligado à
Wiapy desde 19/09/2026 — ver **Acesso e Wiapy**, logo abaixo.

    node servidor.cjs     # http://localhost:4190

## Acesso e Wiapy

Cada venda aprovada na Wiapy vira linhas em `membros_compras` (Supabase do Cofre de
Ofertas, projeto `dxybmayffxvepmwbyezc`, tabelas com prefixo `membros_`): um e-mail, um
item liberado, o pagamento e o status. O login pergunta à Edge Function
`membros-acesso` o que aquele e-mail tem, e o app mostra conforme.

    Wiapy ──webhook──▶ wiapy-webhook ──▶ membros_compras ◀── membros-acesso ◀── login / app

| item | libera | vem de |
|---|---|---|
| `principal` | os 100 projetos | checkout principal, qualquer oferta |
| `bonus` | os 6 bônus | ofertas do Completo (R$ 25,90, 16,90 e 8,90) — o Essencial de R$ 10 não traz |
| `bolsas` … `tiaras` | cada Produto Extra | order bump no checkout, ou o link avulso dele (botão do app) |
| `videos` | a aba de vídeos | upsell (R$ 19,90) ou downsell (R$ 9,90) |

- **A regra mora num lugar só:** `supabase/functions/wiapy-webhook/mapa.ts`, com os IDs
  de checkout, oferta e order bump. Produto novo na Wiapy = uma linha ali + redeploy.
- **Webhook na Wiapy:** Integrações → "Área de membros Miçangas (clubedajuh)", em
  **Todos os checkouts** (sem isso o order bump comprado avulso não chega), eventos
  aprovado, estornado e chargeback. O token vai no header `Authorization` e fica em
  `membros_config.wiapy_token`. Estorno e chargeback tiram o item.
- **`membros_eventos`** guarda o corpo cru de toda venda da miçanga, para conferir e
  reprocessar se o formato mudar. Venda de outros produtos entra sem o corpo.
- **Vendas antigas:** importadas em 19/09 pelo `scripts/membros-importar.cjs`, que
  reenvia cada venda ao próprio webhook (a regra não duplica).
- **GGCheckout (04 a 09/09) NÃO está na base.** Por isso e-mail sem registro entra com
  `principal` + `bonus` (`SEM_REGISTRO` no `acesso.js`). Order bumps e vídeos só abrem
  com compra registrada. Importada a lista do GGCheckout, trocar `SEM_REGISTRO` por `[]`.
- **O app confere de novo** ao abrir e sempre que volta a ficar visível — quem sai para o
  checkout de um extra e volta já encontra liberado.
- **É trava de tela, não de arquivo:** páginas e PDFs são estáticos e abrem por URL
  direta. E login só por e-mail não é segredo: quem souber o e-mail de uma aluna entra
  como ela. Se isso pesar, link mágico ou código de 6 dígitos por e-mail.

## As telas

`index.html` — **login**, com a logo da marca.
`app.html` — **todas as outras**, num arquivo só, trocando de tela pelo hash:

| hash | tela |
|---|---|
| `#/` | início |
| `#/biblioteca` | todos os materiais numa lista |
| `#/loja` | as ofertas |
| `#/perfil` | a conta |
| `#/ler/principal` | leitor da coleção, na última página lida |
| `#/ler/b3/7` | leitor do bônus 3 abrindo direto na página 7 |

Um arquivo só porque trocar de aba não pode recarregar — recarregar perderia a posição
de leitura e piscaria a tela inteira a cada toque.

## O que dá a cara de app

Isso aqui não é um site com telas: as decisões abaixo são o que separa uma coisa da outra.

- **top bar fixa com a logo** e um subtítulo que muda conforme a aba
- **barra de navegação embaixo** com quatro abas — Início, Biblioteca, Loja, Perfil —
  todas com conteúdo de verdade, nenhuma decorativa
- **tudo que é tocável afunda** (`.toque`), em vez de mudar de cor no hover
- **sombra em vez de borda** nos cards, e cantos de 17 a 22 px
- **`env(safe-area-inset-*)`** no topo, no rodapé e na lupa, para o notch e a barra
  de gestos do iPhone
- **`apple-touch-icon` e `apple-mobile-web-app-capable`**, então salvar na tela de
  início abre em tela cheia, com o ícone da Juh
- **a top bar fica em todas as telas, leitor incluído** — ela é a marca, e sumir com ela
  deixava a tela de leitura órfã, parecendo outro site. Só a barra de abas some durante a
  leitura, para não brigar com o botão de baixar nem roubar altura de quem está lendo

## Início

1. **continue de onde parou** — capa, título e **barra de progresso** com a página e o
   percentual; o botão diz "Continuar lendo" ou "Começar agora" conforme o caso
2. **seus bônus** — carrossel com os 5, cada um com o selo do número
3. **adquira também** — os orderbumps em lista horizontal: miniatura à esquerda; nome,
   páginas e botão empilhados à direita

A saudação e o avatar usam o e-mail do login (`sessionStorage`) só para o primeiro nome.

## Biblioteca

O principal e os cinco bônus na mesma lista, cada linha mostrando as páginas e onde a
pessoa parou. É o mesmo componente `.linha` da loja.

**A miniatura respeita a proporção da página (1055/1491), e não é quadrada.** Em quadrado
o `object-fit: cover` corta exatamente a faixa do título da capa, e todas as linhas
ficam parecidas.

## O leitor

A ordem pedida, de cima para baixo: nome do livro centralizado no topo · seta de volta à
esquerda, uma linha abaixo · a página · setas nas laterais · números de paginação · botão
de baixar o PDF. O que mudou foi o tratamento.

**O cabeçalho é um cartão branco** preso embaixo da top bar, com o nome do livro no
centro, o tipo e a contagem logo abaixo, o botão Home à esquerda, um chip "57 de 101" à
direita e a **barra de progresso da leitura** fechando o bloco.

**O fundo da tela de leitura é mais fechado** que o do resto do app (`--leitura`). É o
que faz a página clara saltar; no creme da home ela sumia dentro do fundo.

**As setas flutuam sobre as bordas da página** no celular, e saem para fora dela assim
que a tela dá espaço — o `max()` no `left`/`right` faz as duas coisas com uma regra só.
Em coluna própria, como estavam antes, elas roubavam largura justo de quem mais precisa:
a página. Na primeira e na última página a seta correspondente some, em vez de ficar
apagada ocupando espaço.

**A régua de números vive numa faixa branca própria**, e os números são círculos de
largura fixa — retângulo arredondado tem cara de menu de site. São 36 px com fonte de
12 px porque o maior número da coleção tem três dígitos (101).

**O botão de baixar mora num cartão com título e explicação**, bem separado da régua.
Colado nela ele parecia parte da paginação, e ninguém entendia que ali se leva o material
inteiro. O texto diz quantas páginas tem o PDF, que serve para imprimir os gráficos e que
o arquivo é dela para sempre.

**As páginas são imagens, não PDF renderizado.** Uma `.webp` por página em
`assets/livros/<slug>/pag-001.webp`. É mais leve que PDF.js, abre na hora e não depende
de biblioteca externa. O PDF continua existindo, mas só no botão de baixar.

O progresso fica em `localStorage` (`pag:<slug>`), por livro.

A página vizinha e a seguinte são pré-carregadas — sem isso a virada mostra papel em
branco por meio segundo.

Toque na página abre ela ampliada, com scroll e pinça. Sem isso o gráfico de miçanga não
dá para ler no celular.

## A virada de página

Uma folha só, com duas faces: a frente é a página atual e o verso é papel creme liso.
Ela gira em torno da lateral esquerda, e a página de destino aparece por baixo — avançar
gira de 0° a −180°, voltar começa em −180° e vem até 0°.

Arrastar acompanha o dedo grau a grau. Passou de 32% do caminho, completa; não passou,
desfaz. As setas, os números e as setas do teclado usam a mesma animação.

**Três armadilhas que já morderam aqui, todas no mesmo efeito:**

- **`touch-action: pan-y` no `.palco` é obrigatório.** Sem isso o navegador entende o
  gesto horizontal como rolagem, cancela o pointer no meio e a folha simplesmente não
  vira no celular. No desktop com mouse funcionava, o que esconde o problema.
- **A folha não pode ter `overflow: hidden`.** `overflow` cria contexto de empilhamento e
  anula o `transform-style: preserve-3d`. O recorte vai nas `.face`.
- **`will-change` na folha só pode listar `transform`.** Com `opacity` junto, o 3D achata
  do mesmo jeito e o `backface-visibility` para de valer: em vez do verso de papel,
  aparece a própria página espelhada no meio do giro.

Os três sintomas são diferentes, a causa é a mesma família. Ao mexer no efeito, conferir
os três.

**A tela precisa estar visível antes de `pintar()`.** O `abrirLeitor` chama
`mostrar('leitor')` primeiro de propósito: com a tela em `display:none`, o `offsetLeft`
dos números vale 0, a faixa não rola, e abrir a coleção na página 57 mostrava a faixa
parada no 1.

**`width:auto` não encolhe um `display:flex`.** O botão de baixar é flex e, sendo
block-level, `width:auto` vale 100% — no desktop ele atravessava a tela inteira. Quem
encolhe é `display:inline-flex`.

**A folha fica oculta (`.parada`) enquanto ninguém está virando página.** Com ela visível
por cima, carregando `will-change:transform` e `preserve-3d`, o Chrome promovia a página
a camada de composição, rasterizava o bitmap uma vez e reusava — a página abria nítida e
perdia definição cerca de um segundo depois, quando a promoção acontecia. Parado, quem
aparece é o `.fundo`, que é 2D puro e desenha na resolução real da tela; a folha só entra
em cena no `preparar()`, e o `will-change` vem junto com ela (`.folha:not(.parada)`).

**Esse defeito não aparece em screenshot por CDP** — `Page.captureScreenshot` renderiza
fora do pipeline de composição e devolve sempre o quadro nítido. Para conferir de novo,
é no navegador de verdade, olhando a tela por alguns segundos.

Quem tem `prefers-reduced-motion` recebe a troca sem animação.

## Os arquivos de página

    bash scripts/app-paginas.sh

Lê os PNG de `Downloads/Brincos Miçanga/Entregável/Em imagem` (a coleção) e de
`entregaveis/bonus-micanga/paginas/` (os bônus) e gera os webp a 1055 px, que é o tamanho
nativo em que o ChatGPT entregou. Reduzir mais começa a comer o gráfico.

São 145 páginas e 29 MB no total. **A contagem tem que bater com o campo `paginas` do
`catalogo.js`** — o leitor confia nesse número para saber onde a última página está.

## O catálogo

Todo o conteúdo da home e do leitor sai do `catalogo.js`. Nem a home nem o leitor têm
texto escrito no HTML: para acrescentar um bônus ou trocar uma oferta, mexe-se só ali.

## O que ainda não está ligado

**PDFs.** Ficam em `arquivos/`, que está no `.gitignore`: a coleção sozinha tem 241 MB e
os cinco bônus somam mais 100 MB. Localmente o botão de baixar funciona porque os
arquivos estão lá; **em produção esse caminho não existe** e o botão vai dar 404. Antes
de subir, os PDFs precisam ir para um storage e o campo `pdf` do catálogo virar a URL de
lá — de preferência assinada e com validade, senão o link vaza e o produto circula.

**Capas das ofertas.** São páginas internas dos outros produtos, não capas de verdade.
Funciona para validar, mas capa própria converte melhor.

**Suporte.** O link "Falar com o suporte" no perfil aponta para `https://wa.me/` sem
número.

## Identidade

A marca do app é **Miçangas da Juh** — a logo circular em `assets/logo-*`, que manda no
rosa como cor primária. O turquesa desceu para ação secundária (baixar o PDF, botão
"Abrir" da biblioteca) e o creme virou o fundo.

Fontes iguais às do funil (`funis/brincos-micanga`): Fraunces nos títulos, Inter no
texto. Ao mexer numa das duas pontas, vale olhar a outra — quem compra vê as duas em
sequência, e a página de vendas ainda usa o turquesa como cor principal.

A logo tem três tamanhos porque cada um tem um uso: `logo-96` na top bar, `logo-192`
no login e no perfil, `logo-180.png` no `apple-touch-icon` (o iOS não aceita webp aí).
