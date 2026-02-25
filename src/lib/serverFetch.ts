interface ServerFetchOptions extends RequestInit {
  next?: NextFetchRequestConfig;
}

export async function serverFetch<T>(
  url: string,
  options?: ServerFetchOptions,
): Promise<T> {
  const res = await fetch(url, options);

  if (!res.ok) {
    throw new Error(`[serverFetch] ${res.status} ${res.statusText} — ${url}`);
  }

  return res.json() as Promise<T>;
}
