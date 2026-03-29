import { env } from '@/config';
import { API_ENDPOINTS } from '@/constants';
import apiClient from '@/lib/axios';
import { serverFetch } from '@/lib/serverFetch';

import { CACHE_OPTIONS, PRODUCTS_PER_PAGE } from '../constants';
import type { Product, ProductsResponse } from '../types';

interface FetchProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  categories?: string[];
}

const productsBaseUrl = `${env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.PRODUCTS.BASE}`;

async function fetchFromUrl(url: string): Promise<ProductsResponse> {
  return serverFetch<ProductsResponse>(url, CACHE_OPTIONS);
}

function paginateProducts(
  products: Product[],
  page: number,
  limit: number,
): ProductsResponse {
  const skip = (page - 1) * limit;
  return {
    products: products.slice(skip, skip + limit),
    total: products.length,
    skip,
    limit,
  };
}

async function fetchAllFromCategory(category: string): Promise<Product[]> {
  const data = await fetchFromUrl(
    `${env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.PRODUCTS.CATEGORY_BASE}/${encodeURIComponent(category)}?limit=0`,
  );
  return data.products;
}

async function fetchAllSearchResults(query: string): Promise<Product[]> {
  const data = await fetchFromUrl(
    `${env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.PRODUCTS.SEARCH}?q=${encodeURIComponent(query)}&limit=0`,
  );
  return data.products;
}

export async function fetchProducts(
  params: FetchProductsParams = {},
): Promise<ProductsResponse> {
  const {
    page = 1,
    limit = PRODUCTS_PER_PAGE,
    search,
    categories = [],
  } = params;
  const skip = (page - 1) * limit;

  if (search && categories.length > 0) {
    const all = await fetchAllSearchResults(search);
    const filtered = all.filter((p) => categories.includes(p.category));
    return paginateProducts(filtered, page, limit);
  }

  if (search) {
    return fetchFromUrl(
      `${env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.PRODUCTS.SEARCH}?q=${encodeURIComponent(search)}&limit=${limit}&skip=${skip}`,
    );
  }

  if (categories.length > 1) {
    const results = await Promise.all(
      categories.map((cat) => fetchAllFromCategory(cat)),
    );
    const merged = results.flat();
    return paginateProducts(merged, page, limit);
  }

  if (categories.length === 1) {
    return fetchFromUrl(
      `${env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.PRODUCTS.CATEGORY_BASE}/${encodeURIComponent(categories[0])}?limit=${limit}&skip=${skip}`,
    );
  }

  return fetchFromUrl(`${productsBaseUrl}?limit=${limit}&skip=${skip}`);
}

export async function fetchProductById(id: string): Promise<Product> {
  return serverFetch<Product>(`${productsBaseUrl}/${id}`, CACHE_OPTIONS);
}

export async function fetchCategories(): Promise<string[]> {
  return serverFetch<string[]>(
    `${env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.PRODUCTS.CATEGORY_LIST}`,
    CACHE_OPTIONS,
  );
}

export async function searchProducts(
  query: string,
  limit: number,
  skip: number,
): Promise<ProductsResponse> {
  const { data } = await apiClient.get<ProductsResponse>(
    `${API_ENDPOINTS.PRODUCTS.SEARCH}?q=${encodeURIComponent(query)}&limit=${limit}&skip=${skip}`,
  );
  return data;
}
