import { useEffect, useRef, useState } from "react";
import { Send, FileText, MessageCircle, Menu, Settings, FilePenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "@/hooks/use-account";
import { shouldSendOnKey, validLetterRequest, type LetterRequest } from "@/lib/composer";
import type { LetterData } from "@/lib/letter";
import { LetterPreview } from "./LetterPreview";
import { WhySHL } from "./WhySHL";

interface Message { id: string; role: "user" | "assistant"; content: string; letter?: LetterData; letter_id?: string; unlocked?: boolean }
export function ChatInterface({ onMenu, onSettings, selected, reset, onSaved }: {
  onMenu: () => void; onSettings: () => void; selected: { id: string; kind: "letter" | "conversation" } | null; reset: number; onSaved: () => void;
}) {
  const { user, profile } = useAccount();
  const [mode, setMode] = useState<"consultation" | "letter" | "improve">("consultation");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [conversation, setConversation] = useState<string | null>(null);
  const [sender, setSender] = useState<LetterRequest>({ full_name: "", national_id: "", mobile: "", entity: "", details: "", recipient_person: "", official_stamp: false });
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { setSender(prev => ({ ...prev, full_name: profile.full_name, national_id: profile.national_id, mobile: profile.mobile })); }, [profile]);
  useEffect(() => { setMessages([]); setConversation(null); setStatus(""); setInput(""); }, [reset]);
  useEffect(() => {
    if (!selected) return;
    let live = true;
    setStatus("");
    (async () => {
      if (selected.kind === "letter") {
        const { data, error } = await supabase.functions.invoke("letter-access", { body: { action: "read", letter_id: selected.id } });
        if (!live) return;
        if (error) { setStatus("تعذّر تحميل الخطاب."); return; }
        setMode("letter"); setMessages([{ id: selected.id, role: "assistant", content: data.letter.subject, letter: data.letter, letter_id: data.letter_id, unlocked: data.unlocked }]);
      } else {
        const { data, error } = await supabase.from("conversations").select("messages").eq("id", selected.id).single();
        if (!live) return;
        if (error) { setStatus("تعذّر تحميل المحادثة."); return; }
        setMode("consultation"); setConversation(selected.id); setMessages(data.messages as unknown as Message[]);
      }
    })();
    return () => { live = false; };
  }, [selected]);
  useEffect(() => { end.current?.scrollIntoView({ block: "end" }); }, [messages, busy]);
  const send = async () => {
    if (busy || !user || (mode !== "consultation" ? !validLetterRequest(sender, mode) : !input.trim())) return;
    const text = mode !== "consultation" ? `الجهة: ${sender.entity}\n${sender.recipient_person?.trim() ? `الشخص الموجّه إليه الخطاب أو صفته: ${sender.recipient_person.trim()}\n` : ""}الاسم: ${sender.full_name}\nالهوية: ${sender.national_id}\nالجوال: ${sender.mobile}\n${mode === "improve" ? `الخطاب المراد تدقيقه: ${sender.original_letter}` : `تفاصيل الطلب: ${sender.details}`}` : input;
    const history: Message[] = [...messages, { id: crypto.randomUUID(), role: "user", content: text }];
    setMessages(history); setInput(""); setBusy(true); setStatus("");
    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", { body: { mode, sender: mode !== "consultation" ? sender : undefined, messages: history.filter(m => !m.letter).map(m => ({ role: m.role, content: m.content })) } });
      if (error) {
        const details = error.context && typeof error.context.json === "function" ? await error.context.json() : null;
        throw new Error(details?.error || "تعذّر الاتصال بالخدمة.");
      }
      const result: Message = { id: crypto.randomUUID(), role: "assistant", content: data.content || data.letter?.subject || "", letter: data.letter, letter_id: data.letter_id, unlocked: data.unlocked };
      const updated = [...history, result]; setMessages(updated);
      if (data.notice) setStatus(data.notice);
      if (mode === "consultation") {
        const id = conversation || crypto.randomUUID();
        const { error: saveError } = await supabase.from("conversations").upsert({ id, user_id: user.id, title: text.slice(0, 80), messages: JSON.parse(JSON.stringify(updated)) });
        if (saveError) setStatus("تم الرد، لكن تعذّر حفظ المحادثة."); else setConversation(id);
      }
      onSaved();
    } catch (e) { setStatus(e instanceof Error ? e.message : "تعذّر إكمال الطلب."); }
    finally { setBusy(false); }
  };
  return <main className="flex-1 min-w-0 min-h-0 flex flex-col bg-background">
    <header className="shrink-0 border-b border-border p-2 sm:p-4">
      <div className="flex items-center justify-between gap-2 max-w-4xl mx-auto">
        <Button variant="ghost" size="icon" aria-label="القائمة" onClick={onMenu} className="min-h-12 min-w-12"><Menu className="w-5 h-5" /></Button>
        <h1 className="font-semibold text-base sm:text-lg">SHL | المستشار الحكومي</h1>
        <Button variant="ghost" size="icon" aria-label="الإعدادات" onClick={onSettings} className="min-h-12 min-w-12"><Settings className="w-5 h-5" /></Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-4xl mx-auto mt-2">
        <Button variant={mode === "consultation" ? "default" : "outline"} onClick={() => setMode("consultation")} className="flex-1 min-h-12"><MessageCircle className="w-4 h-4" />استشارة</Button>
        <Button variant={mode === "letter" ? "premium" : "outline"} onClick={() => setMode("letter")} className="flex-1 min-h-12"><FileText className="w-4 h-4" />صياغة خطاب</Button>
        <Button variant={mode === "improve" ? "premium" : "outline"} onClick={() => setMode("improve")} className="col-span-2 sm:col-span-1 min-h-12 whitespace-normal"><FilePenLine className="w-4 h-4 shrink-0" />تحسين وتدقيق خطاب جاهز</Button>
      </div>
    </header>
    <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 sm:p-5">
      <div className="max-w-4xl mx-auto space-y-5">
        {!messages.length && <section className="border-b border-border pb-5"><h2 className="text-xl font-semibold">منصة سهل</h2><p className="mt-2 text-sm leading-7 text-muted-foreground">منصة ذكية لصياغة المعاريض والخطابات الرسمية الموجّهة للجهات الحكومية والخاصة بدقة وسرعة.</p></section>}
        {!messages.length && mode === "consultation" && <WhySHL />}
        {mode !== "consultation" && <form onSubmit={e => { e.preventDefault(); send(); }} onKeyDown={e => { if (e.key === " " && e.target instanceof HTMLButtonElement) e.preventDefault(); }} className="space-y-4 pb-5 border-b border-border">
          <h2 className="font-semibold text-lg">{mode === "improve" ? "تحسين وتدقيق خطاب جاهز" : "بيانات المعروض"}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {([['full_name', 'الاسم الكامل لصاحب المعروض'], ['national_id', 'رقم الهوية الوطنية'], ['mobile', 'رقم الجوال'], ['entity', 'اسم الجهة الرسمية']] as const).map(([key, label]) => <label key={key} className="block space-y-2"><span className="text-sm">{label}</span><Input required value={sender[key]} onChange={e => setSender({ ...sender, [key]: e.target.value })} inputMode={key === "national_id" || key === "mobile" ? "numeric" : "text"} className="min-h-12 text-base" /></label>)}
          </div>
          <label className="block space-y-2"><span className="text-sm">اسم الشخص الموجّه إليه الخطاب أو صفته <span className="text-muted-foreground">(اختياري)</span></span><Input value={sender.recipient_person || ""} onChange={e => setSender({ ...sender, recipient_person: e.target.value })} placeholder="معالي الوزير / سعادة المدير العام / فلان بن فلان" className="min-h-12 text-base" /></label>
          <div className="flex items-center gap-3"><Checkbox id="official-stamp" checked={sender.official_stamp === true} onCheckedChange={checked => setSender({ ...sender, official_stamp: checked === true })} /><label htmlFor="official-stamp" className="cursor-pointer py-2 text-sm leading-6">تضمين مكان للختم والتوقيع الرسمي</label></div>
          <div className="border-y border-border py-4 space-y-3">
            <h3 className="text-sm font-semibold">خيارات الصياغة</h3>
            <div className="space-y-2"><label id="letter-language-label" className="text-sm">لغة الصياغة</label><Select value={sender.language || "ar"} onValueChange={value => { if (value === "ar" || value === "en") setSender({ ...sender, language: value }); }}><SelectTrigger aria-labelledby="letter-language-label" className="min-h-12"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ar">اللغة العربية الرسمية</SelectItem><SelectItem value="en">اللغة الإنجليزية الرسمية (Formal English)</SelectItem></SelectContent></Select></div>
            <div className="flex items-start gap-3"><Checkbox id="legal-support" className="mt-3 shrink-0" checked={sender.legal_support === true} onCheckedChange={checked => setSender({ ...sender, legal_support: checked === true })} /><label htmlFor="legal-support" className="cursor-pointer py-2 text-sm leading-7">تدعيم الخطاب بالأنظمة واللوائح <span className="text-xs text-muted-foreground">(مثال: الاستناد إلى المادة ٧٧ من نظام العمل، أو لوائح الموارد البشرية)</span></label></div>
            <div className="flex items-center gap-3"><Checkbox id="witnesses" checked={sender.witnesses === true} onCheckedChange={checked => setSender({ ...sender, witnesses: checked === true })} /><label htmlFor="witnesses" className="cursor-pointer py-2 text-sm leading-6">إضافة خانة الشهود / المعرّفين</label></div>
          </div>
          <label className="block space-y-2"><span className="text-sm">{mode === "improve" ? "نص الخطاب الجاهز" : "تفاصيل وسبب الطلب"}</span><textarea required maxLength={8000} value={mode === "improve" ? sender.original_letter || "" : sender.details} onChange={e => setSender({ ...sender, [mode === "improve" ? "original_letter" : "details"]: e.target.value })} onKeyDown={e => { if (shouldSendOnKey(e.key, e.shiftKey, e.nativeEvent.isComposing)) { e.preventDefault(); send(); } }} className="w-full rounded-md border border-input bg-background p-3 text-base min-h-40 resize-y focus:outline-none focus:ring-2 focus:ring-ring" /></label>
          <Button type="submit" disabled={busy || !validLetterRequest(sender, mode)} className="min-h-12 w-full sm:w-auto"><FileText className="w-4 h-4" />{mode === "improve" ? "تحسين وتدقيق الخطاب" : "صياغة المعروض"}</Button>
        </form>}
        {!messages.length && mode === "consultation" && <p className="text-muted-foreground pt-6">السلام عليكم ورحمة الله وبركاته. كيف يمكنني خدمتكم؟</p>}
        {messages.map(message => message.letter && message.letter_id ? <LetterPreview key={message.id} letter={message.letter} letterId={message.letter_id} unlocked={message.unlocked} onUnlock={onSaved} /> :
          <div key={message.id} className={message.role === "user" ? "bg-primary/10 border border-primary/20 rounded-lg p-3 whitespace-pre-wrap break-words" : "whitespace-pre-wrap break-words leading-8"}>{message.content}</div>)}
        {busy && <p role="status" className="text-muted-foreground">جارٍ إعداد الرد…</p>}
        {status && <p role="alert" className="text-accent text-sm">{status}</p>}
        <div ref={end} />
      </div>
    </div>
    {mode === "consultation" && <div className="composer shrink-0 border-t border-border p-2 sm:p-4 bg-background">
      <div className="max-w-4xl mx-auto flex items-end gap-2">
        <textarea aria-label="رسالتك" value={input} onChange={e => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`; }} onKeyDown={e => { if (shouldSendOnKey(e.key, e.shiftKey, e.nativeEvent.isComposing)) { e.preventDefault(); send(); } }} placeholder="اكتب استفسارك هنا..." rows={2} className="flex-1 min-w-0 bg-secondary border border-input rounded-lg p-3 text-base resize-none max-h-40 focus:outline-none focus:ring-2 focus:ring-ring" />
        <Button aria-label="إرسال" size="icon" onKeyDown={e => { if (e.key === " ") e.preventDefault(); }} onClick={send} disabled={busy || !input.trim()} className="min-h-12 min-w-12"><Send className="w-5 h-5" /></Button>
      </div>
    </div>}
  </main>;
}
