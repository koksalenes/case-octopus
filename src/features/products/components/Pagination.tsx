import Link from 'next/link';

import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  searchParams?: Record<string, string>;
}

function buildPageUrl(
  page: number,
  params: Record<string, string> = {},
): string {
  const searchParams = new URLSearchParams();
  searchParams.set('page', String(page));
  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.set(key, value);
  });
  return `/products?${searchParams.toString()}`;
}

function getPageNumbers(
  currentPage: number,
  totalPages: number,
): { key: string; value: number | '...' }[] {
  const raw: (number | '...')[] = (() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, '...', totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [
        1,
        '...',
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      '...',
      currentPage - 1,
      currentPage,
      currentPage + 1,
      '...',
      totalPages,
    ];
  })();

  let dotIndex = 0;
  return raw.map((item) => {
    if (item === '...') {
      dotIndex += 1;
      return { key: `dots-${dotIndex}`, value: item };
    }
    return { key: `page-${item}`, value: item };
  });
}

const basePageClass =
  'flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold';

export function Pagination({
  currentPage,
  totalPages,
  searchParams = {},
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav aria-label="Pagination" className="flex items-start gap-1">
      {/* Prev */}
      {currentPage > 1 ? (
        <Link
          href={buildPageUrl(currentPage - 1, searchParams)}
          className="text-ink hover:text-ink-subtle flex h-8 items-center justify-center rounded-lg px-1 py-2.5 text-xs font-bold"
        >
          Prev
        </Link>
      ) : (
        <span className="text-ink-subtle flex h-8 items-center justify-center rounded-lg px-1 py-2.5 text-xs font-bold">
          Prev
        </span>
      )}

      {/* Page numbers */}
      {pages.map(({ key, value }) => {
        if (value === '...') {
          return (
            <span
              key={key}
              className={cn(
                basePageClass,
                'text-ink text-[13px] font-semibold',
              )}
            >
              ...
            </span>
          );
        }

        const isActive = value === currentPage;

        return (
          <Link
            key={key}
            href={buildPageUrl(value, searchParams)}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              basePageClass,
              isActive
                ? 'bg-primary text-white'
                : 'border-border-light text-ink border bg-white hover:bg-gray-50',
            )}
          >
            {value}
          </Link>
        );
      })}

      {/* Next */}
      {currentPage < totalPages ? (
        <Link
          href={buildPageUrl(currentPage + 1, searchParams)}
          className="text-ink hover:text-ink-subtle flex h-8 items-center justify-center rounded-lg px-1 py-2.5 text-xs font-bold"
        >
          Next
        </Link>
      ) : (
        <span className="text-ink flex h-8 items-center justify-center rounded-lg px-1 py-2.5 text-xs font-bold opacity-50">
          Next
        </span>
      )}
    </nav>
  );
}
