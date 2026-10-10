import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { account } from "../_shared/account.ts";

Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  try {
    const session = await account(req);
    if (!session) return reply({ error: "يرجى تسجيل الدخول." }, 401);
    const { action, letter_id, order } = await req.json();
    if (typeof letter_id !== "string" || !/^[\da-f-]{36}$/i.test(letter_id)) return reply({ error: "الخطاب غير صالح." }, 400);
    const { admin, user } = session;
    const { data: letter, error } = await admin.from("letters").select("*").eq("id", letter_id).eq("user_id", user.id).maybeSingle();
    if (error || !letter) return reply({ error: "الخطاب غير موجود." }, 404);
    const { data: membership } = await admin.from("memberships").select("expires_at").eq("user_id", user.id).maybeSingle();
    const member = membership && Date.parse(membership.expires_at) > Date.now();
    if (letter.unlocked || member) return reply({ type: "letter", letter_id: letter.id, unlocked: true, letter: letter.content });
    if (action === "unlock") {
      if (typeof order !== "string" || !order.trim() || order.length > 100) return reply({ error: "أدخل رقم الطلب للتحقق من الدفع." }, 400);
      // Fail closed until the merchant's Salla connection and product mapping are supplied.
      return reply({ error: "التحقق من طلبات سلة غير متاح بعد. يلزم إكمال ربط المتجر؛ لم يتم فتح الخطاب أو اعتماد رقم الطلب." }, 503);
    }
    return reply({ type: "letter", letter_id: letter.id, unlocked: false, letter: letter.preview });
  } catch { return reply({ error: "تعذّر تحميل الخطاب." }, 500); }
});