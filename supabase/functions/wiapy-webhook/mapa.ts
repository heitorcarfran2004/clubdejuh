// O que cada checkout, oferta e order bump da Wiapy libera no app.
// IDs lidos no painel em 19/09/2026 (GET api.wiapy.com/producer/checkout).
// É a ÚNICA cópia desta regra: a importação de vendas antigas
// (scripts/membros-importar.cjs) passa pelo próprio webhook para não divergir daqui.

export const CHECKOUT_PRINCIPAL = "6aa05d632868307f2b37768c"; // 100 Projetos de Brincos de Miçanga

// Ofertas do checkout principal, pelo código do link pay.wiapy.com/<código>.
// Só o Essencial (R$ 10) vem sem os bônus; as três do Completo trazem os 6.
export const OFERTA_ESSENCIAL = "_dq9DEG8vkO";
export const OFERTAS_COMPLETO = ["Ej1KaWuawT-x", "I2XmXHKdXFVQ", "Pp1tgWLL7fXt"];

export const ORDERBUMPS: Record<string, string> = {
  "6aa7c0e757a29d52f70fd676": "bolsas",
  "6aa1091618bc1c76a8d4673e": "pulseiras",
  "6aa10991a3b1f406fa5d56b0": "colares",
  "6aa109b418bc1c76a8d46a16": "pingentes",
  "6aa109dd2868307f2b4a501b": "tiaras",
  // 6aa10794b0c1c48195afbb8b = Entrega Expressa no WhatsApp: não é material, não libera nada
};

// Checkouts próprios de cada extra, criados em 19/09/2026 para o botão de desbloquear
// do app (quem não levou no pedido compra por aqui). Um produto por checkout.
export const CHECKOUTS_EXTRAS: Record<string, string> = {
  "6aae26945c2bd84427c13d76": "bolsas",     // pay.wiapy.com/S07v1mMgUXYa
  "6aae26e8cf13c78c723eec6f": "pulseiras",  // pay.wiapy.com/BCc75hXR6-tX
  "6aae26e88ac21a43377a3160": "colares",    // pay.wiapy.com/nYTSCxa58zDa
  "6aae26e85c2bd84427c13fc5": "pingentes",  // pay.wiapy.com/SIB1eqJc1Y7n
  "6aae26e85c2bd84427c13fd1": "tiaras",     // pay.wiapy.com/ZEZ3hI1cKH3R
};

// upsell (R$ 19,90), downsell (R$ 9,90) e o checkout próprio dos vídeos no app
// (pay.wiapy.com/3d3HmeQBQa9S) liberam a mesma coisa
export const CHECKOUTS_VIDEOS = ["6aa1e01db0c1c48195cf0ef8", "6aa1e08aa3b1f406fa7ab24d", "6aae26e9f72e338d159b10c0"];

// O payload documentado não traz a oferta. Procura em qualquer lugar do corpo um dos
// códigos conhecidos; sem achar, decide pelo valor. NA DÚVIDA LIBERA OS BÔNUS: travar
// quem pagou pelo Completo custa mais que dar bônus a quem pagou R$ 10.
function ehEssencial(corpo: any): boolean {
  const txt = JSON.stringify(corpo);
  if (OFERTAS_COMPLETO.some((o) => txt.includes('"' + o + '"'))) return false;
  if (txt.includes('"' + OFERTA_ESSENCIAL + '"')) return true;
  const bumps = (corpo?.checkout?.orderbump || []).reduce((s: number, b: any) => s + (b?.amount || 0), 0);
  const base = (corpo?.payment?.amount || 0) - bumps;
  const parcelado = (corpo?.payment?.installments || 0) > 1;
  return !parcelado && base >= 950 && base <= 1050;
}

export function itensDoPagamento(corpo: any): { item: string; origem: string }[] {
  const ck = corpo?.checkout?.id || corpo?.checkout?._id;
  const out: { item: string; origem: string }[] = [];
  if (ck === CHECKOUT_PRINCIPAL) {
    out.push({ item: "principal", origem: ck });
    if (!ehEssencial(corpo)) out.push({ item: "bonus", origem: ck });
    for (const b of corpo?.checkout?.orderbump || []) {
      const id = b?.id || b?._id || b;
      if (ORDERBUMPS[id]) out.push({ item: ORDERBUMPS[id], origem: id });
    }
  } else if (CHECKOUTS_VIDEOS.includes(ck)) {
    out.push({ item: "videos", origem: ck });
  } else if (CHECKOUTS_EXTRAS[ck]) {
    out.push({ item: CHECKOUTS_EXTRAS[ck], origem: ck });
  } else if (ORDERBUMPS[ck]) {
    // o order bump comprado sozinho, pelo link avulso (era o botão do app antes dos
    // checkouts próprios; fica para quem ainda tiver o link antigo)
    out.push({ item: ORDERBUMPS[ck], origem: ck });
  }
  return out;
}
