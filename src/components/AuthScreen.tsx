import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SHLLogo } from "./SHLLogo";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

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
  return <main className="min-h-[100dvh] flex items-center justify-center bg-background p-5" dir="rtl">
    <section className="w-full max-w-sm space-y-6">
      <div className="flex justify-center"><SHLLogo size="lg" /></div>
      <h1 className="text-xl text-center font-semibold">{signup ? "إنشاء حساب" : "تسجيل الدخول"}</h1>
      <Button variant="outline" className="w-full min-h-12" onClick={google} disabled={busy}>المتابعة باستخدام Google</Button>
      <form onSubmit={submit} className="space-y-4">
        <label className="block space-y-2"><span>البريد الإلكتروني</span><Input dir="ltr" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className="min-h-12 text-base" /></label>
        <label className="block space-y-2"><span>كلمة المرور</span><Input dir="ltr" type="password" autoComplete={signup ? "new-password" : "current-password"} minLength={8} required value={password} onChange={e => setPassword(e.target.value)} className="min-h-12 text-base" /></label>
        <Button disabled={busy} className="w-full min-h-12" type="submit">{signup ? "إنشاء الحساب" : "دخول"}</Button>
      </form>
      {status && <p role="status" className="text-sm text-accent">{status}</p>}
      <Button variant="ghost" className="w-full min-h-12" onClick={() => { setSignup(!signup); setStatus(""); }}>{signup ? "لديك حساب؟ تسجيل الدخول" : "إنشاء حساب جديد"}</Button>
    </section>
  </main>;
}