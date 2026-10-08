// Recebe os webhooks da Hotmart (versão 2.0) da operação LATAM — "100 Proyectos de
// Aretes de Chaquira" — e grava em membros_compras, a mesma tabela que
// a Wiapy alimenta. O app de membros pergunta à membros-acesso e não sabe de onde veio.
//
// Formato: https://developers.hotmart.com/docs/pt-BR/2.0.0/webhook/purchase-webhook/
//   event            PURCHASE_APPROVED | PURCHASE_COMPLETE | PURCHASE_REFUNDED | PURCHASE_CHARGEBACK ...
//   data.buyer.email, data.product.id, data.purchase.offer.code, data.purchase.transaction
// O hottok vem no header X-HOTMART-HOTTOK e é conferido contra membros_config.hotmart_hottok.
import { createClient } from "npm:@supabase/supabase-js@2";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

// O hottok é da CONTA Hotmart da operação LATAM, então toda venda que chega aqui é nossa —
// não há produto fixo. O que cada oferta libera fica em membros_config.hotmart_ofertas
// (JSON {"codigo_da_oferta": ["principal","bonus"], ...}) e muda sem reimplantar.
// Oferta fora do mapa libera principal + bonus: melhor entregar a mais do que deixar
// a compradora sem nada; a Esencial (só principal) precisa estar no mapa.
const PADRAO = ["principal", "bonus"];

const STATUS: Record<string, string> = {
  PURCHASE_APPROVED: "paid", PURCHASE_COMPLETE: "paid",
  PURCHASE_REFUNDED: "refunded", PURCHASE_CHARGEBACK: "chargeback",
  PURCHASE_CANCELED: "refunded", PURCHASE_PROTEST: "chargeback",
};

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("ok");

  let corpo: any = null;
  try { corpo = await req.json(); } catch { return new Response("json invalido", { status: 400 }); }

  const { data: cfgs } = await db.from("membros_config").select("chave,valor")
    .in("chave", ["hotmart_hottok", "hotmart_ofertas", "hotmart_aprender"]);
  const cfg = Object.fromEntries((cfgs || []).map((c: any) => [c.chave, c.valor]));
  const hottok = (req.headers.get("x-hotmart-hottok") || corpo?.hottok || "").trim();
  // Aprender o hottok sem ninguém copiá-lo à mão: com membros_config.hotmart_aprender = '1'
  // e nenhum hottok gravado, o PRIMEIRO POST que trouxer um hottok (o "Enviar teste" da
  // Hotmart) grava o dele e apaga a trava. Daí em diante só esse hottok entra.
  if (!cfg.hotmart_hottok && cfg.hotmart_aprender === "1" && hottok.length >= 20) {
    await db.from("membros_config").upsert({ chave: "hotmart_hottok", valor: hottok }, { onConflict: "chave" });
    await db.from("membros_config").delete().eq("chave", "hotmart_aprender");
    cfg.hotmart_hottok = hottok;
  }
  if (!cfg.hotmart_hottok || hottok !== cfg.hotmart_hottok) return new Response("hottok invalido", { status: 401 });
  let OFERTAS: Record<string, string[]> = {};
  try { OFERTAS = JSON.parse(cfg.hotmart_ofertas || "{}"); } catch { /* mapa quebrado: cai no padrao */ }

  const d = corpo?.data || {};
  const { data: ev } = await db.from("membros_eventos").insert({ corpo }).select("id").single();
  const marcar = (resultado: string) => ev && db.from("membros_eventos").update({ resultado }).eq("id", ev.id);

  const status = STATUS[corpo?.event];
  // boleto gerado, atrasado, carrinho abandonado etc. não mexem em acesso
  if (!status) { await marcar("ignorado: " + corpo?.event); return new Response("ok"); }

  const email = String(d?.buyer?.email || "").trim().toLowerCase();
  const pagamento = d?.purchase?.transaction;
  if (!email || !pagamento) { await marcar("sem email ou transacao"); return new Response("ok"); }

  const oferta = String(d?.purchase?.offer?.code || "");
  const itens = OFERTAS[oferta] || PADRAO;

  const linhas = itens.map((item) => ({
    email, nome: d?.buyer?.name || null, item, origem: "hotmart:" + (d?.product?.id || "?") + ":" + (oferta || "?"),
    pagamento_id: String(pagamento), status, valor: d?.purchase?.price?.value ?? null,
    fonte: "webhook", atualizado_em: new Date().toISOString(),
  }));
  const { error } = await db.from("membros_compras").upsert(linhas, { onConflict: "pagamento_id,item" });
  await marcar(error ? "erro: " + error.message : "hotmart " + status + ": " + itens.join(","));
  return new Response(error ? "erro" : "ok", { status: error ? 500 : 200 });
});
