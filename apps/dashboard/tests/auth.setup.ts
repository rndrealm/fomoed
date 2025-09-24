import { test as setup, expect } from "@playwright/test";
import path from "path";
import { createUserUtil, getTestUserEmail, initAdminSupabase } from "./utils";
import { TEST_USER_PASSWORD, USER_0_ID, USER_1_ID } from "./constants";

const authFile = path.join(__dirname, "../playwright/.auth/user.json");

setup.beforeAll(async () => {
  await initAdminSupabase();

  await createUserUtil(USER_0_ID);
  await createUserUtil(USER_1_ID);
});

setup("authenticate", async ({ page }) => {
  await page.goto("/auth/login");

  await page.getByRole("textbox", { name: "Email address" }).fill(getTestUserEmail(USER_1_ID));
  await page.getByRole("textbox", { name: "Password" }).fill(TEST_USER_PASSWORD);
  await page.getByRole("button", { name: /^Sign in$/ }).click();
  // Wait until the page receives the cookies.
  //
  // Sometimes login flow sets cookies in the process of several redirects.
  // Wait for the final URL to ensure that the cookies are actually set.
  await page.waitForURL("/dashboard");
  // Alternatively, you can wait until the page reaches a state where all cookies are set.

  await expect(page.getByLabel("user-menu-toggle")).toBeVisible();

  // End of authentication steps.

  await page.context().storageState({ path: authFile });
});
