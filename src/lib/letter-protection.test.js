import { describe, expect, test } from "bun:test";
import { letterProtection } from "./letter-protection.ts";

describe("letter payment protection", () => {
  test("unpaid drafts are watermarked with selection and exports restricted", () => {
    expect(letterProtection(false)).toEqual({ watermarked: true, selectable: false, canExport: false });
  });
  test("verified payment removes the watermark and enables selection and exports", () => {
    expect(letterProtection(true)).toEqual({ watermarked: false, selectable: true, canExport: true });
  });
});