'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { tokenStorage } from '@/lib/tokenStorage';
import { useAppSelector } from '@/store/hooks';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (isAuthenticated || tokenStorage.getRefreshToken()) {
      router.replace('/products');
    } else {
      const timer = setTimeout(() => setIsChecking(false), 0);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, router]);

  if (isChecking) {
    return null; // Avoid rendering login screen while checking
  }

  return children;
}
