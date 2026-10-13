const laborSource = "https://laws.boe.gov.sa/BoeLaws/Laws/LawDetails/08381293-6388-48e2-8ad2-a9a700f2aa94/1";

// Fixed official source: no user URLs, redirects or client instructions are fetched.
export async function legalContext(details: string): Promise<string> {
  if (!/نظام العمل|عقد العمل|فصل|تعويض|راتب|موظف|labor|employment|termination/i.test(details)) return "";
  try {
    const response = await fetch(laborSource, { redirect: "error" });
    if (!response.ok || !response.headers.get("content-type")?.includes("text/html")) return "";
    const html = await response.text();
    if (html.length > 2_000_000) return "";
    const text = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ").replace(/<[^>]*>/g, " ").replace(/&nbsp;|&#160;/g, " ").replace(/\s+/g, " ");
    const start = text.indexOf("المادة الأولى");
    if (start < 0 || !text.includes("نظام العمل") || !text.includes("المادة السابعة والسبعون")) return "";
    // Do not silently truncate the law and lose amendments or exceptions.
    if (text.length - start > 100000) return "";
    return `المصدر الرسمي: ${laborSource}\n${text.slice(start)}`;
  } catch { return ""; }
}