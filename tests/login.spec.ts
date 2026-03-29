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

async function mockFailedLogin(page: Page) {
  await page.route(
    (url) => url.pathname === '/auth/login' && url.hostname !== 'localhost',
    async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Invalid credentials' }),
      });
    },
  );
}

async function fillInput(
  page: Page,
  locator: ReturnType<Page['getByLabel']>,
  value: string,
) {
  await locator.click();
  await page.keyboard.type(value);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/auth/login');
});

test.describe('Login page', () => {
  test('renders the login form with username and password fields', async ({
    page,
  }) => {
    await expect(page.getByLabel(/username/i)).toBeVisible();
    await expect(page.getByLabel(/enter your password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
  });

  test('shows field validation errors when form is submitted empty', async ({
    page,
  }) => {
    await page.getByRole('button', { name: /login/i }).click();

    await expect(page.getByText(/username is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test('shows only the password error when username is filled but password is empty', async ({
    page,
  }) => {
    await fillInput(page, page.getByLabel(/username/i), 'emilys');
    await page.getByRole('button', { name: /login/i }).click();

    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test('shows an error message for invalid credentials', async ({ page }) => {
    await mockFailedLogin(page);
    await page.goto('/auth/login');
    await page.waitForLoadState('domcontentloaded');
    await fillInput(page, page.getByLabel(/username/i), 'wronguser');
    await fillInput(page, page.getByLabel(/enter your password/i), 'wrongpass');
    await page.getByRole('button', { name: /login/i }).click();

    await expect(page.locator('[class*="red"]').first()).toBeVisible({
      timeout: 8_000,
    });
  });

  test('redirects to /products after a successful login', async ({ page }) => {
    await mockSuccessfulLogin(page);
    await page.goto('/auth/login');
    await page.waitForLoadState('domcontentloaded');
    await fillInput(page, page.getByLabel(/username/i), 'emilys');
    await fillInput(
      page,
      page.getByLabel(/enter your password/i),
      'emilyspass',
    );
    await page.getByRole('button', { name: /login/i }).click();

    await expect(page).toHaveURL(/\/products/, { timeout: 20_000 });
    expect(page.url()).toContain('/products');
  });

  test('"Remember me" checkbox toggles its aria-checked state', async ({
    page,
  }) => {
    const checkbox = page.getByRole('checkbox', { name: /remember me/i });
    await expect(checkbox).toHaveAttribute('aria-checked', 'false');

    await checkbox.click();
    await expect(checkbox).toHaveAttribute('aria-checked', 'true');

    await checkbox.click();
    await expect(checkbox).toHaveAttribute('aria-checked', 'false');
  });

  test('saves username to localStorage when "Remember me" is checked and login succeeds', async ({
    page,
  }) => {
    await mockSuccessfulLogin(page);
    await page.goto('/auth/login');
    await page.waitForLoadState('domcontentloaded');
    await page.getByRole('checkbox', { name: /remember me/i }).click();
    await fillInput(page, page.getByLabel(/username/i), 'emilys');
    await fillInput(
      page,
      page.getByLabel(/enter your password/i),
      'emilyspass',
    );
    await page.getByRole('button', { name: /login/i }).click();

    await expect(page).toHaveURL(/\/products/, { timeout: 20_000 });

    const stored = await page.evaluate(() =>
      localStorage.getItem('remember_me'),
    );
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!)).toEqual({ username: 'emilys' });
  });

  test('does NOT save to localStorage when "Remember me" is unchecked and login succeeds', async ({
    page,
  }) => {
    await mockSuccessfulLogin(page);
    await page.goto('/auth/login');
    await page.waitForLoadState('domcontentloaded');
    await fillInput(page, page.getByLabel(/username/i), 'emilys');
    await fillInput(
      page,
      page.getByLabel(/enter your password/i),
      'emilyspass',
    );
    await expect(
      page.getByRole('checkbox', { name: /remember me/i }),
    ).toHaveAttribute('aria-checked', 'false');
    await page.getByRole('button', { name: /login/i }).click();

    await expect(page).toHaveURL(/\/products/, { timeout: 20_000 });

    const stored = await page.evaluate(() =>
      localStorage.getItem('remember_me'),
    );
    expect(stored).toBeNull();
  });

  test('clears localStorage when "Remember me" is unchecked after being previously set', async ({
    page,
  }) => {
    await mockSuccessfulLogin(page);
    await page.evaluate(() =>
      localStorage.setItem(
        'remember_me',
        JSON.stringify({ username: 'emilys' }),
      ),
    );
    await page.reload();

    const checkbox = page.getByRole('checkbox', { name: /remember me/i });
    await expect(checkbox).toHaveAttribute('aria-checked', 'true');
    await checkbox.click();
    await expect(checkbox).toHaveAttribute('aria-checked', 'false');

    await fillInput(
      page,
      page.getByLabel(/enter your password/i),
      'emilyspass',
    );
    await page.getByRole('button', { name: /login/i }).click();

    await expect(page).toHaveURL(/\/products/, { timeout: 20_000 });

    const stored = await page.evaluate(() =>
      localStorage.getItem('remember_me'),
    );
    expect(stored).toBeNull();
  });

  test('pre-fills username and checks the checkbox when localStorage has saved credentials', async ({
    page,
  }) => {
    await page.evaluate(() =>
      localStorage.setItem(
        'remember_me',
        JSON.stringify({ username: 'emilys' }),
      ),
    );
    await page.reload();

    await expect(page.getByLabel(/username/i)).toHaveValue('emilys');
    await expect(
      page.getByRole('checkbox', { name: /remember me/i }),
    ).toHaveAttribute('aria-checked', 'true');
  });
});
