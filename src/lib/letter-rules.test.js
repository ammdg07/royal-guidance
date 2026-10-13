import { expect, test } from "bun:test";
import { entityAddressee, toneIssues, validAttachments } from "../../supabase/functions/_shared/letter-rules.ts";
test("Emirates get the royal highness title", () => { expect(entityAddressee("إمارة منطقة الرياض")).toBe("صاحب السمو الملكي أمير منطقة الرياض حفظه الله"); });
test("Ministries get معالي الوزير", () => { expect(entityAddressee("وزارة الداخلية")).toBe("معالي وزير الداخلية حفظه الله"); });
test("Departments and companies get سعادة مدير عام", () => { expect(entityAddressee("شركة الاتصالات")).toBe("سعادة مدير عام شركة الاتصالات المحترم"); });
test("Colloquial and harsh words are flagged", () => {
  expect(toneIssues("ابغى موعد عشان الموظفين فاشلين")).toEqual(["ابغى", "عشان", "فاشلين"]);
  expect(toneIssues("أرجو التكرم بالموافقة")).toEqual([]);
});
test("Attachments are optional short strings", () => {
  expect(validAttachments(undefined)).toBe(true);
  expect(validAttachments(["صورة الهوية الوطنية"])).toBe(true);
  expect(validAttachments([""])).toBe(false);
  expect(validAttachments("صورة")).toBe(false);
});
