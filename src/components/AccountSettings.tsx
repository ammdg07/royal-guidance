import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAccount } from "@/hooks/use-account";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, LogOut, Save } from "lucide-react";

export function AccountSettings({ open, onOpenChange, onCleared }: { open: boolean; onOpenChange: (open: boolean) => void; onCleared: () => void }) {
  const { profile, user, saveProfile } = useAccount();
  const [draft, setDraft] = useState(profile);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { setDraft(profile); }, [profile, open]);
  const save = async () => {
    setBusy(true); try { await saveProfile(draft); setStatus("تم حفظ الإعدادات."); }
    catch { setStatus("تعذّر الحفظ. حاول مجدداً."); } finally { setBusy(false); }
  };
  const clear = async () => {
    if (!user || !window.confirm("هل تريد حذف جميع الخطابات والمحادثات نهائياً؟")) return;
    setBusy(true);
    try {
      const results = await Promise.all([supabase.from("letters").delete().eq("user_id", user.id), supabase.from("conversations").delete().eq("user_id", user.id)]);
      if (results.some(r => r.error)) throw new Error();
      onCleared(); setStatus("تم حذف سجل الخطابات والمحادثات.");
    } catch { setStatus("تعذّر حذف السجل بالكامل. حاول مجدداً."); } finally { setBusy(false); }
  };
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent dir="rtl" className="max-h-[90dvh] overflow-y-auto"><DialogHeader><DialogTitle>الإعدادات</DialogTitle></DialogHeader>
    {([['full_name', 'الاسم الكامل'], ['national_id', 'رقم الهوية الوطنية'], ['mobile', 'رقم الجوال']] as const).map(([key, label]) => <label key={key} className="block space-y-2"><span>{label}</span><Input value={draft[key]} onChange={e => setDraft({ ...draft, [key]: e.target.value })} className="min-h-12 text-base" /></label>)}
    <p className="text-xs text-muted-foreground">لا تُحفظ هذه البيانات إلا عند الضغط على «حفظ» وبموافقتك، ولا يُحفظ شيء قبل تسجيل الدخول.</p>
    <Button onClick={save} disabled={busy} className="min-h-12"><Save className="w-4 h-4" />حفظ</Button>
    <Button variant="destructive" onClick={clear} disabled={busy} className="min-h-12"><Trash2 className="w-4 h-4" />مسح سجل الخطابات والمحادثات</Button>
    <Button variant="outline" onClick={() => supabase.auth.signOut()} className="min-h-12"><LogOut className="w-4 h-4" />تسجيل الخروج</Button>
    {status && <p role="status" className="text-sm">{status}</p>}
  </DialogContent></Dialog>;
}