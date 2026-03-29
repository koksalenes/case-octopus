import { configureStore } from '@reduxjs/toolkit';
import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { Provider } from 'react-redux';

import authReducer from '@/features/auth/store/authSlice';
import type { AuthState } from '@/features/auth/types/auth.types';
import cartReducer from '@/features/cart/store/cartSlice';
import type { CartState } from '@/features/cart/types/cart.types';

type PreloadedState = {
  auth?: Partial<AuthState>;
  cart?: Partial<CartState>;
};

export function makeStore(preloadedState: PreloadedState = {}) {
  return configureStore({
    reducer: { auth: authReducer, cart: cartReducer },
    preloadedState: preloadedState as Parameters<
      typeof configureStore
    >[0]['preloadedState'],
  });
}

interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: PreloadedState;
  store?: ReturnType<typeof makeStore>;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState = {},
    store = makeStore(preloadedState),
    ...renderOptions
  }: ExtendedRenderOptions = {},
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  }
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
