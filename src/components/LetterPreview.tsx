import { useRef, useState } from "react";
import { Copy, Download, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { letterToText, signatureLines, letterLabels, witnessLines, type LetterData } from "@/lib/letter";
import { letterProtection } from "@/lib/letter-protection";
import { PricingModal } from "./PricingModal";

export function LetterPreview({ letter: initial, letterId, unlocked: initialUnlocked = false, onUnlock }: {
  letter: LetterData; letterId: string; unlocked?: boolean; onUnlock: () => void;
}) {
  const [letter, setLetter] = useState(initial);
  const [unlocked, setUnlocked] = useState(initialUnlocked);
  const [order, setOrder] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const protection = letterProtection(unlocked);
  const labels = letterLabels(letter);
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
    if (!protection.canExport) return;
    try { await navigator.clipboard.writeText(letterToText(letter)); setStatus("تم نسخ النص."); }
    catch { setStatus("تعذّر النسخ. تحقق من إذن الحافظة."); }
  };
  const pdf = async () => {
    if (!protection.canExport || !paper.current) return;
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
      const total = Math.max(1, Math.ceil(canvas.height / pagePixels - 0.01));
      for (let page = 0; page < total; page++) {
        const offset = page * pagePixels;
        if (page) document.addPage();
        const slice = window.document.createElement("canvas");
        slice.width = canvas.width; slice.height = pagePixels;
        const ctx = slice.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, slice.width, slice.height);
          ctx.drawImage(canvas, 0, offset, canvas.width, Math.min(pagePixels, canvas.height - offset), 0, 0, canvas.width, Math.min(pagePixels, canvas.height - offset));
        }
        document.addImage(slice.toDataURL("image/png"), "PNG", 0, 0, 210, 297);
      }

      document.save("SHL-letter.pdf");
    } catch { setStatus("تعذّر تنزيل PDF. حاول مجدداً."); } finally { setBusy(false); }
  };
  return <div className="w-full min-w-0 space-y-3">
    <article ref={paper} data-letter-id={letterId} className={`document-paper${letter.language === "en" ? " document-english" : ""}${protection.selectable ? "" : " document-unpaid"}`} dir={letter.language === "en" ? "ltr" : "rtl"} lang={letter.language || "ar"} aria-label="معاينة الخطاب" onCopy={e => { if (!protection.canExport) e.preventDefault(); }} onCut={e => { if (!protection.canExport) e.preventDefault(); }} onDragStart={e => { if (!protection.selectable) e.preventDefault(); }}>
      {protection.watermarked && <div className="letter-watermark" aria-hidden="true">{Array.from({ length: 24 }, (_, i) => <span key={i}>منصة سهل - مسودة غير مدفوعة</span>)}</div>}
      <p className="text-lg mb-6">{labels.basmala}</p>
      <p className="font-medium mb-4">{letter.addressee}</p>
      <p className="mb-4"><strong>{labels.subject}:</strong> {letter.subject}</p>
      <p className="mb-4">{letter.greeting}</p>
      {letter.body.map((p, i) => <p key={i} className="mb-4">{p}</p>)}<p className="mb-8">{letter.closing}</p>
      {!!letter.attachments?.length && <section className="document-attachments" aria-label={labels.attachments}><p className="font-semibold">{labels.attachments}:</p><ul>{letter.attachments.map((a, i) => <li key={i}>{a}</li>)}</ul></section>}
      <div className="document-signature">{signatureLines(letter).map(line => <p key={line}>{line}</p>)}<p className="mt-4">{labels.signature}:</p><div className="document-signature-space" /></div>
      {letter.official_stamp && <div className="document-official-space" aria-label="مكان الختم والتوقيع الرسمي"><div><p>{labels.officialSignature}</p><div className="document-signature-space" /></div><div><p>{labels.stamp}</p><div className="document-stamp-space" /></div></div>}
      {letter.witnesses && <section className="document-witnesses" aria-label="الشهود / المعرّفون"><p className="font-semibold mb-3">{labels.witnesses}</p><div className="document-witness-grid">{[0, 1].map(index => <div key={index}>{witnessLines(letter).slice(index * 4, index * 4 + 4).map((line, i) => <p key={i}>{line}</p>)}<div className="document-signature-space" /></div>)}</div></section>}

    </article>

    {!unlocked && <div className="flex flex-col items-center gap-3 py-3">
      <div className="flex items-center gap-2"><LockKeyhole className="w-5 h-5" /><p className="font-semibold">المعروض جاهز</p></div>
      <div className="flex w-full flex-col gap-2 sm:flex-row">
        <PricingModal label="عرض الباقات وخيارات الدفع" />
      </div>
    </div>}
    {!unlocked && <form onSubmit={e => { e.preventDefault(); if (order.trim()) confirm(); }} className="space-y-2">
      <label htmlFor={`activation-${letterId}`} className="block text-sm">إذا أتممت الدفع، أدخل كود التفعيل أو رقم الطلب هنا</label>
      <div className="flex gap-2"><Input id={`activation-${letterId}`} value={order} onChange={e => setOrder(e.target.value)} className="min-h-12 min-w-0 text-base" /><Button type="submit" disabled={busy || !order.trim()} className="min-h-12">تأكيد</Button></div>
    </form>}
    <div className="flex flex-wrap justify-end gap-2"><Button variant="outline" onClick={copy} disabled={!protection.canExport || busy} className="min-h-12"><Copy className="w-4 h-4" />نسخ النص</Button><Button variant="premium" onClick={pdf} disabled={!protection.canExport || busy} className="min-h-12"><Download className="w-4 h-4" />تحميل PDF</Button></div>
    {status && <p role="status" className="text-sm text-accent">{status}</p>}
  </div>;
}