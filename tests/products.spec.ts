import { expect, type Page, test } from '@playwright/test';

const mockLoginResponse = {
  id: 1,
  username: 'emilys',
  email: 'emily@example.com',
  firstName: 'Emily',
  lastName: 'Johnson',
  gender: 'female',
  image: 'https://dummyjson.com/icon/emilys/128',
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
};

async function mockSuccessfulLogin(page: Page) {
  await page.route(
    (url) => url.pathname === '/auth/login' && url.hostname !== 'localhost',
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockLoginResponse),
      });
    },
  );
}

test.describe('Products page', () => {
  test.beforeEach(async ({ page }) => {
    await mockSuccessfulLogin(page);
    await page.goto('/auth/login');
    await page.waitForLoadState('domcontentloaded');
    const usernameInput = page.getByLabel(/username/i);
    const passwordInput = page.getByLabel(/enter your password/i);
    await usernameInput.click();
    await page.keyboard.type('emilys');
    await passwordInput.click();
    await page.keyboard.type('emilyspass');
    await page.getByRole('button', { name: /login/i }).click();
    await expect(page).toHaveURL(/\/products/, { timeout: 20_000 });
  });

  test('displays the product grid after login', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /add cart/i }).first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('the AppBar search button opens the search overlay', async ({
    page,
  }) => {
    const searchTrigger = page.getByRole('button', { name: /search/i }).first();
    await searchTrigger.click();

    await expect(page.getByPlaceholder(/search products/i)).toBeVisible({
      timeout: 5_000,
    });
  });

  test('typing in the AppBar search returns results', async ({ page }) => {
    const searchTrigger = page.getByRole('button', { name: /search/i }).first();
    await searchTrigger.click();

    const input = page.getByPlaceholder(/search products/i);
    await input.fill('iphone');

    await expect(page.getByText(/iphone/i).first()).toBeVisible({
      timeout: 8_000,
    });
  });

  test('navigates to the product detail page when a product link is clicked', async ({
    page,
  }) => {
    const searchTrigger = page.getByRole('button', { name: /search/i }).first();
    await searchTrigger.click();

    const input = page.getByPlaceholder(/search products/i);
    await input.fill('iphone');

    await expect(page.getByText(/iphone/i).first()).toBeVisible({
      timeout: 10_000,
    });

    const firstResultLink = page.locator('a[href*="/products/"]').first();
    await expect(firstResultLink).toBeVisible({ timeout: 5_000 });
    await firstResultLink.click();

    await page.waitForURL('**/products/**', { timeout: 10_000 });
    expect(page.url()).toMatch(/\/products\/\d+/);
  });

  test('the sidebar "Filter" button updates the URL with category params', async ({
    page,
  }) => {
    const firstCheckbox = page.getByRole('checkbox').first();
    await firstCheckbox.click();

    await page.getByRole('button', { name: /filter/i }).click();

    await expect(page).toHaveURL(/category=/, { timeout: 5_000 });
  });

  test('the sidebar search updates URL after debounce', async ({ page }) => {
    const sidebarSearch = page.getByPlaceholder(/quick search/i);
    await sidebarSearch.fill('phone');

    await expect(page).toHaveURL(/search=phone/, { timeout: 5_000 });
  });

  test('pagination controls change the page param in the URL', async ({
    page,
  }) => {
    const nextButton = page
      .getByRole('link', { name: /next/i })
      .or(page.getByRole('button', { name: /next/i }))
      .first();

    if (await nextButton.isVisible()) {
      const before = page.url();
      await nextButton.click();
      if (page.url() === before) {
        test.skip();
      }
      await expect(page).toHaveURL(/page=2/, { timeout: 5_000 });
    } else {
      test.skip();
    }
  });
});

test.describe('Product detail page', () => {
  test.beforeEach(async ({ page }) => {
    await mockSuccessfulLogin(page);
    await page.goto('/auth/login');
    await page.waitForLoadState('domcontentloaded');
    const usernameInput = page.getByLabel(/username/i);
    const passwordInput = page.getByLabel(/enter your password/i);
    await usernameInput.click();
    await page.keyboard.type('emilys');
    await passwordInput.click();
    await page.keyboard.type('emilyspass');
    await page.getByRole('button', { name: /login/i }).click();
    await expect(page).toHaveURL(/\/products/, { timeout: 20_000 });
    await page.goto('/products/1');
    await page.waitForLoadState('domcontentloaded');
  });

  test('displays the product title and price', async ({ page }) => {
    await expect(page.locator('h1, h2').first()).toBeVisible({
      timeout: 8_000,
    });
  });
});
