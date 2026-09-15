import { test, expect } from "@playwright/test";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByRole("button", { name: "Giriş Yap" }).click();
  await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });
}

test("login → dashboard → denemeler", async ({ page }) => {
  await login(page);
  await expect(page.getByRole("heading", { name: /Hoş geldiniz/ })).toBeVisible();

  await page.getByRole("link", { name: /Deneme Sınavları/ }).click();
  await expect(page).toHaveURL(/denemeler/);
  await expect(page.getByRole("heading", { name: /Deneme Sınavları/ })).toBeVisible();
});

test("müfredat ve tercih sayfaları açılır", async ({ page }) => {
  await login(page);
  await page.goto("/mufredat");
  await expect(page.getByRole("heading", { name: /Müfredat/ })).toBeVisible({ timeout: 15000 });
  await page.goto("/tercih");
  await expect(page.getByRole("heading", { name: /Tercih/ })).toBeVisible();
});
