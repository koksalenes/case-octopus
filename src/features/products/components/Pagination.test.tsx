import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/render-utils';

import { Pagination } from './Pagination';

function renderPagination(
  currentPage: number,
  totalPages: number,
  searchParams?: Record<string, string>,
) {
  return renderWithProviders(
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      searchParams={searchParams}
    />,
  );
}

describe('Pagination', () => {
  describe('renders nothing for single or empty pages', () => {
    it('returns null when totalPages is 1', () => {
      const { container } = renderPagination(1, 1);
      expect(container).toBeEmptyDOMElement();
    });

    it('returns null when totalPages is 0', () => {
      const { container } = renderPagination(1, 0);
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('Prev navigation', () => {
    it('renders Prev as a clickable link when not on the first page', () => {
      renderPagination(3, 5);
      const prev = screen.getByRole('link', { name: 'Prev' });
      expect(prev).toHaveAttribute('href', expect.stringContaining('page=2'));
    });

    it('renders Prev as a non-interactive span on page 1', () => {
      renderPagination(1, 5);
      expect(
        screen.queryByRole('link', { name: 'Prev' }),
      ).not.toBeInTheDocument();
      expect(screen.getByText('Prev')).toBeInTheDocument();
    });
  });

  describe('Next navigation', () => {
    it('renders Next as a clickable link when not on the last page', () => {
      renderPagination(2, 5);
      const next = screen.getByRole('link', { name: 'Next' });
      expect(next).toHaveAttribute('href', expect.stringContaining('page=3'));
    });

    it('renders Next as a non-interactive span on the last page', () => {
      renderPagination(5, 5);
      expect(
        screen.queryByRole('link', { name: 'Next' }),
      ).not.toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
    });
  });

  describe('page number links', () => {
    it('renders all page numbers when totalPages is 7 or fewer', () => {
      renderPagination(1, 5);
      for (let i = 1; i <= 5; i++) {
        expect(
          screen.getByRole('link', { name: String(i) }),
        ).toBeInTheDocument();
      }
    });

    it('marks the current page with aria-current="page"', () => {
      renderPagination(3, 5);
      const currentPageLink = screen.getByRole('link', { name: '3' });
      expect(currentPageLink).toHaveAttribute('aria-current', 'page');
    });

    it('does not set aria-current on non-current pages', () => {
      renderPagination(2, 5);
      const page1 = screen.getByRole('link', { name: '1' });
      expect(page1).not.toHaveAttribute('aria-current', 'page');
    });

    it('builds correct /products?page=N href for page links', () => {
      renderPagination(1, 5);
      const page3 = screen.getByRole('link', { name: '3' });
      expect(page3).toHaveAttribute('href', '/products?page=3');
    });

    it('appends searchParams to each page link href', () => {
      renderPagination(1, 5, { search: 'phone' });
      const page2 = screen.getByRole('link', { name: '2' });
      expect(page2.getAttribute('href')).toContain('search=phone');
      expect(page2.getAttribute('href')).toContain('page=2');
    });

    it('appends multiple searchParams to page link hrefs', () => {
      renderPagination(1, 5, { search: 'phone', category: 'smartphones' });
      const page2 = screen.getByRole('link', { name: '2' });
      const href = page2.getAttribute('href') ?? '';
      expect(href).toContain('search=phone');
      expect(href).toContain('category=smartphones');
    });
  });

  describe('ellipsis for large page ranges', () => {
    it('shows one ellipsis when near the start of a large range', () => {
      renderPagination(1, 10);
      expect(screen.getAllByText('...')).toHaveLength(1);
    });

    it('shows two ellipses when in the middle of a large range', () => {
      renderPagination(5, 10);
      expect(screen.getAllByText('...')).toHaveLength(2);
    });

    it('shows one ellipsis when near the end of a large range', () => {
      renderPagination(9, 10);
      expect(screen.getAllByText('...')).toHaveLength(1);
    });

    it('shows no ellipsis when totalPages is 7 or fewer', () => {
      renderPagination(4, 7);
      expect(screen.queryByText('...')).not.toBeInTheDocument();
    });
  });

  describe('Prev link href', () => {
    it('points to currentPage - 1', () => {
      renderPagination(4, 10);
      expect(screen.getByRole('link', { name: 'Prev' })).toHaveAttribute(
        'href',
        expect.stringContaining('page=3'),
      );
    });
  });

  describe('Next link href', () => {
    it('points to currentPage + 1', () => {
      renderPagination(4, 10);
      expect(screen.getByRole('link', { name: 'Next' })).toHaveAttribute(
        'href',
        expect.stringContaining('page=5'),
      );
    });
  });
});
