import type { AxiosError } from 'axios';

export function extractErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError<{ message?: string }>;
  return axiosError?.response?.data?.message ?? axiosError?.message ?? fallback;
}
