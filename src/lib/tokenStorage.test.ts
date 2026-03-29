import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { tokenStorage } from './tokenStorage';

const KEY = 'refresh_token';

describe('tokenStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getRefreshToken', () => {
    it('returns null when storage is empty', () => {
      expect(tokenStorage.getRefreshToken()).toBeNull();
    });

    it('returns the stored token', () => {
      localStorage.setItem(KEY, 'my-refresh-token');
      expect(tokenStorage.getRefreshToken()).toBe('my-refresh-token');
    });
  });

  describe('setRefreshToken', () => {
    it('persists the token in localStorage', () => {
      tokenStorage.setRefreshToken('abc123');
      expect(localStorage.getItem(KEY)).toBe('abc123');
    });

    it('overwrites an existing token', () => {
      localStorage.setItem(KEY, 'old-token');
      tokenStorage.setRefreshToken('new-token');
      expect(localStorage.getItem(KEY)).toBe('new-token');
    });
  });

  describe('clearRefreshToken', () => {
    it('removes the token from localStorage', () => {
      localStorage.setItem(KEY, 'some-token');
      tokenStorage.clearRefreshToken();
      expect(localStorage.getItem(KEY)).toBeNull();
    });

    it('does not throw when storage is already empty', () => {
      expect(() => tokenStorage.clearRefreshToken()).not.toThrow();
    });
  });

  describe('round-trip', () => {
    it('set then get returns the same value', () => {
      tokenStorage.setRefreshToken('round-trip-token');
      expect(tokenStorage.getRefreshToken()).toBe('round-trip-token');
    });

    it('set then clear then get returns null', () => {
      tokenStorage.setRefreshToken('temp-token');
      tokenStorage.clearRefreshToken();
      expect(tokenStorage.getRefreshToken()).toBeNull();
    });
  });
});
