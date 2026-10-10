import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface Profile { full_name: string; national_id: string; mobile: string; theme: string }
const defaults: Profile = { full_name: "", national_id: "", mobile: "", theme: "dark" };
const AccountContext = createContext<{ user: User | null; loading: boolean; profile: Profile;
  saveProfile: (p: Profile) => Promise<void> }>({ user: null, loading: true, profile: defaults, saveProfile: async () => {} });

export function AccountProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(defaults);
  useEffect(() => {
    if (!document.getElementById("shl-arabic-font")) {
      const link = document.createElement("link");
      link.id = "shl-arabic-font";
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap";
      document.head.appendChild(link);
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getUser().then(({ data }) => { setUser(data.user); setLoading(false); });
    return () => subscription.unsubscribe();
  }, []);
  useEffect(() => {
    let live = true;
    setProfile(defaults);
    if (user) supabase.from("profiles").select("full_name,national_id,mobile,theme").eq("id", user.id).maybeSingle()
      .then(({ data }) => { if (live && data) setProfile(data); });
    return () => { live = false; };
  }, [user?.id]);
  useEffect(() => {
    document.documentElement.classList.toggle("light", profile.theme === "light");
    document.documentElement.classList.toggle("dark", profile.theme !== "light");
  }, [profile.theme]);
  const saveProfile = async (p: Profile) => {
    if (!user) return;
    const { error } = await supabase.from("profiles").upsert({ id: user.id, ...p });
    if (error) throw error;
    setProfile(p);
  };
  return <AccountContext.Provider value={{ user, loading, profile, saveProfile }}>{children}</AccountContext.Provider>;
}
export const useAccount = () => useContext(AccountContext);