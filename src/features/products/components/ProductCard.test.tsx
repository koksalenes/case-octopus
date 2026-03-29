import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import toast from 'react-hot-toast';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TEST_API_BASE_URL, TEST_CDN_BASE_URL } from '@/test/mocks/constants';
import { server } from '@/test/mocks/server';
import { renderWithProviders } from '@/test/render-utils';

import type { Product } from '../types';
import { ProductCard } from './ProductCard';

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

const mockProduct: Product = {
  id: 1,
  title: 'iPhone 15',
  description: 'Latest Apple smartphone',
  category: 'smartphones',
  price: 999,
  discountPercentage: 5,
  rating: 4.5,
  stock: 50,
  tags: [],
  brand: 'Apple',
  sku: 'IPHONE-15',
  weight: 0.2,
  dimensions: { width: 7, height: 15, depth: 0.8 },
  warrantyInformation: '1 year',
  shippingInformation: 'Ships in 1 day',
  availabilityStatus: 'In Stock',
  reviews: [],
  returnPolicy: '30 days',
  minimumOrderQuantity: 1,
  meta: { createdAt: '', updatedAt: '', barcode: '', qrCode: '' },
  images: [],
  thumbnail: `${TEST_CDN_BASE_URL}/products/images/1/thumbnail.webp`,
};

afterEach(() => {
  vi.clearAllMocks();
});

function renderProductCard(product = mockProduct) {
  return renderWithProviders(<ProductCard product={product} />);
}

describe('ProductCard', () => {
  describe('content rendering', () => {
    it('displays the product title', () => {
      renderProductCard();
      expect(screen.getByText('iPhone 15')).toBeInTheDocument();
    });

    it('displays the formatted price', () => {
      renderProductCard();
      expect(screen.getByText('$999.00')).toBeInTheDocument();
    });

    it('capitalizes the first letter of the category', () => {
      renderProductCard();
      expect(screen.getByText('Smartphones')).toBeInTheDocument();
    });

    it('renders a link to the product detail page', () => {
      renderProductCard();
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/products/1');
    });

    it('renders the product image with the product title as alt text', () => {
      renderProductCard();
      expect(
        screen.getByRole('img', { name: 'iPhone 15' }),
      ).toBeInTheDocument();
    });

    it('renders the "Add Cart" button', () => {
      renderProductCard();
      expect(
        screen.getByRole('button', { name: /add cart/i }),
      ).toBeInTheDocument();
    });

    it('uses the correct product id in the detail page link', () => {
      renderProductCard({ ...mockProduct, id: 42 });
      expect(screen.getByRole('link')).toHaveAttribute('href', '/products/42');
    });
  });

  describe('add to cart', () => {
    it('shows a success toast after successfully adding to cart', async () => {
      const user = userEvent.setup();
      renderProductCard();

      await user.click(screen.getByRole('button', { name: /add cart/i }));

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
      renderProductCard();

      await user.click(screen.getByRole('button', { name: /add cart/i }));

      await waitFor(
        () =>
          expect(toast.error).toHaveBeenCalledWith(
            'Product could not be added to cart.',
          ),
        { timeout: 2000 },
      );
    });

    it('does not show a success toast when the cart request fails', async () => {
      server.use(
        http.put(`${TEST_API_BASE_URL}/carts/1`, () =>
          HttpResponse.json({ message: 'Server Error' }, { status: 500 }),
        ),
      );

      const user = userEvent.setup();
      renderProductCard();

      await user.click(screen.getByRole('button', { name: /add cart/i }));

      await waitFor(() => expect(toast.error).toHaveBeenCalled(), {
        timeout: 2000,
      });
      expect(toast.success).not.toHaveBeenCalled();
    });

    it('shows a success toast and no error toast on success', async () => {
      const user = userEvent.setup();
      renderProductCard();

      await user.click(screen.getByRole('button', { name: /add cart/i }));

      await waitFor(() => expect(toast.success).toHaveBeenCalled(), {
        timeout: 2000,
      });
      expect(toast.error).not.toHaveBeenCalled();
    });
  });
});
