import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { extractErrorMessage } from '@/lib/extractErrorMessage';
import { tokenStorage } from '@/lib/tokenStorage';

import { AUTH_ACTIONS, AUTH_SLICE_NAME } from '../constants';
import { authService } from '../services/auth.service';
import type {
  AuthState,
  AuthUser,
  LoginRequest,
  LoginResponse,
  RefreshResponse,
} from '../types/auth.types';

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: tokenStorage.getRefreshToken(),
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true,
  error: null,
};

export const login = createAsyncThunk<
  LoginResponse,
  LoginRequest,
  { rejectValue: string }
>(AUTH_ACTIONS.LOGIN, async (credentials, { rejectWithValue }) => {
  try {
    const response = await authService.login(credentials);
    return response;
  } catch (error: unknown) {
    return rejectWithValue(
      extractErrorMessage(
        error,
        'An unexpected error occurred. Please try again.',
      ),
    );
  }
});

export const refreshToken = createAsyncThunk<
  RefreshResponse,
  void,
  { rejectValue: string; state: { auth: AuthState } }
>(AUTH_ACTIONS.REFRESH, async (_, { getState, rejectWithValue }) => {
  try {
    const { refreshToken } = getState().auth;
    if (!refreshToken) {
      return rejectWithValue('No refresh token available');
    }
    const response = await authService.refresh({
      refreshToken,
    });
    return response;
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error, 'Token refresh failed'));
  }
});

export const initAuth = createAsyncThunk<
  { user: AuthUser; accessToken: string; refreshToken: string } | null,
  void,
  { state: { auth: AuthState } }
>(AUTH_ACTIONS.INIT, async (_, { getState }) => {
  const { refreshToken } = getState().auth;
  if (!refreshToken) return null;

  try {
    const { accessToken, refreshToken: newRefreshToken } =
      await authService.refresh({ refreshToken });

    const userData = await authService.me(accessToken);
    const { accessToken: _at, refreshToken: _rt, ...user } = userData;

    return { user, accessToken, refreshToken: newRefreshToken };
  } catch {
    return null;
  }
});

const authSlice = createSlice({
  name: AUTH_SLICE_NAME,
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isInitializing = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        const { accessToken, refreshToken, ...user } = action.payload;
        state.user = user;
        state.accessToken = accessToken;
        state.refreshToken = refreshToken;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Login failed';
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      })
      .addCase(initAuth.fulfilled, (state, action) => {
        state.isInitializing = false;
        if (!action.payload) return;
        const { user, accessToken, refreshToken } = action.payload;
        state.user = user;
        state.accessToken = accessToken;
        state.refreshToken = refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(initAuth.rejected, (state) => {
        state.isInitializing = false;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
