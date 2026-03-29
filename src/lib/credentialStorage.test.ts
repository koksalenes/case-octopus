import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { credentialStorage } from './credentialStorage';

const KEY = 'remember_me';

describe('credentialStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('get', () => {
    it('returns null when storage is empty', () => {
      expect(credentialStorage.get()).toBeNull();
    });

    it('returns parsed credentials when set', () => {
      localStorage.setItem(KEY, JSON.stringify({ username: 'emilys' }));
      expect(credentialStorage.get()).toEqual({ username: 'emilys' });
    });

    it('returns null when stored value is malformed JSON', () => {
      localStorage.setItem(KEY, 'not-valid-json{{{');
      expect(credentialStorage.get()).toBeNull();
    });
  });

  describe('save', () => {
    it('stores username as JSON in localStorage', () => {
      credentialStorage.save('emilys');
      const raw = localStorage.getItem(KEY);
      expect(JSON.parse(raw!)).toEqual({ username: 'emilys' });
    });

    it('overwrites existing credentials', () => {
      credentialStorage.save('user1');
      credentialStorage.save('user2');
      expect(credentialStorage.get()?.username).toBe('user2');
    });
  });

  describe('clear', () => {
    it('removes credentials from localStorage', () => {
      credentialStorage.save('emilys');
      credentialStorage.clear();
      expect(localStorage.getItem(KEY)).toBeNull();
    });

    it('does not throw when storage is already empty', () => {
      expect(() => credentialStorage.clear()).not.toThrow();
    });
  });

  describe('round-trip', () => {
    it('save then get returns correct username', () => {
      credentialStorage.save('testuser');
      expect(credentialStorage.get()).toEqual({ username: 'testuser' });
    });

    it('save then clear then get returns null', () => {
      credentialStorage.save('testuser');
      credentialStorage.clear();
      expect(credentialStorage.get()).toBeNull();
    });
  });

  describe('localStorage unavailable', () => {
    it('set does not throw when localStorage throws', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage full');
      });
      expect(() => credentialStorage.save('user')).not.toThrow();
    });

    it('clear does not throw when localStorage throws', () => {
      vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('Storage full');
      });
      expect(() => credentialStorage.clear()).not.toThrow();
    });
  });
});
