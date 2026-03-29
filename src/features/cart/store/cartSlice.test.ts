import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TEST_CDN_BASE_URL } from '@/test/mocks/constants';

import { cartService } from '../services';
import type { Cart } from '../types/cart.types';
import cartReducer, { addToCart, checkoutCart, fetchCart } from './cartSlice';

vi.mock('../services', () => ({
  cartService: {
    getCart: vi.fn(),
    addToCart: vi.fn(),
    checkout: vi.fn(),
  },
}));

const mockCartService = vi.mocked(cartService);

const mockCart: Cart = {
  id: 1,
  products: [],
  total: 0,
  discountedTotal: 0,
  userId: 1,
  totalProducts: 0,
  totalQuantity: 0,
};

const mockCartWithProduct: Cart = {
  id: 1,
  products: [
    {
      id: 1,
      title: 'iPhone 15',
      price: 999,
      quantity: 1,
      total: 999,
      discountPercentage: 0,
      discountedTotal: 999,
      thumbnail: `${TEST_CDN_BASE_URL}/products/images/1/thumbnail.webp`,
    },
  ],
  total: 999,
  discountedTotal: 999,
  userId: 1,
  totalProducts: 1,
  totalQuantity: 1,
};

function makeStore() {
  return configureStore({ reducer: { cart: cartReducer } });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('initial state', () => {
  it('has idle status and null data by default', () => {
    const store = makeStore();
    const state = store.getState().cart;
    expect(state.data).toBeNull();
    expect(state.status).toBe('idle');
    expect(state.error).toBeNull();
  });
});

describe('fetchCart thunk', () => {
  it('sets status to loading while pending', () => {
    mockCartService.getCart.mockReturnValue(new Promise(() => {}));
    const store = makeStore();
    store.dispatch(fetchCart());
    expect(store.getState().cart.status).toBe('loading');
    expect(store.getState().cart.error).toBeNull();
  });

  it('populates cart data and sets succeeded status on success', async () => {
    mockCartService.getCart.mockResolvedValue(mockCart);
    const store = makeStore();
    await store.dispatch(fetchCart());

    const state = store.getState().cart;
    expect(state.status).toBe('succeeded');
    expect(state.data).toEqual(mockCart);
    expect(state.error).toBeNull();
  });

  it('sets failed status and error message on rejection', async () => {
    mockCartService.getCart.mockRejectedValue({
      response: { data: { message: 'Server error' } },
      message: 'Request failed',
    });
    const store = makeStore();
    await store.dispatch(fetchCart());

    const state = store.getState().cart;
    expect(state.status).toBe('failed');
    expect(state.error).toBeTruthy();
    expect(state.data).toBeNull();
  });

  it('uses the fallback error message when no server message is provided', async () => {
    mockCartService.getCart.mockRejectedValue({});
    const store = makeStore();
    await store.dispatch(fetchCart());

    expect(store.getState().cart.error).toBe('Failed to fetch cart.');
  });

  it('uses reducer fallback when payload is undefined (non-rejectWithValue rejection)', () => {
    const store = makeStore();
    store.dispatch(fetchCart.rejected(new Error('unexpected'), 'req-id'));
    expect(store.getState().cart.error).toBe('Failed to fetch cart');
  });
});

describe('addToCart thunk', () => {
  it('sets status to loading while pending', () => {
    mockCartService.addToCart.mockReturnValue(new Promise(() => {}));
    const store = makeStore();
    store.dispatch(addToCart({ id: 1, quantity: 1 }));
    expect(store.getState().cart.status).toBe('loading');
  });

  it('updates cart data and sets succeeded status on success', async () => {
    mockCartService.addToCart.mockResolvedValue(mockCartWithProduct);
    const store = makeStore();
    await store.dispatch(addToCart({ id: 1, quantity: 1 }));

    const state = store.getState().cart;
    expect(state.status).toBe('succeeded');
    expect(state.data).toEqual(mockCartWithProduct);
    expect(state.data?.totalProducts).toBe(1);
    expect(state.error).toBeNull();
  });

  it('sets failed status and error message on rejection', async () => {
    mockCartService.addToCart.mockRejectedValue({
      response: { data: { message: 'Could not add product' } },
      message: 'Request failed',
    });
    const store = makeStore();
    await store.dispatch(addToCart({ id: 99, quantity: 1 }));

    const state = store.getState().cart;
    expect(state.status).toBe('failed');
    expect(state.error).toBeTruthy();
  });

  it('uses the fallback error message when no server message is provided', async () => {
    mockCartService.addToCart.mockRejectedValue({});
    const store = makeStore();
    await store.dispatch(addToCart({ id: 1, quantity: 1 }));

    expect(store.getState().cart.error).toBe('Failed to add to cart.');
  });

  it('uses reducer fallback when payload is undefined (non-rejectWithValue rejection)', () => {
    const store = makeStore();
    store.dispatch(
      addToCart.rejected(new Error('unexpected'), 'req-id', {
        id: 1,
        quantity: 1,
      }),
    );
    expect(store.getState().cart.error).toBe('Failed to add to cart');
  });
});

describe('checkoutCart thunk', () => {
  it('sets status to loading while pending', () => {
    mockCartService.checkout.mockReturnValue(new Promise(() => {}));
    const store = makeStore();
    store.dispatch(checkoutCart());
    expect(store.getState().cart.status).toBe('loading');
  });

  it('clears cart data and sets succeeded status on success', async () => {
    mockCartService.checkout.mockResolvedValue(mockCart);
    const store = makeStore();
    await store.dispatch(checkoutCart());

    const state = store.getState().cart;
    expect(state.status).toBe('succeeded');
    expect(state.data).toBeNull();
    expect(state.error).toBeNull();
  });

  it('sets failed status and error message on rejection', async () => {
    mockCartService.checkout.mockRejectedValue({
      response: { data: { message: 'Checkout failed' } },
      message: 'Request failed',
    });
    const store = makeStore();
    await store.dispatch(checkoutCart());

    const state = store.getState().cart;
    expect(state.status).toBe('failed');
    expect(state.error).toBeTruthy();
  });

  it('uses the fallback error message when no server message is provided', async () => {
    mockCartService.checkout.mockRejectedValue({});
    const store = makeStore();
    await store.dispatch(checkoutCart());

    expect(store.getState().cart.error).toBe('Failed to checkout.');
  });

  it('uses reducer fallback when payload is undefined (non-rejectWithValue rejection)', () => {
    const store = makeStore();
    store.dispatch(checkoutCart.rejected(new Error('unexpected'), 'req-id'));
    expect(store.getState().cart.error).toBe('Failed to checkout');
  });
});
