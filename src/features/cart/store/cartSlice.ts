import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { extractErrorMessage } from '@/lib/extractErrorMessage';

import {
  CART_ACTIONS,
  CART_SLICE_NAME,
  CART_STATUS,
} from '../constants/cart.constants';
import { cartService } from '../services';
import type { Cart, CartState } from '../types/cart.types';

const initialState: CartState = {
  data: null,
  status: CART_STATUS.IDLE,
  error: null,
};

export const fetchCart = createAsyncThunk<Cart, void, { rejectValue: string }>(
  CART_ACTIONS.FETCH,
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.getCart();
      return response;
    } catch (error: unknown) {
      return rejectWithValue(
        extractErrorMessage(error, 'Failed to fetch cart.'),
      );
    }
  },
);

export const addToCart = createAsyncThunk<
  Cart,
  { id: number; quantity: number },
  { rejectValue: string }
>(CART_ACTIONS.ADD, async (payload, { rejectWithValue }) => {
  try {
    const response = await cartService.addToCart(payload);
    return response;
  } catch (error: unknown) {
    return rejectWithValue(
      extractErrorMessage(error, 'Failed to add to cart.'),
    );
  }
});

export const checkoutCart = createAsyncThunk<
  Cart,
  void,
  { rejectValue: string }
>(CART_ACTIONS.CHECKOUT, async (_, { rejectWithValue }) => {
  try {
    const response = await cartService.checkout();
    return response;
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error, 'Failed to checkout.'));
  }
});

const cartSlice = createSlice({
  name: CART_SLICE_NAME,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.status = CART_STATUS.LOADING;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = CART_STATUS.SUCCEEDED;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = CART_STATUS.FAILED;
        state.error = action.payload ?? 'Failed to fetch cart';
      })
      .addCase(addToCart.pending, (state) => {
        state.status = CART_STATUS.LOADING;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.status = CART_STATUS.SUCCEEDED;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.status = CART_STATUS.FAILED;
        state.error = action.payload ?? 'Failed to add to cart';
      })
      .addCase(checkoutCart.pending, (state) => {
        state.status = CART_STATUS.LOADING;
        state.error = null;
      })
      .addCase(checkoutCart.fulfilled, (state) => {
        state.data = null;
        state.status = CART_STATUS.SUCCEEDED;
        state.error = null;
      })
      .addCase(checkoutCart.rejected, (state, action) => {
        state.status = CART_STATUS.FAILED;
        state.error = action.payload ?? 'Failed to checkout';
      });
  },
});

export default cartSlice.reducer;
