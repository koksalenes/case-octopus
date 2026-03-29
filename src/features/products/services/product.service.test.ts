import { beforeEach, describe, expect, it, vi } from 'vitest';

import apiClient from '@/lib/axios';
import { serverFetch } from '@/lib/serverFetch';
import { TEST_API_BASE_URL, TEST_CDN_BASE_URL } from '@/test/mocks/constants';

import {
  fetchCategories,
  fetchProductById,
  fetchProducts,
  searchProducts,
} from './product.service';

vi.mock('@/lib/serverFetch', () => ({
  serverFetch: vi.fn(),
}));

vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockServerFetch = vi.mocked(serverFetch);
const mockApiClientGet = vi.mocked(apiClient.get);

const mockProduct = {
  id: 1,
  title: 'iPhone 15',
  description: 'Latest Apple smartphone',
  price: 999,
  rating: 4.5,
  stock: 50,
  category: 'smartphones',
  thumbnail: `${TEST_CDN_BASE_URL}/products/images/1/thumbnail.webp`,
  images: [],
};

const mockProductsResponse = {
  products: [mockProduct],
  total: 1,
  skip: 0,
  limit: 9,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('fetchProducts', () => {
  it('fetches from the base products URL with default pagination', async () => {
    mockServerFetch.mockResolvedValue(mockProductsResponse);
    const result = await fetchProducts();
    expect(mockServerFetch).toHaveBeenCalledWith(
      expect.stringContaining('/products?limit=9&skip=0'),
      expect.any(Object),
    );
    expect(result).toEqual(mockProductsResponse);
  });

  it('applies correct skip offset for page 2', async () => {
    mockServerFetch.mockResolvedValue(mockProductsResponse);
    await fetchProducts({ page: 2, limit: 9 });
    expect(mockServerFetch).toHaveBeenCalledWith(
      expect.stringContaining('skip=9'),
      expect.any(Object),
    );
  });

  it('fetches from the search endpoint when a search query is provided', async () => {
    mockServerFetch.mockResolvedValue(mockProductsResponse);
    await fetchProducts({ search: 'iphone', page: 1, limit: 9 });
    expect(mockServerFetch).toHaveBeenCalledWith(
      expect.stringContaining('/products/search?q=iphone'),
      expect.any(Object),
    );
  });

  it('URL-encodes the search query', async () => {
    mockServerFetch.mockResolvedValue(mockProductsResponse);
    await fetchProducts({ search: 'iphone phone', page: 1, limit: 9 });
    expect(mockServerFetch).toHaveBeenCalledWith(
      expect.stringContaining('q=iphone%20phone'),
      expect.any(Object),
    );
  });

  it('fetches from the category endpoint when a single category is provided', async () => {
    mockServerFetch.mockResolvedValue(mockProductsResponse);
    await fetchProducts({ categories: ['smartphones'], page: 1, limit: 9 });
    expect(mockServerFetch).toHaveBeenCalledWith(
      expect.stringContaining('/products/category/smartphones'),
      expect.any(Object),
    );
  });

  it('merges multiple categories using in-memory pagination', async () => {
    const page1Response = {
      products: [mockProduct],
      total: 1,
      skip: 0,
      limit: 0,
    };
    mockServerFetch.mockResolvedValue(page1Response);
    const result = await fetchProducts({
      categories: ['smartphones', 'laptops'],
      page: 1,
    });
    expect(result.products).toBeDefined();
    expect(mockServerFetch).toHaveBeenCalledTimes(2);
  });

  it('applies search + category filter with in-memory pagination', async () => {
    const searchResponse = {
      products: [mockProduct],
      total: 1,
      skip: 0,
      limit: 0,
    };
    mockServerFetch.mockResolvedValue(searchResponse);
    const result = await fetchProducts({
      search: 'phone',
      categories: ['smartphones'],
      page: 1,
    });
    expect(result.products).toHaveLength(1);
  });
});

describe('fetchProductById', () => {
  it('calls serverFetch with the correct product URL', async () => {
    mockServerFetch.mockResolvedValue(mockProduct);
    const result = await fetchProductById('1');
    expect(mockServerFetch).toHaveBeenCalledWith(
      `${TEST_API_BASE_URL}/products/1`,
      expect.any(Object),
    );
    expect(result).toEqual(mockProduct);
  });

  it('passes cache options to serverFetch', async () => {
    mockServerFetch.mockResolvedValue(mockProduct);
    await fetchProductById('5');
    expect(mockServerFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        next: expect.objectContaining({ revalidate: 300 }),
      }),
    );
  });
});

describe('fetchCategories', () => {
  it('calls serverFetch with the category-list endpoint', async () => {
    mockServerFetch.mockResolvedValue(['smartphones', 'laptops']);
    const result = await fetchCategories();
    expect(mockServerFetch).toHaveBeenCalledWith(
      `${TEST_API_BASE_URL}/products/category-list`,
      expect.any(Object),
    );
    expect(result).toEqual(['smartphones', 'laptops']);
  });
});

describe('searchProducts', () => {
  it('calls apiClient.get with query and pagination params', async () => {
    mockApiClientGet.mockResolvedValue({ data: mockProductsResponse });
    const result = await searchProducts('iphone', 9, 0);
    expect(mockApiClientGet).toHaveBeenCalledWith(
      expect.stringContaining('q=iphone&limit=9&skip=0'),
      expect.any(Object),
    );
    expect(result).toEqual(mockProductsResponse);
  });

  it('forwards the AbortSignal to the request config', async () => {
    mockApiClientGet.mockResolvedValue({ data: mockProductsResponse });
    const controller = new AbortController();
    await searchProducts('test', 9, 0, controller.signal);
    expect(mockApiClientGet).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ signal: controller.signal }),
    );
  });

  it('URL-encodes the search query', async () => {
    mockApiClientGet.mockResolvedValue({ data: mockProductsResponse });
    await searchProducts('iphone phone', 9, 0);
    expect(mockApiClientGet).toHaveBeenCalledWith(
      expect.stringContaining('q=iphone%20phone'),
      expect.any(Object),
    );
  });
});
