import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import {
  CART_ACTIONS,
  CART_SLICE_NAME,
  CART_STATUS,
} from '../constants/cart.constants';
import { cartService } from '../services';
import type { Cart, CartStatus } from '../types/cart.types';

interface CartState {
  data: Cart | null;
  status: CartStatus;
  error: string | null;
}

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
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response
      ) {
        const axiosError = error as {
          response: { data: { message?: string } };
          message: string;
        };
        return rejectWithValue(
          axiosError.response.data.message ?? axiosError.message,
        );
      }
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch cart.');
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
    if (
      error &&
      typeof error === 'object' &&
      'response' in error &&
      error.response &&
      typeof error.response === 'object' &&
      'data' in error.response
    ) {
      const axiosError = error as {
        response: { data: { message?: string } };
        message: string;
      };
      return rejectWithValue(
        axiosError.response.data.message ?? axiosError.message,
      );
    }
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Failed to add to cart.');
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
    if (
      error &&
      typeof error === 'object' &&
      'response' in error &&
      error.response &&
      typeof error.response === 'object' &&
      'data' in error.response
    ) {
      const axiosError = error as {
        response: { data: { message?: string } };
        message: string;
      };
      return rejectWithValue(
        axiosError.response.data.message ?? axiosError.message,
      );
    }
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Failed to checkout.');
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
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.data = action.payload;
        state.error = null;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.error = action.payload ?? 'Failed to add to cart';
      })
      .addCase(checkoutCart.pending, (state) => {
        state.error = null;
      })
      .addCase(checkoutCart.fulfilled, (state) => {
        state.data = null;
        state.status = CART_STATUS.SUCCEEDED;
        state.error = null;
      })
      .addCase(checkoutCart.rejected, (state, action) => {
        state.error = action.payload ?? 'Failed to checkout';
      });
  },
});

export default cartSlice.reducer;
