import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const CONSULTATION_PROMPT = `أنت SHL، مستشار حكومي سعودي متخصص ومتقن (مُعقِب). تتحاور بالفصحى العربية الرسمية فقط، دون عامية ودون إيموجي إطلاقاً.

قواعد صارمة:
1. لا تختلق أنظمة أو إجراءات أو قرارات مطلقاً. إذا لم تكن متأكداً من الإجراء أو النص التنظيمي، قل صراحة: "يُرجى الرجوع إلى الجهة الرسمية المختصة مباشرة للتأكد".
2. تُجيب عن الإجراءات الحكومية السعودية (أبشر، مقيم، وزارة الداخلية، وزارة العدل، الجوازات، العمل، إلخ) بخطوات مرقمة موجزة ودقيقة.
3. اذكر الجهة المختصة والمنصة الإلكترونية الرسمية لكل إجراء إن وُجدت.
4. لا تقدّم استشارات قانونية ملزمة؛ أنت توضّح الإجراءات فقط.
5. عناوين المخاطبة حسب المقام: "معالي" للوزراء، "سمو" للأمراء، "سعادة" للمسؤولين.
6. كن مقتضباً ومنظماً: مقدمة رسمية موجزة، ثم النقاط، ثم خاتمة مهنية. لا تذكر ملاحظات عن هويتك أو طبيعة تدريبك.`;

const LETTER_PROMPT = `أنت SHL، كاتب ومُعدّ معاريض وخطابات رسمية سعودية خبير. تنتج خطابات بالفصحى العربية الرسمية فقط، دون إيموجي.

أعد الخطاب بصيغة JSON فقط (بدون أي نص خارج JSON) بهذا الشكل:
{
  "addressee": "لقب الجهة المرسل إليها، مثال: معالي وزير الداخلية المحترم",
  "subject": "الموضوع باختصار",
  "greeting": "التحية الافتتاحية، مثال: السلام عليكم ورحمة الله وبركاته، وبعد:",
  "body": ["فقرة أولى", "فقرة ثانية"],
  "closing": "خاتمة مهنية، مثال: وتفضلوا بقبول وافر الاحترام والتقدير،،،",
  "sender_label": "مقدمه",
  "notes": "ملاحظات قصيرة للمستخدم عن حقول يجب تعبئتها إن وُجدت، أو نص فارغ"
}

قواعد الخطاب:
1. استخدم عناوين المخاطبة الصحيحة: "معالي" للوزراء، "سمو" للأمراء، "سعادة" للمسؤولين.
2. اجعل المتن موجزاً ومهنياً ومهذباً، بلغة رسمية متقنة.
3. إن نقصت معلومات أساسية (اسم المرسل، رقم الهوية، الجوال، الجهة)، اذكرها في "notes" واجعل الحقول كعناصر نائبة بين قوسين مربعين مثل [الاسم].
4. لا تختلق أرقام هوية أو جوالات أو تواريخ.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY غير مضبوط على الخادم" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { messages, mode } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "لا توجد رسائل لمعالجتها" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const isLetter = mode === "letter";
    const systemPrompt = isLetter ? LETTER_PROMPT : CONSULTATION_PROMPT;

    // Sanitize client messages: only role/content kept, roles limited to user/assistant
    const safeMessages = messages
      .filter((m: any) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-20)
      .map((m: any) => ({ role: m.role, content: m.content.slice(0, 8000) }));

    const body: Record<string, unknown> = {
      model: "gpt-4o",
      messages: [{ role: "system", content: systemPrompt }, ...safeMessages],
      temperature: 0.4,
    };
    if (isLetter) {
      body.response_format = { type: "json_object" };
    }

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text().catch(() => "");
      console.error("OpenAI error:", openaiRes.status, errText.slice(0, 500));
      const userMessage =
        openaiRes.status === 401 || openaiRes.status === 403
          ? "مفتاح OpenAI غير صالح أو مرفوض. يُرجى التحقق من المفتاح."
          : openaiRes.status === 429
            ? "تم تجاوز حد الاستخدام المسموح. حاول مرة أخرى بعد قليل."
            : "تعذّر الاتصال بخدمة الذكاء الاصطناعي. حاول مرة أخرى.";
      return new Response(JSON.stringify({ error: userMessage }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await openaiRes.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: "لم يُرجع النموذج أي محتوى. حاول إعادة الصياغة." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (isLetter) {
      let letter: any;
      try {
        letter = JSON.parse(content);
      } catch {
        return new Response(
          JSON.stringify({ error: "تعذّر توليد الخطاب بشكل صحيح. حاول مرة أخرى." }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(JSON.stringify({ type: "letter", letter }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ type: "text", content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-chat error:", e);
    return new Response(
      JSON.stringify({ error: "حدث خطأ غير متوقع. حاول مرة أخرى." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
