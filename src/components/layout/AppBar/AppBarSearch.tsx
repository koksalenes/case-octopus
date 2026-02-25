'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui';
import { API_ENDPOINTS } from '@/constants';
import {
  formatPrice,
  PRODUCTS_PER_PAGE,
  StarRating,
} from '@/features/products';
import type { Product, ProductsResponse } from '@/features/products/types';
import { useClickOutside } from '@/hooks';
import apiClient from '@/lib/axios';

interface AppBarSearchProps {
  onClose: () => void;
}

export function AppBarSearch({ onClose }: AppBarSearchProps) {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useClickOutside(wrapperRef, onClose);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const fetchProducts = useCallback(
    async (searchQuery: string, currentSkip: number, append: boolean) => {
      if (!searchQuery.trim()) {
        setProducts([]);
        setTotal(0);
        setSkip(0);
        setHasMore(false);
        return;
      }

      setIsFetching(true);
      try {
        const { data } = await apiClient.get<ProductsResponse>(
          `${API_ENDPOINTS.PRODUCTS.SEARCH}?q=${encodeURIComponent(searchQuery.trim())}&limit=${PRODUCTS_PER_PAGE}&skip=${currentSkip}`,
        );
        const newProducts = data.products;
        setProducts((prev) =>
          append ? [...prev, ...newProducts] : newProducts,
        );
        setTotal(data.total);
        const loaded = currentSkip + newProducts.length;
        setSkip(loaded);
        setHasMore(loaded < data.total);
      } catch {
        // silently ignore errors
      } finally {
        setIsFetching(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (trimmed.length === 0) {
      setProducts([]);
      setTotal(0);
      setSkip(0);
      setHasMore(false);
      setIsFetching(false);
      return;
    }

    if (trimmed.length < 2) {
      setIsFetching(false);
      return;
    }

    setIsFetching(true);
    setProducts([]);
    setSkip(0);

    debounceRef.current = setTimeout(() => {
      fetchProducts(trimmed, 0, false);
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchProducts]);

  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el || isFetching || !hasMore) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
      fetchProducts(query.trim(), skip, true);
    }
  }, [isFetching, hasMore, skip, query, fetchProducts]);

  const showDropdown = query.trim().length >= 2;

  return (
    <div
      ref={wrapperRef}
      className="relative flex flex-1 items-center md:w-96 md:flex-none"
    >
      {/* Search input */}
      <div className="border-border-light flex w-full items-center gap-2 rounded-lg border bg-white px-3 py-1.5 shadow-sm">
        <Image
          src="/assets/icons/search.svg"
          alt="Search"
          width={18}
          height={18}
          className="shrink-0 opacity-50"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Escape' && onClose()}
          placeholder="Search products…"
          className="text-ink placeholder:text-ink-subtle min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
        {query.length > 0 && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear"
            className="text-ink-subtle hover:text-ink shrink-0 transition-colors"
          >
            <Image
              src="/assets/icons/clear.svg"
              alt="Clear"
              width={14}
              height={14}
            />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="border-border-light fixed top-14 right-3 left-3 z-50 overflow-hidden rounded-xl border bg-white shadow-xl md:absolute md:top-full md:right-auto md:left-0 md:mt-2 md:min-w-140">
          {/* Results list */}
          <div
            ref={listRef}
            onScroll={handleScroll}
            className="max-h-[60vh] overflow-y-auto overscroll-contain md:max-h-120"
          >
            {/* Initial loading skeleton */}
            {isFetching && products.length === 0 && (
              <div className="flex flex-col">
                {(['sk-a', 'sk-b', 'sk-c'] as const).map((key) => (
                  <div
                    key={key}
                    className="border-border-light flex items-center gap-3 border-b px-4 py-3 last:border-b-0"
                  >
                    <div className="h-16 w-16 shrink-0 animate-pulse rounded-md bg-gray-200" />
                    <div className="flex flex-1 flex-col gap-2">
                      <div className="h-3.5 w-3/4 animate-pulse rounded bg-gray-200" />
                      <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
                      <div className="h-3.5 w-1/4 animate-pulse rounded bg-gray-200" />
                    </div>
                    <div className="h-9 w-20 shrink-0 animate-pulse rounded-lg bg-gray-200" />
                  </div>
                ))}
              </div>
            )}

            {/* No results */}
            {!isFetching && products.length === 0 && (
              <p className="text-ink-subtle px-4 py-6 text-center text-sm">
                No products found for &ldquo;{query}&rdquo;
              </p>
            )}

            {products.map((product) => (
              <div
                key={product.id}
                className="border-border-light hover:bg-surface-input flex items-center gap-3 border-b px-4 py-3 last:border-b-0"
              >
                {/* Clickable area: thumbnail + info */}
                <Link
                  href={`/products/${product.id}`}
                  onClick={onClose}
                  className="flex min-w-0 flex-1 items-center gap-3"
                >
                  {/* Thumbnail */}
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-[#F2F2F2]">
                    <Image
                      src={product.thumbnail}
                      alt={product.title}
                      fill
                      sizes="64px"
                      className="object-contain"
                    />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="font-heading truncate text-sm font-semibold text-black">
                      {product.title}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1">
                      <StarRating rating={product.rating} />
                    </div>
                    <p className="font-heading mt-0.5 text-sm font-bold text-black">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </Link>

                {/* Add to cart */}
                <Button variant="primary" size="sm" className="shrink-0">
                  Add Cart
                </Button>
              </div>
            ))}

            {/* Append loading indicator */}
            {isFetching && products.length > 0 && (
              <div className="flex items-center justify-center py-4">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
              </div>
            )}
          </div>

          {/* Footer count */}
          {products.length > 0 && (
            <div className="border-border-light text-ink-subtle border-t px-4 py-2 text-xs">
              {products.length} / {total} product{total !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
