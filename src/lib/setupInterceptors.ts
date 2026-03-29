import type { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { API_ENDPOINTS } from '@/constants';
import type { AuthState } from '@/features/auth';
import {
  logout,
  refreshToken as refreshTokenThunk,
} from '@/features/auth/store/authSlice';
import logger from '@/lib/logger';

import apiClient from './axios';

interface AuthStoreState {
  auth: AuthState;
}

interface AppStore {
  getState: () => AuthStoreState;
  dispatch: ThunkDispatch<AuthStoreState, undefined, UnknownAction>;
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (token) {
      promise.resolve(token);
    } else {
      promise.reject(error);
    }
  });
  failedQueue = [];
};

export function setupInterceptors(store: AppStore) {
  apiClient.interceptors.request.use((config) => {
    const { accessToken } = store.getState().auth;

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  });

  // handle 401 with silent token refresh
  apiClient.interceptors.response.use(undefined, async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const isRefreshRequest = originalRequest?.url?.includes(
      API_ENDPOINTS.AUTH.REFRESH,
    );

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      isRefreshRequest
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const { refreshToken } = store.getState().auth;

    if (!refreshToken) {
      isRefreshing = false;
      store.dispatch(logout());
      return Promise.reject(error);
    }

    try {
      const result = await store.dispatch(refreshTokenThunk());

      if (!refreshTokenThunk.fulfilled.match(result)) {
        throw result.error;
      }

      const { accessToken: newAccessToken } = result.payload;

      processQueue(null, newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      store.dispatch(logout());
      logger.error('[Token Refresh] Failed — user logged out');
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  });
}
