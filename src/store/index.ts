import { configureStore } from '@reduxjs/toolkit';

import { authReducer } from '@/features/auth';
import { setupInterceptors } from '@/lib/setupInterceptors';
import { tokenStorage } from '@/lib/tokenStorage';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

setupInterceptors(store);

let previousRefreshToken: string | null = null;
store.subscribe(() => {
  const { refreshToken } = store.getState().auth;
  if (refreshToken !== previousRefreshToken) {
    previousRefreshToken = refreshToken;
    if (refreshToken) {
      tokenStorage.setRefreshToken(refreshToken);
    } else {
      tokenStorage.clearRefreshToken();
    }
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
