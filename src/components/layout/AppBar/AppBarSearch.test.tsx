import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import toast from 'react-hot-toast';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TEST_API_BASE_URL } from '@/test/mocks/constants';
import { mockProducts } from '@/test/mocks/handlers';
import { server } from '@/test/mocks/server';
import { renderWithProviders } from '@/test/render-utils';

import { AppBarSearch } from './AppBarSearch';

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

let mockOnClose: () => void;

beforeEach(() => {
  mockOnClose = vi.fn();

  class NoopIntersectionObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }
  vi.stubGlobal('IntersectionObserver', NoopIntersectionObserver);
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

function renderSearch() {
  return renderWithProviders(<AppBarSearch onClose={mockOnClose} />);
}

const getSearchInput = () =>
  screen.getByRole('textbox', { name: /search products/i });
const queryClearButton = () => screen.queryByRole('button', { name: /clear/i });
const getClearButton = () => screen.getByRole('button', { name: /clear/i });
const queryNoProductsFound = () => screen.queryByText(/no products found/i);
const getProductLink = (name: RegExp | string) =>
  screen.getByRole('link', { name });
const getAddCartButton = () =>
  screen.getByRole('button', { name: /add cart/i });
const querySkeletonItems = () => screen.queryAllByTestId('product-skeleton');

describe('AppBarSearch', () => {
  describe('initial render', () => {
    it('renders the search input', () => {
      renderSearch();
      expect(getSearchInput()).toBeInTheDocument();
    });

    it('auto-focuses the search input on mount', () => {
      renderSearch();
      expect(getSearchInput()).toHaveFocus();
    });

    it('renders with an empty initial value', () => {
      renderSearch();
      expect(getSearchInput()).toHaveValue('');
    });

    it('does not render the dropdown when the query is empty', () => {
      renderSearch();
      expect(queryNoProductsFound()).not.toBeInTheDocument();
    });
  });

  describe('clear button', () => {
    it('is not visible when the input is empty', () => {
      renderSearch();
      expect(queryClearButton()).not.toBeInTheDocument();
    });

    it('appears once the input has a value', async () => {
      const user = userEvent.setup();
      renderSearch();

      await user.type(getSearchInput(), 'a');

      expect(queryClearButton()).toBeInTheDocument();
    });

    it('resets the input value on click', async () => {
      const user = userEvent.setup();
      renderSearch();

      await user.type(getSearchInput(), 'iphone');
      expect(queryClearButton()).toBeInTheDocument();
      await user.click(getClearButton());

      expect(getSearchInput()).toHaveValue('');
    });

    it('hides itself after the input is cleared', async () => {
      const user = userEvent.setup();
      renderSearch();

      await user.type(getSearchInput(), 'iphone');
      await user.click(getClearButton());

      expect(queryClearButton()).not.toBeInTheDocument();
    });
  });

  describe('keyboard interactions', () => {
    it('calls onClose when Escape is pressed', async () => {
      const user = userEvent.setup();
      renderSearch();

      await user.keyboard('{Escape}');

      expect(mockOnClose).toHaveBeenCalledOnce();
    });
  });

  describe('click outside', () => {
    it('calls onClose when clicking outside the component', async () => {
      const user = userEvent.setup();
      renderSearch();

      await user.click(document.body);

      expect(mockOnClose).toHaveBeenCalledOnce();
    });
  });

  describe('debounce and minimum query length', () => {
    it('does not open the dropdown for a single-character query', async () => {
      const user = userEvent.setup();
      renderSearch();

      await user.type(getSearchInput(), 'a');

      expect(queryNoProductsFound()).not.toBeInTheDocument();
    });

    it('does not open the dropdown for a whitespace-only query', async () => {
      const user = userEvent.setup();
      renderSearch();

      await user.type(getSearchInput(), '   ');

      expect(queryNoProductsFound()).not.toBeInTheDocument();
    });
  });

  describe('search results', () => {
    it('displays products that match the query', async () => {
      const user = userEvent.setup();
      renderSearch();

      await user.type(getSearchInput(), 'ip');

      await waitFor(() =>
        expect(screen.getByText('iPhone 15')).toBeInTheDocument(),
      );
    });

    it('displays the formatted price for each result', async () => {
      const user = userEvent.setup();
      renderSearch();

      await user.type(getSearchInput(), 'ip');

      await waitFor(() =>
        expect(screen.getByText('$999.00')).toBeInTheDocument(),
      );
    });

    it('shows "no products found" when the API returns an empty list', async () => {
      server.use(
        http.get(`${TEST_API_BASE_URL}/products/search`, () =>
          HttpResponse.json({ products: [], total: 0, skip: 0, limit: 10 }),
        ),
      );

      const user = userEvent.setup();
      renderSearch();

      await user.type(getSearchInput(), 'xyzxyz');

      await waitFor(() => expect(queryNoProductsFound()).toBeInTheDocument());
    });

    it('includes the search term in the "no products found" message', async () => {
      server.use(
        http.get(`${TEST_API_BASE_URL}/products/search`, () =>
          HttpResponse.json({ products: [], total: 0, skip: 0, limit: 10 }),
        ),
      );

      const user = userEvent.setup();
      renderSearch();

      await user.type(getSearchInput(), 'xyzxyz');

      await waitFor(() =>
        expect(screen.getByText(/xyzxyz/)).toBeInTheDocument(),
      );
    });

    it('shows a result count in the footer', async () => {
      const user = userEvent.setup();
      renderSearch();

      await user.type(getSearchInput(), 'ip');

      await waitFor(() =>
        expect(screen.getByText('1 / 1 product')).toBeInTheDocument(),
      );
    });

    it('renders a product link pointing to the correct detail page', async () => {
      const user = userEvent.setup();
      renderSearch();

      await user.type(getSearchInput(), 'ip');

      await waitFor(() =>
        expect(getProductLink(/iphone 15/i)).toHaveAttribute(
          'href',
          '/products/1',
        ),
      );
    });

    it('calls onClose when a product result link is clicked', async () => {
      const user = userEvent.setup();
      renderSearch();

      await user.type(getSearchInput(), 'ip');
      await waitFor(() => getProductLink(/iphone 15/i));
      await user.click(getProductLink(/iphone 15/i));

      expect(mockOnClose).toHaveBeenCalledOnce();
    });

    it('renders an "Add Cart" button for each result', async () => {
      const user = userEvent.setup();
      renderSearch();

      await user.type(getSearchInput(), 'ip');

      await waitFor(() => expect(getAddCartButton()).toBeInTheDocument());
    });

    it('shows an error toast when the search request fails', async () => {
      server.use(
        http.get(`${TEST_API_BASE_URL}/products/search`, () =>
          HttpResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 },
          ),
        ),
      );

      const user = userEvent.setup();
      renderSearch();

      await user.type(getSearchInput(), 'ip');

      await waitFor(() =>
        expect(toast.error).toHaveBeenCalledWith(
          'Something went wrong. Please try again.',
        ),
      );
    });

    describe('loading skeleton', () => {
      it('shows loading skeletons while the initial fetch is in flight', async () => {
        let resolveRequest!: () => void;
        server.use(
          http.get(
            `${TEST_API_BASE_URL}/products/search`,
            () =>
              new Promise((resolve) => {
                resolveRequest = () =>
                  resolve(
                    HttpResponse.json({
                      products: mockProducts,
                      total: mockProducts.length,
                      skip: 0,
                      limit: 10,
                    }),
                  );
              }),
          ),
        );

        const user = userEvent.setup();
        renderSearch();

        await user.type(getSearchInput(), 'ip');

        await waitFor(() =>
          expect(querySkeletonItems().length).toBeGreaterThan(0),
        );

        resolveRequest();
        await waitFor(() =>
          expect(screen.getByText('iPhone 15')).toBeInTheDocument(),
        );
        expect(querySkeletonItems()).toHaveLength(0);
      });
    });

    describe('infinite scroll', () => {
      let triggerIntersection: (isIntersecting: boolean) => void;

      beforeEach(() => {
        class SpyIntersectionObserver {
          constructor(callback: IntersectionObserverCallback) {
            triggerIntersection = (isIntersecting: boolean) =>
              callback(
                [{ isIntersecting } as IntersectionObserverEntry],
                this as unknown as IntersectionObserver,
              );
          }
          observe = vi.fn();
          unobserve = vi.fn();
          disconnect = vi.fn();
        }
        vi.stubGlobal('IntersectionObserver', SpyIntersectionObserver);
      });

      it('appends the next page when the sentinel enters the viewport', async () => {
        server.use(
          http.get(`${TEST_API_BASE_URL}/products/search`, ({ request }) => {
            const skip = Number(
              new URL(request.url).searchParams.get('skip') ?? 0,
            );
            return HttpResponse.json(
              skip === 0
                ? { products: [mockProducts[0]], total: 2, skip: 0, limit: 9 }
                : { products: [mockProducts[1]], total: 2, skip: 1, limit: 9 },
            );
          }),
        );

        const user = userEvent.setup();
        renderSearch();

        await user.type(getSearchInput(), 'ip');
        await waitFor(() =>
          expect(screen.getByText('iPhone 15')).toBeInTheDocument(),
        );

        act(() => triggerIntersection(true));

        await waitFor(() =>
          expect(screen.getByText('Samsung Galaxy S23')).toBeInTheDocument(),
        );
        expect(screen.getByText('2 / 2 products')).toBeInTheDocument();
      });

      it('does not fetch the next page when there are no more results', async () => {
        let fetchCount = 0;
        server.use(
          http.get(`${TEST_API_BASE_URL}/products/search`, () => {
            fetchCount++;
            return HttpResponse.json({
              products: [mockProducts[0]],
              total: 1,
              skip: 0,
              limit: 9,
            });
          }),
        );

        const user = userEvent.setup();
        renderSearch();

        await user.type(getSearchInput(), 'ip');
        await waitFor(() =>
          expect(screen.getByText('iPhone 15')).toBeInTheDocument(),
        );

        const countAfterFirstPage = fetchCount;

        act(() => triggerIntersection(true));
        await new Promise((r) => setTimeout(r, 100));

        expect(fetchCount).toBe(countAfterFirstPage);
      });
    });
  });

  describe('add to cart', () => {
    it('shows a success toast after adding a product to the cart', async () => {
      const user = userEvent.setup();
      renderSearch();

      await user.type(getSearchInput(), 'ip');
      await waitFor(() => getAddCartButton());
      await user.click(getAddCartButton());

      await waitFor(
        () =>
          expect(toast.success).toHaveBeenCalledWith('Product added to cart!'),
        { timeout: 2000 },
      );
    });

    it('shows an error toast when the cart request fails', async () => {
      server.use(
        http.put(`${TEST_API_BASE_URL}/carts/1`, () =>
          HttpResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 },
          ),
        ),
      );

      const user = userEvent.setup();
      renderSearch();

      await user.type(getSearchInput(), 'ip');
      await waitFor(() => getAddCartButton());
      await user.click(getAddCartButton());

      await waitFor(
        () =>
          expect(toast.error).toHaveBeenCalledWith(
            'Product could not be added to cart.',
          ),
        { timeout: 2000 },
      );
    });
  });
});
