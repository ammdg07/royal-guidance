import { expect, test } from "bun:test";
import { legalInstruction, validLetterOptions, revisionInstruction } from "../../supabase/functions/_shared/letter-options.ts";
test("Server accepts only supported languages", () => {
  expect(validLetterOptions({ language: "ar" })).toBe(true);
  expect(validLetterOptions({ language: "en" })).toBe(true);
  expect(validLetterOptions({ language: "fr" })).toBe(false);
});
test("Server rejects non-boolean advanced checkbox values", () => {
  for (const field of ["witnesses", "legal_support", "official_stamp"]) {
    expect(validLetterOptions({ [field]: true })).toBe(true);
    expect(validLetterOptions({ [field]: "true" })).toBe(false);
  }
});
test("Legal fallback forbids numbered citations without a verified source", () => {
  expect(legalInstruction("")).toContain("يُمنع ذكر أرقام مواد");
  expect(legalInstruction("نص رسمي")).toContain("نص رسمي");
});
test("Revision preserves original facts and demands", () => {
  expect(revisionInstruction(true)).toContain("لا تضف وقائع أو مطالب جديدة");
  expect(revisionInstruction(false)).not.toContain("أعد حبكة");
});