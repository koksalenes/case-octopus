import { http, HttpResponse } from 'msw';

import { TEST_API_BASE_URL, TEST_CDN_BASE_URL } from './constants';

export const mockUser = {
  id: 1,
  username: 'emilys',
  email: 'emily@example.com',
  firstName: 'Emily',
  lastName: 'Smith',
  gender: 'female',
  image: `${TEST_CDN_BASE_URL}/products/images/1/thumbnail.webp`,
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
};

export const mockProducts = [
  {
    id: 1,
    title: 'iPhone 15',
    description: 'Latest Apple smartphone',
    price: 999,
    rating: 4.5,
    stock: 50,
    category: 'smartphones',
    thumbnail: `${TEST_CDN_BASE_URL}/products/images/1/thumbnail.webp`,
    images: [`${TEST_CDN_BASE_URL}/products/images/1/1.webp`],
    brand: 'Apple',
    discountPercentage: 5,
  },
  {
    id: 2,
    title: 'Samsung Galaxy S23',
    description: 'Flagship Samsung device',
    price: 799,
    rating: 4.3,
    stock: 30,
    category: 'smartphones',
    thumbnail: `${TEST_CDN_BASE_URL}/products/images/2/thumbnail.webp`,
    images: [`${TEST_CDN_BASE_URL}/products/images/2/1.webp`],
    brand: 'Samsung',
    discountPercentage: 10,
  },
];

export const handlers = [
  // Login
  http.post(`${TEST_API_BASE_URL}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as {
      username: string;
      password: string;
    };
    if (body.username === 'emilys' && body.password === 'emilyspass') {
      return HttpResponse.json(mockUser);
    }
    return HttpResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 },
    );
  }),

  // Refresh
  http.post(`${TEST_API_BASE_URL}/auth/refresh`, () => {
    return HttpResponse.json({
      accessToken: 'new-mock-access-token',
      refreshToken: 'new-mock-refresh-token',
    });
  }),

  // Me
  http.get(`${TEST_API_BASE_URL}/auth/me`, () => {
    return HttpResponse.json(mockUser);
  }),

  // Search
  http.get(`${TEST_API_BASE_URL}/products/search`, ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get('q') ?? '';
    const limit = Number(url.searchParams.get('limit') ?? 10);
    const skip = Number(url.searchParams.get('skip') ?? 0);
    const filtered = mockProducts.filter((p) =>
      p.title.toLowerCase().includes(q.toLowerCase()),
    );
    return HttpResponse.json({
      products: filtered.slice(skip, skip + limit),
      total: filtered.length,
      skip,
      limit,
    });
  }),

  // Product List
  http.get(`${TEST_API_BASE_URL}/products`, ({ request }) => {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit') ?? 10);
    const skip = Number(url.searchParams.get('skip') ?? 0);
    return HttpResponse.json({
      products: mockProducts.slice(skip, skip + limit),
      total: mockProducts.length,
      skip,
      limit,
    });
  }),

  // Product by id
  http.get(`${TEST_API_BASE_URL}/products/:id`, ({ params }) => {
    const product = mockProducts.find((p) => p.id === Number(params.id));
    if (!product)
      return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return HttpResponse.json(product);
  }),

  // Product Categories
  http.get(`${TEST_API_BASE_URL}/products/category-list`, () => {
    return HttpResponse.json(['smartphones', 'laptops', 'fragrances']);
  }),

  // Cart
  http.get(`${TEST_API_BASE_URL}/carts/1`, () => {
    return HttpResponse.json({
      id: 1,
      products: [],
      total: 0,
      discountedTotal: 0,
      userId: 1,
      totalProducts: 0,
      totalQuantity: 0,
    });
  }),

  // Checkout Cart (clear)
  http.delete(`${TEST_API_BASE_URL}/carts/1`, () => {
    return HttpResponse.json({
      id: 1,
      products: [],
      total: 0,
      discountedTotal: 0,
      userId: 1,
      totalProducts: 0,
      totalQuantity: 0,
    });
  }),

  // Add to Cart
  http.put(`${TEST_API_BASE_URL}/carts/1`, async ({ request }) => {
    const body = (await request.json()) as {
      products: Array<{ id: number; quantity: number }>;
    };
    return HttpResponse.json({
      id: 1,
      products: body.products.map((p) => ({
        ...p,
        title: mockProducts.find((mp) => mp.id === p.id)?.title ?? 'Product',
        price: mockProducts.find((mp) => mp.id === p.id)?.price ?? 0,
        total:
          (mockProducts.find((mp) => mp.id === p.id)?.price ?? 0) * p.quantity,
        discountPercentage: 0,
        discountedTotal: 0,
        thumbnail: '',
      })),
      total: 0,
      discountedTotal: 0,
      userId: 1,
      totalProducts: 1,
      totalQuantity: 1,
    });
  }),
];
