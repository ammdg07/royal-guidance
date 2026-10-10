import { useEffect, useState } from "react";
import { Plus, FileText, MessageSquare, Search, Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SHLLogo } from "./SHLLogo";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "@/hooks/use-account";
interface Item { id: string; title: string; created_at: string; kind: "letter" | "conversation"; unlocked?: boolean }
export function ChatSidebar({ onClose, onNew, onSettings, onSelect, refresh }: {
  onClose: () => void; onNew: () => void; onSettings: () => void; onSelect: (item: Item) => void; refresh: number;
}) {
  const { user } = useAccount();
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (!user) return;
    let live = true;
    Promise.all([supabase.from("letters").select("id,preview,created_at,unlocked").eq("user_id", user.id).order("created_at", { ascending: false }), supabase.from("conversations").select("id,title,created_at").eq("user_id", user.id).order("created_at", { ascending: false })]).then(([letters, chats]) => {
      if (!live) return;
      if (letters.error || chats.error) { setError("تعذّر تحميل السجل."); return; }
      setError(""); setItems([...(letters.data || []).map(l => ({ id: l.id, title: (l.preview as { subject?: string }).subject || "خطاب رسمي", created_at: l.created_at, unlocked: l.unlocked, kind: "letter" as const })), ...(chats.data || []).map(c => ({ ...c, kind: "conversation" as const }))].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)));
    });
    return () => { live = false; };
  }, [user?.id, refresh]);
  const day = (date: string) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh" }).format(new Date(date));
  const today = day(new Date().toISOString());
  const yesterday = day(new Date(Date.now() - 86400000).toISOString());
  const groups = [{ label: "اليوم", matches: (i: Item) => day(i.created_at) === today }, { label: "أمس", matches: (i: Item) => day(i.created_at) === yesterday }, { label: "سابقاً", matches: (i: Item) => ![today, yesterday].includes(day(i.created_at)) }];
  return <aside className="h-full w-72 max-w-[85vw] flex flex-col bg-background border-l border-border" dir="rtl">
    <div className="p-4 flex items-center justify-between border-b border-border"><SHLLogo size="sm" /><Button aria-label="إغلاق القائمة" variant="ghost" size="icon" onClick={onClose} className="min-w-12 min-h-12"><X className="w-5 h-5" /></Button></div>
    <div className="p-3 space-y-3"><Button variant="neon" onClick={onNew} className="min-h-12 w-full"><Plus className="w-4 h-4" />محادثة جديدة</Button><div className="relative"><Search className="absolute right-3 top-4 w-4 h-4 text-muted-foreground" /><Input aria-label="البحث في السجل" placeholder="البحث في السجل" value={search} onChange={e => setSearch(e.target.value)} className="min-h-12 pr-9 text-base" /></div></div>
    <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-5">
      {groups.map(group => { const list = items.filter(i => group.matches(i) && i.title.includes(search)); return list.length ? <section key={group.label}><h2 className="text-xs text-muted-foreground mb-2">{group.label}</h2>{list.map(i => <Button key={i.id} variant="ghost" onClick={() => onSelect(i)} className="w-full min-h-12 justify-start text-right mb-1">{i.kind === "letter" ? <FileText className="w-4 h-4 shrink-0" /> : <MessageSquare className="w-4 h-4 shrink-0" />}<span className="truncate">{i.title}</span>{i.unlocked && <span className="text-primary text-xs">مفتوح</span>}</Button>)}</section> : null; })}
      {!items.length && <p className="text-sm text-muted-foreground">لا يوجد سجل بعد.</p>}{error && <p role="status" className="text-sm text-accent">{error}</p>}
    </div>
    <div className="p-3 border-t border-border"><Button variant="ghost" onClick={onSettings} className="min-h-12 w-full"><Settings className="w-4 h-4" />الإعدادات</Button></div>
  </aside>;
}
