// Aplica o mapa PT -> ES nos arquivos do app, do texto mais longo para o mais curto
// (assim uma frase inteira e trocada antes de qualquer pedaco dela).
const fs = require('fs');
const mapa = require('./_traducao.json');
const alvo = ['app.html', 'index.html', 'catalogo.js'];

const pares = Object.entries(mapa)
  .filter(([k]) => !k.startsWith('_'))
  .sort((a, b) => b[0].length - a[0].length);

let totalTrocas = 0;
alvo.forEach(f => {
  if (!fs.existsSync(f)) return;
  let s = fs.readFileSync(f, 'utf8');
  let n = 0;
  pares.forEach(([pt, es]) => {
    if (!s.includes(pt)) return;
    const antes = s;
    s = s.split(pt).join(es);
    if (s !== antes) n += antes.split(pt).length - 1;
  });
  fs.writeFileSync(f, s, 'utf8');
  totalTrocas += n;
  console.log(f + ': ' + n + ' trocas');
});
console.log('total: ' + totalTrocas);
