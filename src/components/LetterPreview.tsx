import { useRef, useState } from "react";
import { Copy, Download, LockKeyhole, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { letterToText, signatureLines, type LetterData } from "@/lib/letter";

export function LetterPreview({ letter: initial, letterId, unlocked: initialUnlocked = false, onUnlock }: {
  letter: LetterData; letterId: string; unlocked?: boolean; onUnlock: () => void;
}) {
  const [letter, setLetter] = useState(initial);
  const [unlocked, setUnlocked] = useState(initialUnlocked);
  const [order, setOrder] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const paper = useRef<HTMLElement>(null);
  const confirm = async () => {
    setBusy(true); setStatus("");
    try {
      const { data, error } = await supabase.functions.invoke("letter-access", { body: { action: "unlock", letter_id: letterId, order } });
      if (error) {
        const details = error.context && typeof error.context.json === "function" ? await error.context.json() : null;
        throw new Error(details?.error || "تعذّر التحقق من الدفع.");
      }
      if (!data?.unlocked) throw new Error("لم يتم تأكيد الدفع.");
      setLetter(data.letter); setUnlocked(true); onUnlock();
    } catch (e) { setStatus(e instanceof Error ? e.message : "تعذّر التحقق من الدفع."); }
    finally { setBusy(false); }
  };
  const copy = async () => {
    if (!unlocked) return;
    try { await navigator.clipboard.writeText(letterToText(letter)); setStatus("تم نسخ النص."); }
    catch { setStatus("تعذّر النسخ. تحقق من إذن الحافظة."); }
  };
  const pdf = async () => {
    if (!unlocked || !paper.current) return;
    setBusy(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);
      await window.document.fonts.ready;
      const canvas = await html2canvas(paper.current, { scale: 2, backgroundColor: null, onclone: doc => {
        const element = doc.querySelector<HTMLElement>(`[data-letter-id="${letterId}"]`);
        if (element) { element.style.width = "794px"; element.style.maxWidth = "none"; element.style.minHeight = "1123px"; element.style.padding = "76px 68px"; element.style.fontSize = "18px"; }
      } });
      const document = new jsPDF({ unit: "mm", format: "a4" });
      const pagePixels = Math.floor(canvas.width * 297 / 210);
      for (let offset = 0; offset < canvas.height; offset += pagePixels) {
        if (offset) document.addPage();
        const slice = window.document.createElement("canvas");
        slice.width = canvas.width; slice.height = Math.min(pagePixels, canvas.height - offset);
        slice.getContext("2d")?.drawImage(canvas, 0, offset, canvas.width, slice.height, 0, 0, canvas.width, slice.height);
        document.addImage(slice.toDataURL("image/png"), "PNG", 0, 0, 210, slice.height * 210 / canvas.width);
      }
      document.save("SHL-letter.pdf");
    } catch { setStatus("تعذّر تنزيل PDF. حاول مجدداً."); } finally { setBusy(false); }
  };
  const purchase = () => setStatus("روابط متجر سلة لم تُضف بعد؛ الشراء غير متاح حالياً.");
  return <div className="w-full min-w-0 space-y-3">
    <article ref={paper} data-letter-id={letterId} className="document-paper" dir="rtl" lang="ar" aria-label="معاينة الخطاب">
      <p className="text-lg mb-6">بسم الله الرحمن الرحيم</p>
      <p className="font-medium mb-4">{letter.addressee}</p>
      <p className="mb-4"><strong>الموضوع:</strong> {letter.subject}</p>
      <p className="mb-4">{letter.greeting}</p>
      {unlocked ? <>{letter.body.map((p, i) => <p key={i} className="mb-4">{p}</p>)}<p className="mb-8">{letter.closing}</p></> :
        <div className="locked-letter-body">
          <div className="letter-blur-skeleton" aria-hidden="true">{Array.from({ length: 9 }, (_, i) => <span key={i} />)}</div>
          <div className="letter-purchase-overlay">
            <LockKeyhole className="w-7 h-7" /><p className="font-semibold">المعروض جاهز</p>
            <Button variant="premium" className="min-h-12 w-full whitespace-normal" onClick={purchase}><ShoppingBag className="w-4 h-4 shrink-0" />شراء وفك قفل المعروض</Button>
            <Button variant="outline" className="min-h-12 w-full whitespace-normal" onClick={purchase}>الاشتراك الشهري غير المحدود</Button>
          </div>
        </div>}
      <div className="document-signature">{signatureLines(letter).map(line => <p key={line}>{line}</p>)}<p className="mt-4">التوقيع:</p><div className="document-signature-space" /></div>
    </article>
    {!unlocked && <form onSubmit={e => { e.preventDefault(); if (order.trim()) confirm(); }} className="space-y-2">
      <label htmlFor={`activation-${letterId}`} className="block text-sm">إذا أتممت الدفع، أدخل كود التفعيل أو رقم الطلب هنا</label>
      <div className="flex gap-2"><Input id={`activation-${letterId}`} value={order} onChange={e => setOrder(e.target.value)} className="min-h-12 min-w-0 text-base" /><Button type="submit" disabled={busy || !order.trim()} className="min-h-12">تأكيد</Button></div>
    </form>}
    <div className="flex flex-wrap justify-end gap-2"><Button variant="outline" onClick={copy} disabled={!unlocked || busy} className="min-h-12"><Copy className="w-4 h-4" />نسخ النص</Button><Button variant="premium" onClick={pdf} disabled={!unlocked || busy} className="min-h-12"><Download className="w-4 h-4" />تحميل PDF</Button></div>
    {status && <p role="status" className="text-sm text-accent">{status}</p>}
  </div>;
}