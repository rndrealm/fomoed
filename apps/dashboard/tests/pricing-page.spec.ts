import { test, expect } from "@playwright/test";

test.describe("Pricing page", () => {
  test("should be accessible to logged in users", async ({ page }) => {
    await page.goto("/pricing");

    await expect(page.getByText("Get your free trial to Unlock More")).toBeVisible();
  });
});
