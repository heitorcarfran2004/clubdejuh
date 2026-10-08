// O login do app: recebe um e-mail e devolve o que ele comprou e segue pago.
//   POST {"email": "..."}  ->  {"itens": ["principal", "bonus", "videos", ...]}
// Lista vazia = nenhuma compra com esse e-mail (ou tudo estornado).
import { createClient } from "npm:@supabase/supabase-js@2";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, authorization, apikey",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  let email = "";
  try { email = String((await req.json())?.email || "").trim().toLowerCase(); } catch { /* vazio */ }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return Response.json({ erro: "email invalido" }, { status: 400, headers: CORS });
  }
  // o e-mail é gravado sempre em minúsculas; eq, e não ilike, porque no ilike o "_"
  // de um e-mail vira curinga e abriria a conta de outra pessoa
  const { data, error } = await db.from("membros_compras")
    .select("item, status").eq("email", email);
  if (error) return Response.json({ erro: "falha" }, { status: 500, headers: CORS });

  // um item pode ter vindo em mais de um pagamento: vale se algum deles segue pago
  const itens = [...new Set((data || []).filter((l) => l.status === "paid").map((l) => l.item))];
  return Response.json({ itens }, { headers: CORS });
});
