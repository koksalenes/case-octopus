export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  PRODUCTS: {
    BASE: '/products',
    SEARCH: '/products/search',
    CATEGORY_BASE: '/products/category',
    CATEGORY_LIST: '/products/category-list',
  },
  CART: {
    BASE: '/carts',
    DEFAULT_CART: '/carts/1',
  },
} as const;
