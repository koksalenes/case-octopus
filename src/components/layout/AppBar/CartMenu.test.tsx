import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import toast from 'react-hot-toast';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TEST_API_BASE_URL, TEST_CDN_BASE_URL } from '@/test/mocks/constants';
import { server } from '@/test/mocks/server';
import { renderWithProviders } from '@/test/render-utils';

import { CartMenu } from './CartMenu';

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

const mockCartWithItems = {
  id: 1,
  products: [
    {
      id: 1,
      title: 'iPhone 15',
      price: 999,
      quantity: 2,
      total: 1998,
      discountPercentage: 0,
      discountedTotal: 1998,
      thumbnail: `${TEST_CDN_BASE_URL}/products/images/1/thumbnail.webp`,
    },
  ],
  total: 999,
  discountedTotal: 999,
  userId: 1,
  totalProducts: 1,
  totalQuantity: 2,
};

afterEach(() => {
  vi.clearAllMocks();
});

function renderCartMenu() {
  return renderWithProviders(<CartMenu />);
}

const getCartButton = () => screen.getByRole('button', { name: /cart/i });
const queryCartBadge = () => screen.queryByTestId('cart-badge');
const queryDropdown = () => screen.queryByRole('heading', { name: /cart/i });
const getDropdown = () => screen.getByRole('heading', { name: /cart/i });

describe('CartMenu', () => {
  describe('initial render', () => {
    it('renders the cart icon button', () => {
      renderCartMenu();
      expect(getCartButton()).toBeInTheDocument();
    });

    it('does not show the dropdown by default', () => {
      renderCartMenu();
      expect(queryDropdown()).not.toBeInTheDocument();
    });

    it('does not show a badge when the cart is empty', async () => {
      renderCartMenu();
      await waitFor(() => expect(queryCartBadge()).not.toBeInTheDocument());
    });
  });

  describe('cart badge', () => {
    beforeEach(() => {
      server.use(
        http.get(`${TEST_API_BASE_URL}/carts/1`, () =>
          HttpResponse.json(mockCartWithItems),
        ),
      );
    });

    it('shows a badge with the distinct product count when the cart has items', async () => {
      renderCartMenu();
      const badge = await screen.findByTestId('cart-badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('1');
    });
  });

  describe('dropdown toggle', () => {
    it('opens the dropdown when the cart button is clicked', async () => {
      const user = userEvent.setup();
      renderCartMenu();

      await user.click(getCartButton());

      expect(getDropdown()).toBeInTheDocument();
    });

    it('closes the dropdown when the cart button is clicked again', async () => {
      const user = userEvent.setup();
      renderCartMenu();

      await user.click(getCartButton());
      await user.click(getCartButton());

      expect(queryDropdown()).not.toBeInTheDocument();
    });

    it('closes the dropdown when clicking outside the component', async () => {
      const user = userEvent.setup();
      renderCartMenu();

      await user.click(getCartButton());
      expect(getDropdown()).toBeInTheDocument();

      await user.click(document.body);

      expect(queryDropdown()).not.toBeInTheDocument();
    });
  });

  describe('empty cart dropdown', () => {
    it('shows "Your cart is empty." when opened with an empty cart', async () => {
      const user = userEvent.setup();
      renderCartMenu();

      await user.click(getCartButton());

      await waitFor(() =>
        expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument(),
      );
    });

    it('does not show the "Pay Now" button when the cart is empty', async () => {
      const user = userEvent.setup();
      renderCartMenu();

      await user.click(getCartButton());

      await waitFor(() =>
        expect(
          screen.queryByRole('button', { name: /pay now/i }),
        ).not.toBeInTheDocument(),
      );
    });
  });

  describe('cart with items', () => {
    beforeEach(() => {
      server.use(
        http.get(`${TEST_API_BASE_URL}/carts/1`, () =>
          HttpResponse.json(mockCartWithItems),
        ),
      );
    });

    it('displays each product title and formatted price', async () => {
      const user = userEvent.setup();
      renderCartMenu();

      await user.click(getCartButton());

      await waitFor(() =>
        expect(screen.getByText('iPhone 15')).toBeInTheDocument(),
      );
      expect(screen.getAllByText('$999.00').length).toBeGreaterThan(0);
    });

    it('shows the product quantity', async () => {
      const user = userEvent.setup();
      renderCartMenu();

      await user.click(getCartButton());

      await waitFor(() =>
        expect(screen.getByText(/count: 2/i)).toBeInTheDocument(),
      );
    });

    it('shows the "Pay Now" button when the cart has products', async () => {
      const user = userEvent.setup();
      renderCartMenu();

      await user.click(getCartButton());

      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: /pay now/i }),
        ).toBeInTheDocument(),
      );
    });

    it('renders a link to each product detail page', async () => {
      const user = userEvent.setup();
      renderCartMenu();

      await user.click(getCartButton());

      await waitFor(() =>
        expect(
          screen.getByRole('link', { name: /iphone 15/i }),
        ).toHaveAttribute('href', '/products/1'),
      );
    });

    it('closes the dropdown when a product link is clicked', async () => {
      const user = userEvent.setup();
      renderCartMenu();

      await user.click(getCartButton());
      await waitFor(() => screen.getByText('iPhone 15'));

      await user.click(screen.getByRole('link', { name: /iphone 15/i }));

      expect(queryDropdown()).not.toBeInTheDocument();
    });
  });

  describe('checkout', () => {
    beforeEach(() => {
      server.use(
        http.get(`${TEST_API_BASE_URL}/carts/1`, () =>
          HttpResponse.json(mockCartWithItems),
        ),
      );
    });

    it('shows a success toast and closes the dropdown on successful checkout', async () => {
      const user = userEvent.setup();
      renderCartMenu();

      await user.click(getCartButton());
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: /pay now/i }),
        ).toBeInTheDocument(),
      );
      await user.click(screen.getByRole('button', { name: /pay now/i }));

      await waitFor(() =>
        expect(toast.success).toHaveBeenCalledWith(
          'Payment completed successfully!',
        ),
      );
      expect(queryDropdown()).not.toBeInTheDocument();
    });

    it('shows an error toast and keeps the dropdown open when checkout fails', async () => {
      server.use(
        http.delete(`${TEST_API_BASE_URL}/carts/1`, () =>
          HttpResponse.json({ message: 'Server Error' }, { status: 500 }),
        ),
      );

      const user = userEvent.setup();
      renderCartMenu();

      await user.click(getCartButton());
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: /pay now/i }),
        ).toBeInTheDocument(),
      );
      await user.click(screen.getByRole('button', { name: /pay now/i }));

      await waitFor(() =>
        expect(toast.error).toHaveBeenCalledWith('Payment failed!'),
      );
    });
  });
});
