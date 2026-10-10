import { createClient } from "npm:@supabase/supabase-js@2";
export async function account(req: Request) {
  const url = Deno.env.get("SUPABASE_URL") || "";
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "");
  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "") || "";
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return null;
  return { admin, user: data.user };
}