import { describe, expect, test } from "bun:test";
import { letterToText, signatureLines } from "./letter";

const letter = {
  addressee: "سعادة المدير", subject: "طلب", greeting: "السلام عليكم",
  body: ["أتقدم بطلب الموافقة."], closing: "وفقكم الله", sender_label: "مقدمه",
  sender_name: "أحمد محمد", sender_id: "1234567890",
  sender_mobile: "0501234567", sender_date: "8 أكتوبر 2026",
};

describe("letter sender details", () => {
  test("uses every supplied value in the signature without placeholders", () => {
    expect(signatureLines(letter)).toEqual([
      "مقدمه: أحمد محمد", "رقم الهوية: 1234567890",
      "التواصل: 0501234567", "التاريخ: 8 أكتوبر 2026",
    ]);
  });
  test("clipboard retains the supplied sender details", () => {
    const text = letterToText(letter);
    for (const value of ["أحمد محمد", "1234567890", "0501234567", "8 أكتوبر 2026"]) {
      expect(text).toContain(value);
    }
    expect(text).not.toMatch(/\[[^\]]+\]/);
  });
  test("does not invent missing sender details", () => {
    expect(signatureLines({ ...letter, sender_name: undefined, sender_id: undefined,
      sender_mobile: undefined, sender_date: undefined })).toEqual([
        "مقدمه: ________________", "التواصل: ________________", "التاريخ: ________________",
      ]);
  });
});