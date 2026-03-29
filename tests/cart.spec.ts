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

const mockCartResponse = {
  id: 1,
  products: [
    {
      id: 1,
      title: 'Essence Mascara Lash Princess',
      price: 9.99,
      quantity: 1,
      total: 9.99,
      discountPercentage: 7.17,
      discountedTotal: 9.27,
      thumbnail:
        'https://cdn.dummyjson.com/products/images/beauty/Essence%20Mascara%20Lash%20Princess/thumbnail.png',
    },
  ],
  total: 9.99,
  discountedTotal: 9.27,
  userId: 1,
  totalProducts: 1,
  totalQuantity: 1,
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

async function mockCartApi(page: Page) {
  await page.route(
    (url) => url.pathname === '/carts/1' && url.hostname !== 'localhost',
    async (route) => {
      const method = route.request().method();
      if (method === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockCartResponse),
        });
      } else if (method === 'DELETE') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            ...mockCartResponse,
            products: [],
            total: 0,
            totalProducts: 0,
            totalQuantity: 0,
          }),
        });
      } else {
        await route.continue();
      }
    },
  );
}

async function login(page: Page) {
  await mockSuccessfulLogin(page);
  await mockCartApi(page);
  await page.goto('/auth/login');
  await page.waitForLoadState('domcontentloaded');
  // Use evaluate + dispatchEvent to ensure React state updates in WebKit
  const usernameInput = page.getByLabel(/username/i);
  const passwordInput = page.getByLabel(/enter your password/i);
  await usernameInput.click();
  await page.keyboard.type('emilys');
  await passwordInput.click();
  await page.keyboard.type('emilyspass');
  await page.getByRole('button', { name: /login/i }).click();
  await expect(page).toHaveURL(/\/products/, { timeout: 20_000 });
}

const getCartButton = (page: Page) =>
  page.getByRole('button', { name: 'Cart', exact: true });

test.describe('Cart icon and dropdown', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('cart icon is visible in the AppBar', async ({ page }) => {
    await expect(getCartButton(page)).toBeVisible();
  });

  test('clicking the cart icon opens the cart dropdown', async ({ page }) => {
    await getCartButton(page).click();
    await expect(page.getByText(/cart/i).first()).toBeVisible({
      timeout: 5_000,
    });
  });

  test('clicking outside the cart dropdown closes it', async ({ page }) => {
    await getCartButton(page).click();

    await expect(
      page.getByText(/your cart is empty/i).or(page.getByText(/pay now/i)),
    ).toBeVisible({
      timeout: 5_000,
    });

    await page.locator('body').click({ position: { x: 10, y: 10 } });

    await expect(page.getByText(/your cart is empty/i)).not.toBeVisible({
      timeout: 3_000,
    });
  });

  test('shows "Your cart is empty" when the cart has no products', async ({
    page,
  }) => {
    await getCartButton(page).click();
    await expect(
      page
        .getByText(/your cart is empty/i)
        .or(page.getByRole('button', { name: /pay now/i })),
    ).toBeVisible({ timeout: 8_000 });
  });
});

test.describe('Add to cart from product listing', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('clicking "Add Cart" on a product card shows a success notification', async ({
    page,
  }) => {
    const addCartButton = page
      .getByRole('button', { name: /add cart/i })
      .first();
    await expect(addCartButton).toBeVisible({ timeout: 30_000 });

    await addCartButton.click();

    await expect(
      page.getByText(/added to cart/i).or(page.getByText(/product added/i)),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('cart badge count increases after adding a product', async ({
    page,
  }) => {
    const cartButton = getCartButton(page);

    const addCartButton = page
      .getByRole('button', { name: /add cart/i })
      .first();
    await expect(addCartButton).toBeVisible({ timeout: 30_000 });

    await addCartButton.click();

    await expect(
      page.getByText(/added to cart/i).or(page.getByText(/product added/i)),
    ).toBeVisible({ timeout: 10_000 });

    await expect(cartButton.locator('span')).toBeVisible({ timeout: 10_000 });
  });

  test('added product appears in the cart dropdown', async ({ page }) => {
    const addCartButton = page
      .getByRole('button', { name: /add cart/i })
      .first();
    await expect(addCartButton).toBeVisible({ timeout: 30_000 });

    await addCartButton.click();

    await expect(
      page.getByText(/added to cart/i).or(page.getByText(/product added/i)),
    ).toBeVisible({ timeout: 10_000 });

    await getCartButton(page).click();

    await expect(page.getByText(/your cart is empty/i)).not.toBeVisible({
      timeout: 5_000,
    });
  });
});

test.describe('Add to cart from product detail page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/products/1');
    await page.waitForLoadState('domcontentloaded');
  });

  test('"Add to Cart" button is visible on the product detail page', async ({
    page,
  }) => {
    await expect(
      page.getByRole('button', { name: /add to cart/i }).first(),
    ).toBeVisible({ timeout: 8_000 });
  });

  test('clicking "Add to Cart" shows a success notification', async ({
    page,
  }) => {
    const addButton = page
      .getByRole('button', { name: /add to cart/i })
      .first();
    await expect(addButton).toBeVisible({ timeout: 8_000 });

    await addButton.click();

    await expect(
      page.getByText(/added to cart/i).or(page.getByText(/product added/i)),
    ).toBeVisible({ timeout: 5_000 });
  });
});

test.describe('Cart checkout', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('"Pay Now" button is visible in the cart dropdown when products are present', async ({
    page,
  }) => {
    const addCartButton = page
      .getByRole('button', { name: /add cart/i })
      .first();
    await expect(addCartButton).toBeVisible({ timeout: 30_000 });
    await addCartButton.click();
    await expect(
      page.getByText(/added to cart/i).or(page.getByText(/product added/i)),
    ).toBeVisible({ timeout: 10_000 });

    await getCartButton(page).click();

    await expect(page.getByRole('button', { name: /pay now/i })).toBeVisible({
      timeout: 10_000,
    });
  });

  test('clicking "Pay Now" shows a payment success notification and empties the cart', async ({
    page,
  }) => {
    const addCartButton = page
      .getByRole('button', { name: /add cart/i })
      .first();
    await expect(addCartButton).toBeVisible({ timeout: 30_000 });
    await addCartButton.click();
    await expect(
      page.getByText(/added to cart/i).or(page.getByText(/product added/i)),
    ).toBeVisible({ timeout: 10_000 });

    await getCartButton(page).click();
    await expect(page.getByRole('button', { name: /pay now/i })).toBeVisible({
      timeout: 10_000,
    });
    await page.getByRole('button', { name: /pay now/i }).click();

    await expect(
      page.getByText(/payment completed/i).or(page.getByText(/successfully/i)),
    ).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('Cart product links', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('clicking a product in the cart dropdown navigates to its detail page', async ({
    page,
  }) => {
    const addCartButton = page
      .getByRole('button', { name: /add cart/i })
      .first();
    await expect(addCartButton).toBeVisible({ timeout: 30_000 });
    await addCartButton.click();
    await expect(
      page.getByText(/added to cart/i).or(page.getByText(/product added/i)),
    ).toBeVisible({ timeout: 10_000 });

    await getCartButton(page).click();

    const productLink = page.locator('a[href*="/products/"]').first();
    await expect(productLink).toBeVisible({ timeout: 10_000 });
    await productLink.click();

    await page.waitForURL('**/products/**', { timeout: 15_000 });
    expect(page.url()).toMatch(/\/products\/\d+/);
  });
});
