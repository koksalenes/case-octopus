const REFRESH_TOKEN_KEY = 'refresh_token';

export const tokenStorage = {
  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setRefreshToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } catch {
      // localStorage may be unavailable
    }
  },

  clearRefreshToken: (): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch {
      // localStorage may be unavailable
    }
  },
};
