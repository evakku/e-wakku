import { test, expect } from "@playwright/test";

test.describe("E-Wakku E2E Smoke Tests", () => {
  test("public home page loads successfully", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/E-Wakku/i);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("all issues archive page renders issues list", async ({ page }) => {
    await page.goto("/allIssues");
    await expect(page.locator("h1")).toContainText(/All Issues/i);
  });

  test("admin login page renders authentication form", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
  });

  test("unauthenticated admin access redirects to login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/.*\/admin\/login.*/);
  });
});
