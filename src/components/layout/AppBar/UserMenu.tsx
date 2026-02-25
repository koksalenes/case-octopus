'use client';

import Image from 'next/image';
import { useCallback, useRef, useState } from 'react';

import type { AuthUser } from '@/features/auth/types/auth.types';
import { useClickOutside } from '@/hooks/useClickOutside';

interface UserMenuProps {
  user: AuthUser;
  onLogout: () => void;
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const initials =
    `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  const showImage = !!user.image && !imgError;

  const handleClose = useCallback(() => setIsOpen(false), []);

  useClickOutside(menuRef, handleClose);

  const handleToggle = () => setIsOpen((prev) => !prev);

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={menuRef} className="relative" onKeyDown={handleKeyDown}>
      {/* Trigger */}
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="hover:bg-surface-input focus-visible:ring-primary flex cursor-pointer items-center gap-1.5 rounded-lg p-0.5 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none md:gap-2 md:p-1"
      >
        {/* Avatar */}
        <div className="bg-primary-50 flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full md:size-11">
          {showImage ? (
            <Image
              src={user.image}
              alt={`${user.firstName} ${user.lastName}`}
              width={44}
              height={44}
              className="size-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="text-primary text-sm leading-5 font-bold md:text-base md:leading-6">
              {initials}
            </span>
          )}
        </div>

        {/* Name + Arrow */}
        <div className="hidden items-center gap-1 md:flex">
          <span className="text-ink max-w-30 truncate text-base leading-6 font-normal">
            {user.firstName} {user.lastName}
          </span>
          <Image
            src="/assets/icons/chevron-down.svg"
            alt=""
            width={20}
            height={20}
            className={`size-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          role="menu"
          className="border-border-light absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-lg border bg-white shadow-lg"
        >
          {/* User info */}
          <div className="border-border-light border-b px-4 py-3 md:hidden">
            <p className="text-ink truncate text-sm font-medium">
              {user.firstName} {user.lastName}
            </p>
          </div>

          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="text-ink hover:bg-surface-input flex w-full cursor-pointer items-center gap-2 px-4 py-3 text-sm transition-colors"
          >
            <Image
              src="/assets/icons/logout.svg"
              alt=""
              width={20}
              height={20}
              className="size-5"
            />
            <span>Çıkış Yap</span>
          </button>
        </div>
      )}
    </div>
  );
}
