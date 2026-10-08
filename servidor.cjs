// Servidor local para conferir o app de membros EM ESPANHOL antes de subir.
//   node servidor.cjs   ->  http://localhost:4191
//
// As paginas do produto em espanhol ainda nao existem, entao o que nao estiver
// nesta pasta e buscado na pasta do app em portugues (assets/, pdf/, arquivos/).
// Assim da para ver a interface traduzida com imagens de verdade.
const http = require('http'), fs = require('fs'), path = require('path');
const RESERVA = path.join(__dirname, '..', 'micanga-membros');
const TIPOS = { '.html':'text/html; charset=utf-8', '.webp':'image/webp', '.png':'image/png',
  '.jpg':'image/jpeg', '.css':'text/css', '.js':'text/javascript', '.svg':'image/svg+xml',
  '.pdf':'application/pdf', '.json':'application/json; charset=utf-8', '.ico':'image/x-icon' };

function achar(p) {
  const aqui = path.join(__dirname, p);
  if (aqui.startsWith(__dirname) && fs.existsSync(aqui) && !fs.statSync(aqui).isDirectory()) return aqui;
  const la = path.join(RESERVA, p);
  if (la.startsWith(RESERVA) && fs.existsSync(la) && !fs.statSync(la).isDirectory()) return la;
  return null;
}

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  else if (!path.extname(p) && achar(p + '.html')) p += '.html';
  const arq = achar(p);
  if (!arq) { res.writeHead(404); return res.end('nao encontrado: ' + p); }
  res.writeHead(200, { 'Cache-Control': 'no-store',
    'Content-Type': TIPOS[path.extname(arq)] || 'application/octet-stream' });
  fs.createReadStream(arq).pipe(res);
}).listen(4191, () => console.log('http://localhost:4191'));
