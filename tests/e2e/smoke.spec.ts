import { test, expect } from "@playwright/test";

test.describe("ExecutiveOS smoke tests", () => {
  test("landing page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/ExecutiveOS/i).first()).toBeVisible();
  });

  test("sign-in page loads", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.getByRole("heading")).toBeVisible();
  });

  test("protected routes redirect unauthenticated users", async ({ page }) => {
    await page.goto("/today");
    await expect(page).toHaveURL(/sign-in/);
  });

  test("dashboard alias redirects toward today", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/today|sign-in/);
  });
});
