// Lista todo texto visível em português nos arquivos do app, com linha,
// para montar o mapa de tradução PT -> ES.
const fs = require('fs');
const alvo = ['app.html', 'index.html', 'catalogo.js', 'acesso.js'];

const ACENTO = /[çãõáéíóúâêôàÇÃÕÁÉÍÓÚÂÊÔÀ]/;
const PALAVRAS = /\b(voce|você|seus|seu|suas|sua|para|com|que|nao|não|esta|está|mais|aqui|agora|todos|toda|todo|cada|quando|onde|como|pelo|pela|dos|das|uma|ser|tem|ja|já|ate|até|sem|bem|ver|abrir|bonus|bônus|pagina|página|video|vídeo|aula|acesso|entrar|sair|erro|email|e-mail|comprou|liberado|bloqueado|projeto|projetos|brinco|brincos|miçanga|micanga|coleção|colecao)\b/i;

const IGNORAR = /^(https?:|\/\/|\.\/|\.\.\/|assets\/|pdf\/|arquivos\/|#|[a-z-]+$|[0-9.,%\s]+$)/i;

let total = 0;
const saida = {};

alvo.forEach(f => {
  if (!fs.existsSync(f)) return;
  const linhas = fs.readFileSync(f, 'utf8').split('\n');
  const achados = [];
  linhas.forEach((l, i) => {
    const lits = [];
    // literais entre aspas simples e duplas
    for (const m of l.matchAll(/'([^'\n]{3,160})'/g)) lits.push(m[1]);
    for (const m of l.matchAll(/"([^"\n]{3,160})"/g)) lits.push(m[1]);
    // texto entre tags
    for (const m of l.matchAll(/>([^<>\n]{3,160})</g)) lits.push(m[1]);
    lits.forEach(s => {
      const t = s.trim();
      if (t.length < 3) return;
      if (IGNORAR.test(t)) return;
      if (!(ACENTO.test(t) || PALAVRAS.test(t))) return;
      achados.push({ linha: i + 1, texto: t });
    });
  });
  const vistos = new Set();
  const u = achados.filter(a => { if (vistos.has(a.texto)) return false; vistos.add(a.texto); return true; });
  saida[f] = u;
  total += u.length;
  console.log('### ' + f + ' — ' + u.length + ' strings');
  u.forEach(a => console.log('  ' + String(a.linha).padStart(4) + ' | ' + a.texto));
});
fs.writeFileSync('_strings.json', JSON.stringify(saida, null, 1));
console.log('\nTOTAL: ' + total);
