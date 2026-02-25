import type { Metadata } from 'next';

import {
  fetchCategories,
  fetchProducts,
  Pagination,
  ProductCard,
  ProductContentWrapper,
  PRODUCTS_PER_PAGE,
  ProductSidebar,
  ProductsLoadingProvider,
} from '@/features/products';

export const metadata: Metadata = {
  title: 'Products',
  description: 'Browse and filter all products on Octopus.',
};

interface ProductsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
  }>;
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const search = params.search ?? '';
  const category = params.category ?? '';
  const selectedCategories = category
    ? category.split(',').filter(Boolean)
    : [];

  const [productsData, categories] = await Promise.all([
    fetchProducts({ page, search, categories: selectedCategories }),
    fetchCategories(),
  ]);

  const totalPages = Math.ceil(productsData.total / PRODUCTS_PER_PAGE);

  const paginationParams: Record<string, string> = {};
  if (search) paginationParams.search = search;
  if (category) paginationParams.category = category;

  const dataKey = `${page}-${search}-${category}`;

  return (
    <ProductsLoadingProvider>
      <div className="mx-auto max-w-360 px-4 py-6 md:px-8 md:py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
          {/* Sidebar */}
          <ProductSidebar
            categories={categories}
            currentCategories={selectedCategories}
            currentSearch={search}
          />

          {/* Main content */}
          <ProductContentWrapper dataKey={dataKey}>
            <h2 className="font-heading text-xl leading-[150%] font-bold text-[#141A24]">
              {productsData.total} products are listed
            </h2>

            {/* Product Grid */}
            {productsData.products.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {productsData.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <p className="text-ink-muted py-12 text-center">
                No products match your search.
              </p>
            )}

            {/* Pagination */}
            <div className="flex justify-center">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                searchParams={paginationParams}
              />
            </div>
          </ProductContentWrapper>
        </div>
      </div>
    </ProductsLoadingProvider>
  );
}
