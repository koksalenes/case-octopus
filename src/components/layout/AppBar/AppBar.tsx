'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui';
import { logout } from '@/features/auth/store/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

import { Logo } from '../../ui/Logo';
import { AppBarSearch } from './AppBarSearch';
import { AppBarSkeleton } from './AppBarSkeleton';
import { UserMenu } from './UserMenu';

export function AppBar() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isInitializing } = useAppSelector(
    (state) => state.auth,
  );

  const [searchOpen, setSearchOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/auth/login');
  };

  if (isInitializing) {
    return <AppBarSkeleton />;
  }

  return (
    <header className="border-border-light sticky top-0 z-50 w-full border-b bg-white">
      <div className="mx-auto flex h-14 max-w-360 items-center justify-between px-4 md:h-23 md:px-8">
        <div className={searchOpen ? 'hidden md:block' : ''}>
          <Logo />
        </div>

        {/* Right section */}
        <div
          className={`flex items-center ${searchOpen ? 'ml-3 flex-1 md:ml-0 md:flex-none md:gap-4' : 'gap-1 md:gap-4'}`}
        >
          {/* Search bar */}
          {searchOpen && <AppBarSearch onClose={() => setSearchOpen(false)} />}

          {/* Icon buttons */}
          <div
            className={`flex items-center gap-0 md:gap-1 ${searchOpen ? 'hidden' : ''}`}
          >
            <button
              type="button"
              aria-label="Ara"
              onClick={() => setSearchOpen(true)}
              className="hover:bg-surface-input focus-visible:ring-primary rounded-lg p-1 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none md:p-1.5"
            >
              <Image
                src="/assets/icons/search.svg"
                alt=""
                width={24}
                height={24}
                className="size-5 md:size-6"
                priority
              />
            </button>
            <button
              type="button"
              aria-label="Bilgi"
              className="hover:bg-surface-input focus-visible:ring-primary rounded-lg p-1 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none md:p-1.5"
            >
              <Image
                src="/assets/icons/info-circle.svg"
                alt=""
                width={24}
                height={24}
                className="size-5 md:size-6"
                priority
              />
            </button>
            <button
              type="button"
              aria-label="Bildirimler"
              className="hover:bg-surface-input focus-visible:ring-primary rounded-lg p-1 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none md:p-1.5"
            >
              <Image
                src="/assets/icons/notification.svg"
                alt=""
                width={24}
                height={24}
                className="size-5 md:size-6"
                priority
              />
            </button>
          </div>

          <div className={searchOpen ? 'hidden md:flex' : 'flex'}>
            {isAuthenticated && user ? (
              <UserMenu user={user} onLogout={handleLogout} />
            ) : (
              <Button onClick={() => router.push('/auth/login')} size="sm">
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
