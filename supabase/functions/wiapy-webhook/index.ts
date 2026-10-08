// Recebe os webhooks da Wiapy e grava o que cada e-mail comprou em membros_compras.
//
// Formato: https://help.wiapy.com/pt-br/article/webhook-jtggmu/
//   payment.status  paid | unpaid | credit_card_declined | refunded | chargedback
//   customer.email, checkout.id, checkout.orderbump[] (só os order bumps comprados)
// O token cadastrado na Wiapy chega no header Authorization e é conferido contra
// membros_config.wiapy_token.
//
// O corpo de toda venda da miçanga vai para membros_eventos antes de qualquer coisa: se
// o formato mudar, dá para reprocessar sem perder venda.
import { createClient } from "npm:@supabase/supabase-js@2";
import { itensDoPagamento } from "./mapa.ts";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

const STATUS: Record<string, string> = {
  paid: "paid", approved: "paid",
  refunded: "refunded", chargedback: "chargeback", chargeback: "chargeback",
};

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("ok");

  const { data: cfg } = await db.from("membros_config").select("valor").eq("chave", "wiapy_token").single();
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!cfg || token !== cfg.valor) return new Response("token invalido", { status: 401 });

  let corpo: any = null;
  try { corpo = await req.json(); } catch { return new Response("json invalido", { status: 400 }); }
  // o webhook está em "Todos os checkouts" (é o único jeito de pegar o order bump comprado
  // avulso), então chega venda de outros produtos. Dessas não guardamos o corpo: é dado
  // pessoal de cliente que não é da miçanga.
  const daMicanga = itensDoPagamento(corpo).length > 0;
  const { data: ev } = await db.from("membros_eventos")
    .insert({ corpo: daMicanga ? corpo : null }).select("id").single();
  const marcar = (resultado: string) => ev && db.from("membros_eventos").update({ resultado }).eq("id", ev.id);

  const statusWiapy = corpo?.payment?.status || corpo?.status;
  const status = STATUS[statusWiapy];
  // pendente, recusado e carrinho abandonado não mexem em acesso
  if (!status) { await marcar("ignorado: " + statusWiapy); return new Response("ok"); }

  const email = String(corpo?.customer?.email || "").trim().toLowerCase();
  const pagamento = corpo?.payment?.id || corpo?.payment?._id;
  if (!email || !pagamento) { await marcar("sem email ou pagamento"); return new Response("ok"); }

  const itens = itensDoPagamento(corpo);
  if (!daMicanga) { await marcar("fora da miçanga: " + corpo?.checkout?.id); return new Response("ok"); }

  const linhas = itens.map((it) => ({
    email, nome: corpo?.customer?.name || null, item: it.item, origem: it.origem,
    pagamento_id: String(pagamento), status, valor: corpo?.payment?.amount ?? null,
    fonte: "webhook", atualizado_em: new Date().toISOString(),
  }));
  const { error } = await db.from("membros_compras").upsert(linhas, { onConflict: "pagamento_id,item" });
  await marcar(error ? "erro: " + error.message : status + ": " + itens.map((i) => i.item).join(","));
  return new Response(error ? "erro" : "ok", { status: error ? 500 : 200 });
});
