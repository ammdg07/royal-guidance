import { BadgeCheck, FileCheck2, Landmark } from "lucide-react";

export function WhySHL() {
  return <section aria-labelledby="why-shl" className="border-y border-border py-6">
    <div className="flex items-center gap-3"><Landmark className="h-6 w-6 shrink-0 text-accent" /><h2 id="why-shl" className="text-xl font-semibold">لماذا تختار منصة سهل؟</h2></div>
    <p className="mt-4 text-sm leading-7 text-muted-foreground">أدوات الذكاء الاصطناعي العامة قد تعطيك نصوصاً إنشائية عامة لا تناسب متطلبات الجهات الرسمية.</p>
    <div className="mt-4 space-y-4">
      <div className="flex gap-3"><FileCheck2 className="mt-1 h-5 w-5 shrink-0 text-primary" /><p className="text-sm leading-7">منصة سهل متخصصة ومبنية بخوارزميات وأوامر صياغة مخصصة للبرقيات والمعاريض، تراعي أساليب المخاطبات الرسمية لدى الدوائر الحكومية والوزارات السعودية.</p></div>
      <div className="flex gap-3"><BadgeCheck className="mt-1 h-5 w-5 shrink-0 text-accent" /><p className="text-sm leading-7">صياغة رصينة تراعي البروتوكولات الرسمية وتساعدك على إعداد خطابك دون زيارة مكاتب المعقبين.</p></div>
    </div>
    <p className="mt-4 text-xs leading-6 text-muted-foreground">قبول الخطاب يخضع لمتطلبات الجهة المستقبِلة؛ الصياغة لا تعني اعتماداً حكومياً أو استشارة قانونية ملزمة.</p>
  </section>;
}