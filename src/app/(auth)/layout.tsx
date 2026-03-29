'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { tokenStorage } from '@/lib/tokenStorage';
import { useAppSelector } from '@/store/hooks';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const shouldRedirect =
    isAuthenticated ||
    (typeof window !== 'undefined' && !!tokenStorage.getRefreshToken());

  useEffect(() => {
    if (shouldRedirect) {
      router.replace('/products');
    }
  }, [shouldRedirect, router]);

  if (shouldRedirect) return null;

  return children;
}
