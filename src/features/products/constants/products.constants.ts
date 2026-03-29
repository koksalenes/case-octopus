export const PRODUCTS_PER_PAGE = 9;
export const DEFAULT_CATEGORIES_LIMIT = 5;
export const CACHE_OPTIONS = {
  next: { revalidate: 300, tags: ['products'] },
} satisfies RequestInit;

export const PLACEHOLDER_COLORS = [
  { name: 'Silver', color: '#C0C0C0' },
  { name: 'Black', color: '#000000' },
];

export const PLACEHOLDER_FEATURES = [
  {
    id: 'feature-1',
    title: 'Product Feature 1',
    description: 'Lorem Ipsum Dolor Sit Amet',
  },
  {
    id: 'feature-2',
    title: 'Product Feature 2',
    description: 'Lorem Ipsum Dolor Sit Amet',
  },
  {
    id: 'feature-3',
    title: 'Product Feature 3',
    description: 'Lorem Ipsum Dolor Sit Amet',
  },
  {
    id: 'feature-4',
    title: 'Product Feature 4',
    description: 'Lorem Ipsum Dolor Sit Amet',
  },
];
