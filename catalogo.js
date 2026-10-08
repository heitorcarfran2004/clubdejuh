// Catalogo da area de membros. Tudo que a home e o leitor mostram sai daqui.
//
// Ao trocar um livro de lugar ou acrescentar paginas, mexa SO neste arquivo:
// nem a home nem o leitor tem conteudo escrito no HTML.
//
// `paginas` e a CONTAGEM, e os arquivos precisam existir como
// assets/livros/<slug>/pag-001.webp ate pag-<paginas>.webp, com 3 digitos.
// Quem gera esses webp e o scripts/app-paginas.sh.
//
// `pdf` e o caminho do arquivo para download. Os PDFs vivem em arquivos/, que esta
// no .gitignore por causa do tamanho (o principal tem 241 MB). Em producao isso vira
// URL assinada de storage — ver o README.

const CATALOGO = {
  // o acesso grande da home
  principal: {
    slug: 'principal',
    titulo: '100 Proyectos de Aretes de Chaquira',
    paginas: 101,
    capa: 'assets/capas/principal.webp',
    pdf: 'pdf/100-brincos.pdf',
  },

  // o carrossel horizontal
  bonus: [
    // Entrou em 13/09/2026 como Bono 1, na frente dos outros cinco. Os slugs antigos
    // ficaram como estavam de propósito: o progresso de leitura é salvo por slug, e
    // renumerar b1..b5 faria quem já estava lendo abrir no livro errado.
    { slug: 'cristal', titulo: 'Aretes de Cristal con Chaquiras', sub: 'Flecos, borlas y cascadas de fiesta y de novia',
      paginas: 21, capa: 'assets/capas/cristal.webp', pdf: 'pdf/bonus-cristal.pdf' },
    { slug: 'b1', titulo: 'Tabla de Conversión de Colores', sub: 'Qué chaquira comprar a partir del nombre del color',
      paginas: 10, capa: 'assets/capas/b1.webp', pdf: 'pdf/bonus-1-cores.pdf' },
    { slug: 'b2', titulo: 'Guía de Acabado Profesional', sub: 'El detalle que hace que la pieza parezca de tienda',
      paginas: 8, capa: 'assets/capas/b2.webp', pdf: 'pdf/bonus-2-acabamento.pdf' },
    { slug: 'b3', titulo: 'Cuadrículas en Blanco para Crear', sub: 'Imprime y dibuja tu propio modelo',
      paginas: 10, capa: 'assets/capas/b3.webp', pdf: 'pdf/bonus-3-grades.pdf' },
    { slug: 'b4', titulo: 'Cómo Poner Precio y Vender', sub: 'La cuenta que muestra cuánto vale tu arete',
      paginas: 8, capa: 'assets/capas/b4.webp', pdf: 'pdf/bonus-4-precificar.pdf' },
    { slug: 'b5', titulo: 'Lista de Compras para Principiantes', sub: 'Qué comprar, cuánto, y dónde no ahorrar',
      paginas: 8, capa: 'assets/capas/b5.webp', pdf: 'pdf/bonus-5-compras.pdf' },
  ],

  // "Productos Extra" — os order bumps da coleção de miçanga.
  //
  // Quem comprou (o slug está nos itens do ACESSO, ver acesso.js) vê "Abrir ahora" e
  // o material na Biblioteca. Quem não comprou vê o preço e o botão vai para o
  // `checkout`: o checkout PRÓPRIO de cada extra na Wiapy (criados em 19/09/2026), que o
  // webhook reconhece pelo ID (supabase/functions/wiapy-webhook/mapa.ts). `por` é o preço dele.
  //
  // `paginas` inclui a capa, que é a página 1 de cada um.
  ofertas: [
    // Chegou pronto em PDF (14/09/2026), nao foi gerado aqui: a capa e a pagina 1 e cada
    // receita ocupa de 1 a 3 paginas — ficha, pecas com medida e montagem.
    { slug: 'bolsas', titulo: '50 Bolsos de Chaquira',
      sub: 'Bolsitas tejidas en chaquira, con las medidas de cada pieza.',
      paginas: 67, de: 'R$ 37', por: 'R$ 7,90',
      capa: 'assets/capas/bolsas.webp',
      pdf: 'pdf/50-bolsas.pdf', checkout: 'https://pay.wiapy.com/YOH8Rreo3o5b' },
    { slug: 'pulseiras', titulo: '50 Pulseras de Chaquira',
      sub: 'Patrones étnicos, florales y geométricos tejidos en telar.',
      paginas: 51, de: 'R$ 37', por: 'R$ 5,90',
      capa: 'assets/capas/pulseiras.webp',
      pdf: 'pdf/50-pulseiras.pdf', checkout: 'https://pay.wiapy.com/uMSvSsFhBn11' },
    { slug: 'colares', titulo: '50 Collares de Chaquira',
      sub: 'Collares de crochet con chaquira, del clásico al colorido.',
      paginas: 51, de: 'R$ 37', por: 'R$ 5,90',
      capa: 'assets/capas/colares.webp',
      pdf: 'pdf/50-colares.pdf', checkout: 'https://pay.wiapy.com/WZKGko4yyyCb' },
    { slug: 'pingentes', titulo: '30 Dijes de Chaquira',
      sub: 'Figuras tejidas para colgar en cadena o cordón.',
      paginas: 31, de: 'R$ 27', por: 'R$ 4,90',
      capa: 'assets/capas/pingentes.webp',
      pdf: 'pdf/30-pingentes.pdf', checkout: 'https://pay.wiapy.com/zORuhG_La39-' },
    { slug: 'tiaras', titulo: '16 Diademas de Chaquira',
      sub: 'Diademas forradas de chaquira, de lo folclórico a lo colorido.',
      paginas: 17, de: 'R$ 27', por: 'R$ 3,90',
      capa: 'assets/capas/tiaras.webp',
      pdf: 'pdf/16-tiaras.pdf', checkout: 'https://pay.wiapy.com/wCBOlLHfvLlt' },
  ],

  // Onde se compra o que não veio no pedido. `bonus` é o Completo com 30% (R$ 16,90):
  // quem levou o Essencial compra de novo e o webhook libera os bonos. `videos` é o
  // checkout próprio dos videos, com o mesmo preço do upsell.
  compra: {
    bonus: { preco: 'R$ 16,90', link: 'https://pay.wiapy.com/I2XmXHKdXFVQ' },
    videos: { preco: 'R$ 19,90', link: 'https://pay.wiapy.com/checkout/6aa1e01db0c1c48195cf0ef8' },
  },

  // A aba de VÍDEOS. Não se chama "aula" em lugar nenhum, e os videos não são
  // numerados: no Wistia eles estão salvos como "clase 28", "clase 29"..., mas isso é
  // nome interno. O que identifica cada um na tela é a própria miniatura, que mostra
  // o brinco sendo feito.
  //
  // A lista de IDs vive em scripts/videos-wistia.txt. Para acrescentar vídeo novo:
  // cole o ID lá e rode `node scripts/app-videos.cjs` — ele busca duração e miniatura
  // no Wistia e atualiza o videos.json, que é o que a tela lê.
  videos: [{"id":"pjh6edg1tl","seg":1482},{"id":"1ofxlnctxi","seg":2201},{"id":"9zaahkc7sy","seg":1579},{"id":"sp13kzjlzr","seg":1531},{"id":"kcq4dwifgv","seg":1783},{"id":"kahrxg4lhi","seg":509},{"id":"xy1n485cm0","seg":611},{"id":"xjbv36ju9k","seg":1586},{"id":"vrysu6vt8n","seg":1386},{"id":"ym8ea0ctyb","seg":1052},{"id":"do7yw5uibu","seg":611},{"id":"p32lu1e0qt","seg":1428},{"id":"93piosixt2","seg":1088},{"id":"7tkn8duk3d","seg":1621},{"id":"n2s46x6z8n","seg":1856},{"id":"hb7il0jwwq","seg":1561},{"id":"h4j2cl7tde","seg":1689},{"id":"vqxqn22dsu","seg":1295},{"id":"46yy15jkwt","seg":1182},{"id":"sqcgkwta8t","seg":780},{"id":"p4y1dfjuk2","seg":1611},{"id":"bcgfsmq4x5","seg":1471},{"id":"8wujl2yq0d","seg":1699},{"id":"q4h974by6l","seg":1380},{"id":"enhx0atgkm","seg":1843},{"id":"o0m2b395w2","seg":1426},{"id":"es4g9vdtbm","seg":1474},{"id":"m0tm2zybfk","seg":1847},{"id":"a52tibkt1i","seg":943},{"id":"qwlmgt3ek5","seg":1199},{"id":"strthc7pna","seg":1652},{"id":"osduervzd9","seg":929},{"id":"idg3gft3mu","seg":1673},{"id":"hd5vue17ao","seg":1208},{"id":"w54q61clcu","seg":1516},{"id":"5qa1w8w4bl","seg":1238},{"id":"0p5597u7fs","seg":1133},{"id":"g1yrd0xj8d","seg":1169},{"id":"q4qyautx2p","seg":1192},{"id":"cuc4mkahcv","seg":1656},{"id":"ooo4yj7lxi","seg":1325},{"id":"bllxp4xhwo","seg":1694},{"id":"i4nlux6p73","seg":1001},{"id":"9afdhi9f91","seg":1694},{"id":"y99jpgq1s9","seg":1488}],

  // O GRÁFICO DE CADA VÍDEO, pelo ID do Wistia. Aparece embaixo do player, com a página
  // em assets/graficos/<id>.webp e o PDF de uma página em pdf/graficos/<id>.pdf.
  // O nome é do brinco, não do vídeo: continua sem "aula" e sem número.
  // Gerado por `node scripts/app-graficos.cjs` — não edite à mão entre os marcadores.
  // <graficos>
  graficos: {
    "pjh6edg1tl": {"nome":"Caveira Mexicana","nivel":"Medio","tamanho":"4 cm de altura","tecnica":"Figura chapada"},
    "1ofxlnctxi": {"nome":"Trio de Flores","nivel":"Fácil","tamanho":"6 cm de comprimento","tecnica":"Figura chapada"},
    "9zaahkc7sy": {"nome":"Mandala Dourada","nivel":"Avanzado","tamanho":"4,5 cm de diámetro","tecnica":"Rosetón"},
    "sp13kzjlzr": {"nome":"Losango Huichol","nivel":"Medio","tamanho":"7 cm de comprimento","tecnica":"Con flecos"},
    "kcq4dwifgv": {"nome":"Pena Tropical","nivel":"Avanzado","tamanho":"12 cm de comprimento","tecnica":"Con flecos"},
    "kahrxg4lhi": {"nome":"Estrela Vermelha","nivel":"Medio","tamanho":"3,5 cm de diámetro","tecnica":"Rosetón"},
    "xy1n485cm0": {"nome":"Asa de Arara","nivel":"Avanzado","tamanho":"12 cm de comprimento","tecnica":"Con flecos"},
    "xjbv36ju9k": {"nome":"Girassol","nivel":"Medio","tamanho":"4 cm de diámetro","tecnica":"Rosetón"},
    "vrysu6vt8n": {"nome":"Flor e Franja Azul","nivel":"Avanzado","tamanho":"11 cm de comprimento","tecnica":"Con flecos"},
    "ym8ea0ctyb": {"nome":"Chuva Vermelha","nivel":"Medio","tamanho":"11 cm de comprimento","tecnica":"Con flecos"},
    "do7yw5uibu": {"nome":"Cometa","nivel":"Avanzado","tamanho":"12 cm de comprimento","tecnica":"Con flecos"},
    "p32lu1e0qt": {"nome":"Diamante Asteca","nivel":"Medio","tamanho":"6 cm de comprimento","tecnica":"Con flecos"},
    "93piosixt2": {"nome":"Noche Lila","nivel":"Avanzado","tamanho":"11 cm de comprimento","tecnica":"Con flecos"},
    "7tkn8duk3d": {"nome":"Pluma de Pavo Real","nivel":"Avanzado","tamanho":"12 cm de comprimento","tecnica":"Con flecos"},
    "n2s46x6z8n": {"nome":"Corazones","nivel":"Fácil","tamanho":"6 cm de comprimento","tecnica":"Figura chapada"},
    "hb7il0jwwq": {"nome":"Floco de Neve","nivel":"Medio","tamanho":"10 cm de comprimento","tecnica":"Con flecos"},
    "h4j2cl7tde": {"nome":"Sol Asteca","nivel":"Avanzado","tamanho":"11 cm de comprimento","tecnica":"Con flecos"},
    "vqxqn22dsu": {"nome":"Tucano","nivel":"Avanzado","tamanho":"10 cm de comprimento","tecnica":"Con flecos"},
    "46yy15jkwt": {"nome":"Arara Vermelha","nivel":"Avanzado","tamanho":"11 cm de comprimento","tecnica":"Con flecos"},
    "sqcgkwta8t": {"nome":"Galaxia","nivel":"Avanzado","tamanho":"12 cm de comprimento","tecnica":"Con flecos"},
    "p4y1dfjuk2": {"nome":"Pluma del Atardecer","nivel":"Avanzado","tamanho":"12 cm de comprimento","tecnica":"Con flecos"},
    "bcgfsmq4x5": {"nome":"Gota Arcoíris","nivel":"Medio","tamanho":"6 cm de comprimento","tecnica":"Figura chapada"},
    "8wujl2yq0d": {"nome":"Melancia","nivel":"Medio","tamanho":"8 cm de comprimento","tecnica":"Con flecos"},
    "q4h974by6l": {"nome":"Sandía con Flecos","nivel":"Medio","tamanho":"11 cm de comprimento","tecnica":"Con flecos"},
    "enhx0atgkm": {"nome":"Roseta Verde","nivel":"Avanzado","tamanho":"11 cm de comprimento","tecnica":"Con flecos"},
    "o0m2b395w2": {"nome":"Olho Marrom","nivel":"Medio","tamanho":"6 cm de comprimento","tecnica":"Figura chapada"},
    "es4g9vdtbm": {"nome":"Mandala Azul","nivel":"Avanzado","tamanho":"4,5 cm de diámetro","tecnica":"Rosetón"},
    "m0tm2zybfk": {"nome":"Arcoíris Nocturno","nivel":"Fácil","tamanho":"5 cm de comprimento","tecnica":"Con flecos"},
    "a52tibkt1i": {"nome":"Cascata Rosa","nivel":"Medio","tamanho":"11 cm de comprimento","tecnica":"Con flecos"},
    "qwlmgt3ek5": {"nome":"Cascata Azul","nivel":"Medio","tamanho":"11 cm de comprimento","tecnica":"Con flecos"},
    "strthc7pna": {"nome":"Flor da Noite","nivel":"Avanzado","tamanho":"12 cm de comprimento","tecnica":"Con flecos"},
    "osduervzd9": {"nome":"Folha Azul","nivel":"Medio","tamanho":"8 cm de comprimento","tecnica":"Con flecos"},
    "idg3gft3mu": {"nome":"Dupla Roseta","nivel":"Avanzado","tamanho":"11 cm de comprimento","tecnica":"Con flecos"},
    "hd5vue17ao": {"nome":"Espiral Vermelha","nivel":"Medio","tamanho":"7 cm de comprimento","tecnica":"Figura chapada"},
    "w54q61clcu": {"nome":"Rosa Vermelha","nivel":"Avanzado","tamanho":"4 cm de diámetro","tecnica":"Rosetón"},
    "5qa1w8w4bl": {"nome":"Flor Lila","nivel":"Medio","tamanho":"4 cm de diámetro","tecnica":"Rosetón"},
    "0p5597u7fs": {"nome":"Caminho de Flores","nivel":"Medio","tamanho":"8 cm de comprimento","tecnica":"Figura chapada"},
    "g1yrd0xj8d": {"nome":"Rede Rosa","nivel":"Medio","tamanho":"7 cm de comprimento","tecnica":"Con flecos"},
    "q4qyautx2p": {"nome":"Flor Rosa Gigante","nivel":"Avanzado","tamanho":"5 cm de diámetro","tecnica":"Rosetón"},
    "cuc4mkahcv": {"nome":"Gota Magenta","nivel":"Avanzado","tamanho":"9 cm de comprimento","tecnica":"Con flecos"},
    "ooo4yj7lxi": {"nome":"Flor e Cascata","nivel":"Avanzado","tamanho":"10 cm de comprimento","tecnica":"Con flecos"},
    "bllxp4xhwo": {"nome":"Cascata Turquesa","nivel":"Avanzado","tamanho":"13 cm de comprimento","tecnica":"Con flecos"},
    "i4nlux6p73": {"nome":"Argola Franjada","nivel":"Medio","tamanho":"10 cm de comprimento","tecnica":"Con flecos"},
    "9afdhi9f91": {"nome":"Flor Azul con Flecos","nivel":"Avanzado","tamanho":"11 cm de comprimento","tecnica":"Con flecos"},
    "y99jpgq1s9": {"nome":"Rosa de los Vientos","nivel":"Avanzado","tamanho":"4,5 cm de diámetro","tecnica":"Rosetón"},
  },
  // </graficos>
};

// o leitor acha qualquer material pelo slug: principal, bonos ou extra
CATALOGO.porSlug = (slug) =>
  slug === 'principal' ? CATALOGO.principal
    : CATALOGO.bonus.find(b => b.slug === slug)
    || CATALOGO.ofertas.find(o => o.slug === slug);

// o item de acesso que libera cada material (os itens vêm do acesso.js)
CATALOGO.itemDe = (slug) =>
  slug === 'principal' ? 'principal'
    : CATALOGO.bonus.some(b => b.slug === slug) ? 'bonus'
    : slug;
