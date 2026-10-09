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