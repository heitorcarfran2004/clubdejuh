// O que a pessoa logada comprou. Usado pelo login (index.html) e pelo app (app.html).
//
// A fonte é a Edge Function membros-acesso, no Supabase do Cofre de Ofertas
// (projeto dxybmayffxvepmwbyezc), que lê a tabela membros_compras — alimentada pelo
// webhook da Wiapy (ver supabase/functions/wiapy-webhook e o README).
//
// Itens possíveis: principal · bonus · bolsas · pulseiras · colares · pingentes ·
// tiaras · videos.
//
// ⚠ Isso decide o que a TELA mostra, não protege arquivo: páginas e PDFs são estáticos
// e abrem por URL direta. Para low ticket é aceitável; se virar problema, os arquivos
// dos extras precisam ir para storage com URL assinada.
var ACESSO = (function () {
  var URL_ACESSO = 'https://dxybmayffxvepmwbyezc.supabase.co/functions/v1/membros-acesso';

  // E-mail sem compra registrada não entra (19/09/2026). Quem pagou no GGCheckout de
  // 04/09 a 09/09 ainda não está na base: quem já estava logado no aparelho continua
  // (o app não desloga, ver conferirAcesso), mas login novo depende de importar a lista.
  var SEM_REGISTRO = [];

  function lerLocal(chave) { try { return localStorage.getItem(chave); } catch (e) { return null; } }
  function gravarLocal(chave, v) { try { localStorage.setItem(chave, v); } catch (e) {} }
  function apagarLocal(chave) { try { localStorage.removeItem(chave); } catch (e) {} }

  // PREVIEW LOCAL: em localhost nao consulta o Supabase (que ainda e o do Brasil e so
  // conhece as compras de la) e libera tudo, so para conferir a tela em espanhol.
  // Em producao isto nunca roda: depende do hostname.
  var LOCAL = (location.hostname === 'localhost' || location.hostname === '127.0.0.1');
  var TUDO = ['principal', 'bonus', 'bolsas', 'pulseiras', 'colares', 'pingentes', 'tiaras', 'videos'];

  // REGRA DA LATAM (10/10/2026, pedido do Heitor): aqui NAO se trava extra para subir
  // LTV. Quem comprou qualquer oferta recebe TUDO, para reduzir reembolso ao maximo.
  // Quem nao comprou continua sem nada (SEM_REGISTRO).
  // Isto vale so neste app (clubdejuh). O app brasileiro segue item por item.
  var TUDO_PARA_COMPRADOR = true;

  // Promise<{itens, registrado}> — registrado=false quando o e-mail não tem compra
  function consultar(email) {
    if (LOCAL) return Promise.resolve({ itens: TUDO.slice(), registrado: true });
    return fetch(URL_ACESSO, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: email })
    }).then(function (r) {
      if (!r.ok) throw new Error('acesso ' + r.status);
      return r.json();
    }).then(function (d) {
      var itens = d.itens || [];
      if (!itens.length) return { itens: SEM_REGISTRO.slice(), registrado: false };
      return { itens: TUDO_PARA_COMPRADOR ? TUDO.slice() : itens, registrado: true };
    });
  }

  function entrar(email, itens) {
    gravarLocal('membro', email);
    gravarLocal('membro-itens', JSON.stringify(itens));
  }
  function sair() {
    apagarLocal('membro'); apagarLocal('membro-itens');
    try { sessionStorage.removeItem('membro'); } catch (e) {}
  }
  function email() {
    var e = lerLocal('membro');
    // quem entrou antes desta versão tem o e-mail só no sessionStorage
    if (!e) { try { e = sessionStorage.getItem('membro'); } catch (x) {} }
    return e || '';
  }
  function itens() {
    try { return JSON.parse(lerLocal('membro-itens') || 'null') || SEM_REGISTRO.slice(); }
    catch (e) { return SEM_REGISTRO.slice(); }
  }
  function tem(item) { return itens().indexOf(item) >= 0; }

  return { consultar: consultar, entrar: entrar, sair: sair, email: email, itens: itens, tem: tem,
           SEM_REGISTRO: SEM_REGISTRO };
})();
