import { useState } from "react";
import { BadgeCheck, FileCheck2, Landmark, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function WhySHL() {
  const [open, setOpen] = useState(false);
  return <>
    <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog"
      className="glass glow-gold-subtle mx-auto flex w-full max-w-md items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold transition-transform active:scale-[0.98]">
      <Sparkles className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
      لماذا تختار منصة سهل؟
    </button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent dir="rtl" className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-accent" aria-hidden="true" />
            لماذا تختار منصة سهل؟
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-3"><Landmark className="mt-1 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
            <p className="text-sm leading-7 text-muted-foreground">أدوات الذكاء الاصطناعي العامة قد تعطيك نصوصاً إنشائية عامة لا تناسب متطلبات الجهات الرسمية.</p></div>
          <div className="flex gap-3"><FileCheck2 className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <p className="text-sm leading-7">منصة سهل متخصصة ومبنية بخوارزميات وأوامر صياغة مخصصة للبرقيات والمعاريض، تراعي أساليب المخاطبات الرسمية لدى الدوائر الحكومية والوزارات السعودية.</p></div>
          <div className="flex gap-3"><BadgeCheck className="mt-1 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
            <p className="text-sm leading-7">صياغة رصينة تراعي البروتوكولات الرسمية وتساعدك على إعداد خطابك دون زيارة مكاتب المعقبين.</p></div>
          <p className="text-xs leading-6 text-muted-foreground">قبول الخطاب يخضع لمتطلبات الجهة المستقبِلة؛ الصياغة لا تعني اعتماداً حكومياً أو استشارة قانونية ملزمة.</p>
        </div>
        <DialogFooter>
          <Button className="min-h-12 w-full" onClick={() => setOpen(false)}>فهمت ذلك</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </>;
}
