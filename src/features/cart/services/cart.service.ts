import { API_ENDPOINTS } from '@/constants';
import apiClient from '@/lib/axios';

import type { Cart } from '../types/cart.types';

export const cartService = {
  getCart: async (): Promise<Cart> => {
    const response = await apiClient.get<Cart>(API_ENDPOINTS.CART.DEFAULT_CART);
    return response.data;
  },

  addToCart: async (payload: {
    id: number;
    quantity: number;
  }): Promise<Cart> => {
    const response = await apiClient.put<Cart>(
      API_ENDPOINTS.CART.DEFAULT_CART,
      {
        merge: true,
        products: [
          {
            id: payload.id,
            quantity: payload.quantity,
          },
        ],
      },
    );
    return response.data;
  },

  checkout: async (): Promise<Cart> => {
    const response = await apiClient.delete<Cart>(
      API_ENDPOINTS.CART.DEFAULT_CART,
    );
    return response.data;
  },
};
