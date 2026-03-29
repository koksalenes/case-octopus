import { beforeEach, describe, expect, it, vi } from 'vitest';

import apiClient from '@/lib/axios';

import { authService } from './auth.service';

vi.mock('@/lib/axios', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

const mockApiClient = vi.mocked(apiClient);

const mockLoginResponse = {
  id: 1,
  username: 'emilys',
  email: 'emily@example.com',
  firstName: 'Emily',
  lastName: 'Smith',
  gender: 'female',
  image: 'https://example.com/image.jpg',
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('authService.login', () => {
  it('posts to /auth/login with provided credentials', async () => {
    mockApiClient.post.mockResolvedValue({ data: mockLoginResponse });
    await authService.login({ username: 'emilys', password: 'emilyspass' });
    expect(mockApiClient.post).toHaveBeenCalledWith('/auth/login', {
      username: 'emilys',
      password: 'emilyspass',
    });
  });

  it('returns the full login response data', async () => {
    mockApiClient.post.mockResolvedValue({ data: mockLoginResponse });
    const result = await authService.login({
      username: 'emilys',
      password: 'emilyspass',
    });
    expect(result).toEqual(mockLoginResponse);
  });

  it('propagates errors thrown by the API client', async () => {
    mockApiClient.post.mockRejectedValue(new Error('Unauthorized'));
    await expect(
      authService.login({ username: 'bad', password: 'bad' }),
    ).rejects.toThrow('Unauthorized');
  });

  it('calls post exactly once per invocation', async () => {
    mockApiClient.post.mockResolvedValue({ data: mockLoginResponse });
    await authService.login({ username: 'emilys', password: 'emilyspass' });
    expect(mockApiClient.post).toHaveBeenCalledOnce();
  });
});

describe('authService.refresh', () => {
  it('posts to /auth/refresh with the provided refresh token', async () => {
    mockApiClient.post.mockResolvedValue({
      data: { accessToken: 'new-access', refreshToken: 'new-refresh' },
    });
    await authService.refresh({ refreshToken: 'old-refresh' });
    expect(mockApiClient.post).toHaveBeenCalledWith('/auth/refresh', {
      refreshToken: 'old-refresh',
    });
  });

  it('returns new access and refresh tokens', async () => {
    const newTokens = {
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
    };
    mockApiClient.post.mockResolvedValue({ data: newTokens });
    const result = await authService.refresh({ refreshToken: 'old-refresh' });
    expect(result).toEqual(newTokens);
  });

  it('propagates errors thrown by the API client', async () => {
    mockApiClient.post.mockRejectedValue(new Error('Token expired'));
    await expect(authService.refresh({ refreshToken: 'bad' })).rejects.toThrow(
      'Token expired',
    );
  });
});

describe('authService.me', () => {
  it('calls GET /auth/me with a Bearer Authorization header', async () => {
    mockApiClient.get.mockResolvedValue({ data: mockLoginResponse });
    await authService.me('my-access-token');
    expect(mockApiClient.get).toHaveBeenCalledWith('/auth/me', {
      headers: { Authorization: 'Bearer my-access-token' },
    });
  });

  it('returns the user data from the response', async () => {
    mockApiClient.get.mockResolvedValue({ data: mockLoginResponse });
    const result = await authService.me('my-token');
    expect(result).toEqual(mockLoginResponse);
  });

  it('propagates errors thrown by the API client', async () => {
    mockApiClient.get.mockRejectedValue(new Error('Forbidden'));
    await expect(authService.me('invalid-token')).rejects.toThrow('Forbidden');
  });
});
