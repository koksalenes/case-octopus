interface ServerFetchOptions extends RequestInit {
  next?: NextFetchRequestConfig;
  retries?: number;
}

export async function serverFetch<T>(
  url: string,
  options?: ServerFetchOptions,
): Promise<T> {
  const { retries = 2, ...fetchOptions } = options ?? {};

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, fetchOptions);

      if (!res.ok) {
        throw new Error(
          `[serverFetch] ${res.status} ${res.statusText} — ${url}`,
        );
      }

      return res.json() as Promise<T>;
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * (attempt + 1)),
        );
      }
    }
  }

  throw lastError;
}
