import type { AxiosHeaders } from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';

const REFRESH_URL = '/auth/refresh';

function makeMockAxiosClient() {
  return Object.assign(vi.fn(), {
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  });
}

function makeStore({
  accessToken = null as string | null,
  refreshToken = null as string | null,
} = {}) {
  const store = {
    getState: vi.fn(() => ({
      auth: {
        accessToken,
        refreshToken,
        user: null,
        isAuthenticated: !!accessToken,
        isLoading: false,
        isInitializing: false,
        error: null,
      },
    })),
    dispatch: vi.fn(),
  };

  return store;
}

function makeAxiosError({
  status,
  url = '/products',
  retry = false,
}: {
  status: number;
  url?: string;
  retry?: boolean;
}) {
  return {
    config: { url, headers: {} as AxiosHeaders, _retry: retry },
    response: { status },
    isAxiosError: true,
    name: 'AxiosError',
    message: `Request failed with status code ${status}`,
    toJSON: () => ({}),
  };
}

async function setupFreshInterceptors(
  storeOptions?: Parameters<typeof makeStore>[0],
) {
  vi.resetModules();

  const mockLogout = vi.fn(() => ({ type: 'auth/logout' }));
  const mockRefreshFulfilled = { match: vi.fn() };
  const mockRefreshThunk = Object.assign(vi.fn(), {
    fulfilled: mockRefreshFulfilled,
  });
  const freshClient = makeMockAxiosClient();

  vi.doMock('./axios', () => ({ default: freshClient }));
  vi.doMock('@/constants', () => ({
    API_ENDPOINTS: { AUTH: { REFRESH: REFRESH_URL } },
  }));
  vi.doMock('@/features/auth', () => ({}));
  vi.doMock('@/features/auth/store/authSlice', () => ({
    logout: mockLogout,
    refreshToken: mockRefreshThunk,
  }));
  vi.doMock('@/lib/logger', () => ({ default: { error: vi.fn() } }));

  const { setupInterceptors } = await import('./setupInterceptors');
  const store = makeStore(storeOptions);
  setupInterceptors(store);

  const requestHandler: (config: { headers: Record<string, string> }) => {
    headers: Record<string, string>;
  } = (freshClient.interceptors.request.use as ReturnType<typeof vi.fn>).mock
    .calls[0][0];

  const responseErrHandler: (err: unknown) => Promise<unknown> = (
    freshClient.interceptors.response.use as ReturnType<typeof vi.fn>
  ).mock.calls[0][1];

  return {
    store,
    requestHandler,
    responseErrHandler,
    freshClient,
    mockLogout,
    mockRefreshThunk,
    mockRefreshFulfilled,
  };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('request interceptor', () => {
  it('attaches Authorization header when accessToken exists', async () => {
    const { requestHandler } = await setupFreshInterceptors({
      accessToken: 'my-token',
    });
    const result = requestHandler({ headers: {} });
    expect(result.headers.Authorization).toBe('Bearer my-token');
  });

  it('does not attach Authorization header when no accessToken', async () => {
    const { requestHandler } = await setupFreshInterceptors({
      accessToken: null,
    });
    const result = requestHandler({ headers: {} });
    expect(result.headers.Authorization).toBeUndefined();
  });
});

describe('response error interceptor — pass-through cases', () => {
  it('re-rejects non-401 errors without touching the store', async () => {
    const { store, responseErrHandler } = await setupFreshInterceptors();
    const error = makeAxiosError({ status: 500 });
    await expect(responseErrHandler(error)).rejects.toBe(error);
    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it('re-rejects already-retried 401 requests', async () => {
    const { responseErrHandler } = await setupFreshInterceptors();
    const error = makeAxiosError({ status: 401, retry: true });
    await expect(responseErrHandler(error)).rejects.toBe(error);
  });

  it('re-rejects 401 on the refresh endpoint itself', async () => {
    const { responseErrHandler } = await setupFreshInterceptors();
    const error = makeAxiosError({ status: 401, url: REFRESH_URL });
    await expect(responseErrHandler(error)).rejects.toBe(error);
  });
});

describe('response error interceptor — no refresh token', () => {
  it('dispatches logout and rejects when refreshToken is absent', async () => {
    const { store, responseErrHandler, mockLogout } =
      await setupFreshInterceptors({
        refreshToken: null,
      });
    const error = makeAxiosError({ status: 401 });
    await expect(responseErrHandler(error)).rejects.toBe(error);
    expect(store.dispatch).toHaveBeenCalledWith(mockLogout());
  });
});

describe('response error interceptor — token refresh success', () => {
  it('retries the original request with the new token after a successful refresh', async () => {
    const newToken = 'new-access-token';
    const { store, responseErrHandler, freshClient, mockRefreshFulfilled } =
      await setupFreshInterceptors({ refreshToken: 'valid-refresh' });

    store.dispatch.mockResolvedValueOnce({
      payload: { accessToken: newToken },
    });
    mockRefreshFulfilled.match.mockReturnValue(true);
    freshClient.mockResolvedValueOnce({ data: 'retried ok' });

    await responseErrHandler(makeAxiosError({ status: 401 }));

    expect(store.dispatch).toHaveBeenCalled();
    const headers = (freshClient.mock.calls[0][0] as Record<string, unknown>)
      .headers as Record<string, string>;
    expect(headers.Authorization).toBe(`Bearer ${newToken}`);
  });
});

describe('response error interceptor — token refresh failure', () => {
  it('dispatches logout and rejects when the refresh thunk fails', async () => {
    const { store, responseErrHandler, mockLogout, mockRefreshFulfilled } =
      await setupFreshInterceptors({ refreshToken: 'bad-refresh' });

    store.dispatch.mockResolvedValueOnce({
      error: { message: 'Refresh failed' },
    });
    mockRefreshFulfilled.match.mockReturnValue(false);

    await expect(
      responseErrHandler(makeAxiosError({ status: 401 })),
    ).rejects.toBeDefined();
    expect(store.dispatch).toHaveBeenCalledWith(mockLogout());
  });
});

describe('response error interceptor — concurrent 401 queue', () => {
  it('queues concurrent 401 requests and resolves them all after a single refresh', async () => {
    const newToken = 'queued-new-token';
    const { store, responseErrHandler, freshClient, mockRefreshFulfilled } =
      await setupFreshInterceptors({ refreshToken: 'valid-refresh' });

    let resolveRefresh!: (v: unknown) => void;
    store.dispatch.mockReturnValueOnce(
      new Promise((r) => {
        resolveRefresh = r;
      }),
    );
    mockRefreshFulfilled.match.mockReturnValue(true);
    freshClient.mockResolvedValue({ data: 'ok' });

    const p1 = responseErrHandler(makeAxiosError({ status: 401 }));
    const p2 = responseErrHandler(makeAxiosError({ status: 401 }));

    resolveRefresh({ payload: { accessToken: newToken } });
    await Promise.all([p1, p2]);

    expect(freshClient).toHaveBeenCalledTimes(2);
  });
});
