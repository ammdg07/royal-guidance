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

const LETTER_PROMPT = `أنت خبير ومختص في صياغة الخطابات والمعاريض والبرقيات الرسمية الموجهة للجهات الحكومية والشركات في المملكة العربية السعودية.

التعليمات الصارمة:
1. الصياغة بأسلوب عربي فصيح، رصين، شديد الاحترام والرسمية، واضح ومباشر بدون حشو.
2. الهيكلية الإلزامية: البسملة، ثم التحية الرسمية المناسبة، ثم مقدمة وجيزة، ثم صلب الموضوع بدقة بناءً على طلب المستخدم، ثم الخاتمة بالدعاء، ثم التوقيع (مقدمه/ الاسم، التواصل، التاريخ).
3. استخدم عناوين المخاطبة الصحيحة حسب المقام: "معالي" للوزراء، "سمو" للأمراء، "سعادة" للمسؤولين.
4. أخرج نص الخطاب المباشر فقط بدون أي مقدمات أو شروحات جانبية أو تعليقات خارج نص الخطاب.
5. استخرج اسم المرسل ورقم الهوية وبيانات التواصل والتاريخ من طلب المستخدم ورسائله السابقة، وانقل البيانات المذكورة فوراً كما هي إلى حقول التوقيع أدناه. أحدث بيانات صريحة يذكرها المستخدم هي المعتمدة. لا تستبدل أي بيانات ذكرها المستخدم بأقواس أو حقول فارغة، ولا تضف أقواساً مثل [الاسم] أو [التاريخ].
6. إذا لم يذكر المستخدم بياناً، أعد حقله كسلسلة فارغة فقط، ولا تختلق بيانات أو تواريخ. لا تضف شروحات أو ملاحظات جانبية؛ اجعل notes فارغاً.

لتوافق النظام التقني فقط: أعد الناتج بصيغة JSON فقط (بدون أي نص خارج JSON) بهذا الشكل، ويكون محتوى كل حقل نص الخطاب الرسمي نفسه:
{
  "addressee": "لقب الجهة المرسل إليها، مثال: معالي وزير الداخلية المحترم",
  "subject": "الموضوع باختصار",
  "greeting": "التحية الافتتاحية، مثال: السلام عليكم ورحمة الله وبركاته، وبعد:",
  "body": ["فقرة أولى من صلب الموضوع", "فقرة ثانية"],
  "closing": "الخاتمة بالدعاء، مثال: وتقبل الله شكركم، ووفقكم لما يحب ويرضى،،،",
  "sender_label": "مقدمه",
  "sender_name": "اسم المرسل كما ذكره المستخدم، أو سلسلة فارغة",
  "sender_id": "رقم الهوية كما ذكره المستخدم، أو سلسلة فارغة",
  "sender_mobile": "الجوال أو بيانات التواصل كما ذكرها المستخدم، أو سلسلة فارغة",
  "sender_date": "التاريخ كما ذكره المستخدم، أو سلسلة فارغة",
  "notes": ""
}
لا تختلق أرقام هوية أو جوالات أو تواريخ.`;

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
