import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { authService } from '../services/auth.service';
import type { AuthState } from '../types/auth.types';
import authReducer, {
  clearError,
  initAuth,
  login,
  logout,
  refreshToken,
} from './authSlice';

vi.mock('../services/auth.service', () => ({
  authService: {
    login: vi.fn(),
    refresh: vi.fn(),
    me: vi.fn(),
  },
}));

vi.mock('@/lib/tokenStorage', () => ({
  tokenStorage: {
    getRefreshToken: vi.fn(() => null),
    setRefreshToken: vi.fn(),
    clearRefreshToken: vi.fn(),
  },
}));

const mockAuthService = vi.mocked(authService);

const mockUser = {
  id: 1,
  username: 'emilys',
  email: 'emily@example.com',
  firstName: 'Emily',
  lastName: 'Smith',
  gender: 'female',
  image: 'https://example.com/image.jpg',
};

const mockLoginResponse = {
  ...mockUser,
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
};

function makeStore(auth: Partial<AuthState> = {}) {
  const defaultAuth: AuthState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    isInitializing: true,
    error: null,
  };
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState: { auth: { ...defaultAuth, ...auth } },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('initial state', () => {
  it('has correct defaults when no token is in storage', () => {
    const store = makeStore();
    const state = store.getState().auth;
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.isInitializing).toBe(true);
    expect(state.error).toBeNull();
  });
});

describe('logout action', () => {
  it('clears all auth fields', () => {
    const store = makeStore({
      user: mockUser,
      accessToken: 'tok',
      refreshToken: 'ref',
      isAuthenticated: true,
      isInitializing: false,
      error: 'previous error',
    });

    store.dispatch(logout());

    const s = store.getState().auth;
    expect(s.user).toBeNull();
    expect(s.accessToken).toBeNull();
    expect(s.refreshToken).toBeNull();
    expect(s.isAuthenticated).toBe(false);
    expect(s.isInitializing).toBe(false);
    expect(s.error).toBeNull();
  });
});

describe('clearError action', () => {
  it('sets error to null', () => {
    const store = makeStore({ error: 'something went wrong' });
    store.dispatch(clearError());
    expect(store.getState().auth.error).toBeNull();
  });
});

describe('login thunk', () => {
  it('sets isLoading while pending', () => {
    mockAuthService.login.mockReturnValue(new Promise(() => {}));
    const store = makeStore();
    store.dispatch(login({ username: 'u', password: 'p' }));
    expect(store.getState().auth.isLoading).toBe(true);
    expect(store.getState().auth.error).toBeNull();
  });

  it('populates user and tokens on success', async () => {
    mockAuthService.login.mockResolvedValue(mockLoginResponse);
    const store = makeStore();
    await store.dispatch(login({ username: 'emilys', password: 'pass' }));

    const s = store.getState().auth;
    expect(s.isAuthenticated).toBe(true);
    expect(s.accessToken).toBe('access-token');
    expect(s.refreshToken).toBe('refresh-token');
    expect(s.user?.username).toBe('emilys');
    expect(s.user?.email).toBe('emily@example.com');
    expect(s.isLoading).toBe(false);
    expect(s.error).toBeNull();
  });

  it('stores user without tokens in user field', async () => {
    mockAuthService.login.mockResolvedValue(mockLoginResponse);
    const store = makeStore();
    await store.dispatch(login({ username: 'emilys', password: 'pass' }));

    const { user } = store.getState().auth;
    expect(user).not.toHaveProperty('accessToken');
    expect(user).not.toHaveProperty('refreshToken');
  });

  it('sets error message and stops loading on failure', async () => {
    mockAuthService.login.mockRejectedValue({
      response: { data: { message: 'Invalid credentials' } },
      message: 'Request failed',
    });
    const store = makeStore();
    await store.dispatch(login({ username: 'bad', password: 'bad' }));

    const s = store.getState().auth;
    expect(s.isLoading).toBe(false);
    expect(s.isAuthenticated).toBe(false);
    expect(s.error).toBeTruthy();
  });
});

describe('refreshToken thunk', () => {
  it('rejects early when no refresh token in state', async () => {
    const store = makeStore({ refreshToken: null });
    const result = await store.dispatch(refreshToken());
    expect(refreshToken.rejected.match(result)).toBe(true);
  });

  it('updates access and refresh tokens on success', async () => {
    mockAuthService.refresh.mockResolvedValue({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
    });
    const store = makeStore({ refreshToken: 'old-refresh' });
    await store.dispatch(refreshToken());

    const s = store.getState().auth;
    expect(s.accessToken).toBe('new-access');
    expect(s.refreshToken).toBe('new-refresh');
  });

  it('clears auth state on failure', async () => {
    mockAuthService.refresh.mockRejectedValue({ message: 'Token expired' });
    const store = makeStore({
      refreshToken: 'bad',
      accessToken: 'old',
      isAuthenticated: true,
    });
    await store.dispatch(refreshToken());

    const s = store.getState().auth;
    expect(s.accessToken).toBeNull();
    expect(s.refreshToken).toBeNull();
    expect(s.isAuthenticated).toBe(false);
  });
});

describe('initAuth thunk', () => {
  it('sets isInitializing false and returns null when no refresh token', async () => {
    const store = makeStore({ refreshToken: null, isInitializing: true });
    await store.dispatch(initAuth());
    expect(store.getState().auth.isInitializing).toBe(false);
    expect(store.getState().auth.isAuthenticated).toBe(false);
  });

  it('authenticates the user when refresh token is valid', async () => {
    mockAuthService.refresh.mockResolvedValue({
      accessToken: 'fresh-access',
      refreshToken: 'fresh-refresh',
    });
    mockAuthService.me.mockResolvedValue({
      ...mockUser,
      accessToken: 'fresh-access',
      refreshToken: 'fresh-refresh',
    });

    const store = makeStore({ refreshToken: 'valid', isInitializing: true });
    await store.dispatch(initAuth());

    const s = store.getState().auth;
    expect(s.isInitializing).toBe(false);
    expect(s.isAuthenticated).toBe(true);
    expect(s.user?.username).toBe('emilys');
    expect(s.accessToken).toBe('fresh-access');
  });

  it('gracefully finishes without auth when refresh fails', async () => {
    mockAuthService.refresh.mockRejectedValue(new Error('expired'));
    const store = makeStore({ refreshToken: 'expired', isInitializing: true });
    await store.dispatch(initAuth());

    const s = store.getState().auth;
    expect(s.isInitializing).toBe(false);
    expect(s.isAuthenticated).toBe(false);
  });
});
