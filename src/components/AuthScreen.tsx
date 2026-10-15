import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SHLLogo } from "./SHLLogo";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { WhySHL } from "./WhySHL";
import { PricingModal } from "./PricingModal";

export function AuthScreen() {
  const [signup, setSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setStatus("");
    try {
      const { error } = signup
        ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } })
        : await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (signup) setStatus("أرسلنا رابط تأكيد إلى بريدك الإلكتروني. يرجى تأكيد البريد قبل الدخول.");
    } catch { setStatus("تعذّر إكمال الطلب. تحقّق من البريد وكلمة المرور ثم حاول مجدداً."); }
    finally { setBusy(false); }
  };
  const google = async () => {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
      if (result.error) setStatus("تعذّر تسجيل الدخول عبر Google. حاول مجدداً.");
    } finally { setBusy(false); }
  };
  return <div className="min-h-[100dvh] bg-background" dir="rtl">
    <header className="border-b border-border px-3 py-3 sm:px-6"><div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
      <SHLLogo size="sm" />
      <nav aria-label="الحساب" className="flex gap-2">
        <Button variant={signup ? "outline" : "default"} className="min-h-11 px-3 text-sm" onClick={() => { setSignup(false); setStatus(""); }}>تسجيل الدخول</Button>
        <Button variant={signup ? "default" : "outline"} className="min-h-11 px-3 text-sm" onClick={() => { setSignup(true); setStatus(""); }}>إنشاء حساب جديد</Button>
      </nav>
    </div></header>
    <section className="mx-auto max-w-2xl px-5 pt-8 pb-3 text-center"><h1 className="text-2xl font-semibold">منصة سهل</h1><p className="mt-3 text-base leading-8 text-muted-foreground">منصة ذكية لصياغة المعاريض والخطابات الرسمية الموجّهة للجهات الحكومية والخاصة بدقة وسرعة.</p></section>
    <div className="mx-auto max-w-2xl space-y-3 px-5 py-3"><WhySHL /><div className="flex justify-center"><PricingModal /></div></div>
    <main className="flex items-center justify-center p-5 pb-10">
    <section className="w-full max-w-sm space-y-6">
      <div className="flex justify-center"><SHLLogo size="lg" /></div>
      <h2 className="text-xl text-center font-semibold">{signup ? "إنشاء حساب" : "تسجيل الدخول"}</h2>
      <Button variant="outline" className="w-full min-h-12" onClick={google} disabled={busy}>المتابعة باستخدام Google</Button>
      <form onSubmit={submit} className="space-y-4">
        <label className="block space-y-2"><span>البريد الإلكتروني</span><Input dir="ltr" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className="min-h-12 text-base" /></label>
        <label className="block space-y-2"><span>كلمة المرور</span><Input dir="ltr" type="password" autoComplete={signup ? "new-password" : "current-password"} minLength={8} required value={password} onChange={e => setPassword(e.target.value)} className="min-h-12 text-base" /></label>
        <Button disabled={busy} className="w-full min-h-12" type="submit">{signup ? "إنشاء الحساب" : "دخول"}</Button>
      </form>
      {status && <p role="status" className="text-sm text-accent">{status}</p>}
      <Button variant="ghost" className="w-full min-h-12" onClick={() => { setSignup(!signup); setStatus(""); }}>{signup ? "لديك حساب؟ تسجيل الدخول" : "إنشاء حساب جديد"}</Button>
    </section>
  </main></div>;
}