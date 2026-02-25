export const PRODUCTS_PER_PAGE = 9;
export const DEFAULT_CATEGORIES_LIMIT = 5;
export const CACHE_OPTIONS = {
  next: { revalidate: 300, tags: ['products'] },
} satisfies RequestInit;
