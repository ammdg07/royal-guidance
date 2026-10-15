import { describe, expect, test } from "bun:test";
import { pricingPlans } from "./pricing.ts";

describe("fixed-term pricing", () => {
  test("individual costs 20 SAR", () => expect(pricingPlans[0].priceSar).toBe(20));
  test("individual grants up to 15 letters", () => expect(pricingPlans[0].letterLimit).toBe(15));
  test("individual lasts 30 days", () => expect(pricingPlans[0].durationDays).toBe(30));
  test("individual does not renew automatically", () => expect(pricingPlans[0].autoRenew).toBe(false));
  test("business costs 50 SAR", () => expect(pricingPlans[1].priceSar).toBe(50));
  test("business grants up to 100 letters", () => expect(pricingPlans[1].letterLimit).toBe(100));
  test("business lasts 30 days", () => expect(pricingPlans[1].durationDays).toBe(30));
  test("business does not renew automatically", () => expect(pricingPlans[1].autoRenew).toBe(false));
});