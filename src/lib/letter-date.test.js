import { expect, test } from "bun:test";
import { formatLetterDate } from "../../supabase/functions/_shared/letter-date.ts";
import { signatureLines, letterToText } from "./letter";

test("letter signature and exports retain both Hijri and Gregorian dates", () => {
  const date = formatLetterDate(new Date("2026-10-11T03:01:00Z"));
  expect(date).toBe("30 ربيع الآخر 1448 هـ، الموافق 11 أكتوبر 2026 م");
  const letter = { addressee: "سعادة المدير", subject: "طلب", greeting: "السلام عليكم",
    body: ["أتقدم بطلب الموافقة"], closing: "وفقكم الله", sender_label: "مقدمه", sender_date: date };
  expect(signatureLines(letter)).toContain(`التاريخ: ${date}`);
  expect(letterToText(letter)).toContain(`التاريخ: ${date}`);
});

test("both calendars use the same Riyadh day at the UTC date boundary", () => {
  expect(formatLetterDate(new Date("2026-10-10T21:01:00Z")))
    .toBe(formatLetterDate(new Date("2026-10-11T03:01:00Z")));
});