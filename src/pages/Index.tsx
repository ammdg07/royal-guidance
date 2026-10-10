import { useEffect, useRef, useState } from "react";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatInterface } from "@/components/ChatInterface";
import { AccountSettings } from "@/components/AccountSettings";
import { AuthScreen } from "@/components/AuthScreen";
import { useAccount } from "@/hooks/use-account";
import { Button } from "@/components/ui/button";
const Index = () => {
  const { user, loading } = useAccount();
  const [sidebar, setSidebar] = useState(false);
  const [settings, setSettings] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [reset, setReset] = useState(0);
  const [selected, setSelected] = useState<{ id: string; kind: "letter" | "conversation" } | null>(null);
  const shell = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const viewport = window.visualViewport;
    const update = () => { if (shell.current) { shell.current.style.height = `${viewport?.height || window.innerHeight}px`; shell.current.style.top = `${viewport?.offsetTop || 0}px`; } };
    update(); viewport?.addEventListener("resize", update); viewport?.addEventListener("scroll", update); window.addEventListener("resize", update);
    return () => { viewport?.removeEventListener("resize", update); viewport?.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, [user, loading]);
  useEffect(() => { const handler = (event: KeyboardEvent) => { if (event.key === "Escape") setSidebar(false); }; window.addEventListener("keydown", handler); return () => window.removeEventListener("keydown", handler); }, []);
  if (loading) return <div className="min-h-[100dvh] flex items-center justify-center">جارٍ التحميل…</div>;
  if (!user) return <AuthScreen />;
  const clear = () => { setSelected(null); setReset(v => v + 1); setRefresh(v => v + 1); setSidebar(false); };
  return <div ref={shell} className="app-shell flex w-full bg-background" dir="rtl">
    {sidebar && <><Button aria-label="إغلاق القائمة" variant="ghost" className="sidebar-backdrop fixed inset-0 z-40 h-full w-full rounded-none p-0 lg:hidden" onClick={() => setSidebar(false)} /><div className="absolute inset-y-0 right-0 z-50 lg:relative shrink-0"><ChatSidebar refresh={refresh} onClose={() => setSidebar(false)} onNew={clear} onSettings={() => { setSidebar(false); setSettings(true); }} onSelect={item => { setSelected(item); setSidebar(false); }} /></div></>}
    <ChatInterface key={user.id} onMenu={() => setSidebar(!sidebar)} onSettings={() => setSettings(true)} selected={selected} reset={reset} onSaved={() => setRefresh(v => v + 1)} />
    <AccountSettings open={settings} onOpenChange={setSettings} onCleared={clear} />
  </div>;
};
export default Index;
