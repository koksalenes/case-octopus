'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui';
import {
  formatPrice,
  PRODUCTS_PER_PAGE,
  StarRating,
} from '@/features/products';
import { searchProducts } from '@/features/products/services';
import type { Product } from '@/features/products/types';
import { useAddToCart, useClickOutside, useDebounce } from '@/hooks';

interface AppBarSearchProps {
  onClose: () => void;
}

export function AppBarSearch({ onClose }: AppBarSearchProps) {
  const { add, isAdding } = useAddToCart();
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const debouncedQuery = useDebounce(query.trim(), 350);

  useClickOutside(wrapperRef, onClose);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const fetchSearchResults = useCallback(
    async (searchQuery: string, currentSkip: number, append: boolean) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const trimmed = searchQuery.trim();
      if (trimmed.length < 2) {
        setProducts([]);
        setTotal(0);
        setSkip(0);
        setHasMore(false);
        setIsFetching(false);
        return;
      }

      setIsFetching(true);
      try {
        const data = await searchProducts(
          trimmed,
          PRODUCTS_PER_PAGE,
          currentSkip,
          controller.signal,
        );

        if (controller.signal.aborted) return;

        setProducts((prev) =>
          append ? [...prev, ...data.products] : data.products,
        );
        setTotal(data.total);
        const loaded = currentSkip + data.products.length;
        setSkip(loaded);
        setHasMore(loaded < data.total);
      } catch {
        if (controller.signal.aborted) return;
        toast.error('Something went wrong. Please try again.');
      } finally {
        if (!controller.signal.aborted) setIsFetching(false);
      }
    },
    [],
  );

  useEffect(() => {
    setProducts([]);
    setSkip(0);
    fetchSearchResults(debouncedQuery, 0, false);
  }, [debouncedQuery, fetchSearchResults]);

  const scrollStateRef = useRef({
    isFetching,
    hasMore,
    skip,
    debouncedQuery,
    fetchSearchResults,
  });
  scrollStateRef.current = {
    isFetching,
    hasMore,
    skip,
    debouncedQuery,
    fetchSearchResults,
  };

  const showDropdown = debouncedQuery.length >= 2;

  useEffect(() => {
    if (!showDropdown) return;
    const sentinel = sentinelRef.current;
    const list = listRef.current;
    if (!sentinel || !list) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const {
          isFetching,
          hasMore,
          skip,
          debouncedQuery,
          fetchSearchResults,
        } = scrollStateRef.current;
        if (!entry.isIntersecting || isFetching || !hasMore) return;
        fetchSearchResults(debouncedQuery, skip, true);
      },
      { root: list, rootMargin: '0px 0px 40px 0px', threshold: 0 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [showDropdown]);

  const handleAddToCart = useCallback(
    async (e: React.MouseEvent, productId: number) => {
      e.preventDefault();
      await add(productId);
    },
    [add],
  );

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
          aria-label="Search products"
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
            className="max-h-[60vh] overflow-y-auto overscroll-contain md:max-h-120"
          >
            {/* Initial loading skeleton */}
            {isFetching && products.length === 0 && (
              <div className="flex flex-col">
                {(['sk-a', 'sk-b', 'sk-c'] as const).map((key) => (
                  <div
                    key={key}
                    data-testid="product-skeleton"
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
                  <div className="bg-surface-neutral relative h-16 w-16 shrink-0 overflow-hidden rounded-md">
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
                <Button
                  variant="primary"
                  size="sm"
                  className="shrink-0"
                  onClick={(e) => handleAddToCart(e, product.id)}
                  isLoading={isAdding(product.id)}
                >
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

            <div ref={sentinelRef} aria-hidden="true" />
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
