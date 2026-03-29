import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import toast from 'react-hot-toast';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TEST_API_BASE_URL, TEST_CDN_BASE_URL } from '@/test/mocks/constants';
import { server } from '@/test/mocks/server';
import { renderWithProviders } from '@/test/render-utils';

import type { Product } from '../types';
import { OrderSummaryBar } from './OrderSummaryBar';

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

const mockProduct: Product = {
  id: 1,
  title: 'iPhone 15',
  description: 'Latest Apple smartphone with cutting-edge features',
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

function renderOrderSummaryBar(product = mockProduct) {
  return renderWithProviders(<OrderSummaryBar product={product} />);
}

describe('OrderSummaryBar', () => {
  describe('initial render', () => {
    it('displays the product title', () => {
      renderOrderSummaryBar();
      expect(screen.getAllByText('iPhone 15').length).toBeGreaterThan(0);
    });

    it('displays the formatted product price', () => {
      renderOrderSummaryBar();
      expect(screen.getAllByText('$999.00').length).toBeGreaterThan(0);
    });

    it('renders an "Add to Cart" button', () => {
      renderOrderSummaryBar();
      expect(
        screen.getByRole('button', { name: /add to cart/i }),
      ).toBeInTheDocument();
    });

    it('shows the product image with the product title as alt text', () => {
      renderOrderSummaryBar();
      expect(
        screen.getByRole('img', { name: 'iPhone 15' }),
      ).toBeInTheDocument();
    });

    it('truncates description longer than 60 characters with ellipsis', () => {
      const longDescription =
        'A very long product description that exceeds sixty characters easily here';
      renderOrderSummaryBar({ ...mockProduct, description: longDescription });
      expect(screen.getByText(/\.\.\.$/)).toBeInTheDocument();
    });

    it('does not truncate a description with 60 or fewer characters', () => {
      const shortDescription = 'Short description';
      renderOrderSummaryBar({ ...mockProduct, description: shortDescription });
      expect(screen.getByText('Short description')).toBeInTheDocument();
    });
  });

  describe('add to cart', () => {
    it('shows a success toast after successfully adding to cart', async () => {
      const user = userEvent.setup();
      renderOrderSummaryBar();

      await user.click(screen.getByRole('button', { name: /add to cart/i }));

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
      renderOrderSummaryBar();

      await user.click(screen.getByRole('button', { name: /add to cart/i }));

      await waitFor(
        () =>
          expect(toast.error).toHaveBeenCalledWith(
            'Product could not be added to cart.',
          ),
        { timeout: 2000 },
      );
    });

    it('does not show success toast when the cart request fails', async () => {
      server.use(
        http.put(`${TEST_API_BASE_URL}/carts/1`, () =>
          HttpResponse.json({ message: 'Server Error' }, { status: 500 }),
        ),
      );

      const user = userEvent.setup();
      renderOrderSummaryBar();

      await user.click(screen.getByRole('button', { name: /add to cart/i }));

      await waitFor(() => expect(toast.error).toHaveBeenCalled(), {
        timeout: 2000,
      });
      expect(toast.success).not.toHaveBeenCalled();
    });
  });
});
