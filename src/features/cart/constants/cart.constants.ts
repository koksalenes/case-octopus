export const CART_SLICE_NAME = 'cart';

export const CART_ACTIONS = {
  FETCH: 'cart/fetchCart',
  ADD: 'cart/addToCart',
  CHECKOUT: 'cart/checkoutCart',
} as const;

export const CART_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
} as const;
