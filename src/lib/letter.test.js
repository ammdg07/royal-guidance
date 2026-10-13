import { describe, expect, test } from "bun:test";
import { letterToText, signatureLines, witnessLines } from "./letter";

const letter = {
  addressee: "سعادة المدير", subject: "طلب", greeting: "السلام عليكم",
  body: ["أتقدم بطلب الموافقة."], closing: "وفقكم الله", sender_label: "مقدمه",
  sender_name: "أحمد محمد", sender_id: "1234567890",
  sender_mobile: "0501234567", sender_date: "8 أكتوبر 2026",
};

describe("letter sender details", () => {
  test("Exactly two witness spaces contain name, ID and signature only when selected", () => {
    const lines = witnessLines({ ...letter, witnesses: true });
    expect(lines).toHaveLength(8);
    expect(lines[0]).toBe("الشاهد / المعرّف 1");
    expect(lines[4]).toBe("الشاهد / المعرّف 2");
    for (const field of ["الاسم", "رقم الهوية", "التوقيع"]) expect(lines.filter(line => line.startsWith(field + ":"))).toHaveLength(2);
    expect(witnessLines(letter)).toEqual([]);
    expect(letterToText({ ...letter, witnesses: true })).toContain(lines[4]);
  });
  test("Formal English exports retain sender details with English labels", () => {
    const text = letterToText({ ...letter, language: "en", witnesses: true, official_stamp: true });
    expect(text).toContain("Subject: طلب");
    expect(text).toContain("National ID: 1234567890");
    expect(text).toContain("Witness / Identifier 2");
    expect(text).toContain("Official stamp:");
    expect(text).not.toContain("الموضوع:");
  });
  test("official stamp and signature placeholders appear only when requested", () => {
    expect(letterToText({ ...letter, official_stamp: true })).toContain("الختم الرسمي: ________________");
    expect(letterToText({ ...letter, official_stamp: true })).toContain("التوقيع الرسمي: ________________");
    expect(letterToText({ ...letter, official_stamp: false })).not.toContain("الختم الرسمي:");
    expect(letterToText(letter)).not.toContain("التوقيع الرسمي:");
  });
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