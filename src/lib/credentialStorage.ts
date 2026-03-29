const REMEMBER_ME_KEY = 'remember_me';

interface RememberedCredentials {
  username: string;
}

export const credentialStorage = {
  get: (): RememberedCredentials | null => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(REMEMBER_ME_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as RememberedCredentials;
    } catch {
      return null;
    }
  },

  save: (username: string): void => {
    if (typeof window === 'undefined') return;
    try {
      const data: RememberedCredentials = { username };
      localStorage.setItem(REMEMBER_ME_KEY, JSON.stringify(data));
    } catch {
      // localStorage may be unavailable
    }
  },

  clear: (): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(REMEMBER_ME_KEY);
    } catch {
      // localStorage may be unavailable
    }
  },
};
