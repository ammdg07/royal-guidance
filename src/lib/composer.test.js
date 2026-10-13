import { expect, test } from "bun:test";
import { shouldSendOnKey, validLetterRequest } from "./composer";
test("Space never sends", () => { expect(shouldSendOnKey(" ", false)).toBe(false); });
test("Shift Enter inserts a line instead of sending", () => { expect(shouldSendOnKey("Enter", true)).toBe(false); });
test("Enter sends only outside text composition", () => { expect(shouldSendOnKey("Enter", false)).toBe(true); expect(shouldSendOnKey("Enter", false, true)).toBe(false); });
test("All five letter details are mandatory", () => {
  const request = { full_name: "أحمد محمد", national_id: "1234567890", mobile: "0501234567", entity: "وزارة الداخلية", details: "طلب مساعدة" };
  expect(validLetterRequest(request)).toBe(true);
  for (const key of Object.keys(request)) expect(validLetterRequest({ ...request, [key]: " " })).toBe(false);
});
test("Recipient person and official stamp are optional", () => {
  const request = { full_name: "أحمد محمد", national_id: "1234567890", mobile: "0501234567", entity: "وزارة الداخلية", details: "طلب مساعدة", recipient_person: "", official_stamp: false };
  expect(validLetterRequest(request)).toBe(true);
  expect(validLetterRequest({ ...request, recipient_person: "سعادة المدير العام", official_stamp: true })).toBe(true);
  expect(validLetterRequest({ ...request, entity: "", official_stamp: true })).toBe(false);
});
test("Revision requires original text and sender details, not new request details", () => {
  const request = { full_name: "أحمد", national_id: "1234567890", mobile: "0501234567", entity: "مستشفى", details: "", original_letter: "أطلب موعداً للعلاج" };
  expect(validLetterRequest(request, "improve")).toBe(true);
  expect(validLetterRequest({ ...request, original_letter: " " }, "improve")).toBe(false);
  expect(validLetterRequest({ ...request, national_id: "" }, "improve")).toBe(false);
  expect(validLetterRequest(request)).toBe(false);
});