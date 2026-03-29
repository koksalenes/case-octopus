'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui';
import { useDebouncedCallback } from '@/hooks';

import { useProductsLoading } from './ProductsLoadingContext';

interface ProductSidebarProps {
  categories: string[];
  currentCategories: string[];
  currentSearch: string;
}

function formatCategoryName(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function ProductSidebar({
  categories,
  currentCategories,
  currentSearch,
}: ProductSidebarProps) {
  const router = useRouter();
  const currentSearchParams = useSearchParams();
  const { setIsProductsLoading } = useProductsLoading();
  const [search, setSearch] = useState(currentSearch);
  const [selectedCategories, setSelectedCategories] =
    useState<string[]>(currentCategories);

  const navigate = useCallback(
    (searchValue: string, cats: string[]) => {
      const params = new URLSearchParams();
      if (searchValue.trim()) params.set('search', searchValue.trim());
      if (cats.length > 0) params.set('category', cats.join(','));
      params.set('page', '1');

      const newQuery = params.toString();
      const currentQuery = currentSearchParams.toString();
      if (newQuery === currentQuery) return;

      setIsProductsLoading(true);
      router.push(`/products?${newQuery}`);
    },
    [router, setIsProductsLoading, currentSearchParams],
  );

  const triggerSearch = useDebouncedCallback(() => {
    const trimmed = search.trim();
    if (trimmed.length >= 2) {
      navigate(search, selectedCategories);
    } else if (trimmed.length < 2 && currentSearch) {
      navigate('', selectedCategories);
    }
  }, 350);

  useEffect(() => {
    triggerSearch();
  }, [search, triggerSearch]);

  function handleFilter() {
    navigate(search, selectedCategories);
  }

  function handleCategoryToggle(slug: string) {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }

  function handleClearCategories() {
    setSelectedCategories([]);
    navigate(search, []);
  }

  function handleClearSearch() {
    setSearch('');
  }

  return (
    <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-64">
      {/* Search Bar */}
      <div className="border-border-light flex items-center gap-2 rounded-lg border bg-white px-4 py-3">
        <Image
          src="/assets/icons/search.svg"
          alt="Search"
          width={17}
          height={17}
          className="shrink-0"
        />
        <input
          type="text"
          aria-label="Quick search"
          placeholder="Quick Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
          className="text-ink placeholder:text-ink-subtle w-full bg-transparent text-sm outline-none"
        />
        {search.length > 0 && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="text-ink-subtle hover:text-ink shrink-0 transition-colors"
            aria-label="Clear search"
          >
            <Image
              src="/assets/icons/clear.svg"
              alt="Clear"
              width={16}
              height={16}
            />
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-lg font-bold tracking-wide text-black">
              Categories
            </h3>
            {selectedCategories.length > 0 && (
              <button
                type="button"
                onClick={handleClearCategories}
                className="text-ink-subtle hover:text-ink text-xs font-medium transition-colors"
              >
                Clear ({selectedCategories.length})
              </button>
            )}
          </div>
          <div className="h-1.25 bg-black" />
        </div>

        <div className="flex max-h-52 flex-col gap-4 overflow-y-auto overscroll-contain">
          {categories.map((cat) => (
            <label
              key={cat}
              className="flex cursor-pointer items-center gap-2.5"
            >
              <span
                role="checkbox"
                aria-label={formatCategoryName(cat)}
                aria-checked={selectedCategories.includes(cat)}
                tabIndex={0}
                onClick={() => handleCategoryToggle(cat)}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    handleCategoryToggle(cat);
                  }
                }}
                className={`flex h-4.25 w-4.25 shrink-0 items-center justify-center border border-black ${
                  selectedCategories.includes(cat) ? 'bg-black' : 'bg-white'
                }`}
              >
                {selectedCategories.includes(cat) && (
                  <svg width="11" height="9" viewBox="0 0 12 10" fill="none">
                    <path
                      d="M1 5L4.5 8.5L11 1.5"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
              <span
                className="font-heading text-sm text-black"
                onClick={() => handleCategoryToggle(cat)}
              >
                {formatCategoryName(cat)}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Filter Button – secondary (dark) */}
      <Button variant="secondary" fullWidth onClick={handleFilter}>
        Filter
      </Button>
    </aside>
  );
}
