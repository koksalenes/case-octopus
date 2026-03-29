import { beforeEach, describe, expect, it, vi } from 'vitest';

import apiClient from '@/lib/axios';
import { TEST_CDN_BASE_URL } from '@/test/mocks/constants';

import { cartService } from './cart.service';

vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockApiClient = vi.mocked(apiClient);

const mockEmptyCart = {
  id: 1,
  products: [],
  total: 0,
  discountedTotal: 0,
  userId: 1,
  totalProducts: 0,
  totalQuantity: 0,
};

const mockCartWithProduct = {
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
  total: 1998,
  discountedTotal: 1998,
  userId: 1,
  totalProducts: 1,
  totalQuantity: 2,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('cartService.getCart', () => {
  it('calls GET /carts/1', async () => {
    mockApiClient.get.mockResolvedValue({ data: mockEmptyCart });
    await cartService.getCart();
    expect(mockApiClient.get).toHaveBeenCalledWith('/carts/1');
  });

  it('returns the cart data', async () => {
    mockApiClient.get.mockResolvedValue({ data: mockEmptyCart });
    const result = await cartService.getCart();
    expect(result).toEqual(mockEmptyCart);
  });

  it('calls get exactly once', async () => {
    mockApiClient.get.mockResolvedValue({ data: mockEmptyCart });
    await cartService.getCart();
    expect(mockApiClient.get).toHaveBeenCalledOnce();
  });

  it('propagates errors from the API client', async () => {
    mockApiClient.get.mockRejectedValue(new Error('Network error'));
    await expect(cartService.getCart()).rejects.toThrow('Network error');
  });
});

describe('cartService.addToCart', () => {
  it('calls PUT /carts/1 with merge: true and the product list', async () => {
    mockApiClient.put.mockResolvedValue({ data: mockCartWithProduct });
    await cartService.addToCart({ id: 1, quantity: 2 });
    expect(mockApiClient.put).toHaveBeenCalledWith('/carts/1', {
      merge: true,
      products: [{ id: 1, quantity: 2 }],
    });
  });

  it('returns the updated cart', async () => {
    mockApiClient.put.mockResolvedValue({ data: mockCartWithProduct });
    const result = await cartService.addToCart({ id: 1, quantity: 2 });
    expect(result).toEqual(mockCartWithProduct);
  });

  it('sends the correct product id and quantity in the request body', async () => {
    mockApiClient.put.mockResolvedValue({ data: mockCartWithProduct });
    await cartService.addToCart({ id: 42, quantity: 3 });
    const callBody = (mockApiClient.put as ReturnType<typeof vi.fn>).mock
      .calls[0][1];
    expect(callBody.products[0]).toEqual({ id: 42, quantity: 3 });
  });

  it('propagates errors from the API client', async () => {
    mockApiClient.put.mockRejectedValue(new Error('Conflict'));
    await expect(cartService.addToCart({ id: 1, quantity: 1 })).rejects.toThrow(
      'Conflict',
    );
  });
});

describe('cartService.checkout', () => {
  it('calls DELETE /carts/1', async () => {
    mockApiClient.delete.mockResolvedValue({ data: mockEmptyCart });
    await cartService.checkout();
    expect(mockApiClient.delete).toHaveBeenCalledWith('/carts/1');
  });

  it('returns the API response data', async () => {
    mockApiClient.delete.mockResolvedValue({ data: mockEmptyCart });
    const result = await cartService.checkout();
    expect(result).toEqual(mockEmptyCart);
  });

  it('calls delete exactly once', async () => {
    mockApiClient.delete.mockResolvedValue({ data: mockEmptyCart });
    await cartService.checkout();
    expect(mockApiClient.delete).toHaveBeenCalledOnce();
  });

  it('propagates errors from the API client', async () => {
    mockApiClient.delete.mockRejectedValue(new Error('Forbidden'));
    await expect(cartService.checkout()).rejects.toThrow('Forbidden');
  });
});
