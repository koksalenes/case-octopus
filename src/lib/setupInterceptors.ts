import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { API_ENDPOINTS } from '@/constants';
import { authService } from '@/features/auth/services/auth.service';
import { logout, setTokens } from '@/features/auth/store/authSlice';
import logger from '@/lib/logger';

import apiClient from './axios';

interface AuthStoreState {
  auth: {
    accessToken: string | null;
    refreshToken: string | null;
  };
}

interface AppStore {
  getState: () => AuthStoreState;
  dispatch: (action: unknown) => unknown;
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
      const response = await authService.refresh({
        refreshToken,
      });

      store.dispatch(
        setTokens({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        }),
      );

      processQueue(null, response.accessToken);

      originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
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
